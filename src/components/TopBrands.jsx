import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, FlatList, Modal, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { IMAGE_BASE_URL } from '../api/api';
import styles from '../css/HomeStyles';

const TopBrands = () => {
  const [isAllBrandsVisible, setIsAllBrandsVisible] = useState(false);
  const brands = useSelector((state) => state.brand.data) || [];

  return (
    <>
      <View style={styles.brandsSection}>
        <View style={styles.brandsHeader}>
          <View>
            <Text style={styles.brandsTitle}>Top Brands</Text>
            <Text style={styles.brandsSubtitle}>Premium fashion labels</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7} onPress={() => setIsAllBrandsVisible(true)}>
            <Text style={styles.brandsSeeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.brandsScrollContainer}
        >
          {(Array.isArray(brands) ? brands : []).slice(0, 8).map((brand) => (
            <TouchableOpacity
              key={brand.id}
              style={styles.brandItem}
              activeOpacity={0.8}
            >
              <View style={styles.brandIconWrapper}>
                <Image
                  source={{
                    uri: `${IMAGE_BASE_URL}/${brand.logo}`,
                  }}
                  style={styles.brandImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.brandText} numberOfLines={1}>{brand.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Modal
        visible={isAllBrandsVisible}
        animationType="slide"
        onRequestClose={() => setIsAllBrandsVisible(false)}
      >
        <SafeAreaView style={styles.brandsModalContainer}>
          <View style={styles.brandsModalHeader}>
            <Text style={styles.brandsModalTitle}>All Brands</Text>
            <TouchableOpacity onPress={() => setIsAllBrandsVisible(false)}>
              <Icon name="close" size={28} color="#282c3f" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={Array.isArray(brands) ? brands : []}
            keyExtractor={(item) => item.id.toString()}
            numColumns={4}
            contentContainerStyle={styles.brandsModalGrid}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.brandGridItem}
                activeOpacity={0.8}
              >
                <View style={styles.brandIconWrapper}>
                  <Image
                    source={{
                      uri: `${IMAGE_BASE_URL}/${item.logo}`,
                    }}
                    style={styles.brandImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.brandText} numberOfLines={1}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
};

export default TopBrands;
