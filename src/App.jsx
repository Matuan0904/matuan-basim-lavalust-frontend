import { useState } from 'react'
import './App.css'

const API_URL = 'https://matuan-basim-lavalust.onrender.com';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [products, setProducts] = useState([])
  const [showLogin, setShowLogin] = useState(!token)

  const [productName, setProductName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const login = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.')
      }

      const accessToken = data.tokens.access_token

      localStorage.setItem('token', accessToken)
      setToken(accessToken)
      setShowLogin(false)
      setMessage('Login successful.')

      setUsername('')
      setPassword('')

      loadProducts(accessToken)
    } catch (err) {
      setError(err.message)
    }
  }

  const loadProducts = async (currentToken = token) => {
    try {
      const response = await fetch(`${API_URL}/api/products`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load products.')
      }

      setProducts(data.data || [])
    } catch (err) {
      setError(err.message)
    }
  }

  const saveProduct = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    const productData = {
      product_name: productName,
      description,
      price: Number(price),
      quantity: Number(quantity),
    }

    try {
      const url = editingId
        ? `${API_URL}/api/products/${editingId}`
        : `${API_URL}/api/products`

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save product.')
      }

      setMessage(
        editingId
          ? 'Product updated successfully.'
          : 'Product added successfully.'
      )

      clearForm()
      loadProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  const editProduct = (product) => {
    setEditingId(product.id)
    setProductName(product.product_name)
    setDescription(product.description || '')
    setPrice(product.price)
    setQuantity(product.quantity)
    setMessage('')
    setError('')
  }

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to delete product.')
      }

      setMessage('Product deleted successfully.')
      loadProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  const clearForm = () => {
    setEditingId(null)
    setProductName('')
    setDescription('')
    setPrice('')
    setQuantity('')
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken('')
    setProducts([])
    setShowLogin(true)
    setMessage('Logged out successfully.')
  }

  if (showLogin) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>Product Management</h1>
          <p className="subtitle">LavaLust API + React</p>

          {error && <div className="alert error">{error}</div>}
          {message && <div className="alert success">{message}</div>}

          <form onSubmit={login}>
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />

            <button type="submit" className="primary-button">
              Login
            </button>
          </form>

          <p className="demo-account">
            Demo account: <strong>admin</strong> / <strong>admin123</strong>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Product Management System</h1>
          <p>LavaLust REST API + React</p>
        </div>

        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </header>

      <main className="container">
        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}

        <section className="card">
          <div className="card-header">
            <h2>{editingId ? 'Edit Product' : 'Add Product'}</h2>

            {editingId && (
              <button onClick={clearForm} className="cancel-button">
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={saveProduct} className="product-form">
            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter product description"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <button type="submit" className="primary-button">
              {editingId ? 'Update Product' : 'Add Product'}
            </button>
          </form>
        </section>

        <section className="card">
          <div className="card-header">
            <h2>Products</h2>

            <button
              onClick={() => loadProducts()}
              className="refresh-button"
            >
              Refresh
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product Name</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>{product.product_name}</td>
                      <td>{product.description}</td>
                      <td>₱{Number(product.price).toLocaleString()}</td>
                      <td>{product.quantity}</td>
                      <td>
                        <button
                          onClick={() => editProduct(product)}
                          className="edit-button"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="delete-button"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App