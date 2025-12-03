/**
 * Tela de Notificações
 * Exibe todas as notificações do sistema
 */

import { AppHeader } from '@/components';
import { Button } from '@/components/ui/Button';
import { AppColors } from '@/constants/theme';
import notificationService, { Notification } from '@/services/notifications';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificacoesScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    const data = await notificationService.getNotifications();
    setNotifications(data);
    setLoading(false);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, []);

  const handleNotificationPress = async (notification: Notification) => {
    // Marca como lida
    await notificationService.markAsRead(notification.id);
    setNotifications(prev =>
      prev.map(n => (n.id === notification.id ? { ...n, read: true } : n))
    );

    // Navega se tiver URL
    if (notification.actionUrl) {
      router.push(notification.actionUrl as any);
    }
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleRemoveNotification = async (notificationId: string) => {
    await notificationService.removeNotification(notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const icon = item.icon || notificationService.getIconByType(item.type);
    const bgColor = item.read
      ? AppColors.background.primary
      : AppColors.background.secondary;

    return (
      <TouchableOpacity
        style={[styles.notificationCard, { backgroundColor: bgColor }]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationIcon}>{icon}</Text>
            <View style={styles.notificationTexts}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationMessage}>{item.message}</Text>
              <Text style={styles.notificationTime}>
                {notificationService.formatTimestamp(item.timestamp)}
              </Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
        </View>

        {/* Botão de remover */}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveNotification(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.removeButtonText}>×</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
      <Text style={styles.emptyMessage}>
        Você não tem notificações no momento
      </Text>
    </View>
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <View style={styles.wrapper}>
        <SafeAreaView style={styles.container} edges={['bottom']}>
          <AppHeader title="Notificações" />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={AppColors.primary} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <StatusBar barStyle="light-content" translucent={true} />

        <AppHeader title="Notificações" />

        {/* Header com contador e ação */}
        {notifications.length > 0 && (
          <View style={styles.headerActions}>
            <Text style={styles.unreadCount}>
              {unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? 's' : ''}` : 'Tudo lido'}
            </Text>
            {unreadCount > 0 && (
              <Button
                title="Marcar todas como lidas"
                variant="outline"
                compact
                onPress={handleMarkAllAsRead}
              />
            )}
          </View>
        )}

        {/* Lista de Notificações */}
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={AppColors.primary}
              colors={[AppColors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
    backgroundColor: AppColors.background.secondary,
  },
  container: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    ...Platform.select({
      web: {
        maxWidth: 720,
      },
    }),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  unreadCount: {
    fontSize: 14,
    color: AppColors.text.secondary,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  notificationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: AppColors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  notificationTexts: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: AppColors.text.secondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: AppColors.text.tertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.primary,
    marginLeft: 8,
    marginTop: 6,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeButtonText: {
    fontSize: 24,
    color: AppColors.text.tertiary,
    lineHeight: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: AppColors.text.secondary,
    textAlign: 'center',
  },
});
