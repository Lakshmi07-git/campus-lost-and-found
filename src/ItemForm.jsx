
import { useState } from 'react'
import './ItemForm.css'

function ItemForm({ type, onBack, onAddItem }) {
  const [item, setItem] = useState({
    name: '',
    category: '',
    description: '',
    date: '',
    location: '',
    studentName: '',
    rollNumber: '',
    email: '',
    mobile: '',
    image: ''
  })

  const [submitted, setSubmitted] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setItem({ ...item, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage('Please select a valid image.')
      e.target.value = ''
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage('Image must be smaller than 2 MB.')
      e.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setItem((previous) => ({
        ...previous,
        image: reader.result
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      const token = sessionStorage.getItem('token')

      if (!token) {
        setMessage('Please login before reporting an item.')
        return
      }

      const response = await fetch('http://localhost:5000/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: item.name,
          category: item.category,
          description: item.description,
          date: item.date,
          location: item.location,
          type,
          image: item.image,
          privateContact: {
            studentName: item.studentName,
            rollNumber: item.rollNumber,
            email: item.email,
            mobile: item.mobile
          }
        })
      })

      const result = await response.json()

      if (!response.ok) {
        setMessage(result.message || 'Failed to submit report.')
        return
      }

      onAddItem(result.item)
      setSubmitted(true)

    } catch (error) {
      setMessage('Cannot connect to backend. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="item-container">
        <div className="item-box">
          <div className="success-message">
            <h2>✓ Report Submitted Successfully!</h2>
            <p>Your {type} item report has been saved in CampusFind.</p>
          </div>
          <button onClick={onBack}>Back to Dashboard</button>
        </div>
      </div>
    )
  }

  return (
    <div className="item-container">
      <div className="item-box">
        <button onClick={onBack}>← Back</button>

        <h1>Report {type} Item</h1>
        <p>Provide the item details and your contact information.</p>

        <form onSubmit={handleSubmit}>
          <h3>Item Information</h3>

          <input name="name" placeholder="Item Name"
            value={item.name} onChange={handleChange} required />

          <select name="category" value={item.category}
            onChange={handleChange} required>
            <option value="">Select Category</option>
            <option>Electronics</option>
            <option>Books</option>
            <option>Clothing</option>
            <option>Accessories</option>
            <option>Other</option>
          </select>

          <textarea name="description" placeholder="Describe the item"
            value={item.description} onChange={handleChange} required />

          <label>{type} Date</label>
          <input type="date" name="date"
            value={item.date} onChange={handleChange} required />

          <input name="location" placeholder="Location in college"
            value={item.location} onChange={handleChange} required />

          <label>Upload Item Photo (Optional)</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />

          {item.image && (
            <img src={item.image} alt="Item preview" className="item-preview" />
          )}

          <h3>Student Contact Information</h3>

          <input name="studentName" placeholder="Your Full Name"
            value={item.studentName} onChange={handleChange} required />

          <input name="rollNumber" placeholder="College Roll Number"
            value={item.rollNumber} onChange={handleChange} required />

          <input type="email" name="email" placeholder="College Email ID"
            value={item.email} onChange={handleChange} required />

          <input type="tel" name="mobile" placeholder="Your Mobile Number"
            value={item.mobile} onChange={handleChange}
            pattern="[0-9]{10}" title="Enter a valid 10-digit mobile number"
            required />

          {message && <p style={{ color: 'red' }}>{message}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : `Submit ${type} Report`}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ItemForm
