import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../../types';
import { ProjectController } from './project.controller';
import { ProjectValidation } from './project.validation';

const router = Router();

router.post(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.project_manager),
  validateRequest(ProjectValidation.createProjectValidationSchema),
  ProjectController.createProject
);

router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.project_manager, USER_ROLE.team_member),
  ProjectController.getAllProjects
);

router.get(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.project_manager, USER_ROLE.team_member),
  ProjectController.getSingleProject
);

router.patch(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.project_manager),
  validateRequest(ProjectValidation.updateProjectValidationSchema),
  ProjectController.updateProject
);

router.delete(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.project_manager),
  ProjectController.deleteProject
);

export const ProjectRouter = router;
