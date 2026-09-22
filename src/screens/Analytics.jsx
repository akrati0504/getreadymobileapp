import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, TextInput, ScrollView, ActivityIndicator, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSales } from '../redux/slices/orderSlice';
import styles from '../css/AnalyticsStyles';
import TopHeader from '../components/TopHeader';

const Analytics = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { sales, isLoading } = useSelector(state => state.order);
  const { user } = useSelector(state => state.auth);
  const token = user?.token;

  const [stats, setStats] = useState({ totalEarnings: '₹0', pendingEarnings: '₹0', activeRentals: 0 });
  const [activeInvoiceMenu, setActiveInvoiceMenu] = useState(null);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchSales());
    }, [dispatch])
  );

  useEffect(() => {
    if (sales?.data) {
      let total = 0;
      let pending = 0;
      let active = 0;
      
      sales.data.forEach(order => {
        let orderTotal = 0;
        if (order.items) {
           orderTotal = order.items.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
        }
        total += orderTotal;
        
        if (order.status === 'Pending') {
           pending += orderTotal;
        } else if (!['Delivered', 'Cancelled', 'Returned'].includes(order.status)) {
           active++;
        }
      });
      
      setStats({
        totalEarnings: `₹${total.toLocaleString('en-IN')}`,
        pendingEarnings: `₹${pending.toLocaleString('en-IN')}`,
        activeRentals: active
      });
    }
  }, [sales]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Section */}
      <TopHeader />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>My Sales Dashboard</Text>
          <Text style={styles.pageSubtitle}>Track your earnings and manage incoming rental/sale requests</Text>

          <TouchableOpacity
            style={styles.backToHomeBtn}
            onPress={() => navigation.navigate('HomeTab')}
          >
            <Icon name="home-outline" size={16} color="#64748b" />
            <Text style={styles.backToHomeText}>BACK TO HOME</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (!sales?.data || sales.data.length === 0) ? (
          <ActivityIndicator size="large" color="#f59e0b" style={{ marginTop: 50 }} />
        ) : sales?.data && sales.data.length > 0 ? (
          <View style={styles.dashboardContainer}>
            {/* Stats Overview */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <View style={[styles.statIconWrapper, { backgroundColor: '#dcfce7' }]}>
                  <Icon name="wallet-outline" size={20} color="#16a34a" />
                </View>
                <Text style={styles.statLabel}>Total Revenue</Text>
                <Text style={styles.statValue}>{stats.totalEarnings}</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIconWrapper, { backgroundColor: '#e0e7ff' }]}>
                  <Icon name="bag-handle-outline" size={20} color="#4f46e5" />
                </View>
                <Text style={styles.statLabel}>Total Sales</Text>
                <Text style={styles.statValue}>{sales.total || sales.data.length}</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIconWrapper, { backgroundColor: '#ffedd5' }]}>
                  <Icon name="car-outline" size={20} color="#f97316" />
                </View>
                <Text style={styles.statLabel}>Active Orders</Text>
                <Text style={styles.statValue}>{stats.activeRentals}</Text>
              </View>
            </View>

            {/* Recent Transactions */}
            <View style={styles.transactionsSection}>
              {sales.data.map((order) => {
                const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
                const clothName = firstItem?.cloth?.title || 'Sale Item';
                const API_BASE_URL = 'http://192.168.1.5:8000';
                const imageSource = firstItem?.cloth?.images?.[0]?.image_path 
                    ? { uri: `${API_BASE_URL}/storage/${firstItem.cloth.images[0].image_path}` }
                    : require('../assets/images/logo.png');
                
                const type = order.has_rental_items ? 'Rental' : 'Purchase';
                const amount = order.items ? order.items.reduce((sum, item) => sum + parseFloat(item.price || 0), 0) : 0;
                
                // Find Seller Invoice
                const invoice = order.invoices?.find(inv => inv.issued_to_id === order.items?.[0]?.cloth?.user_id);
                const invoiceNumber = invoice?.invoice_number || `INV-${String(order.id).padStart(5, '0')}`;
                
                const handleInvoiceDownload = () => {
                  if (invoice) {
                    Linking.openURL(`${API_BASE_URL}/invoices/${invoice.id}/download?token=${token}`);
                    setActiveInvoiceMenu(null);
                  }
                };

                return (
                <View key={order.id} style={[styles.transactionCard, { zIndex: activeInvoiceMenu === order.id ? 100 : 1 }]}>
                  <View style={styles.txLeft}>
                    <Image source={imageSource} style={styles.txImage} />
                    <Text style={styles.txOrderId}>#{String(order.id).padStart(5, '0')}</Text>
                    <View style={styles.txTypeBadge}>
                      <Text style={styles.txTypeText}>{type}</Text>
                    </View>
                  </View>

                  <View style={styles.txRight}>
                    <View style={[styles.txHeaderRow, { zIndex: 100 }]}>
                      <View style={styles.userPill}>
                        <View style={styles.userAvatar}>
                          <Text style={styles.userAvatarText}>U</Text>
                        </View>
                        <Text style={styles.userName}>User-{order.buyer_id || order.user_id || '0000'}</Text>
                      </View>
                      
                      {invoice && (
                        <View style={{ position: 'relative' }}>
                          <TouchableOpacity 
                            style={styles.invoiceBtn} 
                            onPress={() => setActiveInvoiceMenu(activeInvoiceMenu === order.id ? null : order.id)}
                          >
                            <Icon name="document-text-outline" size={14} color="#ef4444" />
                            <Text style={styles.invoiceBtnText}>Invoices</Text>
                            <Icon name="chevron-down-outline" size={12} color="#64748b" />
                          </TouchableOpacity>
                          
                          {activeInvoiceMenu === order.id && (
                            <View style={styles.invoiceDropdown}>
                              <TouchableOpacity style={styles.invoiceDropdownItem} onPress={handleInvoiceDownload}>
                                <Icon name="download-outline" size={16} color="#3b82f6" />
                                <Text style={styles.invoiceDropdownText}>{invoiceNumber}</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                    
                    <Text style={styles.txTitle}>{clothName}</Text>
                    
                    <View style={styles.statusPill}>
                      <Text style={styles.statusText}>{order.status}</Text>
                    </View>
                    
                    <Text style={styles.earningsLabel}>YOU EARNED</Text>
                    <Text style={styles.txAmount}>₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                  </View>
                </View>
              )})}
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.emptyIconWrapper}>
              <Icon name="bag-remove-outline" size={80} color="#cbd5e1" />
            </View>

            <Text style={styles.emptyTitle}>No sales yet</Text>
            <Text style={styles.emptyDescription}>
              Your collection is waiting for its first admirer!
            </Text>

            <TouchableOpacity
              style={styles.manageListingsBtn}
              onPress={() => navigation.navigate('Listings')}
            >
              <Text style={styles.manageListingsText}>Manage Your Listings</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Analytics;
