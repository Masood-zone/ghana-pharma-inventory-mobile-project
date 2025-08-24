import type React from "react";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  productService,
  salesService,
  type Product,
  type Sale,
} from "../../../services/firebase";
import { COLORS, SIZES } from "../../../constants";
import {
  validateSale,
  formatCurrency,
  formatTime,
} from "../../../utils/validation";

export const SalesScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [saleData, setSaleData] = useState({
    quantity: "",
    saleType: "retail" as "retail" | "wholesale",
    customerName: "",
    notes: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, salesData] = await Promise.all([
        productService.getAll(),
        salesService.getTodaysSales(),
      ]);
      setProducts(productsData);
      setSales(salesData);
    } catch (error) {
      console.log("[v0] Error loading data:", error);
      Alert.alert("Error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const recordSale = async () => {
    try {
      const errors = validateSale(saleData, selectedProduct);
      if (errors.length > 0) {
        Alert.alert("Validation Error", errors.join("\n"));
        return;
      }

      const quantity = Number.parseInt(saleData.quantity);
      const price =
        saleData.saleType === "retail"
          ? selectedProduct!.retailPrice
          : selectedProduct!.wholesalePrice || 0;
      const totalAmount = quantity * price;

      // Create sale record
      const saleRecord: Omit<Sale, "id"> = {
        productId: selectedProduct!.id,
        productName: selectedProduct!.name,
        quantity,
        saleType: saleData.saleType,
        unitPrice: price,
        totalAmount,
        customerName: saleData.customerName.trim(),
        notes: saleData.notes.trim(),
        createdAt: new Date().toISOString(),
      };

      await salesService.create(saleRecord);

      // Update product stock
      const newStock = selectedProduct!.stock - quantity;
      await productService.update(selectedProduct!.id, { stock: newStock });

      Alert.alert(
        "Success",
        `Sale recorded successfully!\nTotal: ${formatCurrency(
          totalAmount
        )}\nRemaining stock: ${newStock} units`
      );

      // Reset form
      setSaleData({
        quantity: "",
        saleType: "retail",
        customerName: "",
        notes: "",
      });
      setSelectedProduct(null);
      setShowSaleModal(false);
      loadData();
    } catch (error) {
      console.log("[v0] Error recording sale:", error);
      Alert.alert("Error", "Failed to record sale. Please try again.");
    }
  };

  const todaysRevenue = sales.reduce(
    (total, sale) => total + (sale.totalAmount || 0),
    0
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading Sales Data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sales Recording</Text>
        <Text style={styles.headerSubtitle}>
          Today's Revenue: {formatCurrency(todaysRevenue)}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.recordSaleButton}
        onPress={() => setShowSaleModal(true)}
      >
        <Text style={styles.recordSaleButtonText}>+ Record New Sale</Text>
      </TouchableOpacity>

      <ScrollView style={styles.salesList}>
        <Text style={styles.sectionTitle}>
          Recent Sales ({sales.length} today)
        </Text>

        {sales.map((sale) => (
          <View key={sale.id} style={styles.saleCard}>
            <View style={styles.saleHeader}>
              <Text style={styles.saleProduct}>{sale.productName}</Text>
              <Text style={styles.saleAmount}>
                {formatCurrency(sale.totalAmount)}
              </Text>
            </View>
            <View style={styles.saleDetails}>
              <Text style={styles.saleInfo}>
                {sale.quantity} units × {formatCurrency(sale.unitPrice)} (
                {sale.saleType})
              </Text>
              <Text style={styles.saleTime}>{formatTime(sale.createdAt)}</Text>
            </View>
            {sale.customerName && (
              <Text style={styles.saleCustomer}>
                Customer: {sale.customerName}
              </Text>
            )}
          </View>
        ))}

        {sales.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No sales recorded today</Text>
            <Text style={styles.emptySubtext}>
              Record your first sale to start tracking revenue
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showSaleModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Record Sale</Text>
            <TouchableOpacity
              onPress={() => setShowSaleModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              Record pharmaceutical sale transaction
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Select Product *</Text>
              <ScrollView
                style={styles.productSelector}
                showsVerticalScrollIndicator={false}
              >
                {products.map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    style={[
                      styles.productOption,
                      selectedProduct?.id === product.id &&
                        styles.selectedProduct,
                    ]}
                    onPress={() => setSelectedProduct(product)}
                  >
                    <Text style={styles.productOptionName}>{product.name}</Text>
                    <Text style={styles.productOptionStock}>
                      Stock: {product.stock} units
                    </Text>
                    <Text style={styles.productOptionPrice}>
                      Retail: {formatCurrency(product.retailPrice)} | Wholesale:{" "}
                      {formatCurrency(product.wholesalePrice || 0)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {selectedProduct && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Sale Type *</Text>
                  <View style={styles.saleTypeContainer}>
                    <TouchableOpacity
                      style={[
                        styles.saleTypeButton,
                        saleData.saleType === "retail" &&
                          styles.selectedSaleType,
                      ]}
                      onPress={() =>
                        setSaleData({ ...saleData, saleType: "retail" })
                      }
                    >
                      <Text style={styles.saleTypeText}>
                        Retail ({formatCurrency(selectedProduct.retailPrice)})
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.saleTypeButton,
                        saleData.saleType === "wholesale" &&
                          styles.selectedSaleType,
                      ]}
                      onPress={() =>
                        setSaleData({ ...saleData, saleType: "wholesale" })
                      }
                    >
                      <Text style={styles.saleTypeText}>
                        Wholesale (
                        {formatCurrency(selectedProduct.wholesalePrice || 0)})
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    Quantity * (Available: {selectedProduct.stock})
                  </Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Enter quantity"
                    keyboardType="numeric"
                    placeholderTextColor={COLORS.textLight}
                    value={saleData.quantity}
                    onChangeText={(text) =>
                      setSaleData({ ...saleData, quantity: text })
                    }
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Customer Name</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Enter customer name (optional)"
                    placeholderTextColor={COLORS.textLight}
                    value={saleData.customerName}
                    onChangeText={(text) =>
                      setSaleData({ ...saleData, customerName: text })
                    }
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Notes</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Additional notes (optional)"
                    placeholderTextColor={COLORS.textLight}
                    value={saleData.notes}
                    onChangeText={(text) =>
                      setSaleData({ ...saleData, notes: text })
                    }
                  />
                </View>

                {saleData.quantity && (
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total Amount:</Text>
                    <Text style={styles.totalAmount}>
                      {formatCurrency(
                        Number.parseInt(saleData.quantity || "0") *
                          (saleData.saleType === "retail"
                            ? selectedProduct.retailPrice
                            : selectedProduct.wholesalePrice || 0)
                      )}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={recordSale}
                >
                  <Text style={styles.saveButtonText}>Record Sale</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  recordSaleButton: {
    backgroundColor: COLORS.primary,
    margin: SIZES.margin,
    padding: SIZES.padding,
    borderRadius: SIZES.borderRadius,
    alignItems: "center",
  },
  recordSaleButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  salesList: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SIZES.padding,
  },
  saleCard: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  saleProduct: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    flex: 1,
  },
  saleAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  saleDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  saleInfo: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  saleTime: {
    fontSize: 12,
    color: COLORS.secondary,
  },
  saleCustomer: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.secondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    padding: SIZES.padding + 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
    padding: SIZES.padding + 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: COLORS.secondary,
    marginBottom: 24,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: SIZES.padding + 4,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 16,
    color: COLORS.text,
  },
  productSelector: {
    maxHeight: 200,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.borderRadius,
    padding: 8,
  },
  productOption: {
    backgroundColor: COLORS.white,
    padding: 12,
    marginBottom: 8,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedProduct: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  productOptionName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  productOptionStock: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  productOptionPrice: {
    fontSize: 12,
    color: COLORS.secondary,
  },
  saleTypeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  saleTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  selectedSaleType: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  saleTypeText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    padding: SIZES.padding,
    borderRadius: SIZES.borderRadius,
    marginBottom: SIZES.padding + 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textSecondary,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    borderRadius: SIZES.borderRadius,
    alignItems: "center",
    marginTop: SIZES.padding + 4,
    marginBottom: 40,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
});
