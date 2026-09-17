import React from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import styles from '../css/RejectedItemsStyles';
import TopHeader from '../components/TopHeader';

const RejectedItems = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Section */}
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
            <Text style={styles.statValue}>0</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#fefce8' }]}>
              <Icon name="hourglass-outline" size={24} color="#eab308" />
            </View>
            <Text style={styles.statLabel}>UNDER REVIEW</Text>
            <Text style={styles.statValue}>0</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#f0fdf4' }]}>
              <Icon name="checkmark-outline" size={24} color="#22c55e" />
            </View>
            <Text style={styles.statLabel}>TOTAL ITEMS</Text>
            <Text style={styles.statValue}>0</Text>
          </View>
        </View>

        {/* Empty State */}
        <View style={styles.emptyStateCard}>
          <View style={styles.emptyStateIconContainer}>
            <Icon name="checkmark-circle-outline" size={100} color="#22c55e" />
          </View>
          <Text style={styles.emptyStateTitle}>No Rejected Items</Text>
          <Text style={styles.emptyStateText}>
            Great job! You don't have any items requiring action right now. All your listings are either approved or under review.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default RejectedItems;
