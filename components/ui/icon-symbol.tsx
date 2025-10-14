// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Navigation
  'house.fill': 'home',
  'chevron.left': 'chevron-left',
  'chevron.right': 'chevron-right',
  'chevron.left.forwardslash.chevron.right': 'code',
  'arrow.right.square.fill': 'exit-to-app',
  'arrow.up.circle.fill': 'arrow-upward',
  'xmark': 'close',

  // Communication
  'paperplane.fill': 'send',
  'bell.fill': 'notifications',

  // Finance & Business
  'wallet.pass.fill': 'account-balance-wallet',
  'chart.line.uptrend.xyaxis': 'trending-up',
  'creditcard.fill': 'credit-card',
  'tag.fill': 'local-offer',

  // User & Profile
  'person.fill': 'person',
  'faceid': 'fingerprint',

  // Documents & Files
  'doc.text.fill': 'description',

  // Security
  'lock.fill': 'lock',
  'eye': 'visibility',
  'eye.slash': 'visibility-off',
  'eye.fill': 'visibility',

  // UI Elements
  'ellipsis': 'more-vert',
  'line.3.horizontal': 'menu',
  'info.circle.fill': 'info',

  // Alerts
  'exclamationmark.triangle.fill': 'warning',

  // Calendar
  'calendar': 'calendar-today',

  // Phone
  'phone.fill': 'phone',

  // Email
  'envelope.fill': 'email',

  // Chart
  'chart.bar.fill': 'bar-chart',

  // Camera & Media
  'camera.fill': 'photo-camera',
  'photo.fill': 'photo',
  'trash.fill': 'delete',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
