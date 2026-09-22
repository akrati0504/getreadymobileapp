import React, { useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRejections } from '../redux/slices/rejectionSlice';
import styles from '../css/RejectedItemsStyles';
import TopHeader from '../components/TopHeader';

const RejectedItems = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { items, isLoading, error } = useSelector((state) => state.rejections);

  useEffect(() => {
    dispatch(fetchRejections());
  }, [dispatch]);

  const totalRejected = items ? items.filter((item) => item.is_approved === -1).length : 0;
  const totalResubmitted = items ? items.filter((item) => item.is_approved === null && item.resubmission_count > 0).length : 0;
  const totalItems = items ? items.length : 0;

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Manage Rejections</Text>
          <Text style={styles.pageSubtitle}>Review and address feedback from our moderation team.</Text>

          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Home')}>
            <Icon name="home-outline" size={18} color="#4b5563" />
            <Text style={styles.backBtnText}>BACK TO HOME</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#fef2f2' }]}>
              <Icon name="close-circle-outline" size={24} color="#ef4444" />
            </View>
            <Text style={styles.statLabel}>ACTION REQUIRED</Text>
            <Text style={styles.statValue}>{totalRejected}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#fefce8' }]}>
              <Icon name="hourglass-outline" size={24} color="#eab308" />
            </View>
            <Text style={styles.statLabel}>UNDER REVIEW</Text>
            <Text style={styles.statValue}>{totalResubmitted}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#f0fdf4' }]}>
              <Icon name="checkmark-outline" size={24} color="#22c55e" />
            </View>
            <Text style={styles.statLabel}>TOTAL ITEMS</Text>
            <Text style={styles.statValue}>{totalItems}</Text>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#d4af37" style={{ marginTop: 50 }} />
        ) : error ? (
          <Text style={{ textAlign: 'center', color: 'red', marginTop: 50 }}>{error}</Text>
        ) : totalItems > 0 ? (
          <View style={styles.listContainer}>
            {items.map((cloth) => {
              const isRejected = cloth.is_approved === -1;
              const formattedId = `ITEM #${String(cloth.id).padStart(5, '0')}`;
              
              return (
                <View key={cloth.id} style={styles.card}>
                  <View style={styles.cardImageGroup}>
                    <Image
                      source={cloth.image ? { uri: cloth.image } : require('../assets/images/logo.png')}
                      style={styles.cardImage}
                    />
                    {isRejected && (
                      <View style={styles.itemCountBadge}>
                        <Icon name="warning-outline" size={16} color="#fff" />
                      </View>
                    )}
                  </View>

                  <View style={styles.cardInfo}>
                    <View style={styles.orderMeta}>
                      <Text style={styles.orderId}>{formattedId}</Text>
                      <View style={[styles.statusBadge, isRejected ? styles.badgeRejected : styles.badgePending]}>
                        <Text style={[styles.statusText, isRejected ? styles.textRejected : styles.textPending]}>
                          {isRejected ? 'REJECTED' : 'RESUBMITTED'}
                        </Text>
                      </View>
                      <Text style={styles.metaText}>
                        <Icon name="time-outline" size={12} /> {new Date(cloth.updated_at).toLocaleDateString()}
                      </Text>
                    </View>

                    <Text style={styles.itemTitle}>{cloth.title}</Text>
                    <Text style={styles.itemCategory}>{cloth.category}</Text>

                    {isRejected ? (
                      <View style={[styles.pill, styles.pillRejected]}>
                        <Icon name="alert-circle-outline" size={20} color="#ef4444" style={{ marginRight: 10, marginTop: 2 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.pillLabel, { color: '#ef4444' }]}>Issue Reported by Moderation</Text>
                          <Text style={[styles.pillInfo, { color: '#1f2937' }]}>{cloth.reason}</Text>
                        </View>
                      </View>
                    ) : (
                      <View style={[styles.pill, styles.pillPending]}>
                        <Icon name="time-outline" size={20} color="#eab308" style={{ marginRight: 10, marginTop: 2 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.pillLabel, { color: '#4b5563' }]}>Awaiting Admin Review</Text>
                          <Text style={[styles.pillInfo, { color: '#6b7280' }]}>We will notify you once approved</Text>
                        </View>
                      </View>
                    )}

                    <View style={styles.priceSection}>
                      <Text style={styles.priceLabel}>Rental Price</Text>
                      <Text style={styles.priceValue}>₹{Number(cloth.rent_price).toLocaleString('en-IN')}</Text>
                    </View>

                    <View style={styles.actionBtns}>
                      {isRejected ? (
                        <TouchableOpacity 
                          style={[styles.btn, styles.btnFixNow]}
                          onPress={() => navigation.navigate('FixRejection', { id: cloth.id })}
                        >
                          <Icon name="color-wand-outline" size={16} color="#fff" />
                          <Text style={styles.btnText}>FIX NOW</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={[styles.btn, styles.btnPending]}>
                          <Icon name="hourglass-outline" size={16} color="#6b7280" />
                          <Text style={styles.btnTextPending}>PENDING</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyStateCard}>
            <View style={styles.emptyStateIconContainer}>
              <Icon name="checkmark-circle-outline" size={100} color="#22c55e" />
            </View>
            <Text style={styles.emptyStateTitle}>No Rejected Items</Text>
            <Text style={styles.emptyStateText}>
              Great job! You don't have any items requiring action right now. All your listings are either approved or under review.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default RejectedItems;
