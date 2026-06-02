import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../../types';
import { NotificationController } from './notification.controller';

const router = Router();

router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.project_manager, USER_ROLE.team_member),
  NotificationController.getMyNotifications
);

router.patch(
  '/mark-all-read',
  auth(USER_ROLE.admin, USER_ROLE.project_manager, USER_ROLE.team_member),
  NotificationController.markAllNotificationsAsRead
);

router.patch(
  '/:id/read',
  auth(USER_ROLE.admin, USER_ROLE.project_manager, USER_ROLE.team_member),
  NotificationController.markNotificationAsRead
);

export const NotificationRouter = router;
