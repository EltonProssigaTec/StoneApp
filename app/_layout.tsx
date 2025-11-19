import { applyGlobalFontStyles } from '@/constants/global-styles';
import { AuthProvider } from '@/contexts/AuthContext';
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold, useFonts } from '@expo-google-fonts/montserrat';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'splash',
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      // Aplicar fonte Montserrat globalmente em todo o app
      applyGlobalFontStyles();
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    // Configurar StatusBar para Android
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setBarStyle('dark-content');
      StatusBar.setTranslucent(true);
    } else if (Platform.OS === 'ios') {
      // Configurar StatusBar para iOS
      StatusBar.setBarStyle('dark-content');
    }
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider value={DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ gestureEnabled: false }} />
            <Stack.Screen name="splash" options={{ gestureEnabled: false }} />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="recover" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="pendencias" />
            <Stack.Screen name="ofertas" />
            <Stack.Screen name="planos" />
            <Stack.Screen name="chat" options={{ presentation: 'modal' }} />
            <Stack.Screen name="my-cpf" />
            <Stack.Screen name="acordos" />
            <Stack.Screen name="gerar-acordos" />
            <Stack.Screen name="configuracoes" />
            <Stack.Screen name="perfil" />
            <Stack.Screen name="change-password" />
            <Stack.Screen name="termos-uso" />
            <Stack.Screen name="sobre" />
          </Stack>
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
