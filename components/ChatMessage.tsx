import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../types';
import UserIcon from './icons/UserIcon';
import BotIcon from './icons/BotIcon';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.botContainer]}>
      {!isUser && <BotIcon width={32} height={32} color="#22d3ee" />}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={styles.messageText}>{message.content}</Text>
      </View>
      {isUser && <UserIcon width={32} height={32} color="#a5f3fc" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginVertical: 8,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  botContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 12,
    padding: 12,
  },
  userBubble: {
    backgroundColor: '#0891b2', // bg-cyan-600
    borderBottomRightRadius: 0,
  },
  botBubble: {
    backgroundColor: '#374151', // bg-gray-700
    borderBottomLeftRadius: 0,
  },
  messageText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default ChatMessage;
