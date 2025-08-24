import type React from "react";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../contexts/auth/AuthContext";
import { analyticsService } from "../../services/firebase";
import { COLORS, SIZES } from "../../constants";
import { formatCurrency } from "../../utils/validation";

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userProfile, logout } = useAuth();
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    todaysRevenue: 0,
    todaysSalesCount: 0,
    lowStockCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const dashboardMetrics = await analyticsService.getDashboardMetrics();
      setMetrics(dashboardMetrics);
    } catch (error) {
      console.log("[v0] Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>PharmaTrack</Text>
          <Text style={styles.headerSubtitle}>
            Ghana Pharmaceutical Inventory
          </Text>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Welcome, {userProfile?.name}</Text>
            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Text style={styles.metricNumber}>{metrics.totalProducts}</Text>
            <Text style={styles.metricLabel}>Total Products</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricNumber}>
              {formatCurrency(metrics.todaysRevenue)}
            </Text>
            <Text style={styles.metricLabel}>Today's Revenue</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricNumber}>{metrics.todaysSalesCount}</Text>
            <Text style={styles.metricLabel}>Today's Sales</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricNumber}>{metrics.lowStockCount}</Text>
            <Text style={styles.metricLabel}>Low Stock</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("Products")}
            >
              <Text style={styles.actionButtonText}>Manage Products</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("Sales")}
            >
              <Text style={styles.actionButtonText}>Record Sale</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("Reports")}
            >
              <Text style={styles.actionButtonText}>View Reports</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={loadDashboardData}
            >
              <Text
                style={[styles.actionButtonText, styles.secondaryButtonText]}
              >
                Refresh
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: COLORS.secondary,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.primaryLight,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 12,
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.primaryLight,
  },
  logoutButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  metricsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: SIZES.padding,
    gap: 12,
  },
  metricCard: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: 12,
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: COLORS.secondary,
    textAlign: "center",
  },
  section: {
    padding: SIZES.padding,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SIZES.padding,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    borderRadius: SIZES.borderRadius,
    flex: 1,
    alignItems: "center",
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  secondaryButtonText: {
    color: COLORS.primary,
  },
});
