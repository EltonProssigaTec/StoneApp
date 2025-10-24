import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppColors, Fonts } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { StyleProp, ViewStyle } from 'react-native';

export interface AppHeaderProps {
  /** Title to display in the header */
  title: string;
  /** Used to override the default root style */
  style?: StyleProp<ViewStyle>;
  /** Show back button (default: true) */
  showBack?: boolean;
  /** Show menu button (default: true) */
  showMenu?: boolean;
  /** Custom back button handler */
  onBackPress?: () => void;
  /** Custom menu button handler */
  onMenuPress?: () => void;
  /** Used to locate this view in end-to-end tests */
  testID?: string;
}

export function AppHeader({
  title,
  style,
  showBack = true,
  showMenu = true,
  onBackPress,
  onMenuPress,
  testID = 'app-header',
}: AppHeaderProps) {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const handleMenuPress = () => {
    if (onMenuPress) {
      onMenuPress();
    }
  };

  return (
    <View testID={testID} style={[styles.root, style]}>
      <LinearGradient
        colors={['#0195D8', '#0164AE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Back Button */}
          <View style={styles.leftContainer}>
            {showBack ? (
              <TouchableOpacity
                onPress={handleBackPress}
                style={styles.iconButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <IconSymbol name="chevron.left" size={24} color={AppColors.white} />
              </TouchableOpacity>
            ) : (
              <View style={styles.iconButton} />
            )}
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>

          {/* Menu Button */}
          <View style={styles.rightContainer}>
            {showMenu ? (
              <TouchableOpacity
                onPress={handleMenuPress}
                style={styles.iconButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <IconSymbol name="ellipsis" size={24} color={AppColors.white} />
              </TouchableOpacity>
            ) : (
              <View style={styles.iconButton} />
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  gradient: {
    width: '100%',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    paddingTop: 20
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    minHeight: 64,
  },
  leftContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: AppColors.white,
    textAlign: 'center',
    fontFamily: Fonts.regular,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
