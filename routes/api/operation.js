const express = require('express');
const router = express.Router();
const operationControllers = require('../../controllers/operationController');

router.post('/random-string', operationControllers.randomString);
router.post('/math-operation', operationControllers.mathOperation);
module.exports = router;
