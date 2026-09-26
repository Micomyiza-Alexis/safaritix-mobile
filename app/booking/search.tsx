import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Colors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "@/constants/theme";
import { searchTrips, Trip } from "@/services/booking/searchService";

export default function SearchScreen() {
  const router = useRouter();

  const { from, to, date } = useLocalSearchParams<{
    from?: string;
    to?: string;
    date?: string;
  }>();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTrips = async () => {
      if (!from || !to || !date) {
        setError("Missing search information.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const results = await searchTrips({
          from,
          to,
          date,
        });

        setTrips(results);
      } catch (err) {
        console.error("Trip search error:", err);

        setError(
          err instanceof Error ? err.message : "Unable to search for trips.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadTrips();
  }, [from, to, date]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.title}>Available Buses</Text>

            <Text style={styles.route}>
              {from || "Departure"} → {to || "Destination"}
            </Text>
          </View>
        </View>

        {/* Search information */}
        <Card style={styles.searchInfo}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="calendar-outline"
                size={19}
                color={Colors.primary}
              />
            </View>

            <View>
              <Text style={styles.infoLabel}>Travel date</Text>
              <Text style={styles.infoValue}>{formatDate(date)}</Text>
            </View>
          </View>
        </Card>

        {/* Loading */}
        {loading && (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={Colors.primary} />

            <Text style={styles.stateTitle}>Searching for buses...</Text>

            <Text style={styles.stateText}>
              Finding available trips for your route.
            </Text>
          </View>
        )}

        {/* Error */}
        {!loading && error && (
          <Card style={styles.stateCard}>
            <View style={styles.stateIcon}>
              <Ionicons
                name="alert-circle-outline"
                size={30}
                color={Colors.danger}
              />
            </View>

            <Text style={styles.stateTitle}>Something went wrong</Text>

            <Text style={styles.stateText}>{error}</Text>

            <Button
              title="Try Again"
              onPress={() => {
                setLoading(true);
                setError("");

                if (from && to && date) {
                  searchTrips({ from, to, date })
                    .then(setTrips)
                    .catch((err) => {
                      setError(
                        err instanceof Error
                          ? err.message
                          : "Unable to search for trips.",
                      );
                    })
                    .finally(() => setLoading(false));
                }
              }}
              style={styles.retryButton}
            />
          </Card>
        )}

        {/* Empty */}
        {!loading && !error && trips.length === 0 && (
          <Card style={styles.stateCard}>
            <View style={styles.stateIcon}>
              <Ionicons name="bus-outline" size={30} color={Colors.primary} />
            </View>

            <Text style={styles.stateTitle}>No buses found</Text>

            <Text style={styles.stateText}>
              We couldn't find any available buses for this route and travel
              date.
            </Text>

            <Button
              title="Change Search"
              onPress={() => router.back()}
              variant="outline"
              style={styles.retryButton}
            />
          </Card>
        )}

        {/* Results */}
        {!loading && !error && trips.length > 0 && (
          <View style={styles.results}>
            <Text style={styles.resultCount}>
              {trips.length} {trips.length === 1 ? "bus" : "buses"} found
            </Text>

            {trips.map((trip, index) => (
              <TripCard
                key={`${trip.schedule_id}-${index}`}
                trip={trip}
                onSelect={() => {
                  router.push({
                    pathname: "/seat-map",
                    params: {
                      scheduleId: String(trip.schedule_id),
                      from: String(
                        trip.pickup_stop || trip.from_location || "",
                      ),
                      to: String(trip.dropoff_stop || trip.to_location || ""),
                      busPlate: String(trip.bus_plate || "Bus"),
                      departureDate: String(trip.departure_date || ""),
                      departureTime: String(trip.departure_time || ""),
                      price: String(trip.price || 0),
                    },
                  });
                }}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function TripCard({ trip, onSelect }: { trip: Trip; onSelect: () => void }) {
  return (
    <Card style={styles.tripCard}>
      {/* Company / bus */}
      <View style={styles.tripTop}>
        <View style={styles.busIcon}>
          <Ionicons name="bus-outline" size={23} color={Colors.primary} />
        </View>

        <View style={styles.tripMain}>
          <Text style={styles.companyName}>
            {trip.company_name || "SafariTix Bus"}
          </Text>

          <Text style={styles.busPlate}>
            {trip.bus_plate || "Plate unavailable"}
          </Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formatPrice(trip.price)}</Text>

          <Text style={styles.priceLabel}>per seat</Text>
        </View>
      </View>

      {/* Time */}
      <View style={styles.timeRow}>
        <View style={styles.timeBlock}>
          <Text style={styles.time}>{formatTime(trip.departure_time)}</Text>

          <Text style={styles.stop}>{trip.pickup_stop || "Departure"}</Text>
        </View>

        <View style={styles.lineContainer}>
          <View style={styles.dot} />

          <View style={styles.line} />

          <Ionicons name="bus-outline" size={17} color={Colors.primary} />

          <View style={styles.line} />

          <View style={styles.dot} />
        </View>

        <View style={[styles.timeBlock, styles.destinationBlock]}>
          <Text style={styles.time}>Destination</Text>

          <Text style={styles.stop}>
            {trip.dropoff_stop || trip.to_location || "Destination"}
          </Text>
        </View>
      </View>

      {/* Availability */}
      <View style={styles.detailsRow}>
        <View style={styles.detail}>
          <Ionicons name="people-outline" size={17} color={Colors.textMuted} />

          <Text style={styles.detailText}>
            {trip.available_seats ?? 0} seats available
          </Text>
        </View>

        <View style={styles.detail}>
          <Ionicons name="time-outline" size={17} color={Colors.textMuted} />

          <Text style={styles.detailText}>{trip.status || "Scheduled"}</Text>
        </View>
      </View>

      <Button
        title="Select Bus"
        onPress={onSelect}
        style={styles.selectButton}
      />
    </Card>
  );
}

function formatDate(value?: string) {
  if (!value) return "Travel date";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-RW", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value?: string | null) {
  if (!value) return "--:--";

  const [hours, minutes] = value.split(":");

  if (!hours || !minutes) {
    return value;
  }

  const hour = Number(hours);

  if (Number.isNaN(hour)) {
    return value;
  }

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minutes} ${suffix}`;
}

function formatPrice(value?: number | string | null) {
  if (value === null || value === undefined || value === "") {
    return "RWF --";
  }

  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return `RWF ${value}`;
  }

  return `RWF ${amount.toLocaleString()}`;
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
    marginBottom: Spacing.xl,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.small,
  },

  headerText: {
    flex: 1,
    marginLeft: Spacing.md,
  },

  title: {
    ...Typography.heading2,
    color: Colors.text,
  },

  route: {
    ...Typography.small,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },

  searchInfo: {
    marginBottom: Spacing.xl,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },

  infoLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },

  infoValue: {
    ...Typography.bodyMedium,
    color: Colors.text,
    marginTop: 2,
  },

  centerState: {
    alignItems: "center",
    paddingVertical: Spacing.xxxl,
  },

  stateCard: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
  },

  stateIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },

  stateTitle: {
    ...Typography.heading3,
    color: Colors.text,
    textAlign: "center",
  },

  stateText: {
    ...Typography.small,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: Spacing.sm,
    lineHeight: 20,
  },

  retryButton: {
    marginTop: Spacing.lg,
    minWidth: 150,
  },

  results: {
    gap: Spacing.md,
  },

  resultCount: {
    ...Typography.smallMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },

  tripCard: {
    padding: Spacing.lg,
  },

  tripTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  busIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },

  tripMain: {
    flex: 1,
  },

  companyName: {
    ...Typography.bodyMedium,
    color: Colors.text,
  },

  busPlate: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 3,
  },

  priceContainer: {
    alignItems: "flex-end",
  },

  price: {
    ...Typography.bodyMedium,
    color: Colors.primary,
  },

  priceLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xl,
  },

  timeBlock: {
    width: 88,
  },

  destinationBlock: {
    alignItems: "flex-end",
  },

  time: {
    ...Typography.bodyMedium,
    color: Colors.text,
  },

  stop: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 3,
  },

  lineContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.sm,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },

  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  detail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  detailText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },

  selectButton: {
    marginTop: Spacing.lg,
  },
});
