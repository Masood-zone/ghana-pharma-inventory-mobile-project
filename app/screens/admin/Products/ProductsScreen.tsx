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
import { productService, type Product } from "../../../services/firebase";
import { COLORS, SIZES } from "../../../constants";
import { validateProduct, formatCurrency } from "../../../utils/validation";

export function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    stock: "",
    retailPrice: "",
    wholesalePrice: "",
    batchNumber: "",
    expiryDate: "",
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await productService.getAll();
      setProducts(productsData);
    } catch (error) {
      console.log("[v0] Error loading products:", error);
      Alert.alert("Error", "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const saveProduct = async () => {
    try {
      const errors = validateProduct(formData);
      if (errors.length > 0) {
        Alert.alert("Validation Error", errors.join("\n"));
        return;
      }

      const productData: Omit<Product, "id"> = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        stock: Number.parseInt(formData.stock),
        retailPrice: Number.parseFloat(formData.retailPrice),
        wholesalePrice: formData.wholesalePrice
          ? Number.parseFloat(formData.wholesalePrice)
          : 0,
        batchNumber: formData.batchNumber.trim(),
        expiryDate: formData.expiryDate.trim(),
      };

      await productService.create(productData);
      Alert.alert("Success", "Product added successfully!");

      // Reset form and close modal
      setFormData({
        name: "",
        category: "",
        stock: "",
        retailPrice: "",
        wholesalePrice: "",
        batchNumber: "",
        expiryDate: "",
      });
      setShowAddModal(false);
      loadProducts();
    } catch (error) {
      console.log("[v0] Error saving product:", error);
      Alert.alert("Error", "Failed to save product. Please try again.");
    }
  };

  const filteredProducts = products.filter((product) => {
    const q = searchText.toLowerCase();
    return (
      product.name?.toLowerCase().includes(q) ||
      product.category?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading Products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pharmaceutical Inventory</Text>
        <Text style={styles.headerSubtitle}>{products.length} Products</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={COLORS.textLight}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.addButtonText}>+ Add New Product</Text>
      </TouchableOpacity>

      <ScrollView style={styles.productsList}>
        {filteredProducts.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <View style={styles.productHeader}>
              <Text style={styles.productName}>
                {product.name || "Unnamed Product"}
              </Text>
              <Text style={styles.productCategory}>
                {product.category || "General"}
              </Text>
            </View>
            <View style={styles.productDetails}>
              <Text style={styles.productStock}>
                Stock: {product.stock ?? 0} units
              </Text>
              <Text style={styles.productPrice}>
                {formatCurrency(product.retailPrice ?? 0)}
              </Text>
            </View>
            {!!product.expiryDate && (
              <Text style={styles.productExpiry}>
                Expires: {product.expiryDate}
              </Text>
            )}
            {product.stock <= 10 && (
              <Text style={styles.lowStockWarning}>⚠️ Low Stock Alert</Text>
            )}
          </View>
        ))}

        {filteredProducts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubtext}>
              Add your first pharmaceutical product
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Product</Text>
            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              Add pharmaceutical product to inventory
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Product Name *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter product name"
                placeholderTextColor={COLORS.textLight}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Tablets, Syrup, Injection, etc."
                placeholderTextColor={COLORS.textLight}
                value={formData.category}
                onChangeText={(text) =>
                  setFormData({ ...formData, category: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Stock Quantity *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter quantity"
                keyboardType="numeric"
                placeholderTextColor={COLORS.textLight}
                value={formData.stock}
                onChangeText={(text) =>
                  setFormData({ ...formData, stock: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Retail Price (₵) *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter retail price"
                keyboardType="numeric"
                placeholderTextColor={COLORS.textLight}
                value={formData.retailPrice}
                onChangeText={(text) =>
                  setFormData({ ...formData, retailPrice: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Wholesale Price (₵)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter wholesale price"
                keyboardType="numeric"
                placeholderTextColor={COLORS.textLight}
                value={formData.wholesalePrice}
                onChangeText={(text) =>
                  setFormData({ ...formData, wholesalePrice: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Batch Number</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter batch number"
                placeholderTextColor={COLORS.textLight}
                value={formData.batchNumber}
                onChangeText={(text) =>
                  setFormData({ ...formData, batchNumber: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Expiry Date</Text>
              <TextInput
                style={styles.formInput}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={COLORS.textLight}
                value={formData.expiryDate}
                onChangeText={(text) =>
                  setFormData({ ...formData, expiryDate: text })
                }
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={saveProduct}>
              <Text style={styles.saveButtonText}>Save Product</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

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
  searchContainer: {
    padding: SIZES.padding,
  },
  searchInput: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 16,
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    margin: SIZES.margin,
    padding: SIZES.padding,
    borderRadius: SIZES.borderRadius,
    alignItems: "center",
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  productsList: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
  },
  productCard: {
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
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    flex: 1,
  },
  productCategory: {
    fontSize: 12,
    color: COLORS.secondary,
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  productDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  productStock: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  productExpiry: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
  lowStockWarning: {
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: "600",
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
