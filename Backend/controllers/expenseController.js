const mongoose = require("mongoose");
const Expense = require("../models/Expense");
const Group = require("../models/Group");
const User = require("../models/User");
const Payment = require("../models/Payment");

exports.addExpense = async (req, res) => {
  const { title, description, amount, paidBy, groupId, splitBetween } = req.body;

  // Basic validation
  if (!title || !amount || !paidBy || !groupId || !Array.isArray(splitBetween)) {
    return res.status(400).json({
      message: "All required fields must be provided.",
    });
  }

  if (splitBetween.length === 0) {
    return res.status(400).json({
      message: "At least one user must be included in splitBetween.",
    });
  }

  try {
    const expense = new Expense({
      title: title.trim(),
      description: description?.trim() || "",
      amount,
      paidBy,
      createdBy: req.user.id,
      group: groupId,
      splitBetween,
    });

    await expense.save();

    // Add expense to the group
    await Group.findByIdAndUpdate(groupId, {
      $push: { expenses: expense._id },
    });

    return res.status(201).json({
      message: "Expense added successfully.",
      expense,
    });
  } catch (err) {
    console.error("Add expense error:", err.message);
    return res.status(500).json({
      message: "Server error while adding expense.",
    });
  }
};


exports.getGroupExpenses = async (req, res) => {
  const groupId = req.params.groupId;

  try {
    const expenses = await Expense.find({ group: groupId })
      .populate("paidBy", "name email") // only get name & email of payer
      .populate("splitBetween", "name email") // only get name & email of split members
      .sort({ createdAt: -1 }); // latest first

    const formatted = expenses.map((exp) => ({
      id: exp._id,
      title:exp.title,
      description: exp.description,
      amount: exp.amount,
      paidBy: exp.paidBy.name,
      splitBetween: exp.splitBetween.map((m) => m.name),
      date: exp.createdAt,
    }));
     
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.setGroupBalances = async (req, res) => {
  const groupId = req.params.groupId;

  try {
    const expenses = await Expense.find({ group: groupId }).populate(
      "paidBy splitBetween"
    );

    const balances = {};
    const totalCosts = {};

    for (const exp of expenses) {
      const splitAmount = exp.amount / exp.splitBetween.length;

      const payerId = exp.paidBy._id.toString();
      balances[payerId] = (balances[payerId] || 0) + exp.amount;

      for (const member of exp.splitBetween) {
        const memberId = member._id.toString();

        balances[memberId] = (balances[memberId] || 0) - splitAmount;
        totalCosts[memberId] = (totalCosts[memberId] || 0) + splitAmount;
      }
    }

    const users = await User.find({ _id: { $in: Object.keys(balances) } });

    const balanceList = Object.keys(balances).map((userId) => {
      const user = users.find((u) => u._id.toString() === userId);
      return {
        id: userId,
        name: user?.name || "Unknown",
        balance: parseFloat(balances[userId].toFixed(2)),
        totalOwes: parseFloat((totalCosts[userId] || 0).toFixed(2)),
      };
    });

    // Split into creditors and debtors
    const creditors = balanceList.filter((u) => u.balance > 0);
    const debtors = balanceList
      .filter((u) => u.balance < 0)
      .map((u) => ({
        ...u,
        balance: -u.balance,
      }));

    const settlements = [];

    let i = 0,
      j = 0;
    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];

      const payment = Math.min(creditor.balance, debtor.balance);

      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: payment.toFixed(2),
      });

      creditor.balance -= payment;
      debtor.balance -= payment;

      if (creditor.balance === 0) i++;
      if (debtor.balance === 0) j++;
    }

    res.json({
      netBalances: balanceList.map((u) => ({
        name: u.name,
        totalOwes: u.totalOwes.toFixed(2),
      })),
      settlements,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGroupBalances = async (req, res) => {
  const groupId = req.params.groupId;

  try {
    const groupObjectId = new mongoose.Types.ObjectId(groupId);
    const expenses = await Expense.find({ group: groupObjectId }).populate(
      "paidBy splitBetween"
    );
    const balances = {};

    for (const exp of expenses) {
      const splitAmount = exp.amount / exp.splitBetween.length;

      const payerId = exp.paidBy._id.toString();
      balances[payerId] = (balances[payerId] || 0) + exp.amount;

      for (const member of exp.splitBetween) {
        const memberId = member._id.toString();
        balances[memberId] = (balances[memberId] || 0) - splitAmount;
      }
    }
    // const groupObjectId = new mongoose.Types.ObjectId(groupId);
    // const expenses = await Expense.find({ group: groupObjectId }).populate("paidBy splitBetween");
    const payments = await Payment.find({ group: groupObjectId });

    for (const pay of payments) {
      const fromId = pay.from.toString();
      const toId = pay.to.toString();
      const amount = pay.amount;

      balances[fromId] = (balances[fromId] || 0) + amount;
      balances[toId] = (balances[toId] || 0) - amount;
    }

    const users = await User.find({});
    const userMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = user.name;
      return acc;
    }, {});

    const finalBalances = Object.entries(balances).map(([userId, balance]) => ({
      userId,
      name: userMap[userId] || "Unknown",
      netBalance: Number(balance.toFixed(2)),
    }));

    // ✅ Make a deep copy of finalBalances for settlement calculation
    const balancesForSettlement = finalBalances.map((u) => ({ ...u }));

    const creditors = balancesForSettlement
      .filter((u) => u.netBalance > 0)
      .sort((a, b) => b.netBalance - a.netBalance);
    const debtors = balancesForSettlement
      .filter((u) => u.netBalance < 0)
      .sort((a, b) => a.netBalance - b.netBalance);

    const updatedSettlements = [];
    let i = 0,
      j = 0;

    while (i < creditors.length && j < debtors.length) {
      const credit = creditors[i];
      const debt = debtors[j];

      const amount = Math.min(credit.netBalance, -debt.netBalance);

      if (amount > 0) {
        updatedSettlements.push({
          from: debt.name,
          to: credit.name,
          amount: Number(amount.toFixed(2)),
        });

        credit.netBalance -= amount;
        debt.netBalance += amount;
      }

      if (credit.netBalance <= 0) i++;
      if (debt.netBalance >= 0) j++;
    }

    const paymentHistory = await Promise.all(
      payments.map(async (p) => {
        const from = userMap[p.from.toString()] || "Unknown";
        const to = userMap[p.to.toString()] || "Unknown";
        return {
          from,
          to,
          amount: p.amount,
          date: p.createdAt,
        };
      })
    );

    res.json({
      netBalances: finalBalances.map((u) => ({
        name: u.name,
        netBalance: u.netBalance,
      })),
      settlements: updatedSettlements,
      payments: paymentHistory,
    });
  } catch (err) {
    console.error("Error in getGroupBalances:", err);
    res.status(500).json({ error: err.message });
  }
};
