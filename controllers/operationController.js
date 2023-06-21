const axios = require('axios');
const Operation = require('../models/Operation');
const math = require('mathjs');
const { findUserByUsername, findUserAndUpdateBalance } = require('./userController');
const { addRecord } = require('./recordController');

const generateRandomString = async (req, res) => {
  try {
    const { username, type } = req.body;
    const operation = await findOperation(type);
    const user = await findUserByUsername(username);

    if (user.user_balance < operation.cost) {
      return res.status(400).json({ message: 'The user has no credit' })
    }

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
    const userBalanceUpdated = (user.user_balance - operation.cost);
    await findUserAndUpdateBalance(user.username, userBalanceUpdated);
    await addRecord(operation._id, user._id, operation.cost, userBalanceUpdated, randomString);
    res.json({ randomString });
  }
  catch (error) {
    const errorObject = handleOperationError(error);

    return res.status(errorObject.status).json({ message: errorObject.message });
  }
}

const calculateMathOperation = async (req, res) => {
  try {
    const { mathExpression, username } = req.body;

    const mathOperationsPattern = /[\+\-\*\/]|sqrt/g;
    const operators = mathExpression.match(mathOperationsPattern);

    const operations = await findOperations(operators);
    const user = await findUserByUsername(username);

    if (operations.length === 0) {
      return res.status(400).json({ message: 'No matching operations found' });
    }

    const totalCost = calculateTotalCost(operations);

    if (user.user_balance < totalCost) {
      return res.status(400).json({ message: 'The user has insufficient credit' });
    }
    const result = math.evaluate(mathExpression);
    const userBalanceUpdated = (user.user_balance - totalCost);
    await findUserAndUpdateBalance(user.username, userBalanceUpdated);
    await addRecord(operations[0]._id, user._id, totalCost, userBalanceUpdated, result);
    res.json({ result });
  } catch (error) {
    const errorObject = handleOperationError(error, 'math');

    return res.status(errorObject.status).json({ message: errorObject.message });
  }
}

const findOperations = async (operators) => {
  try {
    const operations = await Operation.find({ type: { $in: operators } });
    return operations;
  }
  catch (error) {
    throw new Error('Failed to find Operations');
  }
}

const findOperation = async (type) => {
  try {
    const operation = await Operation.findOne({ type: type });
    return operation;
  }
  catch (error) {
    throw new Error('Failed to find Operation');
  }

}

const calculateTotalCost = (operations) => {
  return operations.reduce((acc, operation) => acc + parseFloat(operation.cost), 0);
}

const handleOperationError = (error, type) => {
  console.error('Error:', error.message);
  let errorObject;
  const errorMessages = {
    'User not found': {
      message: 'User not found',
      status: 400,
    },
    'Failed to update user balance': {
      message: 'Failed to update user balance',
      status: 400,
    },
    'Invalid record fields': {
      message: 'Invalid record fields',
      status: 400,
    },
    'Threre was a problem. Record was not register': {
      message: 'Record was not register',
      status: 400,
    },

  };
  if (type === 'math') {
    errorMessages['Failed to find Operations'] = {
      message: 'Failed to find Operations',
      status: 400,
    };
    errorObject = errorMessages[error.message] || {
      message: 'Failed to calculate math Expression',
      status: 500,
    };
  }
  else {
    errorMessages['Failed to find Operation'] = {
      message: 'Failed to find Operation',
      status: 400,
    };
    errorObject = errorMessages[error.message] || {
      message: 'Failed to generate random string',
      status: 500,
    };
  }
  return errorObject;
}

module.exports = { calculateMathOperation, generateRandomString };
