import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../redux/slices/orderSlice';
import styles from '../css/OrdersStyles';
import TopHeader from '../components/TopHeader';
import { CancelOrderModal, ReturnOrderModal, RateOrderModal, ExtendOrderModal, BuyOrderModal } from '../components/OrderActionModals';

const Cart = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { orders, isLoading } = useSelector(state => state.order);
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [activeRentals, setActiveRentals] = useState(0);

  // Modal State
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [activeClothId, setActiveClothId] = useState(null);
  const [activeCurrentReturnDate, setActiveCurrentReturnDate] = useState(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [isEarlyReturn, setIsEarlyReturn] = useState(false);
  const [rateModalVisible, setRateModalVisible] = useState(false);
  const [extendModalVisible, setExtendModalVisible] = useState(false);
  const [buyModalVisible, setBuyModalVisible] = useState(false);

  // Use focus effect to refresh orders whenever this screen is visited
  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchOrders());
    }, [dispatch])
  );

  useEffect(() => {
    if (orders?.data) {
      const total = orders.data.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
      setTotalInvestment(total);

      const active = orders.data.filter(order => {
        if (!order.rental_to) return false;
        return new Date(order.rental_to) >= new Date();
      }).length;
      setActiveRentals(active);
    }
  }, [orders]);

  const onModalComplete = () => {
    dispatch(fetchOrders());
  };

  const renderOrderCards = () => {
    if (!orders?.data || orders.data.length === 0) {
      return (
        <View style={styles.card}>
          <View style={styles.emptyIconWrapper}>
            <Icon name="bag-add-outline" size={80} color="#cbd5e1" />
          </View>
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptyDescription}>
            Discover curated fashion and start your rental journey today!
          </Text>
          <TouchableOpacity
            style={styles.manageListingsBtn}
            onPress={() => navigation.navigate('HomeTab')}
          >
            <Text style={styles.manageListingsText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return orders.data.map(order => {
      console.log("ORDER PAYLOAD DEBUG:", JSON.stringify(order, null, 2));
      const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
      const clothName = firstItem?.cloth?.title || 'Order Item(s)';

      const API_BASE_URL = 'http://192.168.1.5:8000';
      const clothImage = firstItem?.cloth?.images?.[0]?.image_path
        ? { uri: `${API_BASE_URL}/storage/${firstItem.cloth.images[0].image_path}` }
        : require('../assets/images/logo.png');

      const isPending = order.status === 'Pending';
      const isActive = ['Confirmed', 'Shipped', 'Delivered'].includes(order.status);
      const isDelivered = order.status === 'Delivered' || order.status === 'Returned';

      return (
        <View key={order.id} style={styles.orderCard}>
          <View style={styles.orderImageContainer}>
            <Image source={clothImage} style={styles.orderImage} />
            <Text style={styles.orderIdText}>ORD #{String(order.id).padStart(5, '0')}</Text>
            
            <View style={styles.orderDateBox}>
              {order.rental_from && order.rental_to && (
                <View style={styles.dateRow}>
                  <Icon name="calendar-outline" size={12} color="#3b82f6" />
                  <Text style={styles.dateTextBlue}>
                    {new Date(order.rental_from).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - {new Date(order.rental_to).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
              )}
              {order.return_date && (
                <View style={styles.dateRow}>
                  <Icon name="arrow-undo-outline" size={12} color="#ef4444" />
                  <Text style={styles.dateTextRed}>
                    Return: {new Date(order.return_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.orderDetails}>
            <View style={styles.orderTitleRow}>
              <View style={styles.orderStatusBadge}>
                <Text style={styles.orderStatusText}>
                  {order.status === 'Returned' ? 'RETURNED' : (isDelivered ? 'DELIVERED' : order.status.toUpperCase())}
                </Text>
              </View>
              <View style={styles.orderDateTop}>
                <Icon name="time-outline" size={14} color="#64748b" />
                <Text style={styles.orderDateTopText}>
                  {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              </View>
            </View>

            <Text style={styles.orderTitle} numberOfLines={2}>{clothName}</Text>

            <Text style={styles.orderSubStatus}>
              <Icon name="hourglass-outline" size={12} /> {order.status === 'Confirmed' ? 'PREPARING FOR SHIPMENT...' : order.status}
            </Text>

            <View style={{ height: 1, backgroundColor: '#f1f5f9', marginVertical: 10 }} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={styles.totalPaidLabel}>TOTAL PAID</Text>
                <Text style={styles.totalPaidValue}>₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Icon name="checkmark-circle" size={14} color="#10b981" />
                  <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '700', marginLeft: 4 }}>
                    {order.payment_method ? order.payment_method.toUpperCase() : 'RAZORPAY'}
                  </Text>
                </View>
              </View>

              {(isPending || order.status === 'Confirmed') && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.btnDangerOutline, { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6 }]}
                  onPress={() => { setActiveOrderId(order.id); setCancelModalVisible(true); }}
                >
                  <Icon name="close-circle-outline" size={16} color="#ef4444" style={{ marginRight: 4 }} />
                  <Text style={styles.btnDangerOutlineText}>CANCEL</Text>
                </TouchableOpacity>
              )}
            </View>

            {(() => {
              const trackingNumber = order.tracking_number || 
                                     order.shipment?.tracking_number || 
                                     order.shipments?.[0]?.tracking_number || 
                                     order.shipments?.[0]?.waybill_number;
                                     
              if (!trackingNumber) return null;
              
              return (
                <View style={styles.trackingPill}>
                  <View style={styles.trackingInfo}>
                    <Text style={styles.trackingLabel}>OUTGOING SHIPMENT</Text>
                    <Text style={styles.trackingStatus}>AWB: {trackingNumber}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.trackBtn} 
                    onPress={() => {
                      const labelUrl = order.label_url || order.shipment?.label_url || order.shipments?.[0]?.label_url;
                      if (labelUrl) {
                        const fullUrl = labelUrl.startsWith('http') ? labelUrl : `${API_BASE_URL}/${labelUrl.replace(/^\//, '')}`;
                        Linking.openURL(fullUrl).catch(err => console.error("Couldn't load page", err));
                      } else {
                        // Fallback tracking URL or API endpoint if label isn't in payload
                        const fallbackUrl = `${API_BASE_URL}/api/orders/${order.id}/label`;
                        Linking.openURL(fallbackUrl).catch(err => {
                          Alert.alert("Track Shipment", "Tracking label is not available yet.");
                        });
                      }
                    }}
                  >
                    <Text style={styles.trackBtnText}>TRACK</Text>
                  </TouchableOpacity>
                </View>
              );
            })()}

            <View style={styles.actionButtonsRow}>
              {isActive && order.has_rental_items && (
                <>
                  <TouchableOpacity style={[styles.actionBtn, styles.btnPrimary]} onPress={() => { setActiveOrderId(order.id); setActiveClothId(firstItem?.cloth_id); setActiveCurrentReturnDate(order.rental_to); setExtendModalVisible(true); }}>
                    <Icon name="calendar-outline" size={16} color="#fff" />
                    <Text style={styles.btnPrimaryText}>Extend</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.btnSecondary]} onPress={() => { setActiveOrderId(order.id); setIsEarlyReturn(true); setReturnModalVisible(true); }}>
                    <Icon name="time-outline" size={16} color="#fff" />
                    <Text style={styles.btnSecondaryText}>Early Return</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.btnSuccess]} onPress={() => { setActiveOrderId(order.id); setActiveClothId(firstItem?.cloth_id); setBuyModalVisible(true); }}>
                    <Icon name="cart-outline" size={16} color="#fff" />
                    <Text style={styles.btnSuccessText}>Buy Rental</Text>
                  </TouchableOpacity>
                </>
              )}
              {isDelivered && (
                <TouchableOpacity style={[styles.actionBtn, styles.btnSecondary]} onPress={() => { setActiveOrderId(order.id); setRateModalVisible(true); }}>
                  <Icon name="star-outline" size={16} color="#fff" />
                  <Text style={styles.btnSecondaryText}>Rate Order</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>My Orders Dashboard</Text>
          <Text style={styles.pageSubtitle}>Manage your rentals, track shipments, and view order history</Text>

          <TouchableOpacity
            style={styles.backToHomeBtn}
            onPress={() => navigation.navigate('HomeTab')}
          >
            <Icon name="home-outline" size={16} color="#64748b" />
            <Text style={styles.backToHomeText}>BACK TO HOME</Text>
          </TouchableOpacity>
        </View>

        {isLoading && !orders?.data?.length ? (
          <ActivityIndicator size="large" color="#f59e0b" style={{ marginTop: 50 }} />
        ) : (
          <>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <View style={styles.statIconBoxGreen}>
                  <Icon name="card-outline" size={24} color="#16a34a" />
                </View>
                <Text style={styles.statLabel}>TOTAL INVESTMENT</Text>
                <Text style={styles.statValue}>₹{totalInvestment.toLocaleString('en-IN')}</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIconBoxBlue}>
                  <Icon name="calendar-outline" size={24} color="#2563eb" />
                </View>
                <Text style={styles.statLabel}>ACTIVE RENTALS</Text>
                <Text style={styles.statValue}>{activeRentals}</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIconBoxOrange}>
                  <Icon name="cube-outline" size={24} color="#ea580c" />
                </View>
                <Text style={styles.statLabel}>TOTAL ORDERS</Text>
                <Text style={styles.statValue}>{orders?.data?.length || 0}</Text>
              </View>
            </View>

            <View style={styles.dashboardContainer}>
              {renderOrderCards()}
            </View>
          </>
        )}
      </ScrollView>

      {cancelModalVisible && (
        <CancelOrderModal
          visible={cancelModalVisible}
          orderId={activeOrderId}
          onClose={() => setCancelModalVisible(false)}
          onComplete={onModalComplete}
        />
      )}
      {returnModalVisible && (
        <ReturnOrderModal
          visible={returnModalVisible}
          orderId={activeOrderId}
          isEarly={isEarlyReturn}
          onClose={() => setReturnModalVisible(false)}
          onComplete={onModalComplete}
        />
      )}
      {rateModalVisible && (
        <RateOrderModal
          visible={rateModalVisible}
          orderId={activeOrderId}
          onClose={() => setRateModalVisible(false)}
          onComplete={onModalComplete}
        />
      )}
      {extendModalVisible && (
        <ExtendOrderModal
          visible={extendModalVisible}
          orderId={activeOrderId}
          clothId={activeClothId}
          currentReturnDate={activeCurrentReturnDate ? new Date(activeCurrentReturnDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
          onClose={() => setExtendModalVisible(false)}
          onComplete={onModalComplete}
        />
      )}
      {buyModalVisible && (
        <BuyOrderModal
          visible={buyModalVisible}
          orderId={activeOrderId}
          clothId={activeClothId}
          onClose={() => setBuyModalVisible(false)}
          onComplete={onModalComplete}
        />
      )}
    </SafeAreaView>
  );
};

export default Cart;
