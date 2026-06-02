import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../../types';
import { CommentController } from './comment.controller';
import { CommentValidation } from './comment.validation';

const router = Router();

router.post(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.project_manager, USER_ROLE.team_member),
  validateRequest(CommentValidation.createCommentValidationSchema),
  CommentController.createComment
);

router.get(
  '/task/:taskId',
  auth(USER_ROLE.admin, USER_ROLE.project_manager, USER_ROLE.team_member),
  CommentController.getCommentsForTask
);

router.patch(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.project_manager, USER_ROLE.team_member),
  validateRequest(CommentValidation.updateCommentValidationSchema),
  CommentController.updateComment
);

router.delete(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.project_manager, USER_ROLE.team_member),
  CommentController.deleteComment
);

export const CommentRouter = router;
