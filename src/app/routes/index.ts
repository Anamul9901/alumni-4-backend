import { Router } from 'express';
import { UserRouter } from '../modules/User/user.route';
import { ProjectRouter } from '../modules/Project/project.route';
import { TaskRouter } from '../modules/Task/task.route';
import { CommentRouter } from '../modules/Comment/comment.route';
import { NotificationRouter } from '../modules/Notification/notification.route';
import { ActivityLogRouter } from '../modules/ActivityLog/activityLog.route';

const router = Router();
const moduleRoutes = [
  {
    path: '/user',
    route: UserRouter,
  },
  {
    path: '/project',
    route: ProjectRouter,
  },
  {
    path: '/task',
    route: TaskRouter,
  },
  {
    path: '/comment',
    route: CommentRouter,
  },
  {
    path: '/notification',
    route: NotificationRouter,
  },
  {
    path: '/activity-log',
    route: ActivityLogRouter,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
