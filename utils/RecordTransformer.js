class RecordTransformer {
    static transformRecords(records) {
        return records.map(record => ({
            _id: record._id,
            operation_type: record.operation_id.type,
            user_username: record.user_id.username,
            amount: record.amount,
            user_balance: record.user_balance,
            operation_response: record.operation_response,
            is_deleted: record.is_deleted,
            created_at: record.created_at,
            updated_at: record.updated_at
        }));
    }
}

module.exports = RecordTransformer;