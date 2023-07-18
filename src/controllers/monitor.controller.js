const catchAsync = require('../utils/catchAsync');
const { monitorService } = require('../services');

const getProjectStatus = catchAsync(async (req, res) => {
  const { bucketId } = req.query;
  const projectReport = await monitorService.getReportToAnalyzer(bucketId);
  res.send({ projectReport });
});

module.exports = {
  getProjectStatus,
};
