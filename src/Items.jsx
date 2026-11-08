
import { useState } from 'react'
import './Items.css'

function Items({ items, onBack }) {
  const [messages, setMessages] = useState({})
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const handleRequest = async (itemId) => {
    try {
      const token = sessionStorage.getItem('token')

      if (!token) {
        setMessages(prev => ({
          ...prev,
          [itemId]: 'Please login first.'
        }))
        return
      }

      const response = await fetch(
        `http://localhost:5000/api/contact-requests/${itemId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const result = await response.json()

      setMessages(prev => ({
        ...prev,
        [itemId]: result.message
      }))

    } catch (error) {
      setMessages(prev => ({
        ...prev,
        [itemId]: 'Unable to connect to server.'
      }))
    }
  }

  const categories = [
    ...new Set(items.map(item => item.category).filter(Boolean))
  ]

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesType =
      typeFilter === 'all' || item.type === typeFilter

    const matchesCategory =
      categoryFilter === 'all' || item.category === categoryFilter

    return matchesSearch && matchesType && matchesCategory
  })

  return (
    <div className="items-container">

      <div className="items-header">
        <button onClick={onBack}>← Back</button>
        <h1>Lost & Found Items</h1>
        <p>Find items and contact the students who reported them.</p>
      </div>

      {/* Search and Filters */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        margin: '20px 0'
      }}>

        <input
          type="text"
          placeholder="Search item by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '12px',
            flex: '1',
            minWidth: '180px',
            borderRadius: '8px',
            border: '1px solid #ccc'
          }}
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ padding: '12px', borderRadius: '8px' }}
        >
          <option value="all">All Items</option>
          <option value="lost">Lost Items</option>
          <option value="found">Found Items</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: '12px', borderRadius: '8px' }}
        >
          <option value="all">All Categories</option>

          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

      </div>

      <div className="items-list">

        {items.length === 0 ? (
          <div className="empty-message">
            <h2>No Items Available</h2>
            <p>No lost or found items have been reported yet.</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-message">
            <h2>No Matching Items</h2>
            <p>Try changing your search or filters.</p>
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <div className="item-card" key={item._id || index}>

              <span className={item.type === 'lost' ? 'lost-tag' : 'found-tag'}>
                {item.type.toUpperCase()}
              </span>

              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="item-preview"
                />
              )}

              <h2>{item.name}</h2>
              <p><strong>Category:</strong> {item.category}</p>
              <p><strong>Description:</strong> {item.description}</p>
              <p><strong>Date:</strong> {item.date}</p>
              <p><strong>Location:</strong> {item.location}</p>

              <div className="contact-details">
                <h3>Contact Information Protected</h3>
                <p>
                  Contact details are private until the reporter approves your request.
                </p>

                <button
                  className="contact-button"
                  onClick={() => handleRequest(item._id)}
                  disabled={!item._id}
                >
                  Request Contact
                </button>

                {messages[item._id] && (
                  <p>{messages[item._id]}</p>
                )}
              </div>

            </div>
          ))
        )}

      </div>
    </div>
  )
}

export default Items
