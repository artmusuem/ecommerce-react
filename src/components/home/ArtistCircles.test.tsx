import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ArtistCircles, type ArtistCircle } from './ArtistCircles'

const mockArtists: ArtistCircle[] = [
  {
    name: 'Winslow Homer',
    handle: 'winslow-homer',
    image: 'https://example.com/homer.jpg',
    productCount: 5,
  },
  {
    name: 'Thomas Cole',
    handle: 'thomas-cole',
    image: 'https://example.com/cole.jpg',
    productCount: 3,
  },
]

describe('ArtistCircles', () => {
  it('should render artist circles when artists are provided', () => {
    const handleSelect = vi.fn()
    render(
      <ArtistCircles
        artists={mockArtists}
        selectedArtist={null}
        onSelect={handleSelect}
      />
    )

    expect(screen.getByText('Browse by Artist')).toBeInTheDocument()
    expect(screen.getByText('Winslow Homer')).toBeInTheDocument()
    expect(screen.getByText('Thomas Cole')).toBeInTheDocument()
  })

  it('should render nothing when no artists provided', () => {
    const handleSelect = vi.fn()
    const { container } = render(
      <ArtistCircles
        artists={[]}
        selectedArtist={null}
        onSelect={handleSelect}
      />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('should display product count for each artist', () => {
    const handleSelect = vi.fn()
    render(
      <ArtistCircles
        artists={mockArtists}
        selectedArtist={null}
        onSelect={handleSelect}
      />
    )

    expect(screen.getByText('5 prints')).toBeInTheDocument()
    expect(screen.getByText('3 prints')).toBeInTheDocument()
  })

  it('should call onSelect with artist handle when clicked', async () => {
    const user = userEvent.setup()
    const handleSelect = vi.fn()
    render(
      <ArtistCircles
        artists={mockArtists}
        selectedArtist={null}
        onSelect={handleSelect}
      />
    )

    await user.click(screen.getByText('Winslow Homer'))
    expect(handleSelect).toHaveBeenCalledWith('winslow-homer')
  })

  it('should toggle selection when clicking selected artist (deselect)', async () => {
    const user = userEvent.setup()
    const handleSelect = vi.fn()
    render(
      <ArtistCircles
        artists={mockArtists}
        selectedArtist="winslow-homer"
        onSelect={handleSelect}
      />
    )

    // Clicking the selected artist should deselect (call with empty string)
    await user.click(screen.getByText('Winslow Homer'))
    expect(handleSelect).toHaveBeenCalledWith('')
  })

  it('should show hint text when artist is selected', () => {
    const handleSelect = vi.fn()
    render(
      <ArtistCircles
        artists={mockArtists}
        selectedArtist="winslow-homer"
        onSelect={handleSelect}
      />
    )

    expect(screen.getByText('Click artist again to show all')).toBeInTheDocument()
  })

  it('should not show hint text when no artist is selected', () => {
    const handleSelect = vi.fn()
    render(
      <ArtistCircles
        artists={mockArtists}
        selectedArtist={null}
        onSelect={handleSelect}
      />
    )

    expect(screen.queryByText('Click artist again to show all')).not.toBeInTheDocument()
  })

  it('should visually highlight selected artist', () => {
    const handleSelect = vi.fn()
    render(
      <ArtistCircles
        artists={mockArtists}
        selectedArtist="winslow-homer"
        onSelect={handleSelect}
      />
    )

    // The selected artist button should have scale-105 class
    const selectedButton = screen.getByText('Winslow Homer').closest('button')
    expect(selectedButton).toHaveClass('scale-105')
  })

  it('should render artist images with correct alt text', () => {
    const handleSelect = vi.fn()
    render(
      <ArtistCircles
        artists={mockArtists}
        selectedArtist={null}
        onSelect={handleSelect}
      />
    )

    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(2)
    expect(images[0]).toHaveAttribute('alt', 'Winslow Homer')
    expect(images[1]).toHaveAttribute('alt', 'Thomas Cole')
  })

  it('should handle singular print count', () => {
    const handleSelect = vi.fn()
    const singleArtist: ArtistCircle[] = [
      {
        name: 'Test Artist',
        handle: 'test-artist',
        image: 'https://example.com/test.jpg',
        productCount: 1,
      },
    ]
    render(
      <ArtistCircles
        artists={singleArtist}
        selectedArtist={null}
        onSelect={handleSelect}
      />
    )

    expect(screen.getByText('1 print')).toBeInTheDocument()
  })
})
