import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, FlatList, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { setFilter, toggleArrayFilter } from '../redux/slices/clothesSlice';
import styles from '../css/BrowseStyles';

const BrowseFilters = () => {
  const dispatch = useDispatch();

  const { filters } = useSelector(state => state.clothes);
  const { data: categories } = useSelector(state => state.category);
  const { data: brands } = useSelector(state => state.brand);
  const { sizes, fabricTypes, colors, bodyFits, garmentConditions } = useSelector(state => state.dropdown);

  const [modalVisible, setModalVisible] = useState(false);
  const [filterConfig, setFilterConfig] = useState({ label: '', key: '', options: [], type: 'array' });

  const openFilterModal = (label) => {
    const configMap = {
      'Category': { options: categories || [], key: 'categories', type: 'array' },
      'Brand': { options: brands || [], key: 'brands', type: 'array' },
      'Size': { options: sizes || [], key: 'sizes', type: 'array' },
      'Fabric': { options: fabricTypes || [], key: 'fabrics', type: 'array' },
      'Color': { options: colors || [], key: 'colors', type: 'array' },
      'Condition': { options: garmentConditions || [], key: 'conditions', type: 'array' },
      'Fit Type': { options: bodyFits || [], key: 'fits', type: 'array' },
      'Status': { options: [{id: 'any', name: 'Any'}, {id: 'available', name: 'Available'}, {id: 'sold', name: 'Sold'}], key: 'status', type: 'single' },
      'User Type': { options: [{id: 'men', name: 'Men'}, {id: 'women', name: 'Women'}, {id: 'boy', name: 'Boy'}, {id: 'girl', name: 'Girl'}], key: 'genders', type: 'array' },
      'Bottom Type': { options: [{id: 'plazzo', name: 'Plazzo'}, {id: 'skinny', name: 'Skinny'}, {id: 'straight', name: 'Straight'}, {id: 'wide_leg', name: 'Wide leg'}], key: 'bottoms', type: 'array' },
      'Seller Rating': { options: [], key: 'seller_rating', type: 'rating' },
      'Product Rating': { options: [], key: 'product_rating', type: 'rating' },
      'Rent Range': { options: [], key: 'rent_range', type: 'range' },
      'MRP Range': { options: [], key: 'mrp_range', type: 'range' },
      'Priority': { options: [{id: 'rdm_low', name: 'Best Value (RDM)'}], key: 'sort_by', type: 'boolean' },
      'Features': { options: [{id: '1', name: 'Dry Cleaned Only'}], key: 'is_cleaned', type: 'boolean' },
    };

    const config = configMap[label] || { options: [], key: '', type: 'array' };
    setFilterConfig({ label, ...config });
    setModalVisible(true);
  };

  const handleFilterSelection = (itemValue) => {
    const { type, key } = filterConfig;
    if (type === 'array') {
      dispatch(toggleArrayFilter({ key, value: itemValue }));
    } else if (type === 'single') {
      dispatch(setFilter({ key, value: itemValue }));
    } else if (type === 'boolean') {
      const isSelected = filters[key] === itemValue;
      dispatch(setFilter({ key, value: isSelected ? '' : itemValue }));
    }
    setModalVisible(false);
  };

  const renderDropdown = (label) => (
    <TouchableOpacity style={[styles.dropdownBox, { flex: 0, paddingHorizontal: 12, marginRight: 8 }]} activeOpacity={0.7} onPress={() => openFilterModal(label)}>
      <Text style={[styles.dropdownText, { marginRight: 5 }]}>{label}</Text>
      <Icon name="caret-down" size={14} color="#6b7280" />
    </TouchableOpacity>
  );

  const renderRadio = (label) => {
    const apiValue = label.toLowerCase();
    const isSelected = filters.deal_type === apiValue;
    return (
      <TouchableOpacity style={styles.radioItem} activeOpacity={0.8} onPress={() => dispatch(setFilter({ key: 'deal_type', value: apiValue }))}>
        <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
        <Text style={styles.radioLabel}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const renderFilterContent = () => {
    const { type, key, options } = filterConfig;
    if (['array', 'single', 'boolean'].includes(type)) {
      return (
        <FlatList
          data={options}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={({ item }) => {
            const valueToDispatch = item.id?.toString() || item.name;
            const isSelected = type === 'array' ? filters[key]?.includes(valueToDispatch) : filters[key] === valueToDispatch;
            return (
              <TouchableOpacity style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} onPress={() => handleFilterSelection(valueToDispatch)}>
                <Text style={{ fontSize: 16 }}>{item.name || item.title || item.label || JSON.stringify(item)}</Text>
                {isSelected && <Icon name="checkmark-circle" size={24} color="#FFA500" />}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>No options available.</Text>}
        />
      );
    }
    if (type === 'range') {
      const minKey = key === 'rent_range' ? 'price_min' : 'mrp_min';
      const maxKey = key === 'rent_range' ? 'price_max' : 'mrp_max';
      return (
        <View style={{ padding: 20 }}>
          <Text style={{ marginBottom: 10, fontSize: 16 }}>Min Amount (₹):</Text>
          <TextInput style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 20, fontSize: 16 }} keyboardType="numeric" placeholder="0" value={filters[minKey]} onChangeText={(text) => dispatch(setFilter({ key: minKey, value: text }))} />
          <Text style={{ marginBottom: 10, fontSize: 16 }}>Max Amount (₹):</Text>
          <TextInput style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 20, fontSize: 16 }} keyboardType="numeric" placeholder="20000" value={filters[maxKey]} onChangeText={(text) => dispatch(setFilter({ key: maxKey, value: text }))} />
          <TouchableOpacity style={{ backgroundColor: '#FFA500', padding: 15, borderRadius: 8, alignItems: 'center' }} onPress={() => setModalVisible(false)}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Apply Range</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (type === 'rating') {
      return (
        <View style={{ padding: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 30 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => { dispatch(setFilter({ key, value: star.toString() })); setModalVisible(false); }}>
                <Icon name={parseInt(filters[key] || 0) >= star ? "star" : "star-outline"} size={40} color="#FFD700" />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={{ backgroundColor: '#f0f0f0', padding: 15, borderRadius: 8, alignItems: 'center' }} onPress={() => { dispatch(setFilter({ key, value: '' })); setModalVisible(false); }}>
            <Text style={{ color: '#333', fontWeight: 'bold', fontSize: 16 }}>Clear Rating</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  return (
    <>
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
          {renderDropdown('Category')}
          {renderDropdown('User Type')}
          {renderDropdown('Size')}
          {renderDropdown('Brand')}
          {renderDropdown('Fabric')}
          {renderDropdown('Color')}
          {renderDropdown('Status')}
          {renderDropdown('Condition')}
          {renderDropdown('Fit Type')}
          {renderDropdown('Bottom Type')}
          {renderDropdown('Seller Rating')}
          {renderDropdown('Product Rating')}
          {renderDropdown('Rent Range')}
          {renderDropdown('MRP Range')}
          {renderDropdown('Priority')}
          {renderDropdown('Features')}
        </ScrollView>

        <View style={styles.filterRow2}>
          <View style={styles.radioGroup}>
            {renderRadio('All')}
            {renderRadio('Rent')}
            {renderRadio('Buy')}
          </View>
          <View style={styles.secondarySearch}>
            <Icon name="search-outline" size={16} color="#888" style={{ marginRight: 5 }} />
            <TextInput style={styles.secondarySearchInput} placeholder="Search for clothes..." placeholderTextColor="#888" value={filters.search} onChangeText={(text) => dispatch(setFilter({ key: 'search', value: text }))} />
          </View>
        </View>

        <View style={styles.filterRow3}>
          <View style={[styles.datePickerBox, { flexDirection: 'row', alignItems: 'center' }]}>
            <Icon name="calendar-outline" size={16} color="#FFA500" />
            <TextInput style={[styles.dateText, { padding: 0, marginHorizontal: 5, flex: 1, height: 20 }]} placeholder="From YYYY-MM-DD" placeholderTextColor="#888" value={filters.from_date} onChangeText={(text) => dispatch(setFilter({ key: 'from_date', value: text }))} />
          </View>
          <View style={[styles.datePickerBox, { flexDirection: 'row', alignItems: 'center' }]}>
            <Icon name="calendar-outline" size={16} color="#FFA500" />
            <TextInput style={[styles.dateText, { padding: 0, marginHorizontal: 5, flex: 1, height: 20 }]} placeholder="To YYYY-MM-DD" placeholderTextColor="#888" value={filters.to_date} onChangeText={(text) => dispatch(setFilter({ key: 'to_date', value: text }))} />
          </View>
        </View>
      </View>

      <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{filterConfig.label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {renderFilterContent()}
          </View>
        </View>
      </Modal>
    </>
  );
};

export default BrowseFilters;
