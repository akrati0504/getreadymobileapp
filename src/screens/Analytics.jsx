import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import styles from '../css/AnalyticsStyles';
import TopHeader from '../components/TopHeader';

const mockSalesData = null;

const Analytics = () => {
  const navigation = useNavigation();

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

        {mockSalesData && mockSalesData.transactions.length > 0 ? (
          <View style={styles.dashboardContainer}>
            {/* Stats Overview */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: '#FFA500' }]}>
                <Text style={styles.statLabelLight}>Total Earnings</Text>
                <Text style={styles.statValueLight}>{mockSalesData.stats.totalEarnings}</Text>
              </View>
              <View style={styles.statsColumn}>
                <View style={styles.smallStatCard}>
                  <Text style={styles.statLabel}>Pending</Text>
                  <Text style={styles.statValueOrange}>{mockSalesData.stats.pendingEarnings}</Text>
                </View>
                <View style={styles.smallStatCard}>
                  <Text style={styles.statLabel}>Active Rentals</Text>
                  <Text style={styles.statValue}>{mockSalesData.stats.activeRentals}</Text>
                </View>
              </View>
            </View>

            {/* Recent Transactions */}
            <View style={styles.transactionsSection}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>

              {mockSalesData.transactions.map((tx) => (
                <View key={tx.id} style={styles.transactionCard}>
                  <Image source={tx.image} style={styles.txImage} />
                  <View style={styles.txDetails}>
                    <Text style={styles.txTitle} numberOfLines={1}>{tx.title}</Text>
                    <View style={styles.txMetaRow}>
                      <View style={styles.txTypeBadge}>
                        <Text style={styles.txTypeText}>{tx.type}</Text>
                      </View>
                      <Text style={styles.txDate}>{tx.date}</Text>
                    </View>
                    <Text style={[
                      styles.txStatus,
                      tx.status === 'Completed' ? styles.statusCompleted :
                        tx.status === 'Active' ? styles.statusActive : styles.statusPending
                    ]}>{tx.status}</Text>
                  </View>
                  <View style={styles.txAmountContainer}>
                    <Text style={styles.txAmount}>{tx.amount}</Text>
                  </View>
                </View>
              ))}
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
