import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from '../css/HomeStyles';

const categoryData = [
  { id: '1', title: 'Men', image: require('../assets/images/cat_men.jpg') },
  { id: '2', title: 'Women', image: require('../assets/images/cat_women.jpg') },
  { id: '3', title: 'Boy', image: require('../assets/images/cat_boy.jpg') },
  { id: '4', title: 'Girl', image: require('../assets/images/cat_girl.jpg') },
];

const Categories = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.categoryGrid}>
        {categoryData.map((category) => (
          <TouchableOpacity 
            key={category.id} 
            style={styles.categoryItem} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Browse', { initialFilter: { key: 'genders', value: category.title.toLowerCase() } })}
          >
            <View style={styles.categoryImageWrapper}>
              <Image source={category.image} style={styles.categoryImage} />
            </View>
            <Text style={styles.categoryName}>{category.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} onPress={() => navigation.navigate('Browse')}>
          <Text style={styles.actionButtonText}>Check all Outfits</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Categories;
