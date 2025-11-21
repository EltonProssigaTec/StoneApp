import { LogoImage } from '@/components/LogoImage';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppColors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
}

export default function ChatScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Olá, tudo bem?', sender: 'bot' },
    {
      id: '2',
      text: 'Seja bem-vindo(a) ao suporte da StoneUP Monitora! Estou aqui para te ajudar com suas dúvidas.\n\nDescreva sua dúvida:',
      sender: 'bot',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Detecta altura do teclado no Android
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputText('');

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Obrigado pela sua mensagem! Em breve um de nossos atendentes irá responder.',
        sender: 'bot',
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);

    // Rola até o fim ao enviar
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <StatusBar
          backgroundColor={AppColors.primary} // cor do header no Android
          barStyle="light-content" // texto branco
          translucent={false}
        />

        {/* Header fixo */}
        <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <LogoImage size="small" />
          </View>
          <View>
            <Text style={styles.headerTitle}>StoneUP - Chat</Text>
            <Text style={styles.headerStatus}>Online agora</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <View style={styles.closeButton}>
            <IconSymbol name="xmark" size={20} color={AppColors.white} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Conteúdo com KeyboardAvoidingView */}
      <KeyboardAvoidingView
        style={styles.flexContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Mensagens roláveis */}
        <ScrollView
          ref={scrollRef}
          style={styles.messagesContainer}
          contentContainerStyle={[
            styles.messagesContent,
            { paddingBottom: 80 }, // espaço pro input
          ]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.sender === 'user' && styles.messageWrapperUser,
              ]}
            >
              {message.sender === 'bot' && (
                <View style={styles.botAvatar}>
                  <LogoImage size="small" />
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  message.sender === 'user' && styles.messageBubbleUser,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.sender === 'user' && styles.messageTextUser,
                  ]}
                >
                  {message.text}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input fixo no rodapé */}
        <View
          style={[
            styles.inputContainer,
            { marginBottom: Platform.OS === 'android' ? keyboardHeight : 0 },
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder="Mensagem"
            placeholderTextColor={AppColors.text.placeholder}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <IconSymbol
              name="arrow.up.circle.fill"
              size={32}
              color={
                inputText.trim()
                  ? AppColors.secondary
                  : AppColors.gray[300]
              }
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
    backgroundColor: AppColors.background.secondary,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    ...Platform.select({
      web: {
        maxWidth: 720,
      },
    }),
  },
  header: {
    backgroundColor: AppColors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomEndRadius: 25,
    borderBottomStartRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    marginRight: 12,
    transform: [{ scale: 0.6 }],
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.white,
  },
  headerStatus: {
    fontSize: 12,
    color: AppColors.white,
    opacity: 0.9,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexContainer: {
    flex: 1,
    backgroundColor: AppColors.background.secondary,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageWrapperUser: {
    justifyContent: 'flex-end',
  },
  botAvatar: {
    width: 32,
    height: 32,
    marginRight: 8,
    transform: [{ scale: 0.5 }],
  },
  messageBubble: {
    backgroundColor: AppColors.white,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    maxWidth: '75%',
  },
  messageBubbleUser: {
    backgroundColor: AppColors.primary,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: AppColors.text.primary,
    lineHeight: 20,
  },
  messageTextUser: {
    color: AppColors.white,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: AppColors.primary,
    borderTopWidth: 1,
    borderTopColor: AppColors.border.light,
  },
  input: {
    flex: 1,
    backgroundColor: AppColors.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: AppColors.text.primary,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    marginVertical: 'auto',
  },
});
