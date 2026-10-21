// src/api/contactApi.js
import apiClient from './apiClient'

export const submitContact    = (payload)       => apiClient.post('/contact', payload)
export const getContactMessages = (params = {}) => apiClient.get('/contact', { params })
export const updateContact    = (id, data)      => apiClient.patch(`/contact/${id}`, data)
export const deleteContact    = (id)            => apiClient.delete(`/contact/${id}`)

export const replyToContact = (id, replyText) => apiClient.post(`/contact/${id}/reply`, { replyText })