import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { Calendar } from 'react-native-calendars';
import RazorpayCheckout from 'react-native-razorpay';
import { cancelOrder, returnOrder, rateOrder, extendOrder, getBuyQuote, buyOrder, verifyBuyOrder } from '../redux/slices/orderSlice';

// 0. CancelOrderModal
export const CancelOrderModal = ({ visible, onClose, orderId, onComplete }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    await dispatch(cancelOrder({ orderId }));
    setLoading(false);
    if (onComplete) onComplete();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>Cancel Order</Text>
            <TouchableOpacity onPress={onClose}><Icon name="close" size={24} color="#94a3b8" /></TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>Are you sure you want to cancel this order?</Text>

          <View style={[styles.warningBox, { marginBottom: 25 }]}>
            <Icon name="warning" size={16} color="#b45309" style={{ marginTop: 2, marginRight: 8 }} />
            <Text style={styles.warningText}>Once cancelled, this action cannot be undone. Any paid amount will be refunded according to our policy.</Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Keep Order</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#ef4444' }]} onPress={handleCancel} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Yes, Cancel</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// 1. ExtendOrderModal
export const ExtendOrderModal = ({ visible, onClose, orderId, clothId, currentReturnDate, onComplete }) => {
  const dispatch = useDispatch();
  const [showCalendar, setShowCalendar] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExtend = async () => {
    setLoading(true);
    // Format the date for the API (e.g. YYYY-MM-DD or whatever the backend expects)
    // Here we assume the backend handles the parsed date string from state or we can just send newDate
    await dispatch(extendOrder({ orderId, clothId, newDate }));
    setLoading(false);
    if (onComplete) onComplete();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
            <View style={styles.headerRow}>
              <Text style={styles.modalTitle}>Extend Rental</Text>
              <TouchableOpacity onPress={onClose}><Icon name="close" size={24} color="#94a3b8" /></TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Keep your favorite outfits a bit longer</Text>

            <View style={styles.dateBoxWrapper}>
              <View style={styles.dateBoxTop}>
                <View style={styles.dateIconWrapper}><Icon name="calendar-outline" size={16} color="#3b82f6" /></View>
                <View>
                  <Text style={styles.dateLabel}>CURRENT RETURN</Text>
                  <Text style={styles.dateValue}>{currentReturnDate || '21 Sep 2026'}</Text>
                </View>
              </View>
              <View style={styles.dateBoxBottom}>
                <View style={styles.dateIconWrapper}><Icon name="calendar-outline" size={16} color="#3b82f6" /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dateLabel}>NEW RETURN DATE</Text>
                  <TouchableOpacity onPress={() => setShowCalendar(!showCalendar)}>
                    <Text style={newDate ? styles.dateValue : styles.datePlaceholder}>{newDate || 'Choose a date'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {showCalendar && (
              <View style={{ width: '100%', marginBottom: 20 }}>
                <Calendar
                  onDayPress={day => {
                    setNewDate(new Date(day.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
                    setShowCalendar(false);
                  }}
                  minDate={new Date().toISOString()}
                  theme={{
                    selectedDayBackgroundColor: '#3b82f6',
                    todayTextColor: '#3b82f6',
                    arrowColor: '#3b82f6',
                  }}
                />
              </View>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={newDate ? styles.primaryBtn : styles.disabledBtn} onPress={handleExtend} disabled={!newDate || loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={newDate ? styles.primaryBtnText : styles.disabledBtnText}>Proceed to Pay →</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// 2. ReturnOrderModal (Schedule Early Return)
export const ReturnOrderModal = ({ visible, onClose, orderId, isEarly, onComplete }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const handleReturn = async () => {
    setLoading(true);
    await dispatch(returnOrder({ orderId, type: isEarly ? 'early' : 'normal', return_date: new Date().toISOString() }));
    setLoading(false);
    if (onComplete) onComplete();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
            <View style={styles.headerRow}>
              <Text style={styles.modalTitle}>{isEarly ? 'Schedule Early Return' : 'Return Order'}</Text>
              <TouchableOpacity onPress={onClose}><Icon name="close" size={24} color="#94a3b8" /></TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Select the date you will return the item early.</Text>

            <View style={styles.warningBox}>
              <Icon name="information-circle" size={16} color="#b45309" style={{ marginTop: 2, marginRight: 8 }} />
              <Text style={styles.warningText}>Please note that no refunds are issued for early returns as per our rental policy.</Text>
            </View>

            <View style={{ marginTop: 25, marginBottom: showCalendar ? 10 : 35, width: '100%' }}>
              <Text style={styles.dateLabel}>RETURN DATE</Text>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }} onPress={() => setShowCalendar(!showCalendar)}>
                <Icon name="calendar-outline" size={20} color="#3b82f6" />
                <Text style={[selectedDate ? styles.dateValue : styles.datePlaceholder, { marginLeft: 12, fontSize: 16 }]}>{selectedDate || 'Choose a date'}</Text>
              </TouchableOpacity>
            </View>

            {showCalendar && (
              <View style={{ width: '100%', marginBottom: 20 }}>
                <Calendar
                  onDayPress={day => {
                    setSelectedDate(new Date(day.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
                    setShowCalendar(false);
                  }}
                  minDate={new Date().toISOString()}
                  theme={{
                    selectedDayBackgroundColor: '#f59e0b',
                    todayTextColor: '#f59e0b',
                    arrowColor: '#f59e0b',
                  }}
                />
              </View>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={selectedDate ? styles.primaryBtn : styles.disabledBtn} onPress={handleReturn} disabled={loading || !selectedDate}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={selectedDate ? styles.primaryBtnText : styles.disabledBtnText}>Confirm Return</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// 3. BuyOrderModal
export const BuyOrderModal = ({ visible, onClose, orderId, clothId, onComplete }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [quoteData, setQuoteData] = useState({
    purchase_price: 1699.20,
    rent_paid: 370.80,
    security_deposit: 0,
    amount_due: 1328.40
  });

  useEffect(() => {
    if (visible && orderId && clothId) {
      setIsFetching(true);
      dispatch(getBuyQuote({ orderId, clothId }))
        .unwrap()
        .then((res) => {
          const data = res.quote || res.data || res;
          setQuoteData({
            purchase_price: data.purchase_price || data.total_value || quoteData.purchase_price,
            rent_paid: data.rent_paid || data.rent_already_paid || quoteData.rent_paid,
            security_deposit: data.security_deposit || quoteData.security_deposit,
            amount_due: data.amount_due || data.final_amount || quoteData.amount_due
          });
          setIsFetching(false);
        })
        .catch((err) => {
          console.error(err);
          setIsFetching(false);
        });
    }
  }, [visible, orderId, clothId, dispatch]);

  const handleBuy = async () => {
    setLoading(true);
    try {
      const res = await dispatch(buyOrder({ orderId, clothId })).unwrap();
      
      if (res.requires_payment && res.razorpay_order) {
        var options = {
          description: 'Buy Rental Outright',
          currency: res.razorpay_order.currency || 'INR',
          key: res.key,
          amount: res.razorpay_order.amount,
          name: 'GetReady Rental',
          theme: { color: '#10b981' }
        };
        
        RazorpayCheckout.open(options).then(async (data) => {
          try {
            await dispatch(verifyBuyOrder({
              order_item_id: res.order_item_id,
              razorpay_payment_id: data.razorpay_payment_id
            })).unwrap();
            
            if (onComplete) onComplete();
            onClose();
          } catch (verifyError) {
            console.error('Verification Error:', verifyError);
            alert('Payment successful but verification failed.');
            setLoading(false);
          }
        }).catch((error) => {
          console.error('Razorpay Error:', error);
          setLoading(false);
        });
        
        return; // Loading state handled by Razorpay callback
      } else {
        if (onComplete) onComplete();
        onClose();
      }
    } catch (e) {
      console.error(e);
      alert(typeof e === 'string' ? e : 'An error occurred');
    }
    setLoading(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>Buy Rental Outfit</Text>
            <TouchableOpacity onPress={onClose}><Icon name="close" size={24} color="#94a3b8" /></TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>Keep this item forever instead of returning it.</Text>

          <View style={styles.successBox}>
            <Icon name="checkmark-circle" size={16} color="#15803d" style={{ marginTop: 2, marginRight: 6 }} />
            <Text style={styles.successText}>You can purchase this item outright! Your security deposit will be adjusted against the purchase price.</Text>
          </View>

          <View style={styles.quoteSection}>
            <Text style={styles.quoteTitle}>PURCHASE QUOTE</Text>
            <View style={styles.quoteDividerLight} />

            {isFetching ? (
              <ActivityIndicator size="small" color="#10b981" style={{ marginVertical: 20 }} />
            ) : (
              <>
                <View style={styles.quoteRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.quoteLabel}>Total Purchase Value </Text>
                    <Icon name="information-circle-outline" size={14} color="#3b82f6" />
                  </View>
                  <Text style={styles.quoteValue}>₹{parseFloat(quoteData.purchase_price).toFixed(2)}</Text>
                </View>
                <View style={styles.quoteRow}>
                  <Text style={styles.quoteLabel}>Rent Already Paid</Text>
                  <Text style={styles.quoteValueGreen}>- ₹{parseFloat(quoteData.rent_paid).toFixed(2)}</Text>
                </View>
                <View style={styles.quoteRow}>
                  <Text style={styles.quoteLabel}>Security Deposit Held</Text>
                  <Text style={styles.quoteValueGreen}>- ₹{parseFloat(quoteData.security_deposit).toFixed(2)}</Text>
                </View>
                
                <View style={styles.quoteDivider} />
                
                <View style={[styles.quoteRow, { marginTop: 15, alignItems: 'flex-end' }]}>
                  <View>
                    <Text style={styles.dateLabel}>AMOUNT DUE</Text>
                    <Text style={styles.amountDueText}>₹{parseFloat(quoteData.amount_due).toFixed(2)}</Text>
                  </View>
                  <Text style={styles.taxIncludedText}>TAX INCLUDED</Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={isFetching ? styles.disabledBtn : styles.buyBtn} onPress={handleBuy} disabled={isFetching || loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={isFetching ? styles.disabledBtnText : styles.buyBtnText}>Proceed to Buy →</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// 4. RateOrderModal
export const RateOrderModal = ({ visible, onClose, orderId, onComplete }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const handleRate = async () => {
    setLoading(true);
    await dispatch(rateOrder({ orderId, rating, review }));
    setLoading(false);
    if (onComplete) onComplete();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>Rate Your Experience</Text>
            <TouchableOpacity onPress={onClose}><Icon name="close" size={24} color="#94a3b8" /></TouchableOpacity>
          </View>

          <View style={styles.ratingOrderBox}>
            <Text style={styles.ratingOrderText}>Rating Order: <Text style={{ fontWeight: 'bold' }}>ORD #{String(orderId).padStart(5, '0')}</Text></Text>
          </View>

          <Text style={[styles.modalSubtitle, { textAlign: 'center', marginTop: 15, fontSize: 14 }]}>How was your experience?</Text>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Icon name={star <= rating ? "star" : "star-outline"} size={40} color="#f59e0b" style={{ marginHorizontal: 5 }} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ width: '100%', marginTop: 25, marginBottom: 15 }}>
            <Text style={styles.dateLabel}>REVIEW (OPTIONAL)</Text>
            <TextInput
              style={styles.reviewInput}
              multiline
              numberOfLines={5}
              placeholder="Share your thoughts about the items or service..."
              placeholderTextColor="#94a3b8"
              value={review}
              onChangeText={setReview}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={rating > 0 ? styles.primaryBtn : styles.disabledBtn} 
              onPress={handleRate} 
              disabled={loading || rating === 0}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={rating > 0 ? styles.primaryBtnText : styles.disabledBtnText}>Submit Review</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#fff', borderRadius: 16, padding: 25, alignItems: 'flex-start', width: '100%' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 5 },
  modalTitle: { fontSize: 22, color: '#334155' },
  modalSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 25 },

  // Date Boxes for Extend Modal
  dateBoxWrapper: { width: '100%', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, marginBottom: 30, overflow: 'hidden' },
  dateBoxTop: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  dateBoxBottom: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  dateIconWrapper: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  dateLabel: { fontSize: 10, color: '#64748b', fontWeight: '600', marginBottom: 4 },
  dateValue: { fontSize: 16, color: '#1e293b' },
  datePlaceholder: { fontSize: 16, color: '#64748b' },

  // Info/Warning/Success Boxes
  warningBox: { flexDirection: 'row', backgroundColor: '#fef3c7', padding: 15, borderRadius: 8, width: '100%', alignItems: 'flex-start' },
  warningText: { fontSize: 13, color: '#b45309', flex: 1, lineHeight: 20 },
  successBox: { flexDirection: 'row', backgroundColor: '#dcfce7', padding: 15, borderRadius: 8, width: '100%', alignItems: 'flex-start', marginBottom: 25 },
  successText: { fontSize: 13, color: '#15803d', flex: 1, lineHeight: 20 },

  // Quote Section
  quoteSection: { width: '100%', marginBottom: 30 },
  quoteTitle: { fontSize: 13, color: '#334155', marginBottom: 10 },
  quoteDividerLight: { height: 1, backgroundColor: '#e2e8f0', marginBottom: 15 },
  quoteDivider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 15, borderStyle: 'dashed' },
  quoteRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  quoteLabel: { fontSize: 13, color: '#64748b' },
  quoteValue: { fontSize: 13, color: '#475569' },
  quoteValueGreen: { fontSize: 13, color: '#16a34a' },
  amountDueText: { fontSize: 16, color: '#334155' },
  taxIncludedText: { fontSize: 11, color: '#16a34a', fontWeight: '500' },

  // Rating Modal
  ratingOrderBox: { width: '100%', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4, paddingVertical: 12, alignItems: 'center' },
  ratingOrderText: { fontSize: 13, color: '#64748b' },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', width: '100%', marginVertical: 10 },
  reviewInput: { width: '100%', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, fontSize: 14, color: '#334155', height: 100, marginTop: 8 },

  // Buttons
  buttonRow: { flexDirection: 'row', gap: 12, width: '100%', justifyContent: 'space-between' },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center', backgroundColor: '#f8fafc' },
  cancelBtnText: { color: '#334155', fontWeight: '500', fontSize: 15 },
  closeBtn: { flex: 1, padding: 14, borderRadius: 24, alignItems: 'center', backgroundColor: '#64748b' },
  closeBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  primaryBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center', backgroundColor: '#f59e0b' },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  buyBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center', backgroundColor: '#10b981' },
  buyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  disabledBtn: { flex: 1, padding: 14, borderRadius: 24, alignItems: 'center', backgroundColor: '#f1f5f9' },
  disabledBtnText: { color: '#94a3b8', fontWeight: '600', fontSize: 15 },
});
