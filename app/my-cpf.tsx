import { AppHeader } from '@/components/ui/AppHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppColors, Fonts } from '@/constants/theme';
import React, { useState } from 'react';
import {
  Image,
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

export default function MyCpfScreen() {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');

  const handlePesquisar = () => {
    console.log('Pesquisar:', { nomeCompleto, dataNascimento });
    // Implementar lógica de pesquisa
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar
        barStyle="light-content"
        translucent={true}
      />

      {/* Header */}
      <AppHeader title='Meu CPF' />

      {/* Content */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Ilustração */}
          <View style={styles.illustrationContainer}>
            <Image
              source={require('@/assets/images/flutuante.png')}
              style={styles.illustrationImage}
              resizeMode="contain"
            />
          </View>

          {/* Campo Nome Completo */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <IconSymbol name="person.fill" size={24} color={AppColors.primary} />
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>NOME COMPLETO:</Text>
              <TextInput
                style={styles.input}
                placeholder="Escreva seu nome completo."
                placeholderTextColor={AppColors.gray[400]}
                value={nomeCompleto}
                onChangeText={setNomeCompleto}
              />
            </View>
          </View>

          {/* Campo Data de Nascimento */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <IconSymbol name="calendar" size={24} color={AppColors.primary} />
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>DATA DE NASCIMENTO:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex.: 20/04/..."
                placeholderTextColor={AppColors.gray[400]}
                value={dataNascimento}
                onChangeText={setDataNascimento}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Botão Pesquisar */}
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handlePesquisar}
          >
            <Text style={styles.searchButtonText}>PESQUISAR</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignSelf: "center",
    ...Platform.select({
      web: {
        maxWidth: 720,
      },
    }),
    backgroundColor: AppColors.background.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  illustrationContainer: {
    width: '100%',
    height: 300,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    left: '15%',
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: AppColors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.gray[200],
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    gap: 12,
    minHeight: 100,
  },
  inputIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: AppColors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  inputContent: {
    flex: 1,
    gap: 7,
  },
  inputLabel: {
    color: AppColors.text.primary,
    fontFamily: Fonts.medium,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1,
  },
  input: {
    color: AppColors.gray[400],
    fontFamily: Fonts.regular,
    fontSize: 11,
    letterSpacing: 1,
    padding: 0,
  },
  searchButton: {
    backgroundColor: AppColors.secondary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    alignSelf: 'center',
    minWidth: 128,
  },
  searchButtonText: {
    color: AppColors.white,
    fontFamily: Fonts.regular,
    fontSize: 15,
    letterSpacing: 1,
    textAlign: 'center',
  },
});
