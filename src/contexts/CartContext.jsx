// src/contexts/CartContext.jsx
// Cart stores items keyed by composite: `${id}-${selectedColor}-${selectedSize}`
// This means:
//   • Same product in different colors/sizes = separate line items
//   • Same product + same color + same size = quantity incremented
//
// Each cart item shape:
//   {
//     cartKey:          string,    // composite key (internal use)
//     id:               string,    // product id
//     name:             string,
//     nameEs:           string,
//     price:            number,    // cents
//     imageUrl:         string,    // Cloudinary URL or null
//     selectedColor:    string,    // color name, e.g. "Ivory"
//     selectedColorHex: string,    // hex value, e.g. "#FFFFF0"
//     selectedSize:     string,    // size string, e.g. "M"
//     quantity:         number,
//   }

import { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext(null)

// Build composite key from item fields
const makeKey = (id, color, size) =>
  `${id}-${color || ''}-${size || ''}`

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const s = localStorage.getItem('linces_cart')
      return s ? JSON.parse(s) : []
    } catch { return [] }
  })

  const persist = (items) => {
    setCart(items)
    try { localStorage.setItem('linces_cart', JSON.stringify(items)) } catch {}
  }

  // Add or increment — matches on composite key
  const addToCart = useCallback((item) => {
    const key = makeKey(item.id, item.selectedColor, item.selectedSize)
    setCart(prev => {
      const exists = prev.find(i => i.cartKey === key)
      let updated
      if (exists) {
        updated = prev.map(i =>
          i.cartKey === key
            ? { ...i, quantity: (i.quantity || 1) + (item.quantity || 1) }
            : i
        )
      } else {
        updated = [...prev, { ...item, cartKey: key, quantity: item.quantity || 1 }]
      }
      try { localStorage.setItem('linces_cart', JSON.stringify(updated)) } catch {}
      return updated
    })
  }, [])

  // updateQuantity uses cartKey (the composite key)
  const updateQuantity = useCallback((cartKey, qty) => {
    if (qty < 1) return
    setCart(prev => {
      const updated = prev.map(i =>
        i.cartKey === cartKey ? { ...i, quantity: qty } : i
      )
      try { localStorage.setItem('linces_cart', JSON.stringify(updated)) } catch {}
      return updated
    })
  }, [])

  // removeFromCart uses cartKey
  const removeFromCart = useCallback((cartKey) => {
    setCart(prev => {
      const updated = prev.filter(i => i.cartKey !== cartKey)
      try { localStorage.setItem('linces_cart', JSON.stringify(updated)) } catch {}
      return updated
    })
  }, [])

  const clearCart = useCallback(() => {
    try { localStorage.removeItem('linces_cart') } catch {}
    setCart([])
  }, [])

  const getCartCount = useCallback(() =>
    cart.reduce((s, i) => s + (i.quantity || 1), 0), [cart])

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, getCartCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}