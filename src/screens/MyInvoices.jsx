import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import api, { BASE_URL } from '../api/api';
import TopHeader from '../components/TopHeader';

const MyInvoices = () => {
  const navigation = useNavigation();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState('');
  
  const token = useSelector((state) => state.auth?.token || state.auth?.user?.token);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await api.get('/invoices', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setDebugInfo(JSON.stringify(response.data, null, 2));
        
        const resData = response.data;
        let invoiceData = [];
        
        if (Array.isArray(resData)) {
          invoiceData = resData;
        } else if (resData && typeof resData === 'object') {
          if (Array.isArray(resData.data)) {
            invoiceData = resData.data;
          } else if (resData.invoices && Array.isArray(resData.invoices.data)) {
            invoiceData = resData.invoices.data;
          } else if (resData.invoices && Array.isArray(resData.invoices)) {
            invoiceData = resData.invoices;
          }
        }
        
        setInvoices(invoiceData);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        setDebugInfo(error.message + ' | ' + (error.response ? JSON.stringify(error.response.data) : 'No response'));
        Alert.alert("Error", "Failed to load invoices. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [token]);

  const getBadgeStyle = (type) => {
    if (!type) return { bg: '#f3f4f6', text: '#4b5563' };
    
    const lowerType = type.toLowerCase();
    if (lowerType.includes('seller')) {
      return { bg: '#1f2937', text: '#ffffff' }; // Dark premium badge
    } else if (lowerType.includes('rent') || lowerType.includes('tax')) {
      return { bg: '#e0f2fe', text: '#0284c7' }; // Blue tint
    }
    return { bg: '#f3f4f6', text: '#4b5563' }; // Light grey badge
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatAmount = (amount) => {
    if (!amount) return '0.00';
    return parseFloat(amount).toFixed(2);
  };

  const formatOrderId = (id) => {
    if (!id) return 'N/A';
    return `GR-${String(id).padStart(5, '0')}`;
  };

  const formatType = (type) => {
    if (!type || typeof type !== 'string') return 'Unknown';
    if (type === 'rent_sale') return 'Tax Invoice (Items)';
    if (type === 'platform_fee_buyer') return 'Service Fee (Platform)';
    if (type === 'platform_fee_seller') return 'Seller Fee';
    return type.replace(/_/g, ' ').toUpperCase();
  };

  const handleDownload = (invoiceId) => {
    // Uses the /invoices/{id}/download endpoint
    const baseURL = api.defaults.baseURL || `${BASE_URL}/api`;
    // Note: If your API strictly requires the bearer token for downloads, you may need to append it as a query param
    // depending on how Laravel handles the download route. 
    const downloadUrl = `${baseURL}/invoices/${invoiceId}/download?token=${token}`;
    
    Linking.openURL(downloadUrl).catch(err => {
      console.error("Failed to open URL", err);
      Alert.alert("Error", "Could not start the download.");
    });
  };

  const renderInvoiceItem = ({ item }) => {
    const displayType = formatType(item.type);
    const badge = getBadgeStyle(displayType);
    
    return (
      <View style={styles.premiumCard}>
        {/* Card Header: Invoice # and Amount */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.invoiceLabel}>INVOICE NUMBER</Text>
            <Text style={styles.invoiceNumber}>{item.invoice_number}</Text>
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.amount}>{formatAmount(item.amount)}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Card Body: Details */}
        <View style={styles.cardBody}>
          <View style={styles.detailCol}>
            <View style={styles.detailRow}>
              <Icon name="calendar-outline" size={14} color="#6b7280" style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>{formatDate(item.created_at)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="cube-outline" size={14} color="#6b7280" style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Order ID:</Text>
              <Text style={styles.detailValue}>{formatOrderId(item.order_id)}</Text>
            </View>
          </View>
        </View>

        {/* Card Footer: Type and Actions */}
        <View style={styles.cardFooter}>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.text }]}>{displayType}</Text>
          </View>
          
          <TouchableOpacity style={styles.downloadButton} onPress={() => handleDownload(item.id)}>
            <Icon name="cloud-download-outline" size={18} color="#FFA500" />
            <Text style={styles.downloadText}>Download</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopHeader />
      
      <View style={styles.container}>
        <View style={styles.titleSection}>
          <View style={styles.titleLeft}>
            <View style={styles.titleRow}>
              <Icon name="document-text-outline" size={28} color="#FFA500" style={styles.titleIcon} />
              <Text style={styles.pageTitle}>My Invoices</Text>
            </View>
            <Text style={styles.pageSubtitle}>Manage and download your receipts.</Text>
          </View>
          <TouchableOpacity style={styles.myOrdersButton} onPress={() => navigation.navigate('Cart')}>
            <Icon name="bag-outline" size={16} color="#4b5563" />
            <Text style={styles.myOrdersText}>My Orders</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#FFA500" />
          </View>
        ) : invoices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="receipt-outline" size={60} color="#e5e7eb" />
            <Text style={styles.emptyText}>No invoices found</Text>
            <Text style={{ marginTop: 20, fontSize: 10, color: 'red', textAlign: 'center' }}>
              DEBUG INFO: {debugInfo}
            </Text>
          </View>
        ) : (
          <FlatList
            data={invoices}
            keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
            renderItem={renderInvoiceItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
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
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  titleLeft: {
    flex: 1,
    paddingRight: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleIcon: {
    marginRight: 6,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '600',
    color: '#1f2937',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  myOrdersButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  myOrdersText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 4,
  },
  premiumCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invoiceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  invoiceNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  amountSymbol: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFA500',
    marginTop: 2,
    marginRight: 2,
  },
  amount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFA500',
    letterSpacing: -0.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 14,
  },
  cardBody: {
    marginBottom: 16,
  },
  detailCol: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6b7280',
    width: 70,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f9fafb',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  downloadText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFA500',
    marginLeft: 6,
  },
  centerContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#9ca3af',
  },
});

export default MyInvoices;
