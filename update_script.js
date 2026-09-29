const fs = require('fs');
const path = 'C:/laravel/getReadyWebapp/app/Http/Controllers/Api/OrderApiController.php';
let content = fs.readFileSync(path, 'utf8');

const regex = /public function rate\([\s\S]*?return response\(\)->json\(\['success' => true, 'message' => 'Review saved'\]\);\s*\}/m;

const newMethod = `public function rate(Request $request, $id)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string'
        ]);
        
        $order = \\App\\Models\\Order::with('items')->findOrFail($id);
        
        if ($order->buyer_id !== \\Illuminate\\Support\\Facades\\Auth::id()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $sellerId = $order->items->first()->seller_id ?? null;

        if (!$sellerId) {
            return response()->json(['success' => false, 'message' => 'Seller not found for this order'], 400);
        }

        \\App\\Models\\Rating::updateOrCreate(
            [
                'order_id' => $order->id,
                'rater_id' => \\Illuminate\\Support\\Facades\\Auth::id(),
            ],
            [
                'rated_user_id' => $sellerId,
                'rating' => $request->rating,
                'review' => $request->review,
            ]
        );

        return response()->json(['success' => true, 'message' => 'Review saved successfully']);
    }`;

content = content.replace(regex, newMethod);
fs.writeFileSync(path, content, 'utf8');
console.log('Replaced successfully');
