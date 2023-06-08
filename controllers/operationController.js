const axios = require('axios');
const Operation = require('../models/Operation');
const User = require('../models/User');

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
    console.log(userBalanceUpdated, 'userBalance');
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
  const user = req.body;
  return res.status(200).json(user);
}
module.exports = { mathOperation, randomString };
