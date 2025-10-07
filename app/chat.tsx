import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LogoImage } from '@/components/LogoImage';
import { AppColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
}

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá, tudo bem?',
      sender: 'bot',
    },
    {
      id: '2',
      text: 'Seja bem-vindo(a) ao suporte da StoneUP Monitora! Estou aqui para te ajudar com suas dúvidas.\n\nDescreva sua dúvida:',
      sender: 'bot',
    },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        sender: 'user',
      };
      setMessages([...messages, newMessage]);
      setInputText('');

      // Simulate bot response
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Obrigado pela sua mensagem! Em breve um de nossos atendentes irá responder.',
          sender: 'bot',
        };
        setMessages((prev) => [...prev, botResponse]);
      }, 1000);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
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

      {/* Messages */}
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
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

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite sua dúvida:"
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
            color={inputText.trim() ? AppColors.primary : AppColors.gray[300]}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  header: {
    backgroundColor: AppColors.primary,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
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
  messagesContainer: {
    flex: 1,
    backgroundColor: AppColors.background.secondary,
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
    marginBottom: 2,
  },
});
