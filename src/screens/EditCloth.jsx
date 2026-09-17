import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator, Modal, FlatList, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar } from 'react-native-calendars';
import { fetchMyListings } from '../redux/slices/outfitSlice';
import api from '../api/api';
import styles from '../css/EditClothStyles';
import TopHeader from '../components/TopHeader';
import { launchImageLibrary } from 'react-native-image-picker';

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

// Reusable Date Picker Component
const CustomDatePicker = ({ label, value, onSelect }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.col}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.dropdownSelector} onPress={() => setModalVisible(true)}>
        <Text style={styles.dropdownText}>{value || 'YYYY-MM-DD'}</Text>
        <Icon name="calendar-outline" size={16} color="#64748B" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity 
          style={[styles.modalOverlay, { justifyContent: 'center', padding: 20 }]} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContent, { borderRadius: 12, padding: 0, overflow: 'hidden' }]}>
            <Calendar
              onDayPress={(day) => {
                onSelect(day.dateString);
                setModalVisible(false);
              }}
              markedDates={value ? {
                [value]: { selected: true, selectedColor: '#3B82F6' }
              } : {}}
              theme={{
                todayTextColor: '#3B82F6',
                arrowColor: '#3B82F6',
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const EditCloth = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  
  const { cloth } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [loadingCloth, setLoadingCloth] = useState(true);
  
  const token = useSelector((state) => state.auth?.user?.token || state.auth?.token);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    gender: '',
    brand_id: '',
    fabric_type_id: '',
    color_id: '',
    size_id: '',
    garment_condition_id: '',
    rent_price: '',
    security_deposit: '',
    mrp: '',
    is_purchased: false,
    selling_price: '',
    chest_bust: '',
    waist: '',
    length: '',
    shoulder: '',
    sleeve_length: '',
    measurement_unit: 'Inches',
  });

  const [images, setImages] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);

  // Dropdown Options State
  const [options, setOptions] = useState({
    categories: [],
    brands: [],
    fabrics: [],
    colors: [],
    sizes: [],
    conditions: [],
  });
  const userTypes = [{ id: 'Women', name: 'Women' }, { id: 'Men', name: 'Men' }, { id: 'Girl', name: 'Girl' }, { id: 'Boy', name: 'Boy' }];
  const units = [{ id: 'Inches', name: 'Inches' }, { id: 'cm', name: 'cm' }];

  useEffect(() => {
    fetchDropdownData();
    if (cloth?.id) {
      fetchClothDetails();
    }
  }, []);

  const fetchClothDetails = async () => {
    try {
      const response = await api.get(`/clothes/${cloth.id}`, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) }
      });
      
      const responseData = response.data?.data;
      const data = responseData?.cloth || response.data?.cloth || responseData || response.data;
      
      if (data) {
        let unit = data.measurement_unit || 'Inches';
        if (unit.toLowerCase() === 'inches') unit = 'Inches';
        else if (unit.toLowerCase() === 'cm') unit = 'cm';
        
        setFormData({
            title: data.title || '',
            description: data.description || '',
            category_id: data.category_id || '',
            gender: data.gender || data.user_type || '',
            brand_id: data.brand_id || '',
            fabric_type_id: data.fabric_id || data.fabric_type_id || '',
            color_id: data.color_id || '',
            size_id: data.size_id || '',
            garment_condition_id: data.condition_id || data.garment_condition_id || '',
            
            rent_price: data.rent_price ? String(data.rent_price) : '',
            security_deposit: data.security_deposit ? String(data.security_deposit) : '',
            mrp: data.mrp ? String(data.mrp) : '',
            is_purchased: data.selling_price > 0 ? true : false,
            selling_price: data.selling_price ? String(data.selling_price) : '',
            
            chest_bust: data.chest_bust ? String(data.chest_bust) : '',
            waist: data.waist ? String(data.waist) : '',
            length: data.length ? String(data.length) : '',
            shoulder: data.shoulder ? String(data.shoulder) : '',
            sleeve_length: data.sleeve_length ? String(data.sleeve_length) : '',
            measurement_unit: unit,
          });
        setImages(data.images || []);
        
        // Handle dates properly
        const availability = data.availabilityBlocks || data.availability_blocks || [];
        const blocks = availability.filter(b => b.type === 'blocked');
        
        setBlockedDates(blocks.map(b => {
          let sDate = b.start_date;
          let eDate = b.end_date;
          if (typeof sDate === 'string' && sDate.includes('T')) sDate = sDate.split('T')[0];
          if (typeof eDate === 'string' && eDate.includes('T')) eDate = eDate.split('T')[0];
          
          return {
            id: b.id,
            start_date: sDate,
            end_date: eDate,
            reason: b.reason || ''
          };
        }));
      }
    } catch (error) {
      console.error("Error fetching cloth details:", error);
    } finally {
      setLoadingCloth(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const headers = { 'Accept': 'application/json' };
      const [catRes, brandRes, fabRes, colRes, sizeRes, condRes] = await Promise.all([
        api.get('/categories', { headers }),
        api.get('/brands', { headers }),
        api.get('/fabric-types', { headers }),
        api.get('/colors', { headers }),
        api.get('/sizes', { headers }),
        api.get('/garment-conditions', { headers }),
      ]);

      setOptions({
        categories: catRes.data?.data || catRes.data || [],
        brands: brandRes.data?.data || brandRes.data || [],
        fabrics: fabRes.data?.data || fabRes.data || [],
        colors: colRes.data?.data || colRes.data || [],
        sizes: sizeRes.data?.data || sizeRes.data || [],
        conditions: condRes.data?.data || condRes.data || [],
      });
    } catch (error) {
      console.error('Error fetching dropdown options:', error);
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAiImprove = async () => {
    if (!formData.description) {
      Alert.alert('Notice', 'Please write a simple description first to improve it.');
      return;
    }
    setAiLoading(true);
    try {
      const response = await api.post('/generate-description', {
        raw_description: formData.description,
        title: formData.title
      }, { headers: { ...(token && { Authorization: `Bearer ${token}` }) } });
      
      if (response.data?.description) {
        handleChange('description', response.data.description);
      }
    } catch (error) {
      Alert.alert('AI Error', 'Failed to generate improved description.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddBlockedDate = () => {
    setBlockedDates(prev => [...prev, { id: `new_${Date.now()}`, start_date: '', end_date: '', reason: '' }]);
  };

  const handleUpdateBlockedDate = (index, field, value) => {
    const newDates = [...blockedDates];
    newDates[index][field] = value;
    setBlockedDates(newDates);
  };

  const handleRemoveBlockedDate = (index) => {
    const newDates = [...blockedDates];
    newDates.splice(index, 1);
    setBlockedDates(newDates);
  };

  const handleAddImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 0,
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage);
          return;
        }
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

  const handleDeleteImage = async (imageId, index) => {
    Alert.alert('Delete Image', 'Are you sure you want to remove this image?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          if (typeof imageId === 'number' || !String(imageId).startsWith('new_')) {
            await api.delete(`/clothes/image/${imageId}`, {
              headers: { ...(token && { Authorization: `Bearer ${token}` }) }
            });
          }
          const newImages = [...images];
          newImages.splice(index, 1);
          setImages(newImages);
        } catch (error) {
          Alert.alert('Error', 'Failed to delete image');
        }
      }}
    ]);
  };

  const handleUpdateDatesOnly = async () => {
    setLoading(true);
    try {
      const blocksPayload = {
        availability_blocks: blockedDates.map(b => ({
          start_date: b.start_date,
          end_date: b.end_date,
          type: 'blocked',
          reason: b.reason
        }))
      };
      await api.post(`/clothes/${cloth.id}/availability`, blocksPayload, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) }
      });
      Alert.alert('Success', 'Availability dates updated successfully');
    } catch (error) {
      console.error('Update dates error:', error);
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update dates');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          let val = formData[key];
          if (typeof val === 'boolean') {
            val = val ? 1 : 0;
          }
          submitData.append(key, val);
        }
      });

      images.forEach((img, index) => {
        if (!img.id && img.uri) {
          submitData.append('images[]', {
            uri: img.uri,
            type: img.type || 'image/jpeg',
            name: img.fileName || `new_image_${index}.jpg`,
          });
        }
      });

      // 1. Update main cloth data
      const response = await api.post(`/clothes/${cloth.id}/update`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      
      // 2. Update Availability blocks
      if (blockedDates.length >= 0) {
        const blocksPayload = {
          availability_blocks: blockedDates.map(b => ({
            start_date: b.start_date,
            end_date: b.end_date,
            type: 'blocked',
            reason: b.reason
          }))
        };
        await api.post(`/clothes/${cloth.id}/availability`, blocksPayload, {
          headers: { ...(token && { Authorization: `Bearer ${token}` }) }
        });
      }
      
      Alert.alert('Success', 'Cloth updated successfully');
      dispatch(fetchMyListings()); 
      navigation.goBack();
    } catch (error) {
      console.error('Update cloth error:', error);
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update cloth');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCloth = () => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this item? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await api.delete(`/clothes/${cloth.id}`, {
                headers: { ...(token && { Authorization: `Bearer ${token}` }) }
              });
              Alert.alert('Success', 'Listing deleted successfully');
              dispatch(fetchMyListings());
              navigation.goBack();
            } catch (error) {
              console.error('Delete cloth error:', error);
              Alert.alert('Error', error?.response?.data?.message || 'Failed to delete listing');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="close" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Management Center</Text>
        </View>
        <TouchableOpacity onPress={handleDeleteCloth} style={{ padding: 5 }}>
          <Icon name="trash-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {loadingCloth ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#F59E0B" />
          <Text style={{ marginTop: 10, color: '#64748B' }}>Loading item details...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          
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
                <CustomDropdown label="Category" value={formData.category_id} options={options.categories} onSelect={(val) => handleChange('category_id', val)} placeholder="Select" required />
              </View>
              <View style={styles.col}>
                <CustomDropdown label="User Type" value={formData.gender} options={userTypes} onSelect={(val) => handleChange('gender', val)} placeholder="Select" required />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Description *</Text>
                <TouchableOpacity style={styles.aiButton} onPress={handleAiImprove} disabled={aiLoading}>
                  {aiLoading ? <ActivityIndicator size="small" color="#fff" /> : <Icon name="sparkles" size={12} color="#fff" />}
                  <Text style={styles.aiButtonText}>AI IMPROVE</Text>
                </TouchableOpacity>
              </View>
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
                <CustomDropdown label="Brand" value={formData.brand_id} options={options.brands} onSelect={(val) => handleChange('brand_id', val)} placeholder="Select" />
              </View>
              <View style={styles.col}>
                <CustomDropdown label="Fabric" value={formData.fabric_type_id} options={options.fabrics} onSelect={(val) => handleChange('fabric_type_id', val)} placeholder="Select" />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <CustomDropdown label="Color" value={formData.color_id} options={options.colors} onSelect={(val) => handleChange('color_id', val)} placeholder="Select" />
              </View>
              <View style={styles.col}>
                <CustomDropdown label="Standard Size" value={formData.size_id} options={options.sizes} onSelect={(val) => handleChange('size_id', val)} placeholder="Select" required />
              </View>
            </View>

            <CustomDropdown label="Condition" value={formData.garment_condition_id} options={options.conditions} onSelect={(val) => handleChange('garment_condition_id', val)} placeholder="Select" required />
          </View>

          {/* Pricing & Deposits */}
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Icon name="cash-outline" size={20} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Pricing & Deposits</Text>
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Original MRP</Text>
              <TextInput style={styles.input} value={formData.mrp} onChangeText={(text) => handleChange('mrp', text)} keyboardType="numeric" />
            </View>

            <TouchableOpacity style={styles.checkboxContainer} onPress={() => handleChange('is_purchased', !formData.is_purchased)}>
              <View style={[styles.checkbox, formData.is_purchased && styles.checkboxChecked]}>
                {formData.is_purchased && <Icon name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={styles.checkboxLabel}>Enable Selling</Text>
            </TouchableOpacity>

            {formData.is_purchased && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Selling Price (₹)</Text>
                <TextInput style={styles.input} value={formData.selling_price} onChangeText={(text) => handleChange('selling_price', text)} keyboardType="numeric" />
              </View>
            )}
          </View>

          {/* Media Gallery */}
          <View style={[styles.formSection, { backgroundColor: '#1E293B' }]}>
            <View style={styles.sectionHeader}>
              <Icon name="image-outline" size={20} color="#fff" />
              <Text style={[styles.sectionTitle, { color: '#fff' }]}>Media Gallery</Text>
            </View>
            <Text style={{ color: '#94A3B8', fontSize: 12, marginBottom: 15 }}>High quality images help you rent faster.</Text>
            
            <View style={styles.imageGrid}>
              {images.map((img, index) => {
                const uri = img.image_path ? `http://192.168.1.11:8000/storage/${img.image_path}` : img.uri;
                return (
                  <View key={img.id || index} style={styles.imageContainer}>
                    <Image source={{ uri }} style={styles.image} />
                    <TouchableOpacity style={styles.deleteImageBtn} onPress={() => handleDeleteImage(img.id, index)}>
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

          {/* Manage Availability */}
          <View style={styles.formSection}>
            <View style={[styles.sectionHeader, { justifyContent: 'space-between' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="calendar-outline" size={20} color="#F59E0B" />
                <Text style={styles.sectionTitle}>Manage Availability</Text>
              </View>
            </View>

            <View style={{ backgroundColor: '#FEF2F2', padding: 15, borderRadius: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                <Text style={{ color: '#EF4444', fontWeight: '700' }}>BLOCKED DATES</Text>
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity style={styles.addDateBtn} onPress={handleAddBlockedDate}>
                    <Icon name="add" size={16} color="#fff" />
                    <Text style={styles.addDateBtnText}>ADD</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.addDateBtn, { backgroundColor: '#3B82F6', marginLeft: 10 }]} 
                    onPress={handleUpdateDatesOnly}
                    disabled={loading}
                  >
                    <Icon name="save-outline" size={16} color="#fff" />
                    <Text style={styles.addDateBtnText}>UPDATE DATES</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {blockedDates.map((block, index) => (
                <View key={block.id || index} style={styles.blockedDateCard}>
                  <TouchableOpacity style={styles.removeBlockBtn} onPress={() => handleRemoveBlockedDate(index)}>
                    <Icon name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                  <View style={[styles.row, { marginBottom: 10, marginTop: 10 }]}>
                    <CustomDatePicker label="Start Date" value={block.start_date} onSelect={(date) => handleUpdateBlockedDate(index, 'start_date', date)} />
                    <CustomDatePicker label="End Date" value={block.end_date} onSelect={(date) => handleUpdateBlockedDate(index, 'end_date', date)} />
                  </View>
                  <Text style={styles.label}>Reason</Text>
                  <TextInput style={styles.input} value={block.reason} onChangeText={(text) => handleUpdateBlockedDate(index, 'reason', text)} placeholder="Rented (Order #2)" />
                </View>
              ))}
            </View>
          </View>

        </ScrollView>
      )}

      {/* Floating Action Button */}
      {!loadingCloth && (
        <View style={styles.fabContainer}>
          <TouchableOpacity style={[styles.updateBtn, loading && styles.updateBtnDisabled]} onPress={handleUpdate} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Icon name="cloud-upload-outline" size={20} color="#fff" />
                <Text style={styles.updateBtnText}>UPDATE CHANGES</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default EditCloth;
