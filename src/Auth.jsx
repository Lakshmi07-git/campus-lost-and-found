
import { useState } from 'react'
import './Auth.css'

function Auth({ onBack }) {
  const [isLogin, setIsLogin] = useState(true)
  const [fullName, setFullName] = useState('')
  const [rollNumber, setRollNumber] = useState('')
  const [collegeEmail, setCollegeEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    const url = isLogin
      ? 'http://localhost:5000/api/auth/login'
      : 'http://localhost:5000/api/auth/register'

    const data = isLogin
      ? { collegeEmail, password }
      : { fullName, rollNumber, collegeEmail, password }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        setMessage(result.message || 'Something went wrong')
        return
      }

      // Save login information for future API requests
      sessionStorage.setItem('token', result.token)
      sessionStorage.setItem('user', JSON.stringify(result.user))

      setMessage(result.message)

      onBack('dashboard')

    } catch (error) {
      setMessage('Cannot connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <button className="back-btn" onClick={() => onBack('home')}>
        ← Back to Home
      </button>

      <div className="auth-box">
        <h1>{isLogin ? 'Welcome Back!' : 'Create Account'}</h1>

        <p>
          {isLogin
            ? 'Login to your CampusFind account'
            : 'Register to join CampusFind'}
        </p>

        <form onSubmit={handleSubmit}>

          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="College Roll Number"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                required
              />
            </>
          )}

          <input
            type="email"
            placeholder="College Email ID"
            value={collegeEmail}
            onChange={(e) => setCollegeEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength="6"
            required
          />

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : isLogin ? 'Login' : 'Register'}
          </button>

        </form>

        {message && <p>{message}</p>}

        <p className="switch-text">
          {isLogin
            ? "Don't have an account?"
            : 'Already have an account?'}

          <span onClick={() => {
            setIsLogin(!isLogin)
            setMessage('')
          }}>
            {isLogin ? ' Register' : ' Login'}
          </span>
        </p>
      </div>
    </div>
  )
}

export default Auth
