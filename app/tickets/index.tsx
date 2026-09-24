import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '@/constants/theme';

export default function TicketsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Tickets</Text>
      <Text style={styles.subtitle}>
        Your upcoming and past tickets will appear here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.xxl,
    justifyContent: 'center',
  },
  title: {
    ...Typography.heading1,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
