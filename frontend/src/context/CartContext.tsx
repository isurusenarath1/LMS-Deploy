import React, { createContext, useContext, useEffect, useState } from 'react'

export type CartItem = {
  id: string
  name: string
  batchYear: string
  monthId: string
  price: number // in LKR
  currency?: string
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (monthId: string) => void
  clear: () => void
  count: number
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem('cart')
      return raw ? JSON.parse(raw) : []
    } catch (e) {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addItem = (item: CartItem) => {
    setItems(prev => {
      // replace if monthId exists
      const exist = prev.find(p => p.monthId === item.monthId)
      if (exist) return prev.map(p => p.monthId === item.monthId ? item : p)
      return [...prev, item]
    })
  }

  const removeItem = (monthId: string) => {
    setItems(prev => prev.filter(i => i.monthId !== monthId))
  }

  const clear = () => setItems([])

  const count = items.length
  const total = items.reduce((s, i) => s + (i.price || 0), 0)

  return <CartContext.Provider value={{ items, addItem, removeItem, clear, count, total }}>{children}</CartContext.Provider>
}
