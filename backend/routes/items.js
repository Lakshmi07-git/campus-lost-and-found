
const express = require('express')
const Item = require('../models/Item')
const protect = require('../middleware/auth')

const router = express.Router()

// Report a lost or found item
router.post('/', protect, async (req, res) => {
  try {
    const { name, category, description, date, location, type, image } = req.body

    if (!name || !category || !description || !date || !location || !type) {
      return res.status(400).json({
        message: 'Please fill all required item details'
      })
    }

    if (!['lost', 'found'].includes(type)) {
      return res.status(400).json({
        message: 'Invalid item type'
      })
    }

    const newItem = new Item({
      name,
      category,
      description,
      date,
      location,
      type,
      image: image || '',
      privateContact: req.body.privateContact,
      reportedBy: req.user._id
    })

    await newItem.save()

    res.status(201).json({
      message: 'Item reported successfully',
      item: newItem
    })

  } catch (error) {
    res.status(500).json({
      message: 'Failed to report item'
    })
  }
})

// Get all active items without private contact details
router.get('/', async (req, res) => {
  try {
    const items = await Item.find({ status: 'active' })
      .select('-privateContact')
      .populate('reportedBy', 'fullName')

    res.json(items)

  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch items'
    })
  }
})

module.exports = router
