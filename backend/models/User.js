
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  collegeEmail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  }
})

// Encrypt password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return

  this.password = await bcrypt.hash(this.password, 10)
})

// Check password during login
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password)
}

module.exports = mongoose.model('User', userSchema)
