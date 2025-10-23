import { Fonts } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { StyleProp, ViewStyle } from 'react-native';

export interface PropagandaDeOfertaProps {
  /** Used to override the default root style. */
  style?: StyleProp<ViewStyle>;
  /** Used to locate this view in end-to-end tests. */
  testID?: string;
}

export function PropagandaDeOferta(props: PropagandaDeOfertaProps) {
  return (
    <TouchableOpacity testID={props.testID ?? '301:321'} style={[styles.root, props.style]} activeOpacity={0.8}>
      <LinearGradient
        colors={['#0195D8', '#0164AE', '#0898D9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0.17, 0.5, 0.85]}
        style={styles.card}
      >
        {/* Imagem Bemol à esquerda */}
        <Image
          source={require('@/assets/images/Bemol.png')}
          style={styles.empresaImage}
          resizeMode="contain"
        />

        {/* Texto */}
        <View style={styles.textContainer}>
          <Text style={styles.text}>
            Aproveite nossas ofertas e limpe já o seu nome!
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    height: 123.497,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 21,
    overflow: 'hidden',
  },
  empresaImage: {
    width: 108,
    height: 108,
    borderRadius: 14,
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 26,
  },
  text: {
    color: 'rgba(255, 255, 255, 1)',
    fontFamily: Fonts.medium,
    fontSize: 15,
    letterSpacing: 1,
    opacity: 0.7,
    lineHeight: 22,
  },
});
