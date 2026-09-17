import React, { useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyListings } from '../redux/slices/outfitSlice';
import styles from '../css/ListingsStyles';
import TopHeader from '../components/TopHeader';

const Listings = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const { myListings, myListingsLoading } = useSelector((state) => state.outfit);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchMyListings());
    }, [dispatch])
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Section */}
      <TopHeader />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>My Listed Clothes</Text>
          <Text style={styles.pageSubtitle}>Manage, track, and optimize your fashion collection</Text>

          <TouchableOpacity style={styles.listNewItemBtn} onPress={() => navigation.navigate('Sell')}>
            <Icon name="add-outline" size={20} color="#fff" />
            <Text style={styles.listNewItemText}>LIST NEW ITEM</Text>
          </TouchableOpacity>
        </View>

        {/* Listings List */}
        {myListingsLoading && !myListings?.length ? (
          <ActivityIndicator size="large" color="#f59e0b" style={{ marginTop: 50 }} />
        ) : (
          myListings && myListings.length > 0 ? (
            myListings.map((item) => {
              const API_BASE_URL = 'http://192.168.1.11:8000';
              const imageUrl = item.images && item.images.length > 0 
                ? { uri: `${API_BASE_URL}/storage/${item.images[0].image_path}` }
                : require('../assets/images/logo.png');
                
              const updatedDate = new Date(item.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

              const tags = [];
              if (item.category?.name) tags.push(item.category.name);
              if (item.user_type) tags.push(item.user_type);
              if (item.size?.name) tags.push(`SIZE: ${item.size.name}`);
              if (item.condition?.name) tags.push(item.condition.name);

              const rentEntered = parseFloat(item.rent_price || 0);
              const platformFee = rentEntered * 0.20;
              const earnings = rentEntered * 0.80;

              return (
                <View key={item.id} style={styles.card}>
                  <Image source={imageUrl} style={styles.cardImage} resizeMode="cover" />

                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={3}>{item.title}</Text>

                    <View style={styles.tagsContainer}>
                      {tags.map((tag, index) => (
                        <View key={index} style={styles.tagPill}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>

                    {item.rent_price > 0 && (
                      <View style={styles.pricingContainer}>
                        <View style={styles.pricingRow}>
                          <Text style={styles.pricingLabel}>Rent Entered</Text>
                          <Text style={styles.pricingValue}>₹{rentEntered}</Text>
                        </View>
                        <View style={styles.pricingRow}>
                          <Text style={styles.pricingLabel}>Platform Fee (20%)</Text>
                          <Text style={[styles.pricingValue, {color: '#ef4444'}]}>-₹{platformFee}</Text>
                        </View>
                        <View style={styles.pricingDivider} />
                        <View style={styles.pricingRow}>
                          <Text style={styles.earningsLabel}>Your Earnings</Text>
                          <Text style={styles.earningsValue}>₹{earnings}</Text>
                        </View>
                      </View>
                    )}

                    <View style={styles.cardFooter}>
                      <Text style={styles.footerText}># SKU: {item.sku} | Updated: {updatedDate}</Text>
                    </View>
                  </View>

                  <View style={styles.actionsContainer}>
                    <TouchableOpacity style={[styles.actionBtn, styles.actionStatus]}>
                      <Icon name="checkmark-circle" size={16} color="#10b981" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionBtn, styles.actionView]}
                      onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
                    >
                      <Icon name="eye-outline" size={16} color="#475569" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionBtn, styles.actionEdit]}
                      onPress={() => navigation.navigate('EditCloth', { cloth: item })}
                    >
                      <Icon name="create-outline" size={16} color="#3b82f6" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.actionDelete]}>
                      <Icon name="trash-outline" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <Text style={{ color: '#64748b' }}>You have not listed any items yet.</Text>
            </View>
          )
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

export default Listings;
