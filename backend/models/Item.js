
const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
  location: { type: String, required: true },

  type: {
    type: String,
    enum: ['lost', 'found'],
    required: true
  },

  image: { type: String, default: '' },

  // Private contact information
  privateContact: {
    studentName: String,
    rollNumber: String,
    email: String,
    mobile: String
  },

  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  status: {
    type: String,
    enum: ['active', 'returned'],
    default: 'active'
  }
}, { timestamps: true })

module.exports = mongoose.model('Item', itemSchema)
