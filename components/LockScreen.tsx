import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';

type LockScreenMode = 'set' | 'enter';

interface LockScreenProps {
  mode: LockScreenMode;
  onSuccess: (pin: string) => void;
  onLogout: () => void;
}

const PIN_LENGTH = 4;

const LockScreen: React.FC<LockScreenProps> = ({ mode, onSuccess, onLogout }) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [firstPin, setFirstPin] = useState<string>('');
  const [currentMode, setCurrentMode] = useState<'set' | 'confirm' | 'enter'>(mode);
  
  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    setTimeout(() => textInputRef.current?.focus(), 100);
  }, [currentMode]);

  const getTitle = () => {
    if (currentMode === 'set') return 'قم بتعيين رمز PIN';
    if (currentMode === 'confirm') return 'تأكيد رمز PIN';
    return 'أدخل رمز PIN';
  };
  
  const getSubtitle = () => {
    if (currentMode === 'set') return `أنشئ رمز PIN مكون من ${PIN_LENGTH} أرقام للوصول الآمن.`;
    if (currentMode === 'confirm') return 'أعد إدخال الرمز لتأكيده.';
    return 'أدخل رمزك المكون من 4 أرقام للمتابعة.';
  }

  const handlePinChange = (text: string) => {
    if (error) setError('');
    const newPin = text.replace(/[^0-9]/g, '');
    if (newPin.length <= PIN_LENGTH) {
      setPin(newPin);
      if (newPin.length === PIN_LENGTH) {
        processPin(newPin);
      }
    }
  };

  const processPin = (enteredPin: string) => {
    if (currentMode === 'set') {
      setFirstPin(enteredPin);
      setCurrentMode('confirm');
      setPin('');
    } else if (currentMode === 'confirm') {
      if (enteredPin === firstPin) {
        onSuccess(enteredPin);
      } else {
        setError('رموز PIN غير متطابقة. حاول مرة أخرى.');
        setPin('');
        setFirstPin('');
        setCurrentMode('set');
      }
    } else { // 'enter' mode
      onSuccess(enteredPin); // App.tsx will handle verification
    }
  };

  const PinDots = () => (
    <View style={styles.dotsContainer}>
      {Array.from({ length: PIN_LENGTH }).map((_, index) => (
        <View
          key={index}
          style={[styles.dot, index < pin.length ? styles.dotFilled : {}]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content}>
        <Text style={styles.title}>{getTitle()}</Text>
        <Text style={styles.subtitle}>{getSubtitle()}</Text>
        
        <PinDots />

        {error ? <Text style={styles.errorText}>{error}</Text> : <View style={{ height: 40 }} />}
        
        <TextInput
            ref={textInputRef}
            style={styles.hiddenInput}
            value={pin}
            onChangeText={handlePinChange}
            keyboardType="number-pad"
            maxLength={PIN_LENGTH}
            caretHidden={true}
        />
        
        {mode === 'enter' && (
          <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>لست أنت؟ تسجيل الخروج</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#030712', // bg-gray-950
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  content: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af', // text-gray-400
    marginBottom: 40,
    textAlign: 'center'
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4b5563', // border-gray-600
  },
  dotFilled: {
    backgroundColor: '#22d3ee', // cyan-400
    borderColor: '#22d3ee',
  },
  errorText: {
    color: '#f87171', // red-400
    fontSize: 14,
    height: 20,
    marginBottom: 20,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  logoutButton: {
      position: 'absolute',
      bottom: 50,
  },
  logoutText: {
      color: '#6b7280', // text-gray-500
      fontSize: 14,
  }
});

export default LockScreen;
