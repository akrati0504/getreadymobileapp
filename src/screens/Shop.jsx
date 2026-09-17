import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCartItems, removeCartItem } from '../redux/slices/cartSlice';
import styles from '../css/CartStyles';
import TopHeader from '../components/TopHeader';
import RazorpayCheckout from 'react-native-razorpay';
import { createOrder, verifyPayment } from '../redux/slices/orderSlice';

const Shop = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const user = useSelector((state) => state.auth?.user?.user);
  const clothesList = useSelector((state) => state.clothes?.data || []);
  const { items: bagItems, subtotal, isLoading: isCartLoading, error } = useSelector((state) => state.cart);
  const isCheckoutLoading = useSelector((state) => state.order?.isLoading);
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');
  
  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated) {
        dispatch(fetchCartItems());
      }
    }, [dispatch, isAuthenticated])
  );

  const handleRemoveItem = (cartItemId) => {
    dispatch(removeCartItem(cartItemId));
  };

  let rentalSubtotal = 0;
  let purchaseSubtotal = 0;
  let securityDeposit = 0;
  let rentalFrom = null;
  let rentalTo = null;


  if (bagItems) {
    bagItems.forEach(item => {
      if (item.purchase_type === 'buy') {
        purchaseSubtotal += Number(item.price || 0);
      } else {
        rentalSubtotal += Number(item.price || 0);

        // Grab rental dates from the first rental item we find
        if (!rentalFrom) rentalFrom = item.rental_start_date;
        if (!rentalTo) rentalTo = item.rental_end_date;

        // Find matching cloth in Redux store to get its security deposit
        const matchingCloth = clothesList.find(c => c.id === String(item.cloth_id));
        const clothSecDep = matchingCloth ? Number(matchingCloth.security_deposit || 0) : 0;

        securityDeposit += Number(item.security_deposit || item.cloth?.security_deposit || clothSecDep || 0);
      }
    });
  }
  const totalPay = rentalSubtotal + purchaseSubtotal + securityDeposit;


  const formatDateRange = (start, end, days) => {
    if (!start || !end) return '';
    const startDate = new Date(start);
    const endDate = new Date(end);

    const startStr = startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const endStr = endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const year = endDate.getFullYear();

    return `${startStr} - ${endStr}, ${year} (${days} Days)`;
  };

  const handleCheckout = async () => {
    if (!user?.address) {
      Alert.alert('Address Required', 'Please add a delivery address first.');
      return;
    }

    try {
      // 1. Dispatch createOrder to Redux
      const orderPayload = {
        payment_method: paymentMethod.toLowerCase(),
        delivery_address: user.address,
        delivery_city: user.city,
        delivery_state: user.state,
        delivery_pincode: user.pincode,
        security_amount: securityDeposit,
        rental_from: rentalFrom,
        rental_to: rentalTo,
      };

      const data = await dispatch(createOrder(orderPayload)).unwrap();

      if (paymentMethod === 'COD') {
        Alert.alert('Success', 'Order placed successfully!');
        dispatch(fetchCartItems());
        navigation.navigate('Cart');
      } else {
        // ONLINE Payment using Razorpay
        const options = {
          description: `Order #${data.order.id}`,
          image: 'https://your-logo-url.com/logo.png', // Replace with your app logo
          currency: data.order.currency,
          key: data.razorpay.key,
          amount: data.order.amount_paise,
          name: 'Get Ready',
          order_id: data.order.id, // For Razorpay orders created in backend
          prefill: {
            email: data.customer.email || '',
            contact: data.customer.contact || '',
            name: data.customer.name || ''
          },
          theme: { color: '#4338ca' }
        };

        try {
          const rzpResponse = await RazorpayCheckout.open(options);

          // 2. Dispatch verifyPayment to Redux
          const verifyPayload = {
            order_id: data.order.id,
            razorpay_payment_id: rzpResponse.razorpay_payment_id
          };

          await dispatch(verifyPayment(verifyPayload)).unwrap();

          Alert.alert('Success', 'Payment successful!');
          dispatch(fetchCartItems());
          navigation.navigate('Cart');
        } catch (paymentError) {
          console.log('Razorpay Payment Error: ', paymentError);
          const errorMsg = paymentError?.error?.description || paymentError?.description || paymentError?.message || JSON.stringify(paymentError);
          Alert.alert('Payment Failed', `Reason: ${errorMsg}`);
        }
      }
    } catch (error) {
      console.log('Checkout API Error: ', error);
      const errorMsg = typeof error === 'string' ? error : (error?.message || JSON.stringify(error));
      Alert.alert('Checkout Error', `Reason: ${errorMsg}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Page Title */}
        <View style={styles.pageHeader}>
          <View style={styles.iconWrapper}>
            <Icon name="bag-handle-outline" size={28} color="#FFA500" />
          </View>
          <View style={styles.pageTitleContainer}>
            <Text style={styles.pageTitle}>Your Shopping Bag</Text>
            <Text style={styles.pageSubtitle}>Review your selected items and proceed to checkout</Text>
          </View>
        </View>

        {!isAuthenticated ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyCartIconWrapper}>
              <Icon name="lock-closed-outline" size={100} color="#6b7280" />
            </View>
            <Text style={styles.emptyTitle}>Please Log In</Text>
            <Text style={styles.emptyDescription}>
              You need to be logged in to view and manage your shopping bag.
            </Text>
            <TouchableOpacity
              style={styles.startBrowsingBtn}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.startBrowsingText}>Go to Login</Text>
            </TouchableOpacity>
          </View>
        ) : isCartLoading && bagItems.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFA500" />
          </View>
        ) : error ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyTitle}>Oops!</Text>
            <Text style={styles.emptyDescription}>{error}</Text>
          </View>
        ) : bagItems && bagItems.length > 0 ? (
          <View style={styles.bagItemsContainer}>
            {bagItems.map((item) => (
              <View key={item.cart_item_id} style={styles.bagItemCard}>

                {/* Image Section */}
                <View style={styles.itemImageContainer}>
                  <Image
                    source={{ uri: item.image || 'https://via.placeholder.com/400x500?text=No+Image' }}
                    style={styles.itemImage}
                  />
                  <View style={styles.playIconWrapper}>
                    <Icon name="play" size={20} color="#fff" />
                  </View>
                </View>

                {/* Badge */}
                <View style={[styles.badge, item.purchase_type === 'buy' && styles.badgeBuy]}>
                  <Text style={styles.badgeText}>{item.purchase_type === 'buy' ? 'PURCHASE' : 'RENTAL'}</Text>
                </View>

                {/* Title */}
                <Text style={styles.itemTitle}>{item.title}</Text>

                {/* Size & Condition */}
                <View style={styles.sizeConditionRow}>
                  <View style={styles.sizeBox}>
                    <Text style={styles.metaTextDark}>Size: {item.size}</Text>
                  </View>
                  <View style={styles.conditionBox}>
                    <Text style={styles.metaTextDark}>Condition: Brand New</Text>
                  </View>
                </View>

                {/* Rental / Purchase Cost Box */}
                {item.purchase_type !== 'buy' ? (
                  <View style={styles.rentalCostBox}>
                    <View style={styles.rentalCostHeader}>
                      <Text style={styles.rentalCostLabel}>Rental Cost</Text>
                      <Text style={styles.rentalCostPrice}>₹{item.price}</Text>
                    </View>
                    <View style={styles.dateRow}>
                      <Icon name="calendar-outline" size={16} color="#f59e0b" />
                      <Text style={styles.dateText}>
                        {formatDateRange(item.rental_start_date, item.rental_end_date, item.rental_days)}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.purchaseCostBox}>
                    <View>
                      <Text style={styles.purchaseCostLabel}>Purchase Price</Text>
                      <Text style={styles.purchaseCostSubLabel}>Ownership after delivery</Text>
                    </View>
                    <Text style={styles.purchaseCostPrice}>₹{item.price}</Text>
                  </View>
                )}

                {/* Subtotal & Remove */}
                <View style={styles.subtotalContainer}>
                  <Text style={styles.subtotalLabel}>Subtotal</Text>
                  <Text style={[styles.subtotalPrice, item.purchase_type === 'buy' && styles.subtotalPriceBuy]}>₹{item.price}</Text>
                </View>

                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemoveItem(item.cart_item_id)}
                >
                  <Icon name="trash-outline" size={16} color="#ef4444" />
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>

              </View>
            ))}

            {/* Order Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Icon name="receipt-outline" size={20} color="#fff" />
                <Text style={styles.summaryTitle}>Order Summary</Text>
              </View>

              <View style={styles.summaryBody}>
                <View style={styles.deliverToRow}>
                  <Text style={styles.deliverToLabel}>Deliver To</Text>
                  <TouchableOpacity><Text style={styles.changeText}>Change</Text></TouchableOpacity>
                </View>
                <View style={styles.deliverToAddressContainer}>
                  <Icon name="location-outline" size={20} color="#3b82f6" />
                  <View style={styles.deliverToAddressText}>
                    <Text style={styles.deliverToValue}>
                      {user?.address || 'Please add a delivery address'}
                    </Text>
                  </View>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Rental Subtotal</Text>
                  <Text style={styles.summaryValue}>₹{rentalSubtotal}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryLabelBlue}>
                    <Icon name="shield-checkmark-outline" size={14} color="#3b82f6" />
                    <Text style={{ color: '#3b82f6', marginLeft: 4 }}>Security Deposit</Text>
                  </View>
                  <Text style={styles.summaryValueBlue}>₹{securityDeposit}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Purchase Subtotal</Text>
                  <Text style={styles.summaryValueGreen}>₹{purchaseSubtotal}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow, { alignItems: 'center' }]}>
                  <Text style={styles.totalLabel}>Total Pay</Text>
                  <Text style={styles.totalValue}>₹{totalPay}</Text>
                </View>

                <Text style={styles.paymentMethodsTitle}>Select Payment Method</Text>
                <View style={styles.paymentMethodsContainer}>
                  <TouchableOpacity
                    style={[styles.paymentMethodBtn, paymentMethod === 'ONLINE' && styles.paymentMethodBtnActive]}
                    onPress={() => setPaymentMethod('ONLINE')}
                  >
                    <Icon name="card-outline" size={24} color={paymentMethod === 'ONLINE' ? '#ff8a4c' : '#6b7280'} style={styles.paymentMethodIcon} />
                    <Text style={[styles.paymentMethodText, paymentMethod === 'ONLINE' && styles.paymentMethodTextActive]}>ONLINE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.paymentMethodBtn, paymentMethod === 'COD' && styles.paymentMethodBtnActive]}
                    onPress={() => setPaymentMethod('COD')}
                  >
                    <Icon name="cash-outline" size={24} color={paymentMethod === 'COD' ? '#ff8a4c' : '#6b7280'} style={styles.paymentMethodIcon} />
                    <Text style={[styles.paymentMethodText, paymentMethod === 'COD' && styles.paymentMethodTextActive]}>COD</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.checkoutBtn, isCheckoutLoading && { opacity: 0.7 }]}
                  onPress={handleCheckout}
                  disabled={isCheckoutLoading}
                >
                  {isCheckoutLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Icon name="lock-closed" size={16} color="#fff" />
                      <Text style={styles.checkoutText}>
                        {paymentMethod === 'COD' ? 'Place Order' : 'Place Order securely'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.continueShoppingBtn} onPress={() => navigation.navigate('HomeTab')}>
                  <Icon name="arrow-back" size={16} color="#6b7280" />
                  <Text style={styles.continueShoppingText}>Continue Shopping</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyCartIconWrapper}>
              <Icon name="bag-handle-outline" size={100} color="#6b7280" />
            </View>
            <Text style={styles.emptyTitle}>Your Bag is Empty</Text>
            <Text style={styles.emptyDescription}>
              Looks like you haven't added anything to your bag yet. Explore our premium collection and start your fashion journey!
            </Text>
            <TouchableOpacity
              style={styles.startBrowsingBtn}
              onPress={() => navigation.navigate('HomeTab')}
            >
              <Text style={styles.startBrowsingText}>Start Browsing</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Shop;
