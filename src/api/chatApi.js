// src/api/chatApi.js
import apiClient from './apiClient'

export const getConversations   = ()              => apiClient.get('/chat/conversations')
export const getOrCreateConvo   = ()              => apiClient.post('/chat/conversations')
export const getMessages        = (convId)        => apiClient.get(`/chat/conversations/${convId}/messages`)
export const sendMessage        = (convId, message) => apiClient.post(`/chat/conversations/${convId}/messages`, { message })