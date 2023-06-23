const Operation = require('../models/Operation');

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

module.exports = { findOperation, findOperations };
