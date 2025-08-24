import type React from "react";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  analyticsService,
  salesService,
  productService,
} from "../../../services/firebase";
import { COLORS, SIZES } from "../../../constants";
import { formatCurrency } from "../../../utils/validation";

type Period = "7" | "30" | "90";

export const ReportsScreen: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("30");
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalSales: 0,
    averageDailyRevenue: 0,
  });
  const [topProducts, setTopProducts] = useState<
    Array<{
      productName: string;
      totalQuantity: number;
      totalRevenue: number;
    }>
  >([]);
  const [lowStockProducts, setLowStockProducts] = useState<
    Array<{
      name: string;
      stock: number;
      category: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportsData();
  }, [selectedPeriod]);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      const days = Number.parseInt(selectedPeriod);

      const [analyticsData, topProductsData, lowStockData] = await Promise.all([
        analyticsService.getSalesAnalytics(days),
        salesService.getTopSellingProducts(5),
        productService.getLowStock(10),
      ]);

      setAnalytics(analyticsData);
      setTopProducts(topProductsData);
      setLowStockProducts(
        lowStockData.map((p) => ({
          name: p.name,
          stock: p.stock,
          category: p.category,
        }))
      );
    } catch (error) {
      console.log("[v0] Error loading reports:", error);
      Alert.alert("Error", "Failed to load reports data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading Reports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Business Analytics</Text>
          <Text style={styles.headerSubtitle}>
            Performance insights and trends
          </Text>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <Text style={styles.sectionTitle}>Time Period</Text>
          <View style={styles.periodButtons}>
            {[
              { key: "7", label: "7 Days" },
              { key: "30", label: "30 Days" },
              { key: "90", label: "90 Days" },
            ].map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.key && styles.selectedPeriodButton,
                ]}
                onPress={() => setSelectedPeriod(period.key as Period)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === period.key &&
                      styles.selectedPeriodButtonText,
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Key Metrics ({selectedPeriod} Days)
          </Text>
          <View style={styles.metricsContainer}>
            <View style={styles.metricCard}>
              <Text style={styles.metricNumber}>
                {formatCurrency(analytics.totalRevenue)}
              </Text>
              <Text style={styles.metricLabel}>Total Revenue</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricNumber}>{analytics.totalSales}</Text>
              <Text style={styles.metricLabel}>Total Sales</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricNumber}>
                {formatCurrency(analytics.averageDailyRevenue)}
              </Text>
              <Text style={styles.metricLabel}>Avg Daily Revenue</Text>
            </View>
          </View>
        </View>

        {/* Top Selling Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Selling Products</Text>
          {topProducts.length > 0 ? (
            topProducts.map((product, index) => (
              <View key={product.productName} style={styles.productCard}>
                <View style={styles.productRank}>
                  <Text style={styles.rankNumber}>#{index + 1}</Text>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.productName}</Text>
                  <Text style={styles.productStats}>
                    {product.totalQuantity} units sold •{" "}
                    {formatCurrency(product.totalRevenue)} revenue
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No sales data available</Text>
            </View>
          )}
        </View>

        {/* Low Stock Alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Low Stock Alerts</Text>
          {lowStockProducts.length > 0 ? (
            lowStockProducts.map((product) => (
              <View key={product.name} style={styles.alertCard}>
                <View style={styles.alertIcon}>
                  <Text style={styles.alertIconText}>⚠️</Text>
                </View>
                <View style={styles.alertInfo}>
                  <Text style={styles.alertProductName}>{product.name}</Text>
                  <Text style={styles.alertProductDetails}>
                    {product.stock} units remaining • {product.category}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                All products are well stocked
              </Text>
              <Text style={styles.emptySubtext}>No low stock alerts</Text>
            </View>
          )}
        </View>

        {/* Business Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Insights</Text>
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Revenue Performance</Text>
            <Text style={styles.insightText}>
              {analytics.totalRevenue > 0
                ? `Your pharmacy generated ${formatCurrency(
                    analytics.totalRevenue
                  )} in the last ${selectedPeriod} days, averaging ${formatCurrency(
                    analytics.averageDailyRevenue
                  )} per day.`
                : "No revenue data available for the selected period."}
            </Text>
          </View>

          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Inventory Status</Text>
            <Text style={styles.insightText}>
              {lowStockProducts.length > 0
                ? `${lowStockProducts.length} products are running low on stock. Consider restocking to avoid stockouts.`
                : "Your inventory levels are healthy with no immediate restocking needs."}
            </Text>
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
    padding: SIZES.padding + 4,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.primaryLight,
  },
  section: {
    padding: SIZES.padding,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SIZES.padding,
  },
  periodSelector: {
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    marginBottom: 8,
  },
  periodButtons: {
    flexDirection: "row",
    gap: 8,
  },
  periodButton: {
    flex: 1,
    padding: 12,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  selectedPeriodButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  periodButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  selectedPeriodButtonText: {
    color: COLORS.white,
  },
  metricsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  metricCard: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: 12,
    flex: 1,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  metricNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.secondary,
    textAlign: "center",
  },
  productCard: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginBottom: 8,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  productStats: {
    fontSize: 14,
    color: COLORS.secondary,
  },
  alertCard: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginBottom: 8,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  alertIcon: {
    marginRight: 12,
  },
  alertIconText: {
    fontSize: 24,
  },
  alertInfo: {
    flex: 1,
  },
  alertProductName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  alertProductDetails: {
    fontSize: 14,
    color: COLORS.secondary,
  },
  insightCard: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.secondary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
  },
});
