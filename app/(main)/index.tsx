import { Ionicons } from "@expo/vector-icons";
import { useRouter, useNavigation } from "expo-router";
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  Colors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "@/constants/theme";

const getDateString = (offsetDays: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);

  return date.toISOString().slice(0, 10);
};

const getNextSaturday = () => {
  const date = new Date();
  const day = date.getDay();
  const daysUntilSaturday = (6 - day + 7) % 7;

  date.setDate(date.getDate() + daysUntilSaturday);

  return date.toISOString().slice(0, 10);
};

const QUICK_DATES = [
  {
    label: "Today",
    value: getDateString(0),
  },
  {
    label: "Tomorrow",
    value: getDateString(1),
  },
  {
    label: "Weekend",
    value: getNextSaturday(),
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(getDateString(0));
const [selectedDateLabel, setSelectedDateLabel] = useState("Today");

  const handleSearch = () => {
    if (!from.trim() || !to.trim()) {
      return;
    }

    router.push({
      pathname: "/booking/search",
      params: {
        from: from.trim(),
        to: to.trim(),
        date,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>SafariTix</Text>
            <Text style={styles.greeting}>Where are you going?</Text>
          </View>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('account' as never)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={Colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <Card style={styles.searchCard}>
          <View style={styles.searchTitleRow}>
            <View style={styles.searchIcon}>
              <Ionicons name="search" size={20} color={Colors.primary} />
            </View>

            <View>
              <Text style={styles.searchTitle}>Find your bus</Text>
              <Text style={styles.searchSubtitle}>Search available trips</Text>
            </View>
          </View>

          <View style={styles.routeInputs}>
            <Input
              label="From"
              placeholder="Departure location"
              value={from}
              onChangeText={setFrom}
              autoCapitalize="words"
            />

            <View style={styles.swapButton}>
              <Ionicons name="swap-vertical" size={20} color={Colors.primary} />
            </View>

            <Input
              label="To"
              placeholder="Destination"
              value={to}
              onChangeText={setTo}
              autoCapitalize="words"
            />
          </View>

          <Text style={styles.dateLabel}>Travel date</Text>

          <View style={styles.dateOptions}>
            {QUICK_DATES.map((item) => {
  const selected = selectedDateLabel === item.label;

  return (
    <TouchableOpacity
      key={item.label}
      onPress={() => {
        setDate(item.value);
        setSelectedDateLabel(item.label);
      }}
      activeOpacity={0.8}
      style={[
        styles.dateOption,
        selected && styles.dateOptionSelected,
      ]}
    >
      <Text
        style={[
          styles.dateOptionText,
          selected && styles.dateOptionTextSelected,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );
})}
          </View>

          <Button
            title="Search Buses"
            onPress={handleSearch}
            disabled={!from.trim() || !to.trim()}
            style={styles.searchButton}
          />
        </Card>

        {/* Quick actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick access</Text>

          <View style={styles.quickActions}>
            <QuickAction
              icon="ticket-outline"
              title="My Tickets"
              onPress={() => router.navigate('/tickets')}
            />

            <QuickAction
              icon="navigate-outline"
              title="Track Bus"
              onPress={() => navigation.navigate('track' as never)}
            />

            <QuickAction
              icon="help-circle-outline"
              title="Help"
              onPress={() => router.push("/support/contact")}
            />
          </View>
        </View>

        {/* Upcoming trip placeholder */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your next trip</Text>
            <TouchableOpacity onPress={() => navigation.navigate('trips' as never)}>
              <Text style={styles.seeAll}>View all</Text>
            </TouchableOpacity>
          </View>

          <Card style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="bus-outline" size={28} color={Colors.primary} />
            </View>

            <Text style={styles.emptyTitle}>No upcoming trips</Text>

            <Text style={styles.emptyText}>
              Your booked trips will appear here.
            </Text>
          </Card>
        </View>

        {/* Trust */}
        <View style={styles.trustRow}>
          <TrustItem icon="shield-checkmark-outline" text="Secure booking" />
          <TrustItem icon="time-outline" text="Live schedules" />
          <TrustItem icon="qr-code-outline" text="Digital tickets" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction({
  icon,
  title,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.quickAction}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.quickActionIcon}>
        <Ionicons name={icon} size={22} color={Colors.primary} />
      </View>

      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );
}

function TrustItem({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.trustItem}>
      <Ionicons name={icon} size={17} color={Colors.success} />
      <Text style={styles.trustText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
  },

  brand: {
    ...Typography.heading3,
    color: Colors.primary,
  },

  greeting: {
    ...Typography.heading1,
    color: Colors.text,
    marginTop: 2,
  },

  notificationButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },

  searchCard: {
    padding: Spacing.xl,
  },

  searchTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },

  searchIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },

  searchTitle: {
    ...Typography.heading3,
    color: Colors.text,
  },

  searchSubtitle: {
    ...Typography.small,
    color: Colors.textMuted,
    marginTop: 2,
  },

  routeInputs: {
    position: "relative",
  },

  swapButton: {
    position: "absolute",
    right: 14,
    top: 43,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },

  dateLabel: {
    ...Typography.smallMedium,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },

  dateOptions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },

  dateOption: {
    flex: 1,
    minHeight: 42,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },

  dateOptionSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },

  dateOptionText: {
    ...Typography.smallMedium,
    color: Colors.textSecondary,
  },

  dateOptionTextSelected: {
    color: Colors.primary,
  },

  searchButton: {
    marginTop: Spacing.sm,
  },

  section: {
    marginTop: Spacing.xxxl,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },

  sectionTitle: {
    ...Typography.heading3,
    color: Colors.text,
  },

  seeAll: {
    ...Typography.smallMedium,
    color: Colors.primary,
  },

  quickActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },

  quickAction: {
    flex: 1,
    minHeight: 96,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.small,
  },

  quickActionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },

  quickActionText: {
    ...Typography.caption,
    color: Colors.text,
  },

  emptyCard: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
  },

  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },

  emptyTitle: {
    ...Typography.bodyMedium,
    color: Colors.text,
  },

  emptyText: {
    ...Typography.small,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    textAlign: "center",
  },

  trustRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.xxxl,
    paddingHorizontal: Spacing.xs,
  },

  trustItem: {
    alignItems: "center",
    gap: 4,
  },

  trustText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});
