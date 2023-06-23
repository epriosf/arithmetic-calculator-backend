const Record = require('../models/Record');

const createRecord = async (operation_id, user_id, amount, user_balance, operation_response) => {
    try {
        await Record.create({ operation_id, user_id, amount, user_balance, operation_response });
    } catch (error) {
        throw new Error('Threre was a problem. Record was not register');
    }
}

const findRecordsByUserId = async (query, sortOptions, limit, page) => {
    try {
        const records = await Record.find(query)
            .sort(sortOptions)
            .limit(limit)
            .skip(limit * page)
            .populate('operation_id', 'type')
            .populate('user_id', 'username');
        return records;
    }
    catch (error) {
        throw new Error('Failed to fetch records');
    }
}

const deleteRecordById = async (record_id) => {
    try {
        const updatedRecord = await Record.findByIdAndUpdate(record_id, { is_deleted: true, updated_at: Date.now }, { new: true });
        if (!updatedRecord) {
            throw new Error('Record not found');
        }
        return updatedRecord;
    }
    catch (error) {
        throw new Error('Failed to delete the record');
    }

}
const getTotalRecords = async () => {
    const totalRecords = await Record.countDocuments({ is_deleted: false });
    return totalRecords;
}

module.exports = { findRecordsByUserId, deleteRecordById, createRecord, getTotalRecords };

