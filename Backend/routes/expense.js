const express = require('express')
const router = express.Router()
const {addExpense,setGroupBalances,getGroupBalances}  = require('../controllers/expenseController')
const verifyToken = require('../middleware/auth')
const upload = require("../middleware/upload");

router.post('/add',verifyToken,addExpense)
router.get('/:groupId',verifyToken,setGroupBalances)
router.get('/balances/:groupId',verifyToken,getGroupBalances)

module.exports = router