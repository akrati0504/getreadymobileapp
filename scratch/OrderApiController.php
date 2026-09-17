<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Razorpay\Api\Api; 
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Order; 
use App\Models\Payment;
use App\Models\CartItem; 
use App\Services\AvailabilityService;

class OrderApiController extends Controller
{
    public function index()
    {
        $orders = Order::with(['payments', 'shipments', 'invoices', 'items.cloth.images'])
            ->where('buyer_id', Auth::id())
            ->where('status', '!=', 'Pending')
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'orders' => $orders
        ]);
    }

    public function store(Request $request)
    {
        Log::info('--- NEW ORDER CHECKOUT STARTED ---');
        Log::info('Request Data: ', $request->all());

        // 1. Validate the incoming request from the mobile app
        $request->validate([
            'payment_method' => 'required|in:cod,online',
            'delivery_address' => 'required|string',
            'delivery_city' => 'required|string',
            'delivery_state' => 'required|string',
            'delivery_pincode' => 'required|string',
            'security_amount' => 'required|numeric',
            'rental_from' => 'nullable|date',
            'rental_to' => 'nullable|date',
        ]);

        $user = Auth::user();
        Log::info('User authenticated: ID ' . $user->id);

        // 2. Calculate your total amount securely
        $cartItems = CartItem::where('user_id', $user->id)->get();
        Log::info('Found ' . $cartItems->count() . ' items in cart.');

        if ($cartItems->isEmpty()) {
            Log::warning('Checkout failed: Cart is empty.');
            return response()->json([
                'success' => false,
                'message' => 'Your cart is empty.'
            ], 400);
        }

        $cartTotal = 0;
        foreach ($cartItems as $item) {
            if ($item->purchase_type === 'buy') {
                $cartTotal += $item->total_selling_price;
            } else {
                $cartTotal += $item->total_rental_cost;
            }
        }
        Log::info('Calculated Cart Total: ' . $cartTotal);

        $totalPay = $cartTotal + $request->security_amount;
        Log::info('Final Total Pay (incl. Security Amount ' . $request->security_amount . '): ' . $totalPay);

        // 3. Create the Order in your database
        $order = Order::create([
            'buyer_id' => $user->id,
            'status' => 'Pending',
            'payment_method' => $request->payment_method,
            'delivery_address' => $request->delivery_address,
            'delivery_city' => $request->delivery_city,
            'delivery_state' => $request->delivery_state,
            'delivery_pincode' => $request->delivery_pincode,
            'total_amount' => $totalPay,
            'security_amount' => $request->security_amount,
            'rental_from' => $request->rental_from, 
            'rental_to' => $request->rental_to,
        ]);
        Log::info('Order successfully created in DB: Order ID ' . $order->id);

        foreach ($cartItems as $item) {
            \App\Models\OrderItem::create([
                'order_id' => $order->id,
                'cloth_id' => $item->cloth_id,
                'quantity' => $item->quantity ?? 1,
                'purchase_type' => $item->purchase_type,
                'price' => $item->purchase_type === 'buy' ? $item->total_selling_price : $item->total_rental_cost,
            ]);
        }
        Log::info('OrderItems saved successfully.');

        // 4. Handle based on Payment Method
        if ($request->payment_method === 'cod') {
            Log::info('Processing COD payment...');
            $order->update(['status' => 'Confirmed']);
            Log::info('Order status updated to Confirmed for COD.');

            // Clear the user's cart after successful COD order
            CartItem::where('user_id', $user->id)->delete();
            Log::info('User cart cleared for COD.');

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully',
                'order' => $order
            ]);
        }

        // 5. Handle Razorpay (ONLINE)
        if ($request->payment_method === 'online') {
            Log::info('Processing ONLINE payment via Razorpay...');
            try {
                $apiKey = config('services.razorpay.key_id');
                $apiSecret = config('services.razorpay.key_secret');
                Log::info('Loaded Razorpay Keys - ID: ' . ($apiKey ? 'EXISTS' : 'MISSING') . ', Secret: ' . ($apiSecret ? 'EXISTS' : 'MISSING'));

                $api = new Api($apiKey, $apiSecret);

                // Create Razorpay order
                $razorpayOrder = $api->order->create([
                    'receipt' => (string) $order->id,
                    'amount' => (int) ($totalPay * 100), // Amount in paise
                    'currency' => 'INR',
                ]);
                Log::info('Razorpay Order created successfully: ' . $razorpayOrder['id']);

                // Save Razorpay order ID to your DB
                $order->update(['razorpay_order_id' => $razorpayOrder['id']]);
                Log::info('Saved Razorpay Order ID to DB.');

                return response()->json([
                    'success' => true,
                    'order' => [
                        'id' => $razorpayOrder['id'],
                        'amount_paise' => (int) ($totalPay * 100),
                        'currency' => 'INR'
                    ],
                    'razorpay' => [
                        'key' => $apiKey 
                    ],
                    'customer' => [
                        'name' => $user->name,
                        'email' => $user->email,
                        'contact' => $user->phone ?? '' 
                    ]
                ]);

            } catch (\Exception $e) {
                Log::error('Razorpay Error: ' . $e->getMessage());
                Log::error('Stack Trace: ' . $e->getTraceAsString());
                
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to initialize payment gateway.'
                ], 500);
            }
        }
    }


    public function verifyPayment(Request $request)
    {
        Log::info('--- VERIFY PAYMENT CALLED ---');
        Log::info('Verify Data: ', $request->all());

        $request->validate([
            'order_id' => 'required|string', // The Razorpay Order ID
            'razorpay_payment_id' => 'required|string',
        ]);

        try {
            // Retrieve the database order ID from Razorpay's receipt
            $apiKey = config('services.razorpay.key_id');
            $apiSecret = config('services.razorpay.key_secret');
            $api = new Api($apiKey, $apiSecret);
            
            $razorpayOrder = $api->order->fetch($request->order_id);
            $dbOrderId = $razorpayOrder['receipt'];

            // Find order and update status
            $order = Order::where('id', $dbOrderId)->firstOrFail();
            Log::info('Found Order for Verification: ' . $order->id);

            $order->update(['status' => 'Confirmed']);
            Log::info('Order status updated to Confirmed.');
            
            // Log Payment...
            Payment::create([
                'order_id' => $order->id,
                'transaction_id' => $request->razorpay_payment_id,
                'amount' => $order->total_amount,
                'status' => 'Success'
            ]);
            Log::info('Payment record created successfully.');

            // Clear the user's cart after successful payment verification
            CartItem::where('user_id', $order->buyer_id)->delete();
            Log::info('User cart cleared for ONLINE payment.');

            return response()->json([
                'success' => true,
                'message' => 'Payment successful!'
            ]);

        } catch (\Exception $e) {
            Log::error('Verify Payment Error: ' . $e->getMessage());
            Log::error('Trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Payment verification failed: ' . $e->getMessage()
            ], 400);
        }
    }
}
