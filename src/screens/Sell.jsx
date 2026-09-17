import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Switch, Image, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import TopHeader from '../components/TopHeader';
import DropdownModal from '../components/DropdownModal';
import { useDropdownData } from '../hooks/useDropdownData';
import { useImagePicker } from '../hooks/useImagePicker';
import { submitOutfit } from '../redux/slices/outfitSlice';
import styles from '../css/SellStyles';

// --- Local Helper Components to Reduce Boilerplate ---
const InputField = ({ label, required, value, onChangeText, placeholder, half, multiline, keyboardType, isPrice, error }) => (
  <View style={[styles.inputGroup, half && styles.halfInput]}>
    <Text style={styles.label}>{label} {required && <Text style={{ color: 'red' }}>*</Text>}</Text>
    {isPrice ? (
      <View style={[styles.priceInputContainer, error ? { borderColor: 'red', borderWidth: 1 } : {}]}>
        <Text style={styles.currencySymbol}>₹</Text>
        <TextInput 
          style={styles.priceInput} 
          placeholder={placeholder} 
          keyboardType="numeric" 
          placeholderTextColor="#aaa" 
          value={value} 
          onChangeText={onChangeText} 
        />
      </View>
    ) : (
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={keyboardType || 'default'}
      />
    )}
    {error ? <Text style={{ color: '#e74c3c', fontSize: 12, marginTop: 5 }}>{error}</Text> : null}
  </View>
);

const DropdownField = ({ label, required, placeholder, value, data, selectionKey, openDropdown, half }) => (
  <View style={[styles.inputGroup, half && styles.halfInput]}>
    <Text style={styles.label}>{label} {required && <Text style={{ color: 'red' }}>*</Text>}</Text>
    <TouchableOpacity style={[styles.input, { justifyContent: 'center' }]} activeOpacity={0.7} onPress={() => openDropdown(placeholder, data, selectionKey)}>
      <Text style={{ color: value ? '#333' : '#aaa' }}>{value ? (value.title || value.name) : placeholder}</Text>
    </TouchableOpacity>
  </View>
);

const PhotoBoxField = ({ label, imageUri, onPress, isMain }) => (
  <TouchableOpacity style={[styles.photoUploadBox, { width: '48%', height: 100, marginBottom: 10, overflow: 'hidden' }]} activeOpacity={0.7} onPress={onPress}>
    {imageUri ? <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} /> : <>
      <Icon name="camera" size={30} color={isMain ? "#FFA500" : "#888"} />
      <Text style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{label}</Text>
    </>}
  </TouchableOpacity>
);
// ---------------------------------------------------

const userTypes = [
  { id: 'Boy', name: 'Boy' },
  { id: 'Girl', name: 'Girl' },
  { id: 'Men', name: 'Men' },
  { id: 'Women', name: 'Women' }
];

const Sell = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { loading } = useSelector((state) => state.outfit);

  const dropdownData = useDropdownData();
  const { images, pickImage, clearImages, getImageCount } = useImagePicker();

  const [measurementUnit, setMeasurementUnit] = useState('inch');
  const [isPurchased, setIsPurchased] = useState(false);

  // Grouped Form State
  const [formData, setFormData] = useState({
    title: '', defects: '', chest: '', waist: '', length: '',
    shoulder: '', sleeveLength: '', sellingPrice: '', mrp: '', 
    rentPrice: '', description: ''
  });

  // Grouped Selections State
  const [selections, setSelections] = useState({
    category: null, brand: null, fabricType: null, color: null,
    userType: null, size: null, bodyFit: null, condition: null
  });

  // Validation States
  const [errors, setErrors] = useState({ price: '', rent: '' });

  // Modal State
  const [modalState, setModalState] = useState({ visible: false, title: '', data: [], selectionKey: null });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelection = (item) => {
    setSelections(prev => ({ ...prev, [modalState.selectionKey]: item }));
    setModalState(prev => ({ ...prev, visible: false }));
  };

  const openDropdown = (title, data, selectionKey) => {
    setModalState({ visible: true, title, data, selectionKey });
  };

  // Real-time price validation
  useEffect(() => {
    let priceErr = '';
    let rentErr = '';

    if (isPurchased && formData.sellingPrice && formData.mrp) {
      if (parseFloat(formData.sellingPrice) > parseFloat(formData.mrp)) {
        priceErr = 'Selling price should not exceed MRP';
      }
    }

    if (formData.rentPrice && formData.mrp) {
      const maxRent = Math.floor(parseFloat(formData.mrp) * 0.2);
      if (parseFloat(formData.rentPrice) > maxRent) {
        rentErr = `Suggested maximum rent: ₹${maxRent}`;
      }
    }

    setErrors({ price: priceErr, rent: rentErr });
  }, [formData.sellingPrice, formData.rentPrice, formData.mrp, isPurchased]);

  const toggleMeasurementUnit = (unit) => {
    if (measurementUnit === unit) return;
    setMeasurementUnit(unit);
    const convert = (val) => {
      if (!val) return '';
      return unit === 'cm' 
        ? (parseFloat(val) * 2.54).toFixed(2).replace(/\.00$/, '') 
        : (parseFloat(val) / 2.54).toFixed(2).replace(/\.00$/, '');
    };
    
    setFormData(prev => ({
      ...prev,
      chest: convert(prev.chest),
      waist: convert(prev.waist),
      length: convert(prev.length),
      shoulder: convert(prev.shoulder),
      sleeveLength: convert(prev.sleeveLength),
    }));
  };

  const handleSubmitOutfit = async () => {
    if (!formData.title || !selections.category || !selections.userType || !selections.brand || 
        !selections.fabricType || !selections.color || !selections.size || !selections.condition || 
        !formData.rentPrice || !formData.description) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (isPurchased && !formData.sellingPrice) {
      Alert.alert('Error', 'Selling price is required if the outfit is available for purchase');
      return;
    }

    if (errors.price || errors.rent) {
      Alert.alert('Error', 'Please fix the price errors before submitting');
      return;
    }

    if (getImageCount() < 3) {
      Alert.alert('Error', 'Please upload at least 3 images of your outfit');
      return;
    }

    const data = new FormData();
    const appendIfPresent = (key, value) => {
        if (value) data.append(key, value);
    };

    data.append('title', formData.title);
    data.append('category_id', selections.category.id);
    data.append('user_type', selections.userType.id);
    data.append('brand_id', selections.brand.id);
    data.append('fabric_type_id', selections.fabricType.id);
    data.append('color_id', selections.color.id);
    data.append('size_id', selections.size.id);
    data.append('garment_condition_id', selections.condition.id);
    appendIfPresent('defects', formData.defects);
    
    ['chest', 'waist', 'length', 'shoulder'].forEach(attr => appendIfPresent(attr, formData[attr]));
    appendIfPresent('sleeve_length', formData.sleeveLength);
    
    data.append('measurement_unit', measurementUnit);
    if (selections.bodyFit) data.append('body_fit_id', selections.bodyFit.id);

    data.append('is_purchased', isPurchased ? 1 : 0);
    if (isPurchased) data.append('selling_price', formData.sellingPrice);
    appendIfPresent('mrp', formData.mrp);
    data.append('rent_price', formData.rentPrice);
    data.append('description', formData.description);

    Object.keys(images).forEach(key => {
      if (images[key]) {
        const fieldName = key === 'mainPhoto' ? 'main_photo' : key === 'sidePhoto' ? 'side_photo' : key === 'backPhoto' ? 'back_photo' : 'detail_photo';
        data.append(fieldName, {
          uri: images[key].uri,
          type: images[key].type,
          name: images[key].fileName || `${key}.jpg`
        });
      }
    });

    try {
      const resultAction = await dispatch(submitOutfit(data)).unwrap();
      if (resultAction.success) {
        Alert.alert('Success', 'Outfit submitted successfully!');
        setFormData({ title: '', defects: '', chest: '', waist: '', length: '', shoulder: '', sleeveLength: '', sellingPrice: '', mrp: '', rentPrice: '', description: '' });
        setSelections({ category: null, brand: null, fabricType: null, color: null, userType: null, size: null, bodyFit: null, condition: null });
        clearImages();
        setIsPurchased(false);
        setMeasurementUnit('inch');
        navigation.navigate('Listings');
      } else {
        Alert.alert('Error', resultAction.message || 'Submission failed');
      }
    } catch (error) {
      console.log('Error submitting outfit:', error);
      Alert.alert('Error', error.message || 'Network request failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainer}>
        <Text style={styles.pageTitle}>Sell your Outfit</Text>

        {/* Basic Details Section */}
        <View style={styles.sectionCard}>
          <InputField label="Title" placeholder="Title" required value={formData.title} onChangeText={(val) => handleInputChange('title', val)} />
          <View style={styles.row}>
            <DropdownField label="Category" placeholder="Select Category" required half value={selections.category} data={dropdownData.categories} selectionKey="category" openDropdown={openDropdown} />
            <DropdownField label="User Type" placeholder="Select User Type" required half value={selections.userType} data={userTypes} selectionKey="userType" openDropdown={openDropdown} />
          </View>
          <DropdownField label="Brand" placeholder="Select Brand" required value={selections.brand} data={dropdownData.brands} selectionKey="brand" openDropdown={openDropdown} />
        </View>

        {/* Fabric, Color & Size Section */}
        <View style={styles.sectionCard}>
          <View style={styles.row}>
            <DropdownField label="Fabric Type" placeholder="Select Fabric Type" required half value={selections.fabricType} data={dropdownData.fabricTypes} selectionKey="fabricType" openDropdown={openDropdown} />
            <DropdownField label="Color" placeholder="Select Color" required half value={selections.color} data={dropdownData.colors} selectionKey="color" openDropdown={openDropdown} />
          </View>
          <DropdownField label="Size" placeholder="Select Size" required value={selections.size} data={dropdownData.sizes} selectionKey="size" openDropdown={openDropdown} />
          <InputField label="Defects (Optional)" placeholder="Any Defects" multiline value={formData.defects} onChangeText={(val) => handleInputChange('defects', val)} />
        </View>

        {/* Measurements Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.label}>Exact Measurements (for better fit understanding) (optional)</Text>
          <View style={{ flexDirection: 'row', marginBottom: 15, alignItems: 'center' }}>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }} onPress={() => toggleMeasurementUnit('inch')}>
              <Icon name={measurementUnit === 'inch' ? "radio-button-on" : "radio-button-off"} size={20} color={measurementUnit === 'inch' ? "#FFA500" : "#888"} />
              <Text style={{ marginLeft: 5 }}>Inch</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => toggleMeasurementUnit('cm')}>
              <Icon name={measurementUnit === 'cm' ? "radio-button-on" : "radio-button-off"} size={20} color={measurementUnit === 'cm' ? "#FFA500" : "#888"} />
              <Text style={{ marginLeft: 5 }}>CM</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <InputField label="Chest/Bust" placeholder={`Chest/Bust (${measurementUnit})`} keyboardType="numeric" half value={formData.chest} onChangeText={(val) => handleInputChange('chest', val)} />
            <InputField label="Waist" placeholder={`Waist (${measurementUnit})`} keyboardType="numeric" half value={formData.waist} onChangeText={(val) => handleInputChange('waist', val)} />
          </View>
          <View style={styles.row}>
            <InputField label="Length" placeholder={`Length (${measurementUnit})`} keyboardType="numeric" half value={formData.length} onChangeText={(val) => handleInputChange('length', val)} />
            <InputField label="Shoulder" placeholder={`Shoulder (${measurementUnit})`} keyboardType="numeric" half value={formData.shoulder} onChangeText={(val) => handleInputChange('shoulder', val)} />
          </View>
          <View style={styles.row}>
            <InputField label="Sleeve Length" placeholder={`Sleeve Length (${measurementUnit})`} keyboardType="numeric" half value={formData.sleeveLength} onChangeText={(val) => handleInputChange('sleeveLength', val)} />
            <DropdownField label="Body Fit Type" placeholder="Select Body Fit Type" half value={selections.bodyFit} data={dropdownData.bodyFits} selectionKey="bodyFit" openDropdown={openDropdown} />
          </View>
        </View>

        {/* Pricing & Condition Section */}
        <View style={styles.sectionCard}>
          <View style={[styles.toggleBox, { marginBottom: 15 }]}>
            <Text style={styles.label}>Available for Purchase</Text>
            <Switch trackColor={{ false: "#767577", true: "#FFA500" }} thumbColor={isPurchased ? "#fff" : "#f4f3f4"} onValueChange={setIsPurchased} value={isPurchased} />
          </View>
          {isPurchased && (
            <InputField label="Selling Price" placeholder="Selling Price (₹)" keyboardType="numeric" required isPrice error={errors.price} value={formData.sellingPrice} onChangeText={(val) => handleInputChange('sellingPrice', val)} />
          )}
          <InputField label="MRP (₹)" placeholder="MRP" keyboardType="numeric" isPrice value={formData.mrp} onChangeText={(val) => handleInputChange('mrp', val)} />
          <View style={styles.row}>
            <DropdownField label="Outfit Condition" placeholder="Select Outfit Condition" required half value={selections.condition} data={dropdownData.garmentConditions} selectionKey="condition" openDropdown={openDropdown} />
            <InputField label="Rent Price" placeholder="Rent Price (₹)" keyboardType="numeric" required half isPrice error={errors.rent} value={formData.rentPrice} onChangeText={(val) => handleInputChange('rentPrice', val)} />
          </View>
        </View>

        {/* Photos Section */}
        <View style={styles.sectionCard}>
          <View style={{ alignItems: 'center', marginBottom: 15 }}>
            <Text style={[styles.label, { fontSize: 16, textAlign: 'center' }]}>Upload Outfit Images</Text>
            <Text style={{ color: '#888', fontSize: 12, textAlign: 'center' }}>High-quality photos increase your chances of a quick rental</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <PhotoBoxField label="Main Photo" imageUri={images.mainPhoto?.uri} onPress={() => pickImage('mainPhoto')} isMain />
            <PhotoBoxField label="Side View" imageUri={images.sidePhoto?.uri} onPress={() => pickImage('sidePhoto')} />
            <PhotoBoxField label="Back View" imageUri={images.backPhoto?.uri} onPress={() => pickImage('backPhoto')} />
            <PhotoBoxField label="Detail Shot" imageUri={images.detailPhoto?.uri} onPress={() => pickImage('detailPhoto')} />
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.sectionCard}>
          <InputField label="Description" placeholder="Description" required multiline value={formData.description} onChangeText={(val) => handleInputChange('description', val)} />
        </View>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <TouchableOpacity style={styles.submitButton} activeOpacity={0.9} onPress={handleSubmitOutfit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit</Text>}
          </TouchableOpacity>
        </View>

      </ScrollView>

      <DropdownModal
        visible={modalState.visible}
        title={modalState.title}
        data={modalState.data}
        onClose={() => setModalState(prev => ({ ...prev, visible: false }))}
        onSelect={handleSelection}
      />
    </SafeAreaView>
  );
};

export default Sell;
