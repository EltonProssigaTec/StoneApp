import { AppColors, Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const { signOut } = useAuth();
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
    { icon: 'arrow.right.square.fill', title: 'Sair', route: 'LOGOUT', color: AppColors.primary },
  ];

  useEffect(() => {
    if (visible) {
      // Reset e animar entrada (da esquerda para direita)
      slideAnim.setValue(-MENU_WIDTH);
      fadeAnim.setValue(0);

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
  }, [visible, slideAnim, fadeAnim]);

  const handleNavigate = async (route: string) => {
    onClose();

    // Tratar logout de forma especial
    if (route === 'LOGOUT') {
      await signOut();
      router.replace('/login');
      return;
    }

    router.push(route as any);
  };

  // Gesture para fechar arrastando para a esquerda
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) // Mais sensível para detectar gestos
    .failOffsetY([-10, 10]) // Falha se mover muito verticalmente
    .onUpdate((event) => {
      // Só permite arrastar para a esquerda (valores negativos)
      if (event.translationX < 0) {
        slideAnim.setValue(Math.max(event.translationX, -MENU_WIDTH));
        // Atualiza o fade proporcionalmente
        const progress = Math.max(0, 1 + (event.translationX / MENU_WIDTH));
        fadeAnim.setValue(progress);
      }
    })
    .onEnd((event) => {
      // Se arrastou mais de 30% da largura ou velocidade rápida, fecha o menu
      if (event.translationX < -MENU_WIDTH * 0.3 || event.velocityX < -500) {
        onClose();
      } else {
        // Senão, volta para posição aberta
        Animated.parallel([
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            damping: 20,
            stiffness: 90,
          }),
          Animated.spring(fadeAnim, {
            toValue: 1,
            useNativeDriver: true,
            damping: 20,
            stiffness: 90,
          }),
        ]).start();
      }
    });

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <>
        <View style={styles.overlay}>
          {/* Backdrop atrás */}
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={onClose}
              activeOpacity={1}
            />
          </Animated.View>

        {/* Menu na frente */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.menuContainer,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'bottom']}>
              {/* Header */}
              <View style={styles.header}>
                <Image
                  source={require('@/assets/images/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

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
            </SafeAreaView>
          </Animated.View>
        </GestureDetector>
        </View>
      </>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: MENU_WIDTH,
    height: '100%',
    backgroundColor: AppColors.background.secondary,
    ...Platform.select({
      android: {
        marginTop: 35,
      },
    }),
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    zIndex: 2,
  },
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 140,
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
