import { AppColors, Fonts } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { IconSymbol } from './icon-symbol';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MENU_WIDTH =
  Platform.OS === 'web'
    ? (SCREEN_WIDTH > 720 ? SCREEN_WIDTH * 0.5 : SCREEN_WIDTH * 0.8) // 40vw se for web
    : SCREEN_WIDTH * 0.8; // 80% se for mobile

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
}

export function SideMenu({ visible, onClose }: SideMenuProps) {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const menuItems = [
    { icon: 'person.fill', title: 'Meu perfil', route: '/perfil', color: AppColors.primary },
    { icon: 'lock.fill', title: 'Minha senha', route: '/configuracoes', color: AppColors.primary },
    { icon: 'bell.fill', title: 'Notificações', route: '/(tabs)/notificacoes', color: AppColors.primary },
    { icon: 'exclamationmark.triangle.fill', title: 'Minhas pendências', route: '/pendencias', color: AppColors.primary },
    { icon: 'wallet.pass.fill', title: 'Meus boletos', route: '/acordos', color: AppColors.primary },
    { icon: 'chart.line.uptrend.xyaxis', title: 'Saúde financeira', route: '/(tabs)/saude-financeira', color: AppColors.primary },
    { icon: 'info.circle.fill', title: 'Ajuda', route: '/chat', color: AppColors.primary },
    { icon: 'arrow.right.square.fill', title: 'Sair', route: '/login', color: AppColors.primary },
  ];

  useEffect(() => {
    if (visible) {
      // Animar entrada (da esquerda para direita)
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animar saída (da direita para esquerda)
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -MENU_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleNavigate = (route: string) => {
    onClose();
    router.push(route as any);
  };

  // Gesture para fechar arrastando para a esquerda
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 999999]) // Ativa em qualquer direção
    .onBegin(() => {
      console.log('[SideMenu] Pan gesture begin');
    })
    .onUpdate((event) => {
      console.log('[SideMenu] Pan update', { translationX: event.translationX });
      // Só permite arrastar para a esquerda (valores negativos)
      if (event.translationX < 0) {
        slideAnim.setValue(Math.max(event.translationX, -MENU_WIDTH));
      }
    })
    .onEnd((event) => {
      console.log('[SideMenu] Pan end', { translationX: event.translationX, velocityX: event.velocityX });
      // Se arrastou mais de 50px ou velocidade rápida, fecha o menu
      if (event.translationX < -50 || event.velocityX < -500) {
        console.log('[SideMenu] Fechando menu');
        onClose();
      } else {
        console.log('[SideMenu] Voltando para posição aberta');
        // Senão, volta para posição aberta
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.menuContainer,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            {/* Header with Gradient */}
            {/* <LinearGradient
              colors={['#0195D8', '#0164AE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.header}
            > */}
            <View style={styles.header}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            {/* <TouchableOpacity style={styles.avatarContainer}>
                <IconSymbol name="person.fill" size={32} color={AppColors.white} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.eyeButton}>
                <IconSymbol name="eye.fill" size={24} color={AppColors.white} />
              </TouchableOpacity> */}
            {/* </LinearGradient> */}

            {/* Menu Items */}
            <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
              {menuItems.map((item, index) => (
                <Pressable
                  key={index}
                  style={styles.menuItem}
                  onPress={() => handleNavigate(item.route)}
                >
                  {({ pressed }) => (
                    <>
                      <View style={[
                        styles.iconContainer,
                        { backgroundColor: pressed ? '#FFF3E0' : '#E3F2FD' }
                      ]}>
                        <IconSymbol name={item.icon as any} size={20} color={pressed ? AppColors.secondary : item.color} />
                      </View>
                      <Text style={[styles.menuItemText, pressed && { color: AppColors.secondary }]}>{item.title}</Text>
                    </>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        </GestureDetector>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={onClose}
            activeOpacity={1}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  menuContainer: {
    width: MENU_WIDTH,
    height: '100%',
    backgroundColor: AppColors.white,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  header: {
    paddingTop: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 150,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  eyeButton: {
    padding: 8,
  },
  menuList: {
    flex: 1,
    paddingVertical: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: AppColors.primary,
  },
});
