import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Home from './pages/Home'
import Product from './pages/Product'
import Checkout from './pages/Checkout'
import Cart from './components/cart/Cart'

function App() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <Cart />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </div>
  )
}

export default App
