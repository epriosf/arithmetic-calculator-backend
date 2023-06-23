const math = require('mathjs');
const calculateTotalCost = (operations) => {
    return operations.reduce((acc, operation) => acc + parseFloat(operation.cost), 0);
}
const evaluateMathExpression = (mathExpression) => {
    return math.evaluate(mathExpression);
  };
module.exports = {calculateTotalCost,  evaluateMathExpression};