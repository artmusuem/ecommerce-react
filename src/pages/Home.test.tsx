import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from './Home'
import { CartProvider } from '../context/CartContext'
import type { ReactNode } from 'react'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock Cloudinary
vi.stubEnv('VITE_CLOUDINARY_CLOUD', 'test-cloud')

// Test wrapper
function TestWrapper({ children, initialRoute = '/' }: { children: ReactNode; initialRoute?: string }) {
  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <CartProvider>
        {children}
      </CartProvider>
    </MemoryRouter>
  )
}

// Mock artwork response
const mockArtworkResponse = {
  artworks: [
    {
      title: 'The Gulf Stream',
      artist: 'Homer, Winslow',
      year_created: '1899',
      medium: 'Oil on canvas',
      image: 'https://ids.si.edu/ids/deliveryService?id=SAAM-1967.66.3_1',
      description: 'A dramatic seascape',
      smithsonian_id: 'saam-1967.66.3',
      museum: 'Smithsonian American Art Museum',
      accession_number: '1967.66.3',
      object_type: 'Painting'
    },
    {
      title: 'Breezing Up',
      artist: 'Homer, Winslow',
      year_created: '1876',
      medium: 'Oil on canvas',
      image: 'https://ids.si.edu/ids/deliveryService?id=SAAM-12345',
      description: 'A sailing scene',
      smithsonian_id: 'saam-12345',
      museum: 'Smithsonian American Art Museum',
      accession_number: '12345',
      object_type: 'Painting'
    }
  ]
}

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockArtworkResponse)
    })
  })

  describe('Initial Render', () => {
    it('should render default artist (Winslow Homer)', async () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Winslow Homer')
      })
    })

    it('should show artist life dates', async () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByText(/American, 1836/)).toBeInTheDocument()
      })
    })

    it('should fetch artwork on mount', async () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/data/winslow-homer.json')
      })
    })
  })

  describe('Artist Selection', () => {
    it('should render artist dropdown', async () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )
      
      await waitFor(() => {
        const select = screen.getByRole('combobox')
        expect(select).toBeInTheDocument()
      })
    })

    it('should have all artists in dropdown', async () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Winslow Homer' })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: 'Mary Cassatt' })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: 'Thomas Cole' })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: 'Frederic Remington' })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: "Georgia O'Keeffe" })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: 'Edward Hopper' })).toBeInTheDocument()
      })
    })

    it('should change artist when dropdown changes', async () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Winslow Homer')
      })
      
      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'edward-hopper' } })
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Edward Hopper')
        expect(mockFetch).toHaveBeenCalledWith('/data/edward-hopper.json')
      })
    })

    it('should respect artist from URL param', async () => {
      render(
        <TestWrapper initialRoute="/?artist=mary-cassatt">
          <Home />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Mary Cassatt')
        expect(mockFetch).toHaveBeenCalledWith('/data/mary-cassatt.json')
      })
    })
  })

  describe('Product Grid', () => {
    it('should render products after loading', async () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByText('The Gulf Stream')).toBeInTheDocument()
        expect(screen.getByText('Breezing Up')).toBeInTheDocument()
      })
    })

    it('should show product count badge', async () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByText('2 prints')).toBeInTheDocument()
      })
    })

    it('should filter out products without images', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          artworks: [
            { title: 'Has Image', artist: 'Test', image: 'http://example.com/img.jpg' },
            { title: 'No Image', artist: 'Test', image: '' },
            { title: 'Also Has Image', artist: 'Test', image: 'http://example.com/img2.jpg' }
          ]
        })
      })
      
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByText('Has Image')).toBeInTheDocument()
        expect(screen.getByText('Also Has Image')).toBeInTheDocument()
        expect(screen.queryByText('No Image')).not.toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should show error message on fetch failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load artwork. Please try again.')).toBeInTheDocument()
      })
    })

    it('should show error on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      })
      
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load artwork. Please try again.')).toBeInTheDocument()
      })
    })

    it('should show Try Again button on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument()
      })
    })
  })

  describe('Empty State', () => {
    it('should show empty message when no artwork found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ artworks: [] })
      })
      
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByText('No artwork found for this artist.')).toBeInTheDocument()
      })
    })
  })

  describe('Footer', () => {
    it('should render footer with store name', async () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByText('Gallery Store')).toBeInTheDocument()
      })
    })

    it('should have Smithsonian Open Access link', async () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )
      
      await waitFor(() => {
        const link = screen.getByRole('link', { name: 'Smithsonian Open Access' })
        expect(link).toHaveAttribute('href', 'https://www.si.edu/openaccess')
        expect(link).toHaveAttribute('target', '_blank')
      })
    })

    it('should show free shipping message', async () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByText(/Free shipping on orders \$100\+/)).toBeInTheDocument()
      })
    })
  })
})
