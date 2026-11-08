
const express = require('express')
const ContactRequest = require('../models/ContactRequest')
const Item = require('../models/Item')
const protect = require('../middleware/auth')

const router = express.Router()

// Send a contact request
router.post('/:itemId', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId)

    if (!item || item.status !== 'active') {
      return res.status(404).json({ message: 'Item not available' })
    }

    if (item.reportedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: 'You cannot request contact for your own item'
      })
    }

    const existing = await ContactRequest.findOne({
      item: item._id,
      requestedBy: req.user._id
    })

    if (existing) {
      return res.status(409).json({
        message: 'You have already requested contact for this item'
      })
    }

    const request = await ContactRequest.create({
      item: item._id,
      requestedBy: req.user._id,
      itemReporter: item.reportedBy
    })

    res.status(201).json({
      message: 'Contact request sent successfully',
      request
    })
  } catch (error) {
    res.status(500).json({ message: 'Could not send request' })
  }
})

// View incoming requests
router.get('/incoming', protect, async (req, res) => {
  try {
    const requests = await ContactRequest.find({
      itemReporter: req.user._id
    })
      .populate('requestedBy', 'fullName rollNumber collegeEmail')
      .populate('item', 'name type location')

    res.json(requests)
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch requests' })
  }
})

// View requests sent by the logged-in student
router.get('/my-requests', protect, async (req, res) => {
  try {
    const requests = await ContactRequest.find({
      requestedBy: req.user._id
    })
      .populate('item', 'name type location')
      .populate('itemReporter', 'fullName')

    res.json(requests)
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch your requests' })
  }
})

// Accept or reject a request
router.patch('/:requestId', protect, async (req, res) => {
  try {
    const { status } = req.body

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid decision' })
    }

    const request = await ContactRequest.findById(req.params.requestId)

    if (!request) {
      return res.status(404).json({ message: 'Request not found' })
    }

    if (request.itemReporter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' })
    }

    request.status = status
    await request.save()

    res.json({ message: `Request ${status}`, request })
  } catch (error) {
    res.status(500).json({ message: 'Could not update request' })
  }
})

// Reveal contact details only after approval
router.get('/:requestId/contact', protect, async (req, res) => {
  try {
    const request = await ContactRequest.findById(req.params.requestId)

    if (!request) {
      return res.status(404).json({ message: 'Request not found' })
    }

    if (request.requestedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    if (request.status !== 'accepted') {
      return res.status(403).json({
        message: 'Contact details are available only after approval'
      })
    }

    const item = await Item.findById(request.item)

    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }

    res.json({
      message: 'Contact request approved',
      contact: item.privateContact
    })
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch contact details' })
  }
})

module.exports = router

