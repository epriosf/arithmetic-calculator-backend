const mongoose = require('mongoose');
const Record = require('../models/Record');
const RecordTransformer = require('../utils/RecordTransformer');

const createRecord = async (req, res) => {

    const { operation_id, user_id, amount, user_balance, operation_response } = req.body;
    if (!operation_id || !user_id || !amount || !user_balance || !operation_response) {
        return res.status(422).json({ message: 'Invalid record fields' });
    }

    try {
        await Record.create({ operation_id, user_id, amount, user_balance, operation_response });
        return res.sendStatus(201);
    } catch (error) {
        return res.status(400).json({ message: 'Threre was a problem. Record was not register' });
    }
}
const addRecord = async (operation_id, user_id, amount, user_balance, operation_response) => {
    if (!operation_id || !user_id || !amount || !user_balance || !operation_response) {
        throw new Error('Invalid record fields');
    }
    try {
        await Record.create({ operation_id, user_id, amount, user_balance, operation_response });
    } catch (error) {
        throw new Error('Threre was a problem. Record was not register');
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
            const stringOrConditions = [
                { operation_response: { $regex: searchText, $options: 'i' } },
            ];
            const numericOrConditions = [
                { amount: { $eq: parseInt(searchText) } },
                { user_balance: { $eq: parseInt(searchText) } },
            ];

            query.$or = isNaN(parseInt(searchText)) ? stringOrConditions : numericOrConditions;
        }
        const records = await Record.find(query)
            .sort(sortOptions)
            .limit(limit)
            .skip(limit * page)
            .populate('operation_id', 'type')
            .populate('user_id', 'username');

        const total_records = searchText ? records.length : await Record.countDocuments({ is_deleted: false });

        if (!records && !total_records) {
            return res.status(400).json({ message: 'Records not found' });
        }
        const transformedRecords = RecordTransformer.transformRecords(records);
        res.json({ records: transformedRecords, total_records });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch records' });
    }
}

const deleteRecordById = async (req, res) => {
    try {
        const recordIdString = req.params.record_id;
        const record_id = new mongoose.Types.ObjectId(recordIdString);

        if (!mongoose.Types.ObjectId.isValid(record_id)) {
            return res.status(400).json({ error: 'Invalid record ID' });
        }
        const updatedRecord = await Record.findByIdAndUpdate(record_id, { is_deleted: true, updated_at: Date.now }, { new: true });
        if (!updatedRecord) {
            return res.status(404).json({ error: 'Record not found' });
        }
        res.json(updatedRecord);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to delete the record' });
    }

}

module.exports = { findRecordsByUserId, deleteRecordById, createRecord, addRecord };

