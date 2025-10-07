import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors } from '@/constants/theme';
import { IconSymbol } from './icon-symbol';

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  showMenu?: boolean;
  showAvatar?: boolean;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  rightAction?: React.ReactNode;
}

export function ScreenHeader({
  title,
  showBack = false,
  showMenu = false,
  showAvatar = false,
  onBackPress,
  onMenuPress,
  rightAction,
}: ScreenHeaderProps) {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
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
      <Text style={styles.title}>{title}</Text>

      {/* Right Action */}
      <View style={styles.rightAction}>
        {rightAction ? (
          rightAction
        ) : showAvatar ? (
          <TouchableOpacity style={styles.avatar}>
            <IconSymbol name="person.fill" size={24} color={AppColors.white} />
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.white,
    textAlign: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 24,
  },
});
