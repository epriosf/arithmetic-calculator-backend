const mongoose = require('mongoose');
const recordHelper = require('../helpers/recordHelper');
const recordService = require('../services/recordService');

const createRecord = async (req, res) => {
    const { operation_id, user_id, amount, user_balance, operation_response } = req.body;
    if (!operation_id || !user_id || !amount || !user_balance || !operation_response) {
        return res.status(422).json({ message: 'Invalid record fields' });
    }
    try {
        await recordService.createRecord(operation_id, user_id, amount, user_balance, operation_response);
        res.sendStatus(201);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

const findRecordsByUserId = async (req, res) => {
    try {
        const { user_id } = req.params;
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 5;
        const sortField = req.query.sortField || '_id';
        const sortOrder = parseInt(req.query.sortOrder) || 1;
        const searchText = req.query.searchText || '';

        const sortOptions = {
            [sortField]: sortOrder === 1 ? 1 : -1
        };

        const userId = new mongoose.Types.ObjectId(user_id);

        const query = {
            user_id: userId,
            is_deleted: false,
        }
        if (searchText) {
            const searchTextRegex = new RegExp(searchText, 'i');
            const numericSearchText = parseInt(searchText);

            query.$or = [
                { operation_response: searchTextRegex },
                { amount: numericSearchText },
                { user_balance: numericSearchText },
            ];
        }
        const records = await recordService.findRecordsByUserId(query, sortOptions, limit, page);
        const total_records = searchText ? records.length : await recordService.getTotalRecords();

        if (!records && !total_records) {
            return res.status(400).json({ message: 'Records not found' });
        }
        const transformedRecords = recordHelper.transformRecords(records);
        res.json({ records: transformedRecords, total_records });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const deleteRecordById = async (req, res) => {
    try {
        const recordIdString = req.params.record_id;
        const record_id = new mongoose.Types.ObjectId(recordIdString);

        if (!mongoose.Types.ObjectId.isValid(record_id)) {
            return res.status(400).json({ error: 'Invalid record ID' });
        }
        const updatedRecord = await recordService.deleteRecordById(record_id);
        if (!updatedRecord) {
            return res.status(404).json({ error: 'Record not found' });
        }
        res.json(updatedRecord);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }

}

module.exports = { findRecordsByUserId, deleteRecordById, createRecord };

