import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import AppError from '../../errors/AppError';
import { Notification } from './notification.model';

const getMyNotificationsFromDB = async (user: JwtPayload) => {
  const result = await Notification.find({ recipient: user.userId })
    .populate('sender', 'name email role')
    .sort({ createdAt: -1 });
  return result;
};

const markNotificationAsReadInDB = async (id: string, user: JwtPayload) => {
  const notification = await Notification.findById(id);
  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification not found');
  }

  if (notification.recipient.toString() !== user.userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You do not have access to this notification');
  }

  notification.isRead = true;
  await notification.save();

  return notification;
};

const markAllNotificationsAsReadInDB = async (user: JwtPayload) => {
  const result = await Notification.updateMany(
    { recipient: user.userId, isRead: false },
    { isRead: true }
  );
  return result;
};

export const NotificationService = {
  getMyNotificationsFromDB,
  markNotificationAsReadInDB,
  markAllNotificationsAsReadInDB,
};
