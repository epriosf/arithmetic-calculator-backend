const express = require('express');
const router = express.Router();
const recordControllers = require('../../controllers/recordController');
router.post('/record', recordControllers.createRecord)
router.get('/:user_id', recordControllers.findRecordsByUserId);
router.post('/record/:record_id', recordControllers.deleteRecordById);

module.exports = router;
