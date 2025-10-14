import { AppColors, Fonts } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '../ui/icon-symbol';

import type { StyleProp, ViewStyle } from 'react-native';

export interface DebtCardProps {
    /** Used to override the default root style. */
    style?: StyleProp<ViewStyle>;
    /** Used to locate this view in end-to-end tests. */
    testID?: string;
    /** Valor total das dívidas */
    amount: number;
    /** Data de atualização */
    updatedAt: string;
    /** Título do card (padrão: "MINHAS DÍVIDAS") */
    title?: string;
    /** Define se o valor é exibido inicialmente (padrão: true) */
    defaultShowAmount?: boolean;
    /** Cores do gradiente (padrão: ['#0164AE', '#0195D8']) */
    gradientColors?: string[];
}

export function DebtCard(props: DebtCardProps) {
    const {
        amount,
        updatedAt,
        title = 'MINHAS DÍVIDAS',
        defaultShowAmount = true,
        gradientColors = ['#0164AE', '#0195D8'],
        style,
        testID,
    } = props;

    const [showAmount, setShowAmount] = React.useState(defaultShowAmount);

    return (
        <View testID={testID} style={[styles.card, style]}>
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.rectangle}
            />
            <View style={styles.cardHeader}>
                <Text style={styles.title}>{title}</Text>
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
            <Text style={styles.updatedAt}>
                Atualizado em {updatedAt}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginTop: 30,
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
    rectangle: {
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
    title: {
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
    updatedAt: {
        color: AppColors.white,
        fontSize: 11,
        fontFamily: Fonts.regular,
        letterSpacing: 0,
        opacity: 0.8,
    },
});
