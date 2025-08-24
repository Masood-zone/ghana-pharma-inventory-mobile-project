import { db } from "../../firebase"
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore"

export type Product = {
  id: string
  name: string
  category: string
  stock: number
  retailPrice: number
  wholesalePrice?: number
  batchNumber?: string
  expiryDate?: string
  createdAt?: string
}

export type Sale = {
  id: string
  productId: string
  productName: string
  quantity: number
  saleType: "retail" | "wholesale"
  unitPrice: number
  totalAmount: number
  customerName?: string
  notes?: string
  createdAt: string
}

// Product Services
export const productService = {
  async getAll(): Promise<Product[]> {
    const snapshot = await getDocs(collection(db, "products"))
    return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...(doc.data() as Omit<Product, "id">),
    }))
  },

  async create(productData: Omit<Product, "id">): Promise<void> {
    await addDoc(collection(db, "products"), {
      ...productData,
      createdAt: new Date().toISOString(),
    })
  },

  async update(id: string, productData: Partial<Product>): Promise<void> {
    await updateDoc(doc(db, "products", id), productData)
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, "products", id))
  },

  async getLowStock(threshold = 10): Promise<Product[]> {
    const products = await this.getAll()
    return products.filter((product) => product.stock <= threshold)
  },
}

// Sales Services
export const salesService = {
  async getAll(): Promise<Sale[]> {
    const snapshot = await getDocs(query(collection(db, "sales"), orderBy("createdAt", "desc")))
    return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...(doc.data() as Omit<Sale, "id">),
    }))
  },

  async create(saleData: Omit<Sale, "id">): Promise<void> {
    await addDoc(collection(db, "sales"), {
      ...saleData,
      createdAt: new Date().toISOString(),
    })
  },

  async getTodaysSales(): Promise<Sale[]> {
    const sales = await this.getAll()
    const today = new Date().toDateString()
    return sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt).toDateString()
      return today === saleDate
    })
  },

  async getSalesByDateRange(startDate: Date, endDate: Date): Promise<Sale[]> {
    const sales = await this.getAll()
    return sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt)
      return saleDate >= startDate && saleDate <= endDate
    })
  },

  async getTopSellingProducts(
    limit = 5,
  ): Promise<Array<{ productName: string; totalQuantity: number; totalRevenue: number }>> {
    const sales = await this.getAll()
    const productStats = new Map()

    sales.forEach((sale) => {
      const existing = productStats.get(sale.productName) || { totalQuantity: 0, totalRevenue: 0 }
      productStats.set(sale.productName, {
        totalQuantity: existing.totalQuantity + sale.quantity,
        totalRevenue: existing.totalRevenue + sale.totalAmount,
      })
    })

    return Array.from(productStats.entries())
      .map(([productName, stats]) => ({ productName, ...stats }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit)
  },
}

// Analytics Services
export const analyticsService = {
  async getDashboardMetrics() {
    const [products, todaysSales] = await Promise.all([productService.getAll(), salesService.getTodaysSales()])

    const todaysRevenue = todaysSales.reduce((total, sale) => total + sale.totalAmount, 0)
    const lowStockCount = products.filter((product) => product.stock <= 10).length

    return {
      totalProducts: products.length,
      todaysRevenue,
      todaysSalesCount: todaysSales.length,
      lowStockCount,
    }
  },

  async getSalesAnalytics(days = 30) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const sales = await salesService.getSalesByDateRange(startDate, endDate)
    const totalRevenue = sales.reduce((total, sale) => total + sale.totalAmount, 0)
    const averageDailyRevenue = totalRevenue / days

    return {
      totalRevenue,
      totalSales: sales.length,
      averageDailyRevenue,
      sales,
    }
  },
}
