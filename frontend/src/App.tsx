import React from 'react';
import { AppRouter } from './AppRouter';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'sonner';
export function App() {
  return <AuthProvider>
      <CartProvider>
        <AppRouter />
        <Toaster position="top-right" richColors />
      </CartProvider>
    </AuthProvider>;
}