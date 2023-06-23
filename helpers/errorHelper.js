const handleOperationError = (error, type) => {
    console.error('Error:', error.message);
    let errorObject;
    const errorMessages = {
        'User not found': {
            message: 'User not found',
            status: 400,
        },
        'Failed to update user balance': {
            message: 'Failed to update user balance',
            status: 400,
        },
        'Invalid record fields': {
            message: 'Invalid record fields',
            status: 400,
        },
        'Threre was a problem. Record was not register': {
            message: 'Record was not register',
            status: 400,
        },

    };
    if (type === 'math') {
        errorMessages['Failed to find Operations'] = {
            message: 'Failed to find Operations',
            status: 400,
        };
        errorObject = errorMessages[error.message] || {
            message: 'Failed to calculate math Expression',
            status: 500,
        };
    }
    else if (type === 'string') {
        errorMessages['Failed to find Operation'] = {
            message: 'Failed to find Operation',
            status: 400,
        };
        errorObject = errorMessages[error.message] || {
            message: 'Failed to generate random string',
            status: 500,
        };
    }
    return errorObject;
}
module.exports = { handleOperationError };
