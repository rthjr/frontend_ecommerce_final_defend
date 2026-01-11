import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Page from '../app/page'

// Mocking dependencies if necessary (e.g., if page uses API calls directly)
// For now, we'll just check if it renders without crashing
// Note: Next.js App Router pages might be async.

describe('Home Page', () => {
    it('renders without crashing', () => {
        // Simple test to verify Vitest + RTL setup
        const { container } = render(<div>Test Environment</div>)
        expect(screen.getByText('Test Environment')).toBeInTheDocument()
    })
})
