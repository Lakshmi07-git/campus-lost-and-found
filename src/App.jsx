
import { useState, useEffect } from 'react'
import './App.css'
import Auth from './Auth'
import ItemForm from './ItemForm'
import Items from './Items'

function App() {
  const [page, setPage] = useState('home')
  const [items, setItems] = useState([])
  const [requests, setRequests] = useState([])
  const [myRequests, setMyRequests] = useState([])
  const [requestMessage, setRequestMessage] = useState('')
  const [contactDetails, setContactDetails] = useState({})
  const [loadingContact, setLoadingContact] = useState('')

  const token = sessionStorage.getItem('token')

  // Load items from MongoDB
  useEffect(() => {
    if (page === 'items') {
      fetch('https://campus-lost-and-found-items.onrender.com/api/items')
        .then(res => res.json())
        .then(data => setItems(Array.isArray(data) ? data : []))
        .catch(() => setItems([]))
    }
  }, [page])

  // Load incoming contact requests
  useEffect(() => {
    if (page === 'requests') {
      setRequestMessage('')

      fetch('https://campus-lost-and-found-items.onrender.com/api/contact-requests/incoming', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          setRequests(Array.isArray(data) ? data : [])
        })
        .catch(() => setRequestMessage('Unable to load requests'))
    }
  }, [page, token])

  // Load requests sent by this student
  useEffect(() => {
    if (page === 'my-requests') {
      setRequestMessage('')

     fetch('https://campus-lost-and-found-items.onrender.com/api/contact-requests/my-requests', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          setMyRequests(Array.isArray(data) ? data : [])
        })
        .catch(() => setRequestMessage('Unable to load your requests'))
    }
  }, [page, token])

  // Accept or reject contact requests
  const handleDecision = async (requestId, status) => {
    try {
      const response = await fetch(
        `https://campus-lost-and-found-items.onrender.com/api/contact-requests/${requestId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        }
      )

      const result = await response.json()
      setRequestMessage(result.message)

      if (response.ok) {
        setRequests(prev =>
          prev.map(request =>
            request._id === requestId
              ? { ...request, status }
              : request
          )
        )
      }
    } catch (error) {
      setRequestMessage('Unable to update request')
    }
  }

  // View contact details after approval
  const handleViewContact = async (requestId) => {
    setLoadingContact(requestId)
    setRequestMessage('')

    try {
      const response = await fetch(
        `https://campus-lost-and-found-items.onrender.com/api/contact-requests/${requestId}/contact`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const result = await response.json()

      if (response.ok) {
        setContactDetails(prev => ({
          ...prev,
          [requestId]: result.contact
        }))
      } else {
        setRequestMessage(result.message)
      }
    } catch (error) {
      setRequestMessage('Unable to fetch contact details')
    }

    setLoadingContact('')
  }

  if (page === 'login') {
    return (
      <Auth onBack={(nextPage) => setPage(nextPage || 'home')} />
    )
  }

  if (page === 'lost' || page === 'found') {
    return (
      <ItemForm
        type={page}
        onBack={() => setPage('dashboard')}
        onAddItem={(newItem) => {
          setItems(prev => [newItem, ...prev])
        }}
      />
    )
  }

  if (page === 'items') {
    return (
      <Items
        items={items}
        onBack={() => setPage('dashboard')}
      />
    )
  }

  // Incoming requests screen
  if (page === 'requests') {
    return (
      <div className="items-container">
        <div className="items-header">
          <button onClick={() => setPage('dashboard')}>
            ← Back
          </button>
          <h1>Incoming Contact Requests</h1>
          <p>Review requests from students interested in your items.</p>
        </div>

        {requestMessage && <p>{requestMessage}</p>}

        {requests.length === 0 ? (
          <h2>No contact requests received yet.</h2>
        ) : (
          requests.map(request => (
            <div className="item-card" key={request._id}>
              <h3>{request.item?.name || 'Item'}</h3>

              <p>
                <strong>Requested by:</strong>{' '}
                {request.requestedBy?.fullName}
              </p>

              <p>
                <strong>Roll Number:</strong>{' '}
                {request.requestedBy?.rollNumber}
              </p>

              <p>
                <strong>Status:</strong> {request.status}
              </p>

              {request.status === 'pending' && (
                <>
                  <button onClick={() =>
                    handleDecision(request._id, 'accepted')
                  }>
                    Accept
                  </button>

                  <button onClick={() =>
                    handleDecision(request._id, 'rejected')
                  }>
                    Reject
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    )
  }

  // My sent requests screen
  if (page === 'my-requests') {
    return (
      <div className="items-container">
        <div className="items-header">
          <button onClick={() => setPage('dashboard')}>
            ← Back
          </button>

          <h1>My Contact Requests</h1>
          <p>Track the requests you have sent.</p>
        </div>

        {requestMessage && <p>{requestMessage}</p>}

        {myRequests.length === 0 ? (
          <h2>You haven't sent any contact requests yet.</h2>
        ) : (
          myRequests.map(request => (
            <div className="item-card" key={request._id}>
              <h3>{request.item?.name || 'Item'}</h3>

              <p>
                <strong>Type:</strong> {request.item?.type}
              </p>

              <p>
                <strong>Location:</strong> {request.item?.location}
              </p>

              <p>
                <strong>Reported by:</strong>{' '}
                {request.itemReporter?.fullName || 'Student'}
              </p>

              <p>
                <strong>Status:</strong> {request.status.toUpperCase()}
              </p>

              {request.status === 'accepted' && (
                <>
                  {!contactDetails[request._id] ? (
                    <button
                      onClick={() => handleViewContact(request._id)}
                      disabled={loadingContact === request._id}
                    >
                      {loadingContact === request._id
                        ? 'Loading...'
                        : 'View Contact Details'}
                    </button>
                  ) : (
                    <div>
                      <h4>Approved Contact Details</h4>

                      <p>
                        <strong>Name:</strong>{' '}
                        {contactDetails[request._id].studentName}
                      </p>

                      <p>
                        <strong>Roll Number:</strong>{' '}
                        {contactDetails[request._id].rollNumber}
                      </p>

                      <p>
                        <strong>Email:</strong>{' '}
                        {contactDetails[request._id].email}
                      </p>

                      <p>
                        <strong>Mobile:</strong>{' '}
                        {contactDetails[request._id].mobile}
                      </p>
                    </div>
                  )}
                </>
              )}

              {request.status === 'pending' && (
                <p>Waiting for the reporter to approve your request.</p>
              )}

              {request.status === 'rejected' && (
                <p>Your contact request was rejected.</p>
              )}
            </div>
          ))
        )}
      </div>
    )
  }

  if (page === 'dashboard') {
    return (
      <div>
        <h1>Welcome to CampusFind!</h1>
        <h2>What would you like to do?</h2>

        <button onClick={() => setPage('lost')}>
          Report Lost Item
        </button>

        <button onClick={() => setPage('found')}>
          Report Found Item
        </button>

        <button onClick={() => setPage('items')}>
          View Lost & Found Items
        </button>

        <button onClick={() => setPage('requests')}>
          Incoming Contact Requests
        </button>

        <button onClick={() => setPage('my-requests')}>
          My Requests
        </button>

        <button onClick={() => {
          sessionStorage.removeItem('token')
          sessionStorage.removeItem('user')
          setPage('home')
        }}>
          Logout
        </button>
      </div>
    )
  }

  return (
    <div className="app">
      <nav className="navbar">
        <h2>Campus<span>Find</span></h2>

        <div className="nav-links">
          <a href="#" onClick={() => setPage('home')}>Home</a>
          <a href="#" onClick={() => setPage('login')}>Login</a>
        </div>

        <button className="report-btn" onClick={() => setPage('login')}>
          + Report Item
        </button>
      </nav>

      <section className="hero">
        <h1>Lost Something on Campus?</h1>
        <p>
          Don't worry! Find your lost belongings or
          help someone reunite with theirs.
        </p>

        <div className="hero-buttons">
          <button onClick={() => setPage('login')}>
            Report Lost Item
          </button>

          <button className="secondary" onClick={() => setPage('login')}>
            Report Found Item
          </button>
        </div>
      </section>

      <section className="features">
        <h2>How CampusFind Works</h2>

        <div className="feature-cards">
          <div className="card">
            <h3>🔍 Search Items</h3>
            <p>Search for belongings reported lost or found.</p>
          </div>

          <div className="card">
            <h3>📢 Report Items</h3>
            <p>Report items you have lost or found on campus.</p>
          </div>

          <div className="card">
            <h3>🤝 Get It Back</h3>
            <p>Connect with the owner and return their belongings.</p>
          </div>
        </div>
      </section>

      <footer>
        © 2026 CampusFind | Campus Lost and Found System
      </footer>
    </div>
  )
}

export default App
