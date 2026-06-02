import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { TaskService } from './task.service';

const createTask = catchAsync(async (req, res) => {
  const result = await TaskService.createTaskIntoDB(req.user, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Task created successfully',
    data: result,
  });
});

const getAllTasks = catchAsync(async (req, res) => {
  const result = await TaskService.getAllTasksFromDB(req.user, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Tasks retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleTask = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await TaskService.getSingleTaskFromDB(id, req.user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Task retrieved successfully',
    data: result,
  });
});

const updateTask = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await TaskService.updateTaskInDB(id, req.user, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Task updated successfully',
    data: result,
  });
});

const deleteTask = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await TaskService.deleteTaskFromDB(id, req.user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Task deleted successfully',
    data: result,
  });
});

const getStaffLoadSummary = catchAsync(async (req, res) => {
  const result = await TaskService.getStaffLoadSummary();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Staff workload summary retrieved successfully',
    data: result,
  });
});

const getDashboardStats = catchAsync(async (req, res) => {
  const result = await TaskService.getDashboardStats(req.user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard statistics retrieved successfully',
    data: result,
  });
});

const bulkUpdateTasks = catchAsync(async (req, res) => {
  const { taskIds, status } = req.body;
  const result = await TaskService.bulkUpdateTasksInDB(req.user, taskIds, status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Tasks updated successfully',
    data: result,
  });
});

const bulkDeleteTasks = catchAsync(async (req, res) => {
  const { taskIds } = req.body;
  const result = await TaskService.bulkDeleteTasksFromDB(req.user, taskIds);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Tasks deleted successfully',
    data: result,
  });
});

export const TaskController = {
  createTask,
  getAllTasks,
  getSingleTask,
  updateTask,
  deleteTask,
  getStaffLoadSummary,
  getDashboardStats,
  bulkUpdateTasks,
  bulkDeleteTasks,
};
