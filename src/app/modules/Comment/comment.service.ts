import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import AppError from '../../errors/AppError';
import { ActivityLogService } from '../ActivityLog/activityLog.service';
import { Task } from '../Task/task.model';
import { TComment } from './comment.interface';
import { Comment } from './comment.model';
import { Notification } from '../Notification/notification.model';

const createCommentIntoDB = async (user: JwtPayload, payload: TComment) => {
  const task = await Task.findById(payload.task).populate('project', 'name');
  if (!task || task.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Task not found');
  }

  payload.user = user.userId;
  const result = await Comment.create(payload);

  const populatedResult = await Comment.findById(result._id).populate('user', 'name email role');

  // Trigger Notification to task assignee (if assignee is someone else)
  if (task.assignedMember && task.assignedMember.toString() !== user.userId) {
    await Notification.create({
      recipient: task.assignedMember,
      sender: user.userId,
      message: `${user.email} added a comment on your task "${task.title}": "${payload.comment}"`,
      type: 'comment_added',
      relatedId: task._id,
    });
  }

  // Log activity
  await ActivityLogService.logActivity({
    action: 'COMMENT_CREATE',
    description: `${user.email} commented on task "${task.title}"`,
    metadata: { commentId: result._id, taskId: task._id },
    timestamp: new Date(),
    createdBy: user.userId,
  });

  return populatedResult;
};

const getCommentsForTaskFromDB = async (taskId: string) => {
  const result = await Comment.find({ task: taskId, isDeleted: false })
    .populate('user', 'name email role')
    .sort({ createdAt: 1 });
  return result;
};

const updateCommentInDB = async (id: string, user: JwtPayload, payload: Partial<TComment>) => {
  const comment = await Comment.findById(id);
  if (!comment || comment.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  // Check authorship
  if (comment.user.toString() !== user.userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only update your own comments');
  }

  const result = await Comment.findByIdAndUpdate(id, { comment: payload.comment }, { new: true })
    .populate('user', 'name email role');

  return result;
};

const deleteCommentFromDB = async (id: string, user: JwtPayload) => {
  const comment = await Comment.findById(id);
  if (!comment || comment.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  // Allowed only for comment author, Admin, or Project Manager
  if (
    comment.user.toString() !== user.userId &&
    user.role !== 'admin' &&
    user.role !== 'project_manager'
  ) {
    throw new AppError(httpStatus.FORBIDDEN, 'You do not have permission to delete this comment');
  }

  comment.isDeleted = true;
  await comment.save();

  return comment;
};

export const CommentService = {
  createCommentIntoDB,
  getCommentsForTaskFromDB,
  updateCommentInDB,
  deleteCommentFromDB,
};
