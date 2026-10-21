// src/api/quotesApi.js
import apiClient from './apiClient'

export const getQuotes     = ()         => apiClient.get('/quotes')
export const getQuoteById  = (id)       => apiClient.get(`/quotes/${id}`)
export const createQuote   = (payload)  => apiClient.post('/quotes', payload)
export const updateQuote   = (id, data) => apiClient.patch(`/quotes/${id}`, data)