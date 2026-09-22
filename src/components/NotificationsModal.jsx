import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAllAsRead, markAsRead } from '../redux/slices/notificationSlice';

const { height } = Dimensions.get('window');

const NotificationsModal = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const { data: notifications, isLoading, unreadCount, error } = useSelector(state => state.notifications);

  useEffect(() => {
    if (visible) {
      dispatch(fetchNotifications());
    }
  }, [visible, dispatch]);

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };

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
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Notifications {unreadCount > 0 && `(${unreadCount})`}</Text>
                {unreadCount > 0 && (
                  <TouchableOpacity onPress={handleMarkAllRead}>
                    <Text style={styles.markAllRead}>Mark All Read</Text>
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#f59e0b" style={{ marginTop: 20 }} />
                ) : error ? (
                  <Text style={{ textAlign: 'center', padding: 20, color: 'red' }}>Error: {error}</Text>
                ) : notifications && notifications.filter(n => !n.read_at && n.read !== true).length > 0 ? (
                  notifications.filter(n => !n.read_at && n.read !== true).map((notif) => {
                    const isUnread = true; // since they are all unread now
                    return (
                      <TouchableOpacity 
                        key={notif.id} 
                        style={[styles.notificationItem, styles.unreadItem]}
                        onPress={() => handleMarkAsRead(notif.id)}
                      >
                        <View style={styles.iconContainer}>
                          <Icon name="checkmark-circle-outline" size={24} color="#10b981" />
                        </View>
                        <View style={styles.contentContainer}>
                          <Text style={styles.title}>{notif.title || 'Notification'}</Text>
                          <Text style={styles.message}>{notif.message || ''}</Text>
                          <Text style={styles.time}>{new Date(notif.created_at).toLocaleDateString()}</Text>
                        </View>
                        <View style={styles.unreadDot} />
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <Text style={{ textAlign: 'center', padding: 20, color: '#64748b' }}>No notifications yet</Text>
                )}
              </ScrollView>
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
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  menuContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 320,
    maxHeight: height * 0.7,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
  },
  markAllRead: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  listContainer: {
    paddingBottom: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  unreadItem: {
    backgroundColor: '#fffbeb',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 6,
  },
  time: {
    fontSize: 12,
    color: '#94a3b8',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f59e0b',
    marginLeft: 10,
    marginTop: 5,
  }
});

export default NotificationsModal;
