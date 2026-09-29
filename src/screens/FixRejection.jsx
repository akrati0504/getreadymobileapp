import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator, Modal, FlatList, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRejectionDetails, fetchFormData, submitRejectionFix, fetchRejections } from '../redux/slices/rejectionSlice';
import { launchImageLibrary } from 'react-native-image-picker';
import styles from '../css/EditClothStyles';
import TopHeader from '../components/TopHeader';
import { IMAGE_BASE_URL } from '../api/api';

// Reusable Custom Dropdown Component
const CustomDropdown = ({ label, value, options, onSelect, placeholder, required = false }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedLabel = options?.find(opt => opt.id === value)?.name || placeholder;

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label} {required && '*'}</Text>
      <TouchableOpacity style={styles.dropdownSelector} onPress={() => setModalVisible(true)}>
        <Text style={[styles.dropdownText, !value && styles.placeholderText]}>{selectedLabel}</Text>
        <Icon name="chevron-down" size={16} color="#64748B" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item, index) => String(item.id || index)}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalItem}
                  onPress={() => {
                    onSelect(item.id);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalItemText, value === item.id && styles.modalItemTextSelected]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const FixRejection = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  
  const { id } = route.params || {};
  const { currentDetails, formData: apiFormData, isLoading, isSubmitting } = useSelector(state => state.rejections);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    gender: '',
    brand: '',
    fabric: '',
    color: '',
    size: '',
    condition: '',
    defects: '',
    rent_price: '',
    security_deposit: '',
    chest_bust: '',
    waist: '',
    length: '',
    shoulder: '',
    sleeve_length: '',
    measurement_unit: 'inch',
  });

  const [images, setImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);

  // Dropdown Options
  const userTypes = [{ id: 'Women', name: 'Women' }, { id: 'Men', name: 'Men' }, { id: 'Girl', name: 'Girl' }, { id: 'Boy', name: 'Boy' }];
  const units = [{ id: 'inch', name: 'Inches' }, { id: 'cm', name: 'cm' }];

  useEffect(() => {
    dispatch(fetchFormData());
    if (id) {
      dispatch(fetchRejectionDetails(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentDetails && currentDetails.cloth) {
      const data = currentDetails.cloth;
      let unit = data.measurement_unit || 'inch';
      
      setFormData({
        title: data.title || '',
        description: data.description || '',
        category: data.category_id || '',
        gender: data.gender || data.user_type || '',
        brand: data.brand_id || '',
        fabric: data.fabric_id || data.fabric_type_id || '',
        color: data.color_id || '',
        size: data.size_id || '',
        condition: data.condition_id || data.garment_condition_id || '',
        defects: data.defects || '',
        rent_price: data.rent_price ? String(data.rent_price) : '',
        security_deposit: data.security_deposit ? String(data.security_deposit) : '',
        chest_bust: data.chest_bust ? String(data.chest_bust) : '',
        waist: data.waist ? String(data.waist) : '',
        length: data.length ? String(data.length) : '',
        shoulder: data.shoulder ? String(data.shoulder) : '',
        sleeve_length: data.sleeve_length ? String(data.sleeve_length) : '',
        measurement_unit: unit,
      });
      setImages(data.images || []);
    }
  }, [currentDetails]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', selectionLimit: 0, quality: 0.8 },
      (response) => {
        if (response.didCancel || response.errorCode) return;
        if (response.assets) {
          const newImages = response.assets.map(asset => ({
            uri: asset.uri,
            type: asset.type,
            fileName: asset.fileName,
          }));
          setImages(prev => [...prev, ...newImages]);
        }
      }
    );
  };

  const handleDeleteImage = (img, index) => {
    Alert.alert('Remove Image', 'Remove this image?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => {
          if (img.id) {
            setDeletedImages(prev => [...prev, img.id]);
          }
          const newImages = [...images];
          newImages.splice(index, 1);
          setImages(newImages);
      }}
    ]);
  };

  const handleSubmit = async () => {
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      images.forEach((img, index) => {
        if (!img.id && img.uri) {
          submitData.append('new_images[]', {
            uri: img.uri,
            type: img.type || 'image/jpeg',
            name: img.fileName || `new_image_${index}.jpg`,
          });
        }
      });

      deletedImages.forEach(imgId => {
        submitData.append('deleted_images[]', imgId);
      });

      await dispatch(submitRejectionFix({ id, formData: submitData })).unwrap();
      
      Alert.alert('Success', 'Item updated and resubmitted for approval successfully!');
      dispatch(fetchRejections());
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error || 'Failed to submit fix');
    }
  };

  if (isLoading || !apiFormData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={{ marginTop: 10, color: '#64748B' }}>Loading item details...</Text>
      </View>
    );
  }

  const { categories, brands, fabricTypes, colors, sizes, garmentConditions } = apiFormData;

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Fix Rejected Item</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {currentDetails?.rejection_reason && (
          <View style={{ backgroundColor: '#fef2f2', padding: 15, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#fecaca' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
              <Icon name="warning" size={20} color="#ef4444" style={{ marginRight: 8 }} />
              <Text style={{ color: '#b91c1c', fontWeight: 'bold' }}>Action Required</Text>
            </View>
            <Text style={{ color: '#991b1b', marginTop: 5 }}>{currentDetails.rejection_reason}</Text>
          </View>
        )}

        {/* Basic Information */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Icon name="information-circle" size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Basic Information</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Outfit Title *</Text>
            <TextInput style={styles.input} value={formData.title} onChangeText={(text) => handleChange('title', text)} />
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <CustomDropdown label="Category" value={formData.category} options={categories} onSelect={(val) => handleChange('category', val)} placeholder="Select" required />
            </View>
            <View style={styles.col}>
              <CustomDropdown label="User Type" value={formData.gender} options={userTypes} onSelect={(val) => handleChange('gender', val)} placeholder="Select" required />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput style={[styles.input, styles.textArea]} value={formData.description} onChangeText={(text) => handleChange('description', text)} multiline />
          </View>
        </View>

        {/* Specifications & Fit */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Icon name="options-outline" size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Specifications & Fit</Text>
          </View>
          
          <View style={styles.row}>
            <View style={styles.col}>
              <CustomDropdown label="Brand" value={formData.brand} options={brands} onSelect={(val) => handleChange('brand', val)} placeholder="Select" />
            </View>
            <View style={styles.col}>
              <CustomDropdown label="Fabric" value={formData.fabric} options={fabricTypes} onSelect={(val) => handleChange('fabric', val)} placeholder="Select" />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <CustomDropdown label="Color" value={formData.color} options={colors} onSelect={(val) => handleChange('color', val)} placeholder="Select" />
            </View>
            <View style={styles.col}>
              <CustomDropdown label="Standard Size" value={formData.size} options={sizes} onSelect={(val) => handleChange('size', val)} placeholder="Select" required />
            </View>
          </View>

          <CustomDropdown label="Condition" value={formData.condition} options={garmentConditions} onSelect={(val) => handleChange('condition', val)} placeholder="Select" required />
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Defects / Notes</Text>
            <TextInput style={[styles.input, styles.textArea]} value={formData.defects} onChangeText={(text) => handleChange('defects', text)} multiline />
          </View>
        </View>

        {/* Pricing & Deposits */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Icon name="cash-outline" size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Pricing</Text>
          </View>
          
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Rent Price *</Text>
              <TextInput style={styles.input} value={formData.rent_price} onChangeText={(text) => handleChange('rent_price', text)} keyboardType="numeric" />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Security Deposit *</Text>
              <TextInput style={styles.input} value={formData.security_deposit} onChangeText={(text) => handleChange('security_deposit', text)} keyboardType="numeric" />
            </View>
          </View>
        </View>

        {/* Media Gallery */}
        <View style={[styles.formSection, { backgroundColor: '#1E293B' }]}>
          <View style={styles.sectionHeader}>
            <Icon name="image-outline" size={20} color="#fff" />
            <Text style={[styles.sectionTitle, { color: '#fff' }]}>Media Gallery</Text>
          </View>
          
          <View style={styles.imageGrid}>
            {images.map((img, index) => {
              const uri = img.image_path ? `${IMAGE_BASE_URL}/${img.image_path}` : img.uri;
              return (
                <View key={img.id || index} style={styles.imageContainer}>
                  <Image source={{ uri }} style={styles.image} />
                  <TouchableOpacity style={styles.deleteImageBtn} onPress={() => handleDeleteImage(img, index)}>
                    <Icon name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              );
            })}
            <TouchableOpacity style={[styles.imageContainer, styles.addImageBtn]} onPress={handleAddImage}>
              <Icon name="add-circle-outline" size={24} color="#64748B" />
              <Text style={styles.addImageText}>Add More</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Detailed Measurements */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Icon name="contract-outline" size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Detailed Measurements</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Bust/Chest</Text>
              <TextInput style={styles.input} value={formData.chest_bust} onChangeText={(text) => handleChange('chest_bust', text)} keyboardType="numeric" />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Waist</Text>
              <TextInput style={styles.input} value={formData.waist} onChangeText={(text) => handleChange('waist', text)} keyboardType="numeric" />
            </View>
          </View>
          
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Length</Text>
              <TextInput style={styles.input} value={formData.length} onChangeText={(text) => handleChange('length', text)} keyboardType="numeric" />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Shoulder</Text>
              <TextInput style={styles.input} value={formData.shoulder} onChangeText={(text) => handleChange('shoulder', text)} keyboardType="numeric" />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Sleeve</Text>
              <TextInput style={styles.input} value={formData.sleeve_length} onChangeText={(text) => handleChange('sleeve_length', text)} keyboardType="numeric" />
            </View>
            <View style={styles.col}>
              <CustomDropdown label="Unit" value={formData.measurement_unit} options={units} onSelect={(val) => handleChange('measurement_unit', val)} placeholder="Select" />
            </View>
          </View>
        </View>

      </ScrollView>

      <View style={styles.fabContainer}>
        <TouchableOpacity style={[styles.updateBtn, isSubmitting && styles.updateBtnDisabled]} onPress={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? <ActivityIndicator color="#fff" /> : (
            <>
              <Icon name="cloud-upload-outline" size={20} color="#fff" />
              <Text style={styles.updateBtnText}>RESUBMIT FOR APPROVAL</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default FixRejection;
