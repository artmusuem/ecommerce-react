import { useState } from 'react'
import { frames, sizes, calculatePrice } from '../../data/products'

export default function FrameSelector({ 
  product, 
  selectedSize, 
  selectedFrame, 
  onSizeChange, 
  onFrameChange,
  onImageClick 
}) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const price = calculatePrice(selectedSize, selectedFrame)
  const frame = frames.find(f => f.id === selectedFrame)

  return (
    <div className="space-y-6">
      {/* Frame Preview */}
      <div className="flex justify-center">
        <div 
          className="relative transition-all duration-300 cursor-zoom-in group"
          style={{ 
            padding: '16px',
            backgroundColor: frame?.color,
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.15), 0 10px 40px rgba(0,0,0,0.2)'
          }}
          onClick={onImageClick}
        >
          <div className="bg-white p-1 shadow-inner relative">
            <div className="relative w-56 h-56 sm:w-72 sm:h-72 bg-stone-100">
              {!imageLoaded && (
                <div className="absolute inset-0 image-loading" />
              )}
              <img
                src={product.image}
                alt={product.title}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
              />
              {/* Zoom hint */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-80 transition-opacity drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Size Selector */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-3">
          Print Size
        </label>
        <div className="grid grid-cols-2 gap-2">
          {sizes.map((size) => (
            <button
              key={size.id}
              onClick={() => onSizeChange(size.id)}
              className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                selectedSize === size.id
                  ? 'border-stone-800 bg-stone-800 text-white'
                  : 'border-stone-200 hover:border-stone-400 text-stone-700 bg-white'
              }`}
            >
              {size.name}
              <span className={`block text-xs mt-0.5 ${
                selectedSize === size.id ? 'text-stone-300' : 'text-stone-400'
              }`}>
                ${size.basePrice}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Frame Selector */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-3">
          Frame Style
        </label>
        <div className="grid grid-cols-2 gap-2">
          {frames.map((frameOption) => (
            <button
              key={frameOption.id}
              onClick={() => onFrameChange(frameOption.id)}
              className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all flex items-center gap-3 ${
                selectedFrame === frameOption.id
                  ? 'border-stone-800 bg-stone-50'
                  : 'border-stone-200 hover:border-stone-400 bg-white'
              }`}
            >
              <span 
                className="w-6 h-6 rounded border border-stone-300 shadow-inner flex-shrink-0"
                style={{ backgroundColor: frameOption.color }}
              />
              <span className="flex-1 text-left">
                <span className="block text-stone-800">{frameOption.name}</span>
                {frameOption.priceAdd > 0 && (
                  <span className="text-xs text-stone-400">+${frameOption.priceAdd}</span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Display */}
      <div className="pt-4 border-t border-stone-200">
        <div className="flex items-center justify-between">
          <span className="text-stone-600">Total</span>
          <span className="text-3xl font-display font-semibold text-stone-800">${price}</span>
        </div>
        <p className="text-xs text-stone-400 mt-2">
          Free shipping on orders over $100
        </p>
      </div>
    </div>
  )
}
