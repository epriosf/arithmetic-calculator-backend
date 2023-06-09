const axios = require('axios');
const Operation = require('../models/Operation');
const User = require('../models/User');
const math = require('mathjs');

async function randomString(req, res) {
  const { userBalance, username, type } = req.body;
  let operation;
  try {
    operation = await Operation.findOne({ type: type });
    if (!operation) {
      return res.sendStatus(400).json({ message: 'Not Math Operation found in DB' });
    }
  }
  catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: 'Failed to retrieve operation' });
  }

  if (parseFloat(userBalance) < parseFloat(operation.cost)) {
    return res.status(400).json({ message: 'The user has no credit' })
  }
  try {
    const response = await axios.post('https://api.random.org/json-rpc/2/invoke', {
      headers: {
        'Content-Type': 'application/json'
      },
      jsonrpc: '2.0',
      method: 'generateStrings',
      params: {
        apiKey: process.env.API_KEY_RANDOM_STRING,
        n: 1, // Number of random strings to generate
        length: 10, // Length of each random string
        characters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' // Characters to include in the random string
      },
      id: 1,
    });
    const randomString = response.data.result.random.data[0]; // Extract the generated random string
    const userBalanceUpdated = (parseFloat(userBalance) - parseFloat(operation.cost)).toString();
    try {
      await User.findOneAndUpdate(
        { username: username },
        { $set: { user_balance: userBalanceUpdated } },
        { new: true }
      ).select({ password: 0, refresh_token: 0, status: 0, __v: 0 });
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: 'Failed to update the user info' });
    }
    res.json({ randomString });

  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: 'Failed to generate random string' });
  }
}

async function mathOperation(req, res) {
  try {
    const { mathExpression, username } = req.body;

    const mathOperationsPattern = /[\+\-\*\/]|sqrt/g;
    const operators = mathExpression.match(mathOperationsPattern);

    const operations = await findOperations(operators);
    const user = await findUser(username);

    if (operations.length === 0) {
      return res.status(400).json({ message: 'No matching operations found' });
    }

    const totalCost = calculateTotalCost(operations);

    if (parseFloat(user.user_balance) < totalCost) {
      return res.status(400).json({ message: 'The user has insufficient credit' });
    }

    if (user.user_balance) {
      await updateUserBalance(user.username, user.user_balance, totalCost);
    }

    const result = math.evaluate(mathExpression);
    res.json({ result });
  } catch (error) {
    console.error('Error:', error.message);
    if (error.message === 'User not found') {
      return res.status(400).json({ message: 'User not found' });
    }
    return res.status(500).json({ error: 'Failed to calculate math expression' });
  }
}
async function findOperations(operators) {
  const operations = await Operation.find({ type: { $in: operators } });
  return operations;
}
async function findUser(username) {
  const user = await User.findOne({ username }).select('-password -refresh_token -status -__v');;
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}
async function updateUserBalance(username, userBalance, totalCost) {
  const user = await User.findOneAndUpdate(
    { username: username },
    { $set: { user_balance: userBalance - totalCost } },
    { new: true, lean: true }
  );
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}

function calculateTotalCost(operations) {
  return operations.reduce((acc, operation) => acc + parseFloat(operation.cost), 0);
}

module.exports = { mathOperation, randomString };
