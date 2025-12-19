import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from './Home'
import { CartProvider } from '../context/CartContext'

// Mock Cloudinary environment
vi.stubEnv('VITE_CLOUDINARY_CLOUD', 'test-cloud')

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

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
      smithsonian_id: 'saam-1967.66.3'
    },
    {
      title: 'Breezing Up',
      artist: 'Homer, Winslow',
      year_created: '1876',
      medium: 'Oil on canvas',
      image: 'https://ids.si.edu/ids/deliveryService?id=SAAM-12345',
      description: 'A sailing scene',
      smithsonian_id: 'saam-12345'
    }
  ]
}

function renderHome(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <CartProvider>
        <Home />
      </CartProvider>
    </MemoryRouter>
  )
}

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockArtworkResponse)
    })
  })

  describe('artist info', () => {
    it('should render default artist name', async () => {
      renderHome()
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Winslow Homer')
      })
    })

    it('should show artist life dates', async () => {
      renderHome()
      
      await waitFor(() => {
        expect(screen.getByText(/American, 1836/)).toBeInTheDocument()
      })
    })
  })

  describe('artist selector', () => {
    it('should render artist dropdown', async () => {
      renderHome()
      
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument()
      })
    })

    it('should have all artists as options', async () => {
      renderHome()
      
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Winslow Homer' })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: 'Mary Cassatt' })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: 'Edward Hopper' })).toBeInTheDocument()
      })
    })

    it('should change artist on selection', async () => {
      renderHome()
      
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument()
      })
      
      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'mary-cassatt' } })
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Mary Cassatt')
      })
    })
  })

  describe('product grid', () => {
    it('should fetch artwork on mount', async () => {
      renderHome()
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/data/winslow-homer.json')
      })
    })

    it('should display products after loading', async () => {
      renderHome()
      
      await waitFor(() => {
        expect(screen.getByText('The Gulf Stream')).toBeInTheDocument()
        expect(screen.getByText('Breezing Up')).toBeInTheDocument()
      })
    })

    it('should show product count', async () => {
      renderHome()
      
      await waitFor(() => {
        expect(screen.getByText('2 prints')).toBeInTheDocument()
      })
    })
  })

  describe('error handling', () => {
    it('should show error on fetch failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      
      renderHome()
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load artwork. Please try again.')).toBeInTheDocument()
      })
    })

    it('should show Try Again button on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      
      renderHome()
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument()
      })
    })
  })

  describe('empty state', () => {
    it('should show message when no artwork found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ artworks: [] })
      })
      
      renderHome()
      
      await waitFor(() => {
        expect(screen.getByText('No artwork found for this artist.')).toBeInTheDocument()
      })
    })
  })

  describe('footer', () => {
    it('should render Gallery Store name', async () => {
      renderHome()
      
      await waitFor(() => {
        expect(screen.getByText('Gallery Store')).toBeInTheDocument()
      })
    })

    it('should have Smithsonian Open Access link', async () => {
      renderHome()
      
      await waitFor(() => {
        const link = screen.getByRole('link', { name: 'Smithsonian Open Access' })
        expect(link.getAttribute('href')).toBe('https://www.si.edu/openaccess')
      })
    })

    it('should show shipping message', async () => {
      renderHome()
      
      await waitFor(() => {
        expect(screen.getByText(/Free shipping on orders \$100\+/)).toBeInTheDocument()
      })
    })
  })

  describe('URL params', () => {
    it('should load artist from URL param', async () => {
      renderHome('/?artist=mary-cassatt')
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Mary Cassatt')
        expect(mockFetch).toHaveBeenCalledWith('/data/mary-cassatt.json')
      })
    })
  })
})
