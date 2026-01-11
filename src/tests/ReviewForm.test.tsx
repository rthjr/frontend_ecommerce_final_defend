import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ReviewForm from '../components/products/ReviewForm'

// Mock API and Toast
const mockCreateReviewWrapper = {
    unwrap: vi.fn().mockResolvedValue({})
}
const mockCreateReview = vi.fn().mockReturnValue(mockCreateReviewWrapper)

vi.mock('../lib/redux/api/productsApi', () => ({
    useCreateReviewMutation: () => [mockCreateReview, { isLoading: false }]
}))

import { toast } from 'sonner' // Import correctly to spy or use mock?
// Actually, since we mocked the module, we need to import the mocked version to make assertions?
// Or we can just use the mock object if we exported it?
// Easier to verify calls on the imported module if mocked.

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn()
    }
}))

describe('ReviewForm', () => {
    it('opens dialog when button is clicked', async () => {
        render(<ReviewForm productId="1" />)
        
        const openButton = screen.getByText('Write a Review')
        fireEvent.click(openButton)
        
        await waitFor(() => {
            expect(screen.getByPlaceholderText('Share your thoughts...')).toBeVisible()
        })
    })

    it('shows validation error when submitting empty form', async () => {
         render(<ReviewForm productId="1" />)
         fireEvent.click(screen.getByText('Write a Review'))
         
         // Wait for dialog
         await waitFor(() => {
            expect(screen.getByText('Submit Review')).toBeVisible()
         })

         const submitButton = screen.getByText('Submit Review')
         fireEvent.click(submitButton)

         expect(toast.error).toHaveBeenCalledWith('Please select a rating')
    })
})
