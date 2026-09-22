import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet
} from 'react-native';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess } from '../redux/slices/authSlice';
import styles from '../css/LoginStyles';
import api from '../api/api';

const Login = ({ navigation }) => {
  // --- States ---
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const [verificationToken, setVerificationToken] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState(''); // 'Men' | 'Women'
  const [isGst, setIsGst] = useState('0');  // '0' | '1'
  const [gstin, setGstin] = useState('');

  // --- Handlers ---
  const handleSendOTP = async () => {
    if (phone.trim().length < 10) {
      return Alert.alert("Invalid Input", "Please enter a valid phone number");
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/login/send-otp', { phone });
      
      if (response.data.success) {
        if (response.data.otp) {
          Alert.alert("Dev Mode OTP", `Your OTP is: ${response.data.otp}`);
        }
        setStep(2);
      } else {
        Alert.alert("Error", response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.trim().length !== 6) {
      return Alert.alert("Invalid Input", "Please enter a 6-digit OTP");
    }

    dispatch(loginStart());
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login/verify-otp', { phone, otp });
      
      if (response.data.success) {
        if (response.data.is_new_user) {
          setVerificationToken(response.data.data.verification_token);
          setStep(3);
        } else {
          dispatch(loginSuccess({ token: response.data.data.token, user: response.data.data.user }));
          navigation.navigate('Home');
        }
      }
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteRegistration = async () => {
    if (!age || !gender || (isGst === '1' && !gstin)) {
      return Alert.alert("Missing Fields", "Please fill out all required fields.");
    }

    dispatch(loginStart());
    setIsLoading(true);
    try {
      const payload = {
        phone,
        verification_token: verificationToken,
        age,
        gender,
        is_gst: parseInt(isGst, 10),
        gstin: isGst === '1' ? gstin : ''
      };

      const response = await api.post('/auth/login/complete-registration', payload);

      if (response.data.success) {
        dispatch(loginSuccess({ token: response.data.data.token, user: response.data.data.user }));
        navigation.navigate('Home');
      }
    } catch (error) {
      Alert.alert("Registration Failed", error.response?.data?.message || "Please check your details and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 2 || step === 3) {
      setStep(1);
      setOtp('');
      setVerificationToken('');
    }
  };

  // --- UI Helpers ---
  const renderStep1 = () => (
    <View style={styles.inputContainer}>
      <Text style={styles.icon}>📞</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Your Mobile Number"
        placeholderTextColor="#94a3b8"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        editable={!isLoading}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.inputContainer}>
      <Text style={styles.icon}>🔒</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter 6-digit OTP"
        placeholderTextColor="#94a3b8"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
        maxLength={6}
        editable={!isLoading}
      />
    </View>
  );

  const renderStep3 = () => (
    <View style={localStyles.step3Container}>
      {/* Age */}
      <View style={styles.inputContainer}>
        <Text style={styles.icon}>📅</Text>
        <TextInput
          style={styles.input}
          placeholder="Age"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
          editable={!isLoading}
        />
      </View>

      {/* Gender Selector */}
      <View style={localStyles.row}>
        {['Men', 'Women'].map(option => (
          <TouchableOpacity 
            key={option}
            style={[localStyles.selectButton, gender === option && localStyles.selectButtonActive]}
            onPress={() => setGender(option)}
          >
            <Text style={[localStyles.selectButtonText, gender === option && localStyles.selectButtonTextActive]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* GST Status Selector */}
      <View style={localStyles.row}>
        {[
          { label: 'Individual', value: '0' },
          { label: 'Business (GST)', value: '1' }
        ].map(option => (
          <TouchableOpacity 
            key={option.value}
            style={[localStyles.selectButton, isGst === option.value && localStyles.selectButtonActiveOrange]}
            onPress={() => setIsGst(option.value)}
          >
            <Text style={[localStyles.selectButtonText, localStyles.selectButtonTextSmall, isGst === option.value && localStyles.selectButtonTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* GSTIN Input */}
      {isGst === '1' && (
        <View style={styles.inputContainer}>
          <Text style={styles.icon}>🧾</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter GSTIN"
            placeholderTextColor="#94a3b8"
            autoCapitalize="characters"
            value={gstin}
            onChangeText={setGstin}
            maxLength={15}
            editable={!isLoading}
          />
        </View>
      )}
    </View>
  );

  const getHeaderInfo = () => {
    switch (step) {
      case 1: return { title: 'Welcome Back', sub: 'Please login to your account' };
      case 2: return { title: 'Verification', sub: `Enter the OTP sent to ${phone}` };
      case 3: return { title: 'Complete Profile', sub: 'Tell us a bit about yourself' };
      default: return { title: '', sub: '' };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <ImageBackground
      source={require('../assets/images/login.jpg')}
      style={styles.backgroundImage}
      imageStyle={{ resizeMode: 'cover', left: 0 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.overlay}>
              <View style={styles.formContainer}>
                
                {step > 1 && (
                  <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Text style={styles.backButtonText}>← Back</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.headerContainer}>
                  <Text style={styles.title}>{headerInfo.title}</Text>
                  <Text style={styles.subtitle}>{headerInfo.sub}</Text>
                </View>

                <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
                  <View style={styles.inputWrapper}>
                    
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}

                    <TouchableOpacity
                      style={[styles.actionButton, isLoading && styles.actionButtonDisabled, localStyles.submitButton]}
                      onPress={() => {
                        if (step === 1) handleSendOTP();
                        else if (step === 2) handleVerifyOTP();
                        else handleCompleteRegistration();
                      }}
                      activeOpacity={0.8}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <Text style={styles.actionButtonText}>
                          {step === 1 ? 'Send OTP' : step === 2 ? 'Verify & Login' : 'Complete Registration'}
                        </Text>
                      )}
                    </TouchableOpacity>

                  </View>
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

// Extracted local styles for cleaner code
const localStyles = StyleSheet.create({
  step3Container: {
    width: '100%',
    gap: 15
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10
  },
  selectButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center'
  },
  selectButtonActive: {
    backgroundColor: '#4169e1',
    borderColor: '#4169e1'
  },
  selectButtonActiveOrange: {
    backgroundColor: '#FFA500',
    borderColor: '#FFA500'
  },
  selectButtonText: {
    color: '#94a3b8',
    fontWeight: 'bold'
  },
  selectButtonTextActive: {
    color: '#fff'
  },
  selectButtonTextSmall: {
    textAlign: 'center',
    fontSize: 12
  },
  submitButton: {
    marginTop: 20
  }
});

export default Login;
