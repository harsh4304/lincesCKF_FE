// src/api/ordersApi.js
// All order-related API calls using the real backend.

import apiClient from './apiClient'

/** Create a Stripe PaymentIntent. Returns { clientSecret, paymentIntentId }. */
export const createPaymentIntent = (amount, currency = 'usd') =>
  apiClient.post('/orders/payment-intent', { amount, currency })

/** Create order row after Stripe confirms payment. */
export const createOrder = (payload) =>
  apiClient.post('/orders', payload)

/** Get all orders (customer: own, admin: all). */
export const getOrders = (params = {}) =>
  apiClient.get('/orders', { params })

/** Get single order with items. */
export const getOrderById = (id) =>
  apiClient.get(`/orders/${id}`)

/** Admin: advance order status. */
export const updateOrderStatus = (id, status) =>
  apiClient.patch(`/orders/${id}/status`, { status })

/** Cancel an order. */
export const cancelOrder = (id) =>
  apiClient.delete(`/orders/${id}`)