import { AppColors, Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { settings } from '@/services/api.config';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from './ui/icon-symbol';

import type { StyleProp, ViewStyle } from 'react-native';
import { DebtCard } from './cards/DebtCardEye';

// Helper para obter avatar padrão da API
const getDefaultAvatar = (userName?: string) => {
    if (userName) {
        // Gera avatar baseado no nome do usuário
        return `https://avatar.iran.liara.run/username?username=${encodeURIComponent(userName)}`;
    }
    // Avatar público aleatório
    return 'https://avatar.iran.liara.run/public';
};

export interface SectionProps {
    /** Used to override the default root style. */
    style?: StyleProp<ViewStyle>;
    /** Used to locate this view in end-to-end tests. */
    testID?: string;
    /** Valor total das dívidas */
    amount?: number;
    /** Data de atualização */
    updatedAt?: string;
    /** Callback para abrir menu */
    onMenuPress?: () => void;
}

export function Section(props: SectionProps) {
    const { amount = 2500.00, updatedAt = '02/09/2025', onMenuPress } = props;
    const { user } = useAuth();
    const router = useRouter();
    const [showAmount, setShowAmount] = React.useState(true);
    const insets = useSafeAreaInsets();

    // Pega o primeiro nome do usuário
    const firstName = user?.name?.split(' ')[0] || 'Usuário';

    // Define saudação baseada na hora
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 12 && hour < 18) return 'Boa tarde';
        if (hour >= 18 || hour < 6) return 'Boa noite';
        return 'Bom dia';
    };

    // Função para gerar URL da foto com cache-busting (sincroniza com mudanças no user.picture)
    const getPhotoUri = React.useMemo(() => {
        if (!user?.picture) {
            return getDefaultAvatar(user?.name);
        }

        // Se for URL completa (http/https) ou arquivo local
        if (user.picture.startsWith('http') || user.picture.startsWith('file')) {
            return user.picture;
        }

        // Se for nome de arquivo do servidor, adicionar timestamp para cache-busting
        const timestamp = user.picture ? new Date().getTime() : 0;
        return `${settings.FILES_URL}${user.picture}?t=${timestamp}`;
    }, [user?.picture, user?.name]);

    return (
        <View testID={props.testID ?? "312:432"} style={[styles.root, props.style]}>
            <LinearGradient
                colors={['#0195D8', '#0164AE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.rectangle, { paddingTop: insets.top + 16 }]}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={onMenuPress} activeOpacity={0.7}>
                        <IconSymbol name="line.3.horizontal" size={28} color={AppColors.white} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.avatarContainer}
                        onPress={() => router.push('/perfil')}
                        activeOpacity={0.7}
                    >
                        <Image
                            source={{ uri: getPhotoUri }}
                            style={styles.avatar}
                            key={user?.picture || 'default'}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeText}>{getGreeting()}, {firstName}!</Text>
                    <Text style={styles.planText}>{user?.plano || 'Plano Gratuito'}</Text>
                </View>
                <DebtCard amount={amount} updatedAt={updatedAt}></DebtCard>
                {/* <View style={styles.card}>
                    <LinearGradient
                        colors={['#0164AE', '#0195D8']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.rectangle2}
                    />
                    <View style={styles.cardHeader}>
                        <Text style={styles.myBalance}>MINHAS DÍVIDAS</Text>
                    </View>
                    <View style={styles.amountRow}>
                        <Text style={styles.amount}>
                            {showAmount ? `R$ ${amount.toFixed(2).replace('.', ',')}` : 'R$ •••••'}
                        </Text>
                        <TouchableOpacity
                            style={styles.eyeButton}
                            activeOpacity={0.7}
                            onPress={() => setShowAmount(!showAmount)}
                        >
                            <IconSymbol
                                name={showAmount ? "eye.fill" : "eye.slash"}
                                size={30}
                                color={AppColors.white}
                            />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.expOnSep172023}>
                        Atualizado em {updatedAt}
                    </Text>
                </View>  */}
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        width: '100%',
        minHeight: 265,
    },
    rectangle: {
        width: '100%',
        minHeight: "auto",
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: AppColors.primary,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        ...Platform.select({
            web: {
                maxWidth: 720,
                marginHorizontal: 'auto',
            },
        }),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    avatarContainer: {
        width: 43,
        height: 43,
        borderRadius: 22,
        overflow: 'hidden',
        backgroundColor: AppColors.white,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 22,
    },
    welcomeSection: {
        paddingHorizontal: 0,
    },
    welcomeText: {
        fontSize: 24,
        fontFamily: Fonts.semiBold,
        color: AppColors.white,
        letterSpacing: 0,
    },
    planText: {
        fontSize: 16,
        fontFamily: Fonts.medium,
        color: AppColors.white,
        letterSpacing: 0,
        opacity: 0.8,
    },
    card: {
        marginTop: 16,
        paddingVertical: 21,
        paddingHorizontal: 14,
        borderRadius: 19,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 5,
        ...Platform.select({
            web: {
                marginHorizontal: 'auto',
                width: "100%",
            },
        }),
    },
    rectangle2: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 19,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    myBalance: {
        color: AppColors.white,
        fontSize: 12,
        fontFamily: Fonts.semiBold,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        opacity: 0.9,
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    eyeButton: {
        padding: 4,
    },
    amount: {
        color: AppColors.white,
        fontSize: 32,
        fontFamily: Fonts.medium,
        letterSpacing: 0,
    },
    expOnSep172023: {
        color: AppColors.white,
        fontSize: 11,
        fontFamily: Fonts.regular,
        letterSpacing: 0,
        opacity: 0.8,
    },
});
