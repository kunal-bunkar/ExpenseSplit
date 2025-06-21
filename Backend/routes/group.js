const express = require('express')
const router = express.Router()
const {createGroup,getUserGroup,getGroupDetails} = require('../controllers/groupController')
const {getGroupExpenses} =require('../controllers/expenseController')
const verifyToken = require('../middleware/auth')

router.post('/create',verifyToken,createGroup)
router.get('/my-group',verifyToken,getUserGroup)  
router.get('/my-group/:groupId',verifyToken,getGroupDetails)
router.get('/:groupId',verifyToken,getGroupExpenses)

module.exports = router