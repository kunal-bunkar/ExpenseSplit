require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./utils/db");

const authRoute = require('./routes/auth');
const groupRoute = require('./routes/group');
const expenseRoute = require('./routes/expense');
const paymentRoute = require('./routes/payment');

const app = express();
connectDB();

app.use(cors()); 
app.use(express.json());

app.use('/api/auth', authRoute);
app.use('/api/group', groupRoute);
app.use('/api/expenses', expenseRoute);
app.use('/api/payments', paymentRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
