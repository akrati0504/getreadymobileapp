import React from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const DropdownModal = ({ visible, title, data, onClose, onSelect }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <SafeAreaView style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '60%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' }}
                onPress={() => onSelect(item)}
              >
                <Text style={{ fontSize: 16 }}>{item.title || item.name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={{ padding: 20, textAlign: 'center', color: '#888' }}>No data available.</Text>}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default DropdownModal;
