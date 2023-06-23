const axios = require('axios');
const operationService = require('../services/operationService');
const userService = require('../services/userService');
const recordService = require('../services/recordService');
const operationHelper = require('../helpers/operationHelper');
const errorHelper = require('../helpers/errorHelper');

const generateRandomString = async (req, res) => {
  try {
    const { username, type } = req.body;
    const operation = await operationService.findOperation(type);
    const user = await userService.findUserByUsername(username);

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
    await userService.findUserAndUpdateBalance(user.username, userBalanceUpdated);
    await recordService.createRecord(operation._id, user._id, operation.cost, userBalanceUpdated, randomString);
    res.json({ randomString });
  }
  catch (error) {
    const errorObject = errorHelper.handleOperationError(error, 'string');
    return res.status(errorObject.status).json({ message: errorObject.message });
  }
}

const calculateMathOperation = async (req, res) => {
  try {
    const { mathExpression, username } = req.body;

    const mathOperationsPattern = /[\+\-\*\/]|sqrt/g;
    const operators = mathExpression.match(mathOperationsPattern);

    const operations = await operationService.findOperations(operators);
    const user = await userService.findUserByUsername(username);

    if (operations.length === 0) {
      return res.status(400).json({ message: 'No matching operations found' });
    }

    const totalCost = operationHelper.calculateTotalCost(operations);

    if (user.user_balance < totalCost) {
      return res.status(400).json({ message: 'The user has insufficient credit' });
    }
    const result = operationHelper.evaluateMathExpression(mathExpression);
    const userBalanceUpdated = (user.user_balance - totalCost);
    await userService.findUserAndUpdateBalance(user.username, userBalanceUpdated);
    await recordService.createRecord(operations[0]._id, user._id, totalCost, userBalanceUpdated, result);
    res.json({ result });
  } catch (error) {
    const errorObject = errorHelper.handleOperationError(error, 'math');
    return res.status(errorObject.status).json({ message: errorObject.message });
  }
}

module.exports = { calculateMathOperation, generateRandomString };
