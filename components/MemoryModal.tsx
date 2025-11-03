import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { UserData } from '../types';
import CloseIcon from './icons/CloseIcon';
import TrashIcon from './icons/TrashIcon';

interface MemoryModalProps {
  visible: boolean;
  onClose: () => void;
  userData: UserData;
  onDelete: (key: string) => void;
}

const MemoryModal: React.FC<MemoryModalProps> = ({ visible, onClose, userData, onDelete }) => {
  const memoryItems = Object.entries(userData);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>الذاكرة المحفوظة</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <CloseIcon width={24} height={24} color="#e5e7eb" />
            </TouchableOpacity>
          </View>
          
          {memoryItems.length === 0 ? (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>لا توجد معلومات محفوظة في الذاكرة حتى الآن.</Text>
            </View>
          ) : (
            <FlatList
              data={memoryItems}
              keyExtractor={(item) => item[0]}
              renderItem={({ item }) => (
                <View style={styles.memoryItem}>
                  <View style={styles.memoryTextContainer}>
                    <Text style={styles.memoryKey}>{item[0]}:</Text>
                    <Text style={styles.memoryValue}>{item[1]}</Text>
                  </View>
                  <TouchableOpacity onPress={() => onDelete(item[0])} style={styles.deleteButton} accessibilityLabel={`حذف ${item[0]}`}>
                    <TrashIcon width={20} height={20} color="#f87171" />
                  </TouchableOpacity>
                </View>
              )}
              style={styles.list}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    height: '60%',
    backgroundColor: '#1f2937', // bg-gray-800
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  emptyText: {
    color: '#9ca3af', // text-gray-400
    fontSize: 16,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  memoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#374151', // bg-gray-700
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  memoryTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  memoryKey: {
    color: '#e5e7eb', // text-gray-200
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  memoryValue: {
    color: '#d1d5db', // text-gray-300
    fontSize: 14,
  },
  deleteButton: {
    marginLeft: 16,
    padding: 8,
  },
});

export default MemoryModal;
