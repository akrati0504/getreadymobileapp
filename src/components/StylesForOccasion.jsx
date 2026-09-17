import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPublicOutfits } from '../redux/slices/outfitSlice';
import styles from '../css/HomeStyles';

// --- Local Helper Components ---
const FilterPill = ({ name, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.filterPill, isActive && styles.filterPillActive]}
    activeOpacity={0.8}
    onPress={onPress}
  >
    <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
      {name}
    </Text>
  </TouchableOpacity>
);

const OutfitCard = ({ outfit, isAuthenticated, onNavigate, onAddBag }) => (
  <TouchableOpacity style={styles.outfitCard} activeOpacity={0.95} onPress={() => onNavigate(outfit)}>
    <View style={styles.outfitImageContainer}>
      {outfit.image ? (
        <Image source={{ uri: outfit.image }} style={styles.outfitImage} />
      ) : (
        <View style={[styles.outfitImage, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
          <Icon name="image-outline" size={40} color="#ccc" />
        </View>
      )}
      <TouchableOpacity style={styles.addToBagButton} activeOpacity={0.8} onPress={(e) => { e.stopPropagation(); onAddBag(); }}>
        <Icon name="bag-handle-outline" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
    <View style={styles.outfitDetails}>
      <Text style={styles.outfitTitle} numberOfLines={1}>{outfit.title}</Text>
      <Text style={styles.outfitBrand}>{outfit.brand || 'Unbranded'}</Text>
      <View style={styles.dashedLine} />
      <View style={styles.priceRow}>
        <View style={styles.priceItem}>
          <Icon name="calendar-outline" size={12} color="#888" />
          <Text style={styles.priceLabel}>RENT:</Text>
          <Text style={styles.rentPrice}>{outfit.rent}</Text>
        </View>
      </View>
      <View style={[styles.priceRow, { marginTop: 4 }]}>
        <View style={styles.priceItem}>
          <Icon name="bag-outline" size={12} color="#888" />
          <Text style={styles.priceLabel}>BUY:</Text>
          <Text style={styles.buyPrice}>{outfit.buy}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);
// -------------------------------

const StylesForOccasion = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const categories = useSelector((state) => state.category?.data) || [];
  const { publicOutfits, homeFeedLoading } = useSelector((state) => state.outfit);

  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    dispatch(fetchPublicOutfits());
  }, [dispatch]);

  const allFilters = useMemo(() => [
    { id: 'all', name: 'All Outfits' },
    ...(Array.isArray(categories) ? categories : [])
  ], [categories]);

  const filteredOutfits = useMemo(() => {
    if (!publicOutfits) return [];
    if (selectedCategory === 'all') return publicOutfits;
    return publicOutfits.filter(outfit => String(outfit.category_id) === String(selectedCategory));
  }, [publicOutfits, selectedCategory]);

  const handleAddBag = () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
    } else {
      // handle add to bag
    }
  };

  return (
    <View style={styles.occasionSection}>
      <View style={styles.occasionTitleContainer}>
        <Text style={styles.occasionTitlePart1}>Styles For Every <Text style={styles.occasionTitlePart2}>Occasion</Text></Text>
        <Text style={styles.brandsSubtitle}>Handpicked outfits tailored for your special moments.</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
        {allFilters.map((filter) => (
          <FilterPill
            key={filter.id}
            name={filter.name || filter.title}
            isActive={selectedCategory === filter.id}
            onPress={() => setSelectedCategory(filter.id)}
          />
        ))}
      </ScrollView>

      {homeFeedLoading ? (
        <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FFA500" />
        </View>
      ) : filteredOutfits.length === 0 ? (
        <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#888' }}>No outfits found for this category.</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.outfitCardsContainer}>
          {filteredOutfits.map((outfit) => (
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              isAuthenticated={isAuthenticated}
              onNavigate={(o) => navigation.navigate('ProductDetails', { productId: o.id })}
              onAddBag={handleAddBag}
            />
          ))}
        </ScrollView>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} onPress={() => navigation.navigate('Browse')}>
          <Text style={styles.actionButtonText}>Check all Outfits</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default StylesForOccasion;
