import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CartDrawer from '../components/cart/CartDrawer'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import cartReducer from '../lib/redux/slices/cartSlice'
import uiReducer from '../lib/redux/slices/uiSlice'

const createMockStore = (initialState = {}) => {
    return configureStore({
        reducer: {
            cart: cartReducer,
            ui: uiReducer
        },
        preloadedState: initialState
    })
}

describe('CartDrawer', () => {
    it('renders empty cart message initially', () => {
        const store = createMockStore({
             ui: { isCartDrawerOpen: true },
             cart: { items: [], totalPrice: 0 }
        })
        
        render(
            <Provider store={store}>
                <CartDrawer />
            </Provider>
        )
        expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
    })

    it('renders items and allows checkout navigation', () => {
         const store = createMockStore({
             ui: { isCartDrawerOpen: true },
             cart: { 
                 items: [{ productId: '1', name: 'Test Product', price: 50, quantity: 2, image: '/test.jpg' }], 
                 totalPrice: 100 
             }
        })

        render(
            <Provider store={store}>
                <CartDrawer />
            </Provider>
        )
        
        expect(screen.getByText('Test Product')).toBeInTheDocument()
        
        // Check for checkout button
        const checkoutLink = screen.getByRole('link', { name: /checkout/i })
        expect(checkoutLink).toHaveAttribute('href', '/checkout')
    })
})
