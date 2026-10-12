import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Clipboard,
  ToastAndroid,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import api from '../api/api';
import TopHeader from '../components/TopHeader';

const MyTransactions = () => {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('ALL'); // ALL, DEBIT, CREDIT

  const token = useSelector((state) => state.auth?.token || state.auth?.user?.token);

  const fetchTransactions = useCallback(async (isRefresh = false) => {
    if (!token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      if (!isRefresh) setLoading(true);
      const response = await api.get('/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const resData = response.data;
      let txData = [];

      if (Array.isArray(resData)) {
        txData = resData;
      } else if (resData && typeof resData === 'object') {
        if (Array.isArray(resData.data)) {
          txData = resData.data;
        } else if (resData.transactions && Array.isArray(resData.transactions.data)) {
          txData = resData.transactions.data;
        } else if (resData.transactions && Array.isArray(resData.transactions)) {
          txData = resData.transactions;
        }
      }

      setTransactions(txData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      Alert.alert('Error', 'Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions(true);
  };

  const copyTransactionId = (txnId) => {
    if (!txnId || txnId === 'N/A') return;
    Clipboard.setString(txnId);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Transaction ID copied to clipboard', ToastAndroid.SHORT);
    } else {
      Alert.alert('Copied', 'Transaction ID copied to clipboard');
    }
  };

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return '0.00';
    return Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatMethodName = (method) => {
    if (!method) return 'Razorpay';
    return method
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((item) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'DEBIT') return item.type === 'debit';
    if (filterType === 'CREDIT') return item.type === 'credit';
    return true;
  });

  const renderTransactionItem = ({ item }) => {
    const isCredit = item.type === 'credit';
    const amountPrefix = isCredit ? '+' : '-';
    const amountColor = isCredit ? '#16a34a' : '#dc2626';
    const methodName = formatMethodName(item.method);
    const isRazorpay = (item.method || '').toLowerCase().includes('razorpay');

    return (
      <View style={styles.card}>
        {/* Card Header: Type Badge, Order ID and Amount */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            {/* Type badge */}
            <View
              style={[
                styles.typeBadge,
                isCredit ? styles.creditBadge : styles.debitBadge,
              ]}
            >
              <Icon
                name={isCredit ? 'arrow-down-outline' : 'arrow-up-outline'}
                size={12}
                color={isCredit ? '#16a34a' : '#dc2626'}
                style={{ marginRight: 3 }}
              />
              <Text
                style={[
                  styles.typeBadgeText,
                  { color: isCredit ? '#16a34a' : '#dc2626' },
                ]}
              >
                {isCredit ? 'Credit' : 'Debit'}
              </Text>
            </View>

            {/* Order ID */}
            {item.order_id && (
              <TouchableOpacity
                style={styles.orderIdContainer}
                onPress={() => navigation.navigate('Cart')}
                activeOpacity={0.7}
              >
                <Text style={styles.orderIdText}>
                  {item.order_number || `GR-${String(item.order_id).padStart(5, '0')}`}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Amount */}
          <Text style={[styles.amountText, { color: amountColor }]}>
            {amountPrefix} ₹{formatAmount(item.amount)}
          </Text>
        </View>

        {/* Description */}
        <Text style={styles.descriptionText}>
          {item.description || (isCredit ? 'Seller Earnings' : 'Payment for Order')}
        </Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Card Body: Details Rows */}
        <View style={styles.cardDetails}>
          {/* Date */}
          <View style={styles.detailRow}>
            <View style={styles.detailLabelCol}>
              <Icon name="calendar-outline" size={14} color="#6b7280" style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Date</Text>
            </View>
            <Text style={styles.detailValue}>
              {item.formatted_date || (item.date ? new Date(item.date).toLocaleDateString('en-GB') : 'N/A')}
            </Text>
          </View>

          {/* Transaction ID */}
          <View style={styles.detailRow}>
            <View style={styles.detailLabelCol}>
              <Icon name="receipt-outline" size={14} color="#6b7280" style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Txn ID</Text>
            </View>
            <TouchableOpacity
              style={styles.txnIdWrapper}
              onPress={() => copyTransactionId(item.transaction_id)}
              activeOpacity={0.7}
            >
              <Text style={styles.txnIdText} numberOfLines={1} ellipsizeMode="middle">
                {item.transaction_id || 'N/A'}
              </Text>
              <Icon name="copy-outline" size={13} color="#9ca3af" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          {/* Payment Method */}
          <View style={styles.detailRow}>
            <View style={styles.detailLabelCol}>
              <Icon name="card-outline" size={14} color="#6b7280" style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Method</Text>
            </View>
            <View style={styles.methodWrapper}>
              {isRazorpay && (
                <Icon name="shield-checkmark" size={14} color="#0284c7" style={{ marginRight: 4 }} />
              )}
              <Text style={styles.detailValue}>{methodName}</Text>
            </View>
          </View>

          {/* Status */}
          <View style={[styles.detailRow, { marginBottom: 0 }]}>
            <View style={styles.detailLabelCol}>
              <Icon name="information-circle-outline" size={14} color="#6b7280" style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Status</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                item.status === 'Paid' || item.status === 'Success' || item.status === 'Confirmed'
                  ? styles.statusPaid
                  : item.status === 'Refunded'
                  ? styles.statusRefunded
                  : styles.statusOther,
              ]}
            >
              <Icon
                name={
                  item.status === 'Paid' || item.status === 'Success' || item.status === 'Confirmed'
                    ? 'checkmark-circle'
                    : item.status === 'Refunded'
                    ? 'refresh-circle'
                    : 'alert-circle'
                }
                size={12}
                color={
                  item.status === 'Paid' || item.status === 'Success' || item.status === 'Confirmed'
                    ? '#15803d'
                    : item.status === 'Refunded'
                    ? '#0284c7'
                    : '#b45309'
                }
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      item.status === 'Paid' || item.status === 'Success' || item.status === 'Confirmed'
                        ? '#15803d'
                        : item.status === 'Refunded'
                        ? '#0284c7'
                        : '#b45309',
                  },
                ]}
              >
                {item.status || 'Paid'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopHeader />

      <View style={styles.container}>
        {/* Page Header Section matching Web view */}
        <View style={styles.pageHeader}>
          <View style={styles.headerTitleArea}>
            <View style={styles.titleRow}>
              <Icon name="card" size={24} color="#d97706" style={{ marginRight: 8 }} />
              <Text style={styles.pageTitle}>My Transactions</Text>
            </View>
            <Text style={styles.pageSubtitle}>
              Review all payment records and transaction statuses.
            </Text>
          </View>

          {/* Quick Nav Buttons: My Invoices & My Orders */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('MyInvoices')}
              activeOpacity={0.8}
            >
              <Icon name="receipt-outline" size={13} color="#1f2937" style={{ marginRight: 4 }} />
              <Text style={styles.actionBtnText}>Invoices</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('Cart')}
              activeOpacity={0.8}
            >
              <Icon name="bag-outline" size={13} color="#1f2937" style={{ marginRight: 4 }} />
              <Text style={styles.actionBtnText}>Orders</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterBar}>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'DEBIT', label: 'Debits' },
            { id: 'CREDIT', label: 'Credits' },
          ].map((tab) => {
            const active = filterType === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.filterChip, active && styles.activeFilterChip]}
                onPress={() => setFilterType(tab.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, active && styles.activeFilterChipText]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Transactions Content */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#d97706" />
            <Text style={styles.loadingText}>Loading transactions...</Text>
          </View>
        ) : filteredTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Icon name="card-outline" size={48} color="#d97706" />
            </View>
            <Text style={styles.emptyTitle}>No transactions found</Text>
            <Text style={styles.emptySubtitle}>
              Completed payments for orders and extensions will appear here.
            </Text>
            <TouchableOpacity
              style={styles.startShoppingBtn}
              onPress={() => navigation.navigate('Shop')}
              activeOpacity={0.85}
            >
              <Icon name="cart-outline" size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.startShoppingBtnText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredTransactions}
            keyExtractor={(item, index) => item.id ? String(item.id) : String(index)}
            renderItem={renderTransactionItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#d97706']}
                tintColor="#d97706"
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  pageHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitleArea: {
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  activeFilterChip: {
    backgroundColor: '#1f2937',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  activeFilterChipText: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  debitBadge: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  creditBadge: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  orderIdContainer: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  orderIdText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1f2937',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  descriptionText: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '500',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 12,
  },
  cardDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabelCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: 6,
    width: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  txnIdWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    maxWidth: '55%',
  },
  txnIdText: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#4b5563',
  },
  methodWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusPaid: {
    backgroundColor: '#dcfce7',
  },
  statusRefunded: {
    backgroundColor: '#e0f2fe',
  },
  statusOther: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  startShoppingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d97706',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  startShoppingBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default MyTransactions;
