import { Platform, StyleSheet, View, ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { color } from '@/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// Filled icon when active, outline when idle — a fast, glanceable "where am I" cue.
function TabIcon({ name, focused, c }: { name: string; focused: boolean; c: ColorValue }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons name={(focused ? name : `${name}-outline`) as IconName} size={22} color={c} />
    </View>
  );
}

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: color.brand,
        tabBarInactiveTintColor: color.muted,
        tabBarHideOnKeyboard: true,
        tabBarStyle: styles.bar,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: { paddingTop: 6 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color: c, focused }) => <TabIcon name="home" focused={focused} c={c} /> }} />
      <Tabs.Screen name="trips" options={{ title: 'Tickets', tabBarIcon: ({ color: c, focused }) => <TabIcon name="ticket" focused={focused} c={c} /> }} />
      <Tabs.Screen name="track" options={{ title: 'Track', tabBarIcon: ({ color: c, focused }) => <TabIcon name="navigate" focused={focused} c={c} /> }} />
      <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: ({ color: c, focused }) => <TabIcon name="person" focused={focused} c={c} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: Platform.OS === 'ios' ? 88 : 70,
    backgroundColor: color.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.line,
    paddingBottom: Platform.OS === 'ios' ? 26 : 10,
  },
  label: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  iconWrap: { width: 48, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  iconWrapActive: { backgroundColor: color.brandSoft },
});
