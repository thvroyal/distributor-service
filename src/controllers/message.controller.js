const catchAsync = require('../utils/catchAsync');
const { messageService } = require('../services');

const getProjectStatus = catchAsync(async (req, res) => {
  const { bucketId } = req.query;
  const projectReport = await messageService.getReportToAnalyzer(bucketId);
  res.send({ projectReport });
});

module.exports = {
  getProjectStatus,
};
