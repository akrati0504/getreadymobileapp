import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import styles from '../css/ProfileStyles';
import TopHeader from '../components/TopHeader';
import api from '../api/api';
import { loginSuccess } from '../redux/slices/authSlice'; // To update user in store if needed

const Profile = () => {
  const [activeTab, setActiveTab] = useState('Personal Info');
  const scrollViewRef = useRef(null);
  const [sectionPositions, setSectionPositions] = useState({
    'Personal Info': 0,
    'Business & KYC': 0,
    'Activity': 0,
  });

  const dispatch = useDispatch();
  
  // Get token and user from Redux store
  const { token, user: reduxUser } = useSelector((state) => state.auth.user || {});
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // User Data State
  const [userData, setUserData] = useState(reduxUser || {});
  const [name, setName] = useState(reduxUser?.name || '');
  const [email, setEmail] = useState(reduxUser?.email || '');
  const [phone, setPhone] = useState(reduxUser?.phone || '');
  const [gender, setGender] = useState(reduxUser?.gender || '');
  const [address, setAddress] = useState(reduxUser?.address || '');
  const [userState, setUserState] = useState(reduxUser?.state || '');
  const [city, setCity] = useState(reduxUser?.city || '');
  const [pincode, setPincode] = useState(reduxUser?.pincode || '');
  const [isGst, setIsGst] = useState(reduxUser?.is_gst ? '1' : '0');
  const [gstin, setGstin] = useState(reduxUser?.gstin || reduxUser?.gst_number || '');
  const [aadhaarNumber, setAadhaarNumber] = useState(reduxUser?.aadhaar_masked_number || reduxUser?.aadhaar_number || '');

  const [gstLegalName, setGstLegalName] = useState(reduxUser?.gst_legal_name || '');
  const [isAadhaarVerified, setIsAadhaarVerified] = useState(reduxUser?.is_aadhaar_verified || false);
  const [createdAt, setCreatedAt] = useState(reduxUser?.created_at ? new Date(reduxUser.created_at).toLocaleDateString() : 'N/A');
  const [updatedAt, setUpdatedAt] = useState(reduxUser?.updated_at ? new Date(reduxUser.updated_at).toLocaleDateString() : 'N/A');

  // Dropdown states
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showGstDropdown, setShowGstDropdown] = useState(false);

  useEffect(() => {
    // We already populated from Redux, but we can try to fetch fresh data if available.
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!token) return;
    // Don't set loading to true if we already have data, to prevent screen flickering
    if (!userData.name) setLoading(true);
    
    try {
      // Try /auth/profile which is a common endpoint, or /profile
      const response = await api.get('/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success && response.data.user) {
        const u = response.data.user;
        setUserData(u);
        populateState(u);
      }
    } catch (error) {
      console.log('Error fetching profile API. Falling back to Redux user data.', error);
      // Suppress the alert on initial load if we already have reduxUser
      // Alert.alert('Error', 'Failed to fetch profile details.');
    } finally {
      setLoading(false);
    }
  };

  const populateState = (u) => {
    if (!u) return;
    setName(u.name || '');
    setEmail(u.email || '');
    setPhone(u.phone || '');
    setGender(u.gender || '');
    setAddress(u.address || '');
    setUserState(u.state || '');
    setCity(u.city || '');
    setPincode(u.pincode || '');
    setIsGst(u.is_gst ? '1' : '0');
    setGstin(u.gstin || u.gst_number || '');
    setAadhaarNumber(u.aadhaar_masked_number || u.aadhaar_number || '');
    setGstLegalName(u.gst_legal_name || '');
    setIsAadhaarVerified(u.is_aadhaar_verified || false);
    setCreatedAt(u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A');
    setUpdatedAt(u.updated_at ? new Date(u.updated_at).toLocaleDateString() : 'N/A');
  };

  const handleTabPress = (tabName) => {
    setActiveTab(tabName);
    if (scrollViewRef.current && sectionPositions[tabName] !== undefined) {
      scrollViewRef.current.scrollTo({
        y: sectionPositions[tabName] - 20, // Slight offset for better view
        animated: true,
      });
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const payload = {
        name: name?.trim(),
        email: email?.trim(),
        phone: phone?.trim(),
        gender,
        address: address?.trim(),
        state: userState?.trim(),
        city: city?.trim(),
        pincode: pincode?.trim(),
        is_gst: parseInt(isGst, 10),
        gstin: isGst === '1' ? gstin?.trim() : ''
      };

      const response = await api.post('/profile/update', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        Alert.alert('Success', 'Profile updated successfully!');
        if (response.data.user) {
          setUserData(response.data.user);
          populateState(response.data.user);
          // Optional: Update Redux if user info is stored there
          dispatch(loginSuccess({ token, user: response.data.user }));
        }
      } else {
        Alert.alert('Error', response.data.message || 'Update failed');
      }
    } catch (error) {
      console.log('Update Error:', error?.response?.data || error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to update profile.';
      Alert.alert('Error', errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyGst = async () => {
    if (!gstin || gstin.length !== 15) {
      Alert.alert('Warning', 'Enter a valid 15-digit GSTIN.');
      return;
    }
    try {
      const response = await api.post('/verify-gst', { gstin }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        Alert.alert('Success', 'GST details verified! Save changes to finalize.');
        fetchProfile(); // Refresh profile to get updated GST legal name
      } else {
        Alert.alert('Error', 'GSTIN verification failed.');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error during GST verification.');
    }
  };

  const handleAadhaarKyc = async () => {
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      Alert.alert('Warning', 'Enter a valid 12-digit Aadhaar Number.');
      return;
    }
    try {
      const response = await api.post('/aadhaar-start', { aadhaar_number: aadhaarNumber }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success && response.data.url) {
        // You might want to open a WebView or use Linking to open the URL
        Alert.alert('Success', 'KYC initialized. Complete process via the web interface.');
        // Linking.openURL(response.data.url);
      } else {
        Alert.alert('Error', 'KYC initialization failed.');
      }
    } catch (error) {
      Alert.alert('Error', 'KYC service unavailable.');
    }
  };

  if (loading && !userData.name) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#b45309" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader />

      <ScrollView showsVerticalScrollIndicator={false} ref={scrollViewRef}>
        {/* Top Section */}
        <View style={styles.topSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{name ? name.substring(0, 1).toUpperCase() : 'U'}</Text>
            </View>
            <TouchableOpacity style={styles.cameraBadge}>
              <Icon name="camera" size={16} color="#f59e0b" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{name || 'Unknown User'}</Text>
          <Text style={styles.userEmail}>{email || 'No email provided'}</Text>

          <View style={isAadhaarVerified ? [styles.pendingBadge, { backgroundColor: '#dcfce7' }] : styles.pendingBadge}>
            <Icon name={isAadhaarVerified ? "checkmark-circle" : "warning"} size={16} color={isAadhaarVerified ? "#16a34a" : "#e11d48"} />
            <Text style={isAadhaarVerified ? [styles.pendingText, { color: '#16a34a' }] : styles.pendingText}>
              {isAadhaarVerified ? 'VERIFIED' : 'PENDING'}
            </Text>
          </View>

          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'Personal Info' && styles.activeTabButton]}
              onPress={() => handleTabPress('Personal Info')}
            >
              <Icon name="person-circle-outline" size={16} color={activeTab === 'Personal Info' ? '#b45309' : '#6b7280'} />
              <Text style={[styles.tabText, activeTab === 'Personal Info' && styles.activeTabText]}>Personal Info</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'Business & KYC' && styles.activeTabButton]}
              onPress={() => handleTabPress('Business & KYC')}
            >
              <Icon name="business-outline" size={16} color={activeTab === 'Business & KYC' ? '#b45309' : '#6b7280'} />
              <Text style={[styles.tabText, activeTab === 'Business & KYC' && styles.activeTabText]}>Business & KYC</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'Activity' && styles.activeTabButton]}
              onPress={() => handleTabPress('Activity')}
            >
              <Icon name="time-outline" size={16} color={activeTab === 'Activity' ? '#b45309' : '#6b7280'} />
              <Text style={[styles.tabText, activeTab === 'Activity' && styles.activeTabText]}>Activity</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.saveChangesRow}>
            <TouchableOpacity style={styles.saveChangesButton} onPress={handleSaveChanges} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveChangesText}>SAVE CHANGES</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.refreshButton} onPress={fetchProfile}>
              <Icon name="refresh-outline" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Personal Information Card */}
        <View
          style={styles.card}
          onLayout={(event) => {
            const layout = event.nativeEvent.layout;
            setSectionPositions(prev => ({ ...prev, 'Personal Info': layout.y }));
          }}
        >
          <View style={styles.cardTitleRow}>
            <Icon name="person-circle-outline" size={24} color="#1f2937" />
            <Text style={styles.cardTitle}>Personal Information</Text>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.halfInputGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} />
            </View>
            <View style={styles.halfInputGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.halfInputGroup}>
              <Text style={styles.label}>PHONE NUMBER</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>
            <View style={styles.halfInputGroup}>
              <Text style={styles.label}>USER TYPE</Text>
              <TouchableOpacity style={styles.dropdownSelector} onPress={() => setShowGenderDropdown(!showGenderDropdown)}>
                <Text style={styles.dropdownText}>{gender || 'Select'}</Text>
                <Icon name="chevron-down-outline" size={16} color="#6b7280" />
              </TouchableOpacity>
              {showGenderDropdown && (
                <View style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, marginTop: 5 }}>
                  {['Boy', 'Girl', 'Men', 'Women'].map((item) => (
                    <TouchableOpacity key={item} style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }} onPress={() => { setGender(item); setShowGenderDropdown(false); }}>
                      <Text style={{ color: '#374151' }}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PRIMARY ADDRESS</Text>
            <TextInput
              style={styles.textArea}
              value={address}
              onChangeText={setAddress}
              editable={!isAadhaarVerified}
              multiline
              numberOfLines={3}
            />
            {isAadhaarVerified && (
              <Text style={{ color: '#16a34a', fontSize: 12, marginTop: 5, fontWeight: 'bold' }}>
                <Icon name="shield-checkmark" size={12} /> Aadhaar Verified
              </Text>
            )}
          </View>

          <View style={styles.inputRow}>
            <View style={styles.thirdInputGroup}>
              <Text style={styles.label}>STATE</Text>
              <TextInput style={styles.input} value={userState} onChangeText={setUserState} />
            </View>
            <View style={styles.thirdInputGroup}>
              <Text style={styles.label}>CITY</Text>
              <TextInput style={styles.input} value={city} onChangeText={setCity} />
            </View>
            <View style={styles.thirdInputGroup}>
              <Text style={styles.label}>PINCODE</Text>
              <TextInput style={styles.input} value={pincode} onChangeText={setPincode} keyboardType="numeric" maxLength={6} />
            </View>
          </View>
        </View>

        {/* Business & KYC Card */}
        <View
          style={styles.card}
          onLayout={(event) => {
            const layout = event.nativeEvent.layout;
            setSectionPositions(prev => ({ ...prev, 'Business & KYC': layout.y }));
          }}
        >
          <View style={styles.cardTitleRow}>
            <Icon name="shield-checkmark-outline" size={24} color="#1f2937" />
            <Text style={styles.cardTitle}>Business & KYC</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>BUSINESS TYPE</Text>
            <TouchableOpacity style={styles.dropdownSelector} onPress={() => setShowGstDropdown(!showGstDropdown)}>
              <Text style={styles.dropdownText}>{isGst === '1' ? 'Business (GST Available)' : 'Individual / Non-Business'}</Text>
              <Icon name="chevron-down-outline" size={16} color="#6b7280" />
            </TouchableOpacity>
            {showGstDropdown && (
              <View style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, marginTop: 5 }}>
                <TouchableOpacity style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }} onPress={() => { setIsGst('0'); setShowGstDropdown(false); }}>
                  <Text style={{ color: '#374151' }}>Individual / Non-Business</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ padding: 10 }} onPress={() => { setIsGst('1'); setShowGstDropdown(false); }}>
                  <Text style={{ color: '#374151' }}>Business (GST Available)</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {isGst === '1' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>GSTIN NUMBER</Text>
              <View style={styles.kycInputContainer}>
                <TextInput
                  style={[styles.kycInput, { flex: 1 }]}
                  placeholder="15-digit GSTIN"
                  placeholderTextColor="#9ca3af"
                  value={gstin}
                  onChangeText={setGstin}
                  maxLength={15}
                  editable={!(isGst === '1' && gstLegalName)}
                />
                {(isGst === '1' && gstLegalName) ? (
                  <TouchableOpacity style={[styles.kycButton, { backgroundColor: '#16a34a' }]} disabled>
                    <Icon name="checkmark" size={18} color="#fff" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={[styles.kycButton, { backgroundColor: '#1f2937' }]} onPress={handleVerifyGst}>
                    <Text style={styles.kycButtonText}>VERIFY</Text>
                  </TouchableOpacity>
                )}
              </View>
              {gstLegalName ? (
                <View style={{ marginTop: 10, padding: 10, backgroundColor: '#f3f4f6', borderLeftWidth: 4, borderLeftColor: '#16a34a', borderRadius: 4 }}>
                  <Text style={{ fontSize: 10, color: '#6b7280', fontWeight: 'bold' }}>LEGAL BUSINESS NAME</Text>
                  <Text style={{ fontWeight: 'bold', color: '#1f2937' }}>{gstLegalName}</Text>
                </View>
              ) : null}
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>AADHAAR NUMBER (KYC)</Text>
            <View style={styles.kycInputContainer}>
              <TextInput
                style={[styles.kycInput, { flex: 1 }]}
                placeholder="12-digit Aadhaar Number"
                placeholderTextColor="#9ca3af"
                value={aadhaarNumber}
                onChangeText={(text) => setAadhaarNumber(text.replace(/[^0-9]/g, '').slice(0, 12))}
                maxLength={12}
                keyboardType="numeric"
                editable={!isAadhaarVerified}
              />
              {isAadhaarVerified ? (
                <TouchableOpacity style={[styles.kycButton, { backgroundColor: '#16a34a' }]} disabled>
                  <Icon name="shield-checkmark" size={18} color="#fff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.kycButton, { backgroundColor: '#1f2937' }]} onPress={handleAadhaarKyc}>
                  <Text style={styles.kycButtonText}>KYC</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {isAadhaarVerified ? (
              <View style={{ marginTop: 10, padding: 10, backgroundColor: '#f3f4f6', borderLeftWidth: 4, borderLeftColor: '#0ea5e9', borderRadius: 4 }}>
                <Text style={{ fontSize: 10, color: '#6b7280', fontWeight: 'bold' }}>KYC STATUS</Text>
                <Text style={{ fontWeight: 'bold', color: '#0ea5e9' }}>IDENTITY VERIFIED</Text>
              </View>
            ) : (
              <Text style={styles.helpText}>
                Verify via IM Wallet to unlock premium features and increase trust score.
              </Text>
            )}
          </View>
        </View>

        {/* Account Activity Card */}
        <View
          style={[styles.card, { marginBottom: 100 }]}
          onLayout={(event) => {
            const layout = event.nativeEvent.layout;
            setSectionPositions(prev => ({ ...prev, 'Activity': layout.y }));
          }}
        >
          <View style={styles.cardTitleRow}>
            <Icon name="time-outline" size={24} color="#1f2937" />
            <Text style={styles.cardTitle}>Account Activity</Text>
          </View>

          <View style={styles.activityBoxContainer}>
            <View style={styles.activityBox}>
              <Text style={styles.activityLabel}>MEMBER SINCE</Text>
              <Text style={styles.activityValue}>{createdAt}</Text>
            </View>
            <View style={styles.activityBox}>
              <Text style={styles.activityLabel}>LAST UPDATE</Text>
              <Text style={styles.activityValue}>{updatedAt}</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
