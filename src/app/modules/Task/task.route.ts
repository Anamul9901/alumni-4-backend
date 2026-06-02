import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../../types';
import { TaskController } from './task.controller';
import { TaskValidation } from './task.validation';

const router = Router();

router.post(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.project_manager),
  validateRequest(TaskValidation.createTaskValidationSchema),
  TaskController.createTask
);

router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.project_manager, USER_ROLE.team_member),
  TaskController.getAllTasks
);

router.get(
  '/staff-load',
  auth(USER_ROLE.admin, USER_ROLE.project_manager, USER_ROLE.team_member),
  TaskController.getStaffLoadSummary
);

router.get(
  '/dashboard-stats',
  auth(USER_ROLE.admin, USER_ROLE.project_manager, USER_ROLE.team_member),
  TaskController.getDashboardStats
);

router.get(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.project_manager, USER_ROLE.team_member),
  TaskController.getSingleTask
);

router.patch(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.project_manager, USER_ROLE.team_member),
  validateRequest(TaskValidation.updateTaskValidationSchema),
  TaskController.updateTask
);

router.delete(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.project_manager),
  TaskController.deleteTask
);

export const TaskRouter = router;
