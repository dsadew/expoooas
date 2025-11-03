import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, SafeAreaView, Linking } from 'react-native';
import CloseIcon from './icons/CloseIcon';

interface AboutModalProps {
  visible: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ visible, onClose }) => {
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
            <Text style={styles.headerTitle}>حول مساعد الذاكرة</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <CloseIcon width={24} height={24} color="#e5e7eb" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.text}>
            هذا التطبيق هو مساعد شخصي مدعوم بالذكاء الاصطناعي لمساعدتك على تذكر الأشياء المهمة. يمكنك أن تطلب منه حفظ معلومات واسترجاعها في أي وقت.
          </Text>
          <Text style={styles.text}>
            يستخدم التطبيق نموذج Gemini من Google للدردشة وتخزين المعلومات بشكل آمن خلال جلستك الحالية.
          </Text>
          <Text style={styles.subHeader}>الميزات:</Text>
          <Text style={styles.listItem}>• حفظ واسترجاع المعلومات باستخدام اللغة الطبيعية.</Text>
          <Text style={styles.listItem}>• تأمين الجلسة باستخدام رمز PIN.</Text>
          <Text style={styles.listItem}>• واجهة دردشة بسيطة وسهلة الاستخدام.</Text>

           <View style={styles.footer}>
                <Text style={styles.footerText}>
                    تم التطوير بواسطة مهندس واجهات أمامية خبير بالاستعانة بـ Gemini.
                </Text>
           </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#1f2937', // bg-gray-800
    borderRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    paddingBottom: 10,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  text: {
    color: '#d1d5db',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  subHeader: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 8,
  },
  listItem: {
      color: '#d1d5db',
      fontSize: 16,
      lineHeight: 24,
      marginLeft: 10,
  },
  footer: {
      marginTop: 30,
      borderTopWidth: 1,
      borderTopColor: '#374151',
      paddingTop: 15,
      alignItems: 'center'
  },
  footerText: {
      color: '#6b7280',
      fontSize: 12,
  }
});

export default AboutModal;
