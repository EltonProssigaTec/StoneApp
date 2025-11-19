import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { settings } from '@/services/api.config';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from './icon-symbol';

// Helper para obter avatar padrão da API
const getDefaultAvatar = (userName?: string) => {
  if (userName) {
    // Gera avatar baseado no nome do usuário
    return `https://avatar.iran.liara.run/username?username=${encodeURIComponent(userName)}`;
  }
  // Avatar público aleatório
  return 'https://avatar.iran.liara.run/public';
};

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  showMenu?: boolean;
  showAvatar?: boolean;
  showGreeting?: boolean;
  subtitle?: string;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  rightAction?: React.ReactNode;
}

export function ScreenHeader({
  title,
  showBack = false,
  showMenu = false,
  showAvatar = false,
  showGreeting = false,
  subtitle,
  onBackPress,
  onMenuPress,
  rightAction,
}: ScreenHeaderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Resetar loading quando a foto do usuário mudar
  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
  }, [user?.picture]);

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  // Callbacks estáveis para evitar re-renders
  const handleImageLoadStart = useCallback(() => {
    setImageLoading(true);
    setImageError(false);
  }, []);

  const handleImageLoadEnd = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoading(false);
    setImageError(true);
  }, []);

  // Pega o primeiro nome do usuário
  const firstName = user?.name?.split(' ')[0] || 'Usuário';

  // Define saudação baseada na hora
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    if (hour >= 18 || hour < 6) return 'Boa noite';
    return 'Bom dia';
  };

  return (
    <LinearGradient
      colors={['#0195D8', '#0164AE']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      {/* Left Action */}
      <View style={styles.leftAction}>
        {showBack && (
          <TouchableOpacity onPress={handleBackPress} style={styles.iconButton}>
            <IconSymbol name="chevron.left" size={24} color={AppColors.white} />
          </TouchableOpacity>
        )}
        {showMenu && (
          <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
            <IconSymbol name="line.3.horizontal" size={28} color={AppColors.white} />
          </TouchableOpacity>
        )}
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        {showGreeting ? (
          <>
            <Text style={styles.greeting}>{getGreeting()}, {firstName}!</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </>
        ) : (
          <Text style={styles.title}>{title}</Text>
        )}
      </View>

      {/* Right Action */}
      <View style={styles.rightAction}>
        {rightAction ? (
          rightAction
        ) : showAvatar ? (
          <TouchableOpacity style={styles.avatar}>
            {/* Loading Indicator */}
            {imageLoading && !imageError && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={AppColors.white} />
              </View>
            )}

            {/* Avatar Image */}
            <Image
              source={{
                uri: user?.picture
                  ? (user.picture.startsWith('http') || user.picture.startsWith('file')
                    ? user.picture
                    : settings.FILES_URL + user.picture)
                  : getDefaultAvatar(user?.name)
              }}
              style={[styles.avatarImage, imageLoading && styles.hiddenImage]}
              onLoadStart={handleImageLoadStart}
              onLoadEnd={handleImageLoadEnd}
              onError={handleImageError}
            />

            {/* Fallback Icon se houver erro */}
            {imageError && (
              <View style={styles.errorContainer}>
                <IconSymbol name="person.fill" size={20} color={AppColors.white} />
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftAction: {
    width: 44,
  },
  rightAction: {
    width: 44,
    alignItems: 'flex-end',
  },
  iconButton: {
    padding: 4,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.white,
    textAlign: 'center',
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.white,
    opacity: 0.9,
    marginTop: 4,
    textAlign: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  hiddenImage: {
    opacity: 0,
  },
  loadingContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.secondary,
    zIndex: 1,
  },
  errorContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.secondary,
    zIndex: 1,
  },
  placeholder: {
    width: 24,
  },
});
