// src/api/reviewsApi.js
// Reviews API — backend filters userId IS NOT NULL,
// so seed/anonymous reviews are never returned.

import apiClient from './apiClient'

/** Get real customer reviews for a product. */
export const getProductReviews = (productId) =>
  apiClient.get('/reviews', { params: { productId } })

/** Get reviews written by the current user. */
export const getMyReviews = () =>
  apiClient.get('/reviews', { params: { userId: 'me' } })

/** Check if current customer can review a product. */
export const canReview = (productId) =>
  apiClient.get(`/reviews/can-review/${productId}`)

/** Submit a review. */
export const createReview = (payload) =>
  apiClient.post('/reviews', payload)

/** Delete a review (own or admin). */
export const deleteReview = (id) =>
  apiClient.delete(`/reviews/${id}`)