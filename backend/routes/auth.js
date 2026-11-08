
const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const router = express.Router()

// Student Registration
router.post('/register', async (req, res) => {
  try {
    const { fullName, rollNumber, collegeEmail, password } = req.body

    if (!fullName || !rollNumber || !collegeEmail || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const existingUser = await User.findOne({
      $or: [
        { rollNumber },
        { collegeEmail: collegeEmail.toLowerCase() }
      ]
    })

    if (existingUser) {
      return res.status(409).json({ message: 'Roll number or email already registered' })
    }

    const user = new User({
      fullName,
      rollNumber,
      collegeEmail,
      password
    })

    await user.save()

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        rollNumber: user.rollNumber,
        collegeEmail: user.collegeEmail
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' })
  }
})

// Student Login
router.post('/login', async (req, res) => {
  try {
    const { collegeEmail, password } = req.body

    if (!collegeEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({
      collegeEmail: collegeEmail.toLowerCase()
    })

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        rollNumber: user.rollNumber,
        collegeEmail: user.collegeEmail
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Login failed' })
  }
})

module.exports = router
