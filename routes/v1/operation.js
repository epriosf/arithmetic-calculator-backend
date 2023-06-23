const express = require('express');
const router = express.Router();
const operationControllers = require('../../controllers/operationController');

router.post('/random-string', operationControllers.generateRandomString);
router.post('/math-operation', operationControllers.calculateMathOperation);

module.exports = router;

