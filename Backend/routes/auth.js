const express = require('express')
const { register, login,getAllUsers } = require('../controllers/authController') 
const router = express.Router()
const verifyToken = require('../middleware/auth')
const User = require('../models/User')


router.post('/register', register)
router.post('/login', login)
router.get('/users',verifyToken,getAllUsers)

// ✅ Add this GET route for verifying logged-in user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
