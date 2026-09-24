import {
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import {
  Colors,
  Radius,
  Shadows,
  Spacing,
} from '@/constants/theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  padding?: number;
  style?: StyleProp<ViewStyle>;
}

export function Card({
  children,
  padding = Spacing.lg,
  style,
  ...props
}: CardProps) {
  return (
    <View
      {...props}
      style={[
        styles.card,
        { padding },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
});