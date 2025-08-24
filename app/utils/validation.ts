export const validateProduct = (formData: any) => {
  const errors: string[] = []

  if (!formData.name?.trim()) {
    errors.push("Product name is required")
  }

  if (!formData.category?.trim()) {
    errors.push("Category is required")
  }

  if (!formData.stock?.trim()) {
    errors.push("Stock quantity is required")
  } else {
    const stockNum = Number.parseInt(formData.stock)
    if (isNaN(stockNum) || stockNum < 0) {
      errors.push("Please enter a valid stock quantity")
    }
  }

  if (!formData.retailPrice?.trim()) {
    errors.push("Retail price is required")
  } else {
    const retailNum = Number.parseFloat(formData.retailPrice)
    if (isNaN(retailNum) || retailNum <= 0) {
      errors.push("Please enter a valid retail price")
    }
  }

  return errors
}

export const validateSale = (saleData: any, selectedProduct: any) => {
  const errors: string[] = []

  if (!selectedProduct) {
    errors.push("Please select a product")
  }

  if (!saleData.quantity?.trim()) {
    errors.push("Quantity is required")
  } else {
    const quantity = Number.parseInt(saleData.quantity)
    if (isNaN(quantity) || quantity <= 0) {
      errors.push("Please enter a valid quantity")
    } else if (selectedProduct && quantity > selectedProduct.stock) {
      errors.push(`Only ${selectedProduct.stock} units available`)
    }
  }

  return errors
}

export const formatCurrency = (amount: number) => {
  return `₵${amount.toFixed(2)}`
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

export const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString()
}
