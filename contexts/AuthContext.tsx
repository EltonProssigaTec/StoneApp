/**
 * Context de Autenticação
 * Baseado em: monitora_mobile/src/contexts/auth.js
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api.config';

interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  // Adicione outros campos conforme necessário
}

interface AuthContextData {
  isLogged: boolean;
  loading: boolean;
  user: User | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateUser: (newData: Partial<User>) => Promise<void>;
  setUser: (user: User | null) => void;
  // Preferências de notificação
  notificar: boolean;
  setNotificar: (value: boolean) => void;
  notificar_sms: boolean;
  setNotificarSMS: (value: boolean) => void;
  notificar_email: boolean;
  setNotificarEmail: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Preferências de notificação
  const [notificar, setNotificar] = useState(false);
  const [notificar_sms, setNotificarSMS] = useState(false);
  const [notificar_email, setNotificarEmail] = useState(false);

  /**
   * Login do usuário
   */
  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('[Auth] Iniciando login...');

      // IMPORTANTE: Remover token antigo antes de fazer login
      // Isso evita que o backend tente validar um token expirado/inválido
      delete api.defaults.headers.common['Authorization'];

      // Fazer requisição diretamente sem usar o interceptor
      const response = await api.post('/login_monitora', { email, password }, {
        validateStatus: (status) => status < 500, // Aceitar qualquer status < 500
      });

      console.log('[Auth] Status da resposta:', response.status);
      console.log('[Auth] Dados da resposta:', JSON.stringify(response.data, null, 2));

      // Verifica se é um erro de SQL do backend (mas o login pode ter funcionado)
      const hasException = response.data?.exception || response.data?.message?.includes('SQLSTATE');

      if (hasException) {
        console.warn('[Auth] Backend retornou erro mas vou tentar extrair dados do login...');
        // O backend tem um bug que retorna erro depois do login bem-sucedido
        // Mas não retorna os dados do usuário nesta resposta
        // Vamos tentar fazer login sem validação do middleware
        alert('Login efetuado mas o sistema apresentou um erro técnico. Por favor, tente novamente.');
        return false;
      }

      // Verifica diferentes estruturas de resposta possíveis
      let user = null;
      let token = null;

      if (response.data?.dados) {
        // Estrutura: { dados: { user, access_token } }
        user = response.data.dados.user;
        token = response.data.dados.access_token;
      } else if (response.data?.user && response.data?.access_token) {
        // Estrutura: { user, access_token }
        user = response.data.user;
        token = response.data.access_token;
      } else if (response.data?.data) {
        // Estrutura: { data: { user, access_token } }
        user = response.data.data.user;
        token = response.data.data.access_token;
      }

      if (!user || !token) {
        console.error('[Auth] Estrutura de resposta inválida');
        console.error('[Auth] Resposta completa:', response.data);
        alert('Email ou senha incorretos');
        return false;
      }

      console.log('[Auth] Token recebido:', token.substring(0, 20) + '...');

      // Configura token no header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Salva no AsyncStorage
      await AsyncStorage.multiSet([
        ['@Auth:user', JSON.stringify(user)],
        ['@Auth:token', token],
      ]);

      setUser(user);
      console.log('[Auth] Login concluído com sucesso!');
      return true;
    } catch (err: any) {
      console.error('[Auth] Erro ao fazer login:', err.message);
      console.error('[Auth] Detalhes:', err.response?.data);

      const message = err?.response?.data?.message ?? 'Falha ao entrar. Verifique suas credenciais.';
      alert(message);

      return false;
    }
  };

  /**
   * Logout do usuário
   */
  const signOut = async (): Promise<void> => {
    setLoading(true);
    await AsyncStorage.clear();
    api.defaults.headers.common['Authorization'] = '';
    setUser(null);
    setLoading(false);
  };

  /**
   * Atualiza dados do usuário
   */
  const updateUser = async (newData: Partial<User>): Promise<void> => {
    setUser((prev) => {
      const merged = prev ? { ...prev, ...newData } : ({ ...newData } as User);
      AsyncStorage.setItem('@Auth:user', JSON.stringify(merged));
      return merged;
    });
  };

  /**
   * Verifica se há sessão ativa
   */
  const verifyIsLogged = useCallback(async () => {
    try {
      const [storedUser, storedToken] = await AsyncStorage.multiGet([
        '@Auth:user',
        '@Auth:token',
      ]);

      if (storedUser[1] && storedToken[1]) {
        // Nota: Não configurar o token aqui automaticamente
        // porque pode causar erro se o token for inválido
        // O token será configurado apenas após um login bem-sucedido
        console.log('[Auth] Sessão encontrada, mas não configurando token automaticamente');
        // api.defaults.headers.common['Authorization'] = `Bearer ${storedToken[1]}`;
        // setUser(JSON.parse(storedUser[1]));
      }
    } catch (error) {
      console.error('[Auth] Erro ao verificar sessão:', error);
      // Limpar dados corrompidos
      await AsyncStorage.clear();
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    verifyIsLogged();
  }, [verifyIsLogged]);

  const value = useMemo(
    () => ({
      isLogged: !!user,
      loading,
      user,
      signIn,
      signOut,
      updateUser,
      setUser,
      // Preferências
      notificar,
      setNotificar,
      notificar_sms,
      setNotificarSMS,
      notificar_email,
      setNotificarEmail,
    }),
    [user, loading, notificar, notificar_sms, notificar_email]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};