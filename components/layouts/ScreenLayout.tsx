import React from 'react';
import { View, StyleSheet, ScrollView, Platform, ViewStyle } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { AppColors } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

interface ScreenLayoutProps {
  children: React.ReactNode;
  headerTitle?: string;
  showHeader?: boolean;
  showBack?: boolean;
  showMenu?: boolean;
  showAvatar?: boolean;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  headerRightAction?: React.ReactNode;
  scrollable?: boolean;
  backgroundColor?: string;
  contentStyle?: ViewStyle;
}

export function ScreenLayout({
  children,
  headerTitle,
  showHeader = true,
  showBack = false,
  showMenu = false,
  showAvatar = false,
  onBackPress,
  onMenuPress,
  headerRightAction,
  scrollable = true,
  backgroundColor = AppColors.background.secondary,
  contentStyle,
}: ScreenLayoutProps) {
  // Gesture de swipe da esquerda para direita para abrir menu
  const swipeGesture = Gesture.Pan()
    .activeOffsetX([10, 999999]) // Só ativa quando deslizar para direita
    .failOffsetX([-999999, -10]) // Falha se deslizar para esquerda
    .onBegin((event) => {
      console.log('[Swipe] onBegin', { x: event.x, absoluteX: event.absoluteX });
    })
    .onStart((event) => {
      console.log('[Swipe] onStart', { x: event.x, absoluteX: event.absoluteX });
      // Só ativa se começar da borda esquerda (primeiros 80px)
      if (event.absoluteX < 80 && onMenuPress) {
        console.log('[Swipe] Abrindo menu pela borda');
        onMenuPress();
      }
    })
    .onUpdate((event) => {
      console.log('[Swipe] onUpdate', { translationX: event.translationX });
    })
    .onEnd((event) => {
      console.log('[Swipe] onEnd', { translationX: event.translationX });
      // Ou se deslizar mais de 100px para direita
      if (event.translationX > 100 && onMenuPress) {
        console.log('[Swipe] Abrindo menu por translationX');
        onMenuPress();
      }
    });

  const content = (
    <View style={styles.wrapper}>
      <View style={[styles.container, { backgroundColor }]}>
        {showHeader && headerTitle && (
          <ScreenHeader
            title={headerTitle}
            showBack={showBack}
            showMenu={showMenu}
            showAvatar={showAvatar}
            onBackPress={onBackPress}
            onMenuPress={onMenuPress}
            rightAction={headerRightAction}
          />
        )}

        {scrollable ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.scrollContent, contentStyle]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.responsiveContent}>
              {children}
            </View>
          </ScrollView>
        ) : (
          <View style={[styles.content, contentStyle]}>
            <View style={styles.responsiveContent}>
              {children}
            </View>
          </View>
        )}
      </View>
    </View>
  );

  // Se tem menu, envolve com gesture detector
  if (showMenu && onMenuPress) {
    return <GestureDetector gesture={swipeGesture}>{content}</GestureDetector>;
  }

  return content;
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    ...Platform.select({
      web: {
        justifyContent: 'center',
        alignItems: 'center',
      },
    }),
  },
  container: {
    flex: 1,
    width: '100%',
    ...Platform.select({
      web: {
        maxWidth: 720,
      },
    }),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
  responsiveContent: {
    flex: 1,
  },
});
