import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { cancelOrder, returnOrder, rateOrder, getBuyQuote, getExtendQuote } from '../redux/slices/orderSlice';

export const CancelOrderModal = ({ visible, onClose, orderId, onComplete }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    await dispatch(cancelOrder({ orderId }));
    setLoading(false);
    onComplete();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Cancel Order</Text>
          <Text style={styles.modalBody}>Are you sure you want to cancel this order?</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleCancel} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.dangerButtonText}>Confirm Cancel</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const ReturnOrderModal = ({ visible, onClose, orderId, isEarly, onComplete }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleReturn = async () => {
    setLoading(true);
    await dispatch(returnOrder({ orderId, type: isEarly ? 'early' : 'normal', return_date: new Date().toISOString() }));
    setLoading(false);
    onComplete();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{isEarly ? 'Early Return' : 'Return Order'}</Text>
          <Text style={styles.modalBody}>Proceed with returning this rental?</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleReturn} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Confirm Return</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const RateOrderModal = ({ visible, onClose, orderId, onComplete }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);

  const handleRate = async () => {
    setLoading(true);
    await dispatch(rateOrder({ orderId, rating, review: 'Great' })); // placeholder review
    setLoading(false);
    onComplete();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Rate Order</Text>
          <Text style={styles.modalBody}>How was your experience?</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleRate} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Submit Review</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#1e293b' },
  modalBody: { fontSize: 14, color: '#475569', marginBottom: 20, textAlign: 'center' },
  buttonRow: { flexDirection: 'row', gap: 10, width: '100%', justifyContent: 'space-between' },
  button: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#f1f5f9' },
  cancelButtonText: { color: '#475569', fontWeight: 'bold' },
  dangerButton: { backgroundColor: '#ef4444' },
  dangerButtonText: { color: '#fff', fontWeight: 'bold' },
  primaryButton: { backgroundColor: '#2563eb' },
  primaryButtonText: { color: '#fff', fontWeight: 'bold' }
});
