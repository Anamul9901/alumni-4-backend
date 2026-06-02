import { Router } from 'express';
import { UserValidation } from './user.validation';
import { UserControllers } from './user.controller';
import { USER_ROLE } from '../../types';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';

const router = Router();

router.post(
  '/signup',
  validateRequest(UserValidation.signUpValidationSchema),
  UserControllers.signUpUser
);

router.post(
  '/login',
  validateRequest(UserValidation.logInValidationSchema),
  UserControllers.loginUser
);

router.patch(
  '/change-password',
  validateRequest(UserValidation.changePasswordValidationSchema),
  UserControllers.changePassword
);


router.get('/me', auth(USER_ROLE.admin, USER_ROLE.project_manager, USER_ROLE.team_member), UserControllers.getMyData);


router.patch(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.project_manager, USER_ROLE.team_member),
  validateRequest(UserValidation.updateUserValidationSchema),
  UserControllers.updateUser
);

router.get('/', auth(USER_ROLE.admin, USER_ROLE.project_manager, USER_ROLE.team_member), UserControllers.getAllUser);

router.delete('/:id', auth(USER_ROLE.admin), UserControllers.deleteUser);

export const UserRouter = router;
