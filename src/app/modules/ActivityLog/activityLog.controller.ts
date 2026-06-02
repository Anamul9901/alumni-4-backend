import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ActivityLogService } from './activityLog.service';

const getRecentLogs = catchAsync(async (req, res) => {
    const result = await ActivityLogService.getRecentLogs(req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Activity logs retrieved successfully',
        data: result,
    });
});

export const ActivityLogController = {
    getRecentLogs,
};
