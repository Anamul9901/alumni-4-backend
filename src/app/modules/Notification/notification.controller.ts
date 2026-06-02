import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { NotificationService } from './notification.service';

const getMyNotifications = catchAsync(async (req, res) => {
  const result = await NotificationService.getMyNotificationsFromDB(req.user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notifications retrieved successfully',
    data: result,
  });
});

const markNotificationAsRead = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NotificationService.markNotificationAsReadInDB(id, req.user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification marked as read successfully',
    data: result,
  });
});

const markAllNotificationsAsRead = catchAsync(async (req, res) => {
  const result = await NotificationService.markAllNotificationsAsReadInDB(req.user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All notifications marked as read successfully',
    data: result,
  });
});

export const NotificationController = {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
