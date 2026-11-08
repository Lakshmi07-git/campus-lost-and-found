
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Authentication routes
const authRoutes = require('./routes/auth')
app.use('/api/auth', authRoutes)

// Lost and Found item routes
const itemRoutes = require('./routes/items')
app.use('/api/items', itemRoutes)
const contactRequestRoutes = require('./routes/contactRequests')
app.use('/api/contact-requests', contactRequestRoutes)
// Test route
app.get('/', (req, res) => {
  res.send('CampusFind Backend is Running!')
})

// Connect database and start server
const PORT = process.env.PORT || 5000

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully!')

    app.listen(PORT, () => {
      console.log(`CampusFind server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.log('MongoDB Connection Error:', error.message)
  })
