import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const AccountMenuModal = ({ visible, onClose }) => {
  const navigation = useNavigation();

  const menuItems = [
    { id: 1, title: 'My Listings', icon: 'list-outline', screen: 'Listings' },
    { id: 2, title: 'Sales Dashboard', icon: 'stats-chart-outline', screen: 'Analytics' },
    { id: 3, title: 'My Orders', icon: 'bag-outline', screen: 'Cart' },
    { id: 4, title: 'My Invoices', icon: 'receipt-outline', screen: 'MyInvoices' },
    { id: 5, title: 'My Transactions', icon: 'cash-outline', screen: 'Home' },
    { id: 6, title: 'Rejected Items', icon: 'close-circle-outline', screen: 'RejectedItems' },
    { id: 7, title: 'Profile Settings', icon: 'settings-outline', screen: 'Profile' },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.menuContainer}>
              <View style={styles.accountHeader}>
                <Text style={styles.accountLabel}>ACCOUNT</Text>
                <Text style={styles.userName}>User-8236</Text>
              </View>

              <View style={styles.menuList}>
                {menuItems.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.menuItem} 
                    onPress={() => {
                      onClose();
                      navigation.navigate(item.screen);
                    }}
                  >
                    <Icon name={item.icon} size={22} color="#6b7280" style={styles.menuIcon} />
                    <Text style={styles.menuText}>{item.title}</Text>
                  </TouchableOpacity>
                ))}
                
                <TouchableOpacity 
                  style={[styles.menuItem, styles.logoutItem]} 
                  onPress={() => {
                    onClose();
                    navigation.replace('Login');
                  }}
                >
                  <Icon name="log-out-outline" size={22} color="#ef4444" style={styles.menuIcon} />
                  <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  menuContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 250,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  accountHeader: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  accountLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 1,
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  menuList: {
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    fontSize: 15,
    color: '#4b5563',
    fontWeight: '400',
  },
  logoutItem: {
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 15,
  },
  logoutText: {
    fontSize: 15,
    color: '#ef4444',
    fontWeight: '600',
  }
});

export default AccountMenuModal;
