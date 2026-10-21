// src/api/productsApi.js
// All product-related API calls — uses the real backend via Axios.
// Image uploads use FormData (multipart/form-data) so multer on the backend
// can parse the file buffer.

import apiClient from './apiClient'

// ── Read (public) ─────────────────────────────────────────────────────────────

/** Get all products. Admin can pass { all: true } to include inactive ones. */
export const fetchProducts = (params = {}) =>
  apiClient.get('/products', { params })

/** Get a single product by ID with both translations. */
export const fetchProductById = (id) =>
  apiClient.get(`/products/${id}`)

/** Get all categories (for filter dropdowns). */
export const fetchCategories = () =>
  apiClient.get('/products/categories')

// ── Write (admin only) ────────────────────────────────────────────────────────

/**
 * Create a new product.
 * Sends multipart/form-data so the image file is included.
 * @param {FormData} formData
 */
export const createProduct = (formData) =>
  apiClient.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

/**
 * Full update of a product (PUT).
 * @param {number|string} id
 * @param {FormData} formData
 */
export const updateProduct = (id, formData) =>
  apiClient.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

/**
 * Partial update of a product (PATCH).
 * Used for quick field changes (e.g. toggle isActive, update stock).
 * @param {number|string} id
 * @param {object|FormData} data
 */
export const patchProduct = (id, data) => {
  const isFormData = data instanceof FormData
  return apiClient.patch(`/products/${id}`, data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  })
}

/**
 * Delete a product.
 * Soft-delete by default; pass hard=true to permanently remove.
 * @param {number|string} id
 * @param {boolean} hard
 */
export const deleteProduct = (id, hard = false) =>
  apiClient.delete(`/products/${id}`, { params: hard ? { hard: 'true' } : {} })