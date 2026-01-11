import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ProductCard from '../components/products/ProductCard'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import cartReducer from '../lib/redux/slices/cartSlice'
import { Product } from '../lib/types'

// Mock the API hook
vi.mock('../lib/redux/api/cartApi', () => ({
    useAddToCartMutation: () => [vi.fn().mockImplementation(() => ({
        unwrap: () => Promise.resolve()
    }))]
}))

const mockProduct = {
    _id: '1',
    name: 'Test Product',
    price: 99.99,
    description: 'Test Desc',
    images: ['/test.jpg'],
    category: 'Test Cat',
    stockQuantity: 10,
    rating: 4.5,
    numReviews: 10,
    brand: 'Test Brand',
    countInStock: 10,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    isFeatured: false,
    banner: '',
    stock: 10
} as Product

const createMockStore = () => configureStore({
    reducer: { cart: cartReducer }
})

describe('ProductCard', () => {
    it('renders product details', () => {
        render(
            <Provider store={createMockStore()}>
                <ProductCard product={mockProduct} />
            </Provider>
        )
        expect(screen.getByText('Test Product')).toBeInTheDocument()
        expect(screen.getByText('$99.99')).toBeInTheDocument()
    })

    it('calls addToCart when button is clicked', () => {
        render(
            <Provider store={createMockStore()}>
                <ProductCard product={mockProduct} />
            </Provider>
        )
        
        const addToCartButton = screen.getAllByRole('button')[0]
        fireEvent.click(addToCartButton)

        // TODO: Assert dispatch or toast
    })
})
