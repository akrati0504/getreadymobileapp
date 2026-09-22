import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView, Dimensions, TextInput, ActivityIndicator, Alert, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import styles from '../css/ProductDetailsStyles';
import TopHeader from '../components/TopHeader';

import api from '../api/api';

const CustomCalendar = ({ selectedDate, onSelect, minDate, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(minDate ? new Date(minDate) : new Date());

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const renderDays = () => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minD = minDate ? new Date(minDate) : today;
    minD.setHours(0, 0, 0, 0);

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} style={{ width: '14.28%', aspectRatio: 1 }} />);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      const isPast = dateObj < minD;

      const pad = (n) => n < 10 ? '0' + n : n;
      const dateStr = `${currentMonth.getFullYear()}-${pad(currentMonth.getMonth() + 1)}-${pad(i)}`;
      const isSelected = selectedDate === dateStr;

      days.push(
        <TouchableOpacity
          key={i}
          style={{
            width: '14.28%',
            aspectRatio: 1,
            justifyContent: 'center',
            alignItems: 'center'
          }}
          disabled={isPast}
          onPress={() => onSelect(dateStr)}
        >
          <View style={{
            width: 32, height: 32, borderRadius: 16,
            backgroundColor: isSelected ? '#e6f7eb' : 'transparent',
            justifyContent: 'center', alignItems: 'center'
          }}>
            <Text style={{
              color: isPast ? '#ccc' : (isSelected ? '#007a33' : '#333'),
              fontWeight: isSelected ? 'bold' : 'normal'
            }}>{i}</Text>
          </View>
        </TouchableOpacity>
      );
    }
    return days;
  };

  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 15, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
        <Text style={{ fontSize: 16, color: '#333' }}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={handlePrevMonth} style={{ padding: 5 }}>
            <Icon name="chevron-back" size={20} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNextMonth} style={{ padding: 5 }}>
            <Icon name="chevron-forward" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
          <Text key={d} style={{ width: '14.28%', textAlign: 'center', fontSize: 11, color: '#888', fontWeight: 'bold' }}>{d}</Text>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {renderDays()}
      </View>
      <TouchableOpacity style={{ marginTop: 10, alignSelf: 'flex-end', padding: 5 }} onPress={onClose}>
        <Text style={{ color: '#007a33', fontWeight: 'bold' }}>CLOSE</Text>
      </TouchableOpacity>
    </View>
  );
};

const ProductDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const auth = useSelector((state) => state.auth);
  const isAuthenticated = auth?.isAuthenticated;
  const token = auth?.user?.token || auth?.token;

  // Depending on how login sets the payload, it might be nested
  const currentUserId = auth?.user?.user?.id || auth?.user?.id || auth?.userData?.id || null;

  // Only accept productId from navigation params
  const { productId } = route.params || {};

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageWidth, setImageWidth] = useState(Dimensions.get('window').width);
  const flatListRef = useRef(null);

  // Rental state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isRenting, setIsRenting] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [rentalDays, setRentalDays] = useState(0);
  const [rentalCost, setRentalCost] = useState(0);
  const [isRented, setIsRented] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);

  // Generate simple next 30 days for JS picker
  const [availableDates, setAvailableDates] = useState([]);

  useEffect(() => {
    const dates = [];
    let d = new Date();
    for (let i = 0; i < 30; i++) {
      dates.push(d.toISOString().split('T')[0]);
      d.setDate(d.getDate() + 1);
    }
    setAvailableDates(dates);
  }, []);

  const handleStartDateSelect = (dateStr) => {
    setStartDate(dateStr);
    setShowStartDatePicker(false);

    // Auto calculate End Date (+3 days) exactly like jQuery logic
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 3);
    const endStr = d.toISOString().split('T')[0];
    setEndDate(endStr);

    calculateRent(dateStr, endStr);
  };

  const handleEndDateSelect = (dateStr) => {
    setEndDate(dateStr);
    setShowEndDatePicker(false);
    calculateRent(startDate, dateStr);
  };

  const getAvailableEndDates = () => {
    if (!startDate) return [];
    return availableDates.filter(d => new Date(d) >= new Date(startDate));
  };

  const isSeller = product && currentUserId === product.user_id;

  // Pricing Logic (20% Fee)
  const getPricing = (basePrice) => {
    const price = Number(basePrice) || 0;
    const fee = Math.round(price * 0.20);
    return {
      base: price,
      fee: fee,
      buyerPrice: price + fee,
      sellerEarnings: price - fee
    };
  };

  const rentPricing = product ? getPricing(product.rent_price) : { base: 0, fee: 0, buyerPrice: 0, sellerEarnings: 0 };
  const buyPricing = product ? getPricing(product.selling_price) : { base: 0, fee: 0, buyerPrice: 0, sellerEarnings: 0 };

  const effectiveRent = isSeller ? rentPricing.sellerEarnings : rentPricing.buyerPrice;
  const effectiveBuy = isSeller ? buyPricing.sellerEarnings : buyPricing.buyerPrice;

  const calculateRent = (start, end) => {
    if (!start || !end || !product) return;
    const diffTime = Math.abs(new Date(end) - new Date(start));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    setRentalDays(diffDays);

    const basePrice = rentPricing.buyerPrice; // Buyers always pay the marked up price
    const dailyRate = basePrice / 4;
    let total = basePrice;

    if (diffDays > 4) {
      total += (diffDays - 4) * dailyRate;
    }
    setRentalCost(Math.round(total));
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) {
        setLoading(false);
        Alert.alert("Error", "No product ID provided");
        return;
      }

      try {
        setLoading(true);

        const headers = {};
        if (isAuthenticated && token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await api.get(`/clothes/${productId}`, { headers });
        const json = response.data;

        if (json.success) {
          setProduct(json.data.cloth);
        } else {
          Alert.alert("Error", json.message || "Failed to fetch product details");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Could not connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId, isAuthenticated, token]);

  const handleRent = async () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    // TODO: In a real app, you would read these from a DatePicker component
    if (!startDate || !endDate) {
      Alert.alert('Missing Dates', 'Please select a start and end date to rent this item.');
      return;
    }

    setIsRenting(true);
    try {
      const payload = {
        cloth_id: product.id,
        rental_start_date: startDate,
        rental_end_date: endDate,
        // In the app you'd calculate these properly based on dates
        rental_days: rentalDays > 0 ? rentalDays : 4,
        total_rental_cost: rentalCost > 0 ? rentalCost : product.rent_price,
      };

      const response = await dispatch(addToCart(payload)).unwrap();

      if (response.success) {
        setIsRented(true);
        Alert.alert('Success', 'Item added to your bag for renting!', [
          { text: 'OK', onPress: () => navigation.navigate('Home', { screen: 'Shop' }) }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Error adding to bag');
      }
    } catch (error) {
      console.log('Cart Rent Error:', error);
      Alert.alert('Error', error?.message || typeof error === 'string' ? error : 'Failed to add item to cart.');
    } finally {
      setIsRenting(false);
    }
  };

  const handleBuy = async () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }

    setIsBuying(true);
    try {
      const payload = {
        cloth_id: product.id,
        purchase_type: 'buy',
      };

      const response = await dispatch(addToCart(payload)).unwrap();

      if (response.success) {
        setIsPurchased(true);
        Alert.alert('Success', 'Item added to your bag for purchase!', [
          { text: 'OK', onPress: () => navigation.navigate('Home', { screen: 'Shop' }) }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Error adding to bag');
      }
    } catch (error) {
      console.log('Cart Buy Error:', error);
      Alert.alert('Error', error?.message || typeof error === 'string' ? error : 'Failed to add item to cart.');
    } finally {
      setIsBuying(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4169e1" />
        <Text style={{ marginTop: 10 }}>Loading details...</Text>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>No product data available</Text>
      </SafeAreaView>
    );
  }

  // Format images cleanly from Laravel relationship
  const gallery = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map(img => `http://192.168.1.5:8000/storage/${img.image_path}`)
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <View
            style={styles.mainImageWrapper}
            onLayout={(event) => setImageWidth(event.nativeEvent.layout.width)}
          >
            {gallery.length > 0 ? (
              <FlatList
                ref={flatListRef}
                data={gallery}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, index) => index.toString()}
                onMomentumScrollEnd={(event) => {
                  const slideSize = event.nativeEvent.layoutMeasurement.width;
                  const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
                  setActiveImageIndex(index);
                }}
                renderItem={({ item }) => (
                  <View style={{ width: imageWidth, height: '100%' }}>
                    <Image
                      source={{ uri: item }}
                      style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                    />
                  </View>
                )}
              />
            ) : (
              <Text style={{ textAlign: 'center', marginTop: 100 }}>No Image Provided</Text>
            )}

            {product.is_approved === 1 && (
              <View style={styles.qcBadge}>
                <Icon name="checkmark-circle" size={16} color="#0066ff" />
                <Text style={styles.qcBadgeText}>QC Passed</Text>
              </View>
            )}
          </View>

          <View style={styles.thumbnailsContainer}>
            {gallery.map((img, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.thumbnailWrapper, activeImageIndex === index && styles.thumbnailWrapperActive]}
                onPress={() => {
                  setActiveImageIndex(index);
                  flatListRef.current?.scrollToIndex({ index, animated: true });
                }}
                activeOpacity={0.8}
              >
                <Image source={{ uri: img }} style={styles.thumbnailImage} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Product Basic Info Block */}
        <View style={styles.cardSection}>
          <View style={styles.tagsRow}>
            {product.category && (
              <View style={styles.tagPill}>
                <Icon name="pricetag" size={12} color="#4169e1" />
                <Text style={styles.tagText}>{product.category.name}</Text>
              </View>
            )}

            {product.color && (
              <View style={[styles.tagPill, styles.tagPillGold]}>
                <Icon name="color-palette" size={12} color="#c71585" />
                <Text style={[styles.tagText, styles.tagTextGold]}>{product.color.name}</Text>
              </View>
            )}

            {product.size && (
              <View style={[styles.tagPill, styles.tagPillOrange]}>
                <Icon name="resize" size={12} color="#ff4500" />
                <Text style={[styles.tagText, styles.tagTextOrange]}>Size {product.size.name}</Text>
              </View>
            )}
          </View>

          <Text style={styles.titleText}>{product.title}</Text>
          <Text style={styles.brandText}>{product.brand?.name}</Text>
          <Text style={styles.productCodeText}>PRODUCT CODE: {product.sku}</Text>

          <View style={styles.divider} />

          <View style={styles.attributesRow}>
            <View style={styles.attributeColumn}>
              <Text style={styles.attributeLabel}>FIT TYPE</Text>
              <Text style={styles.attributeValue}>{product.fitType?.name || 'Standard'}</Text>
            </View>
            <View style={styles.attributeColumn}>
              <Text style={styles.attributeLabel}>CONDITION</Text>
              <View style={styles.attributeValueGreen}>
                <Icon name="checkmark-circle-outline" size={16} color="#2e8b57" />
                <Text style={styles.attributeValueGreenText}>{product.condition?.name || 'Good'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>
            MEASUREMENTS <Icon name="information-circle-outline" size={14} color="#888" />
          </Text>
          <Text style={styles.measurementsText}>
            Chest: {product.chest_bust || 'N/A'} {product.measurement_unit}  ·
            Waist: {product.waist || 'N/A'} {product.measurement_unit}  ·
            Length: {product.length || 'N/A'} {product.measurement_unit}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>FABRIC & HIGHLIGHTS</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
        </View>

        {/* Details & Care Block */}
        <View style={styles.cardSection}>
          <Text style={styles.detailsTitle}>Product Details & Care</Text>
          <View style={styles.careListItem}>
            <Icon name="water" size={18} color="#00a8cc" />
            <Text style={styles.careListText}>
              {product.is_cleaned ? 'Freshly Cleaned & Sanitized' : 'Professional Dry Clean Only'}
            </Text>
          </View>
          <View style={styles.careListItem}>
            <Icon name="shirt-outline" size={18} color="#00a8cc" />
            <Text style={styles.careListText}>Material: {product.fabric?.name || 'Premium Fabric'}</Text>
          </View>
          {product.defects && (
            <View style={styles.careListItem}>
              <Icon name="alert-circle-outline" size={18} color="#ff4500" />
              <Text style={[styles.careListText, { color: '#ff4500' }]}>Note: {product.defects}</Text>
            </View>
          )}
        </View>

        {/* Pricing & Booking Block */}
        <View style={styles.cardSection}>
          <View style={styles.priceRowMain}>
            <Text style={styles.priceMainText}>₹{effectiveRent}</Text>
            <Text style={styles.priceDaysText}>/4 days</Text>

            <View style={styles.trustedBadge}>
              <Icon name="shield-checkmark" size={16} color="#00a86b" />
              <Text style={styles.trustedBadgeText}>TRUSTED OWNER</Text>
            </View>
          </View>

          <Text style={styles.additionalDayText}>
            ₹{Math.round(effectiveRent / 4)} per additional day (after 4 days)
          </Text>

          {product.mrp > 0 && (
            <View style={styles.priceDetailRow}>
              <Text style={styles.priceDetailText}>Retail Price (MRP): </Text>
              <Text style={[styles.priceDetailText, styles.priceDetailValueLineThrough]}>₹{product.mrp}</Text>
            </View>
          )}

          <View style={styles.priceDetailRow}>
            <Icon name="shield-checkmark-outline" size={14} color="#00a86b" />
            <Text style={styles.priceDetailText}> Refundable Security Deposit: ₹{product.security_deposit}</Text>
          </View>

          {product.selling_price > 0 && (
            <>
              <View style={[styles.priceDetailRow, { marginTop: 10 }]}>
                <Icon name="bag-handle-outline" size={14} color="#00a8cc" />
                <Text style={styles.priceDetailText}> Buy Price: </Text>
                <Text style={styles.priceDetailValueBlue}>₹{effectiveBuy}</Text>
              </View>

            </>
          )}

          {currentUserId !== product.user_id && (
            <>
              <View style={styles.bookingBanner}>
                <Text style={styles.bookingBannerLabel}>BOOKING WINDOW:</Text>
                <Text style={styles.bookingBannerDates}>
                  {startDate && endDate ? `${startDate} to ${endDate}` : 'Select Dates Below'}
                </Text>
              </View>

              <View style={styles.datePickerContainer}>
                <View style={styles.datePickerColumn}>
                  <Text style={styles.datePickerLabel}>Start Date</Text>
                  <TouchableOpacity style={styles.datePickerBox} onPress={() => setShowStartDatePicker(true)}>
                    <Icon name="calendar-outline" size={18} color="#FFA500" />
                    <Text style={styles.datePickerText}>{startDate || 'Select'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.datePickerColumn}>
                  <Text style={styles.datePickerLabel}>End Date</Text>
                  <TouchableOpacity style={styles.datePickerBox} onPress={() => {
                    if (!startDate) {
                      Alert.alert('Notice', 'Please select a Start Date first.');
                      return;
                    }
                    setShowEndDatePicker(true);
                  }}>
                    <Icon name="calendar-outline" size={18} color="#FFA500" />
                    <Text style={styles.datePickerText}>{endDate || 'Select'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Custom Grid Date Picker Modals */}
              {showStartDatePicker && (
                <View style={{ marginBottom: 15 }}>
                  <CustomCalendar
                    selectedDate={startDate}
                    onSelect={handleStartDateSelect}
                    onClose={() => setShowStartDatePicker(false)}
                  />
                </View>
              )}

              {showEndDatePicker && (
                <View style={{ marginBottom: 15 }}>
                  <CustomCalendar
                    selectedDate={endDate}
                    onSelect={handleEndDateSelect}
                    minDate={startDate}
                    onClose={() => setShowEndDatePicker(false)}
                  />
                </View>
              )}

              {startDate && endDate && (
                <View style={{ backgroundColor: '#f8f9fa', padding: 15, borderRadius: 12, marginBottom: 15 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ color: '#888', fontSize: 13 }}>Duration</Text>
                    <Text style={{ color: '#333', fontSize: 13, fontWeight: '500' }}>{rentalDays} days</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ color: '#888', fontSize: 13 }}>Rental Cost</Text>
                    <Text style={{ color: '#333', fontSize: 13, fontWeight: '500' }}>₹{rentalCost}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={{ color: '#888', fontSize: 13 }}>Security Deposit</Text>
                    <Text style={{ color: '#333', fontSize: 13, fontWeight: '500' }}>₹{product?.security_deposit || 0}</Text>
                  </View>
                  <View style={{ height: 1, backgroundColor: '#e2e8f0', marginBottom: 12 }} />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#333', fontSize: 15, fontWeight: '500' }}>Total Amount</Text>
                    <Text style={{ color: '#2563eb', fontSize: 20, fontWeight: 'bold' }}>₹{rentalCost + (Number(product?.security_deposit) || 0)}</Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.btnOrange,
                  isRented && { backgroundColor: '#10b981' },
                  (isPurchased || isBuying) && { backgroundColor: '#f8f9fa', elevation: 0 }
                ]}
                activeOpacity={0.8}
                onPress={handleRent}
                disabled={isRenting || isRented || isBuying || isPurchased}
              >
                {isRenting ? (
                  <ActivityIndicator color={(isPurchased || isBuying) ? "#555" : "#fff"} size="small" />
                ) : isRented ? (
                  <>
                    <Icon name="checkmark-circle" size={18} color="#fff" />
                    <Text style={styles.btnOrangeText}>RENTED</Text>
                  </>
                ) : (
                  <>
                    <Icon name={startDate && endDate ? "cart-outline" : "calendar"} size={18} color={(isPurchased || isBuying) ? "#333" : "#fff"} />
                    <Text style={[styles.btnOrangeText, (isPurchased || isBuying) && { color: '#333' }]}>{startDate && endDate ? "Add to Bag" : "Select dates to rent"}</Text>
                  </>
                )}
              </TouchableOpacity>

              {product.selling_price > 0 && (
                <TouchableOpacity
                  style={[
                    styles.btnBlue,
                    isPurchased && { backgroundColor: '#10b981', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
                    (isRented || isRenting) && { backgroundColor: '#f8f9fa', elevation: 0 }
                  ]}
                  activeOpacity={0.8}
                  onPress={handleBuy}
                  disabled={isBuying || isPurchased || isRenting || isRented}
                >
                  {isBuying ? (
                    <ActivityIndicator color={(isRented || isRenting) ? "#555" : "#fff"} size="small" />
                  ) : isPurchased ? (
                    <>
                      <Icon name="checkmark-circle" size={18} color="#fff" />
                      <Text style={[styles.btnBlueText, { marginLeft: 8 }]}>PURCHASED</Text>
                    </>
                  ) : (
                    <Text style={[styles.btnBlueText, (isRented || isRenting) && { color: '#333' }]}>BUY NOW</Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}

          <View style={styles.featuresContainer}>
            <View style={styles.featureCard}>
              <Icon name="bus-outline" size={24} color="#282c3f" />
              <Text style={styles.featureCardText}>FREE PICK & DROP</Text>
            </View>
            <View style={styles.featureCard}>
              <Icon name="sparkles-outline" size={24} color="#282c3f" />
              <Text style={styles.featureCardText}>FRESHLY CLEANED</Text>
            </View>
            <View style={styles.featureCard}>
              <Icon name="shield-outline" size={24} color="#282c3f" />
              <Text style={styles.featureCardText}>SECURE PAYMENTS</Text>
            </View>
          </View>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductDetails;
