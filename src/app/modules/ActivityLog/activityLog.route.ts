import { Router } from 'express';
import { ActivityLogController } from './activityLog.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../../types';

const router = Router();

router.get(
    '/',
    auth(USER_ROLE.admin, USER_ROLE.project_manager, USER_ROLE.team_member),
    ActivityLogController.getRecentLogs
);

export const ActivityLogRouter = router;
