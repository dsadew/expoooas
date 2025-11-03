import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import SendIcon from './icons/SendIcon';
// MicrophoneIcon is removed for now, as speech recognition is a native feature
// import MicrophoneIcon from './icons/MicrophoneIcon';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  limitReached: boolean;
  dailyUsage: number;
  limit: number;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, limitReached, dailyUsage, limit }) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim() && !isLoading && !limitReached) {
      onSendMessage(text);
      setText('');
    }
  };

  const placeholderText = limitReached 
    ? "لقد وصلت إلى الحد اليومي." 
    : "اكتب رسالتك...";

  const isInputDisabled = isLoading || limitReached;
  const isSendDisabled = isLoading || !text.trim() || limitReached;

  return (
    <View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.textInput, isInputDisabled && styles.disabledInput]}
          value={text}
          onChangeText={setText}
          placeholder={placeholderText}
          placeholderTextColor="#9ca3af" // placeholder-gray-400
          editable={!isInputDisabled}
          multiline
        />
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSendDisabled}
          style={[styles.sendButton, isSendDisabled && styles.disabledButton]}
          aria-label="إرسال"
        >
          <SendIcon width={24} height={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
      <Text style={styles.usageText}>
          {`استخدام اليوم: ${dailyUsage} / ${limit}`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1f2937', // bg-gray-800
    borderWidth: 1,
    borderColor: '#4b5563', // border-gray-600
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
    maxHeight: 120,
  },
  disabledInput: {
    opacity: 0.5,
  },
  sendButton: {
    backgroundColor: '#0891b2', // bg-cyan-600
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#4b5563', // bg-gray-600
  },
  usageText: {
    fontSize: 12,
    color: '#6b7280', // text-gray-500
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ChatInput;
