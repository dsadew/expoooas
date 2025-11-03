import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native';
import { Message, ChatHistory, UserData, Content, Part } from './types';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { sendMessageToGemini } from './services/geminiService';
import BotIcon from './components/icons/BotIcon';
import BrainIcon from './components/icons/BrainIcon';
import InfoIcon from './components/icons/InfoIcon';
import LogoutIcon from './components/icons/LogoutIcon';

const DAILY_MESSAGE_LIMIT = 30;
const INITIAL_PROMPT = "أنت تبدأ محادثة جديدة. استخدم دالة getAllUserData لفحص ذاكرة المستخدم. ابحث عن أي أحداث قادمة هذا الأسبوع أو أي معلومات مثيرة للاهتمام. ثم، قم بإنشاء تحية ودية واستباقية. إذا كانت الذاكرة فارغة، قدم تحية ترحيبية قياسية.";

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<ChatHistory>([]);
  const [userData, setUserData] = useState<UserData>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [dailyUsage, setDailyUsage] = useState<number>(0);
  const [limitReached, setLimitReached] = useState<boolean>(false);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);
  
  // Note: In a real app, this should interact with persistent storage like AsyncStorage.
  const saveUserData = useCallback((key: string, value: string): string => {
    if (Object.keys(userData).length >= 10 && !userData[key]) {
        return 'عذراً، الذاكرة ممتلئة. لا يمكن حفظ أكثر من 10 معلومات. يرجى حذف معلومة قديمة أولاً.';
    }
    const updatedUserData = { ...userData, [key]: value };
    setUserData(updatedUserData);
    console.log('Saved to memory state:', updatedUserData);
    return `تم حفظ المعلومة بنجاح: ${key}`;
  }, [userData]);

  const getUserData = useCallback((key: string): string => {
    const value = userData[key];
    if (value) {
      return `المعلومة التي وجدتها لـ ${key} هي: ${value}`;
    }
    return `عذراً، لم أجد أي معلومة محفوظة بالمفتاح: ${key}`;
  }, [userData]);
  
  const getAllUserData = useCallback((): string => {
    return JSON.stringify(userData);
  }, [userData]);

   const getGeminiResponse = async (prompt: string, currentHistory: ChatHistory): Promise<{ modelResponseText: string, finalHistory: ChatHistory }> => {
    try {
      const userTurn: Content = { role: 'user', parts: [{ text: prompt }] };
      const historyWithUserTurn = [...currentHistory, userTurn];
      
      const geminiResponse = await sendMessageToGemini(historyWithUserTurn, '');
      
      const functionCalls = geminiResponse.functionCalls;

      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];
        let functionResult = '';

        if (call.name === 'saveUserData' && call.args) {
          functionResult = saveUserData(call.args.key as string, call.args.value as string);
        } else if (call.name === 'getUserData' && call.args) {
          functionResult = getUserData(call.args.key as string);
        } else if (call.name === 'getAllUserData') {
          functionResult = getAllUserData();
        }

        const modelTurnWithFC: Content = { role: 'model', parts: [{ functionCall: call }] };
        const functionResponsePart: Part[] = [{ functionResponse: { name: call.name, response: { result: functionResult } } }];
        
        const historyForSecondCall: ChatHistory = [...historyWithUserTurn, modelTurnWithFC];

        const functionResponseResult = await sendMessageToGemini(
          historyForSecondCall,
          '',
          functionResponsePart
        );
        
        const functionResponseTurn: Content = { role: 'function', parts: functionResponsePart };
        const finalModelTurn: Content = { role: 'model', parts: [{ text: functionResponseResult.text }] };

        return {
          modelResponseText: functionResponseResult.text,
          finalHistory: [...historyForSecondCall, functionResponseTurn, finalModelTurn]
        };
      } else {
        const modelTurn: Content = { role: 'model', parts: [{ text: geminiResponse.text }] };
        return {
          modelResponseText: geminiResponse.text,
          finalHistory: [...historyWithUserTurn, modelTurn]
        };
      }
    } catch (error) {
      console.error("Error in getGeminiResponse:", error);
      const detailMessage = error instanceof Error ? error.message : 'يرجى المحاولة مرة أخرى.';
      throw new Error(`عذراً، حدث خطأ أثناء الاتصال بالمساعد: ${detailMessage}`);
    }
  };
  
  const startConversation = useCallback(async () => {
    setIsLoading(true);
    setHistory([]);
    setMessages([]);
    try {
        // Pass an empty history initially for the proactive greeting
        const { modelResponseText, finalHistory } = await getGeminiResponse(INITIAL_PROMPT, []);
        const initialMessage: Message = { role: 'model', content: modelResponseText };
        setMessages([initialMessage]);
        setHistory(finalHistory);
    } catch (error) {
        const errorMessage: Message = { 
            role: 'model', 
            content: error instanceof Error ? error.message : 'فشل بدء المحادثة.'
        };
        setMessages([errorMessage]);
    } finally {
        setIsLoading(false);
    }
  }, [getAllUserData, getUserData, saveUserData]);

  useEffect(() => {
    startConversation();
  }, [startConversation]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || limitReached) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const newCount = dailyUsage + 1;
    setDailyUsage(newCount);
    if (newCount >= DAILY_MESSAGE_LIMIT) {
        setLimitReached(true);
    }

    try {
        const { modelResponseText, finalHistory } = await getGeminiResponse(text, history);
        const modelMessage: Message = { role: 'model', content: modelResponseText };
        setMessages(prev => [...prev, modelMessage]);
        setHistory(finalHistory);
    } catch (error) {
      const errorMessage: Message = { 
        role: 'model', 
        content: error instanceof Error ? error.message : 'عذراً، حدث خطأ غير متوقع.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      if (newCount >= DAILY_MESSAGE_LIMIT) {
         setTimeout(() => {
            const limitMessage: Message = { role: 'model', content: 'لقد وصلت إلى حد الاستخدام اليومي. يرجى المحاولة مرة أخرى غداً.' };
            setMessages(prev => [...prev, limitMessage]);
        }, 500);
      }
    }
  }, [history, dailyUsage, limitReached, getGeminiResponse]);
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <BotIcon width={32} height={32} color="#22d3ee" />
          <Text style={styles.headerText}>مساعد الذاكرة</Text>
        </View>
        <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={() => console.log('About pressed - UI to be implemented')}>
                <InfoIcon width={24} height={24} color="#22d3ee" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => console.log('Memory pressed - UI to be implemented')}>
                <BrainIcon width={24} height={24} color="#22d3ee" />
            </TouchableOpacity>
             <TouchableOpacity style={styles.iconButton} onPress={() => console.log('Logout pressed - UI to be implemented')}>
                <LogoutIcon width={24} height={24} color="#f87171" />
            </TouchableOpacity>
        </View>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item, index }) => <ChatMessage key={index} message={item} />}
        keyExtractor={(_, index) => index.toString()}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
      />

      {isLoading && !messages.length && (
          <ActivityIndicator size="large" color="#22d3ee" style={styles.initialLoader} />
      )}

      {isLoading && messages.length > 0 && (
        <View style={styles.typingIndicatorContainer}>
            <BotIcon width={32} height={32} color="#22d3ee" />
            <Text style={styles.typingText}>يكتب...</Text>
        </View>
      )}

      <View style={styles.footer}>
        <ChatInput 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading}
          limitReached={limitReached}
          dailyUsage={dailyUsage}
          limit={DAILY_MESSAGE_LIMIT}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712', // bg-gray-950
  },
  header: {
    backgroundColor: '#1f2937', // bg-gray-800
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#374151', // border-gray-700
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 999,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  initialLoader: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%'
  },
  typingIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  typingText: {
    color: '#9ca3af', // text-gray-400
    fontSize: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151', // border-gray-700
  },
});

export default App;
