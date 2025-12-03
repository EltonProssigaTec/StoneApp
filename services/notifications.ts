/**
 * Serviço de Notificações
 * Gerencia notificações de assinatura, pendências e eventos do sistema
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Notification {
  id: string;
  type: 'subscription' | 'payment' | 'pending' | 'alert' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  icon?: string;
}

class NotificationService {
  private readonly STORAGE_KEY = '@Notifications:data';

  /**
   * Busca todas as notificações
   */
  async getNotifications(): Promise<Notification[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!data) return this.getDefaultNotifications();

      const notifications: Notification[] = JSON.parse(data);
      return notifications.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      if (__DEV__) console.error('[Notifications] Erro ao buscar notificações:', error);
      return this.getDefaultNotifications();
    }
  }

  /**
   * Busca notificações não lidas
   */
  async getUnreadNotifications(): Promise<Notification[]> {
    const notifications = await this.getNotifications();
    return notifications.filter(n => !n.read);
  }

  /**
   * Conta notificações não lidas
   */
  async getUnreadCount(): Promise<number> {
    const unread = await this.getUnreadNotifications();
    return unread.length;
  }

  /**
   * Marca uma notificação como lida
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const updated = notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      if (__DEV__) console.error('[Notifications] Erro ao marcar como lida:', error);
    }
  }

  /**
   * Marca todas como lidas
   */
  async markAllAsRead(): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const updated = notifications.map(n => ({ ...n, read: true }));
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      if (__DEV__) console.error('[Notifications] Erro ao marcar todas como lidas:', error);
    }
  }

  /**
   * Adiciona uma nova notificação
   */
  async addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
      };
      notifications.unshift(newNotification);

      // Mantém apenas as 50 últimas notificações
      const limited = notifications.slice(0, 50);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(limited));
    } catch (error) {
      if (__DEV__) console.error('[Notifications] Erro ao adicionar notificação:', error);
    }
  }

  /**
   * Remove uma notificação
   */
  async removeNotification(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const filtered = notifications.filter(n => n.id !== notificationId);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      if (__DEV__) console.error('[Notifications] Erro ao remover notificação:', error);
    }
  }

  /**
   * Limpa todas as notificações
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      if (__DEV__) console.error('[Notifications] Erro ao limpar notificações:', error);
    }
  }

  /**
   * Formata a data/hora relativa
   */
  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  /**
   * Retorna ícone por tipo
   */
  getIconByType(type: Notification['type']): string {
    switch (type) {
      case 'subscription':
        return '📋';
      case 'payment':
        return '💳';
      case 'pending':
        return '⚠️';
      case 'alert':
        return '🔔';
      case 'success':
        return '✅';
      default:
        return '📬';
    }
  }

  /**
   * Notificações padrão de exemplo
   */
  private getDefaultNotifications(): Notification[] {
    return [
      {
        id: '1',
        type: 'success',
        title: 'Bem-vindo ao Monitora!',
        message: 'Agora você pode consultar pendências e monitorar sua situação financeira.',
        timestamp: new Date().toISOString(),
        read: false,
        icon: '👋',
      },
      {
        id: '2',
        type: 'subscription',
        title: 'Conheça nossos planos',
        message: 'Assine um plano premium e tenha acesso ilimitado a consultas.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
        actionUrl: '/planos',
        icon: '⭐',
      },
    ];
  }

  /**
   * Notifica sobre nova assinatura
   */
  async notifySubscriptionCreated(planName: string): Promise<void> {
    await this.addNotification({
      type: 'success',
      title: 'Assinatura Ativada! 🎉',
      message: `Seu plano ${planName} está ativo. Aproveite todos os benefícios!`,
      actionUrl: '/minha-assinatura',
    });
  }

  /**
   * Notifica sobre renovação próxima
   */
  async notifySubscriptionRenewal(planName: string, daysLeft: number): Promise<void> {
    await this.addNotification({
      type: 'subscription',
      title: 'Renovação Próxima',
      message: `Seu plano ${planName} será renovado em ${daysLeft} dias.`,
      actionUrl: '/minha-assinatura',
    });
  }

  /**
   * Notifica sobre assinatura expirada
   */
  async notifySubscriptionExpired(planName: string): Promise<void> {
    await this.addNotification({
      type: 'alert',
      title: 'Assinatura Expirada',
      message: `Seu plano ${planName} expirou. Renove para continuar com os benefícios.`,
      actionUrl: '/planos',
    });
  }

  /**
   * Notifica sobre nova pendência encontrada
   */
  async notifyNewPending(count: number): Promise<void> {
    await this.addNotification({
      type: 'pending',
      title: 'Novas Pendências Encontradas',
      message: `Encontramos ${count} nova${count > 1 ? 's' : ''} pendência${count > 1 ? 's' : ''} em seu CPF/CNPJ.`,
      actionUrl: '/(tabs)/home',
    });
  }

  /**
   * Notifica sobre pagamento confirmado
   */
  async notifyPaymentConfirmed(amount: number): Promise<void> {
    await this.addNotification({
      type: 'payment',
      title: 'Pagamento Confirmado',
      message: `Pagamento de R$ ${amount.toFixed(2)} foi confirmado com sucesso.`,
    });
  }
}

export default new NotificationService();
