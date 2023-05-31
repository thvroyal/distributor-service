const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');

const create = catchAsync(async (req, res) => {
  console.dir(req.body);
  res.status(httpStatus.CREATED).send('File received');
});

module.exports = {
  create,
};
