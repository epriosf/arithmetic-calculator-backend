const express = require('express');
const router = express.Router();
const operationControllers = require('../../controllers/operationController');

router.post('/random-string', operationControllers.randomString);

module.exports = router;
