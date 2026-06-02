import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { ActivityLogService } from '../ActivityLog/activityLog.service';
import { Project } from '../Project/project.model';
import { User } from '../User/user.model';
import { TTask } from './task.interface';
import { Task } from './task.model';
import { Notification } from '../Notification/notification.model';

const createTaskIntoDB = async (user: JwtPayload, payload: TTask) => {
  // Validate project exists and user has access
  const project = await Project.findById(payload.project);
  if (!project || project.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  // Only Admin or Project Manager can create tasks
  if (user.role === 'team_member') {
    throw new AppError(httpStatus.FORBIDDEN, 'Only Admins and Project Managers can create tasks');
  }

  // Rule: Prevent duplicate task titles inside the same project
  const duplicate = await Task.findOne({
    project: payload.project,
    title: { $regex: new RegExp(`^${payload.title.trim()}$`, 'i') },
    isDeleted: false,
  });
  if (duplicate) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This task already exists in the project.');
  }

  // Rule: Prevent setting past dates as deadlines
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(payload.dueDate) < today) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Please select a valid deadline.');
  }

  // Create Task
  const result = await Task.create(payload);

  // Fetch assignee info for the activity log and notification
  let assigneeName = 'Unassigned';
  if (payload.assignedMember) {
    const assignee = await User.findById(payload.assignedMember);
    if (assignee) {
      assigneeName = assignee.name;

      // Trigger Notification
      await Notification.create({
        recipient: payload.assignedMember,
        sender: user.userId,
        message: `You have been assigned a new task: "${payload.title}" under project "${project.name}"`,
        type: 'task_assigned',
        relatedId: result._id,
      });
    }
  }

  // Log activity
  await ActivityLogService.logActivity({
    action: 'TASK_CREATE',
    description: `Task "${result.title}" created in project "${project.name}" and assigned to ${assigneeName}`,
    metadata: { taskId: result._id, projectId: project._id },
    timestamp: new Date(),
    createdBy: user.userId,
  });

  return result;
};

const getAllTasksFromDB = async (user: JwtPayload, query: Record<string, unknown>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filterQuery: Record<string, any> = { isDeleted: { $ne: true } };

  // Copy query object to prevent direct mutation
  const queryObj = { ...query };

  // If a team_member is querying, we only show tasks from projects they belong to
  if (user.role === 'team_member') {
    const memberProjects = await Project.find({ members: user.userId, isDeleted: false }).select('_id');
    const projectIds = memberProjects.map((p) => p._id);
    filterQuery.project = { $in: projectIds };
  }

  // If project id is passed explicitly, add it to filterQuery
  if (queryObj.project) {
    filterQuery.project = queryObj.project;
  }

  // If assignedMember filter is passed
  if (queryObj.assignedMember) {
    filterQuery.assignedMember = queryObj.assignedMember;
  }

  // Handle custom filter: isPending (not completed tasks)
  if (queryObj.isPending === 'true') {
    filterQuery.status = { $ne: 'completed' };
    delete queryObj.isPending;
  }

  // Handle custom filter: deadlineStatus (upcoming / overdue)
  if (queryObj.deadlineStatus) {
    const today = new Date();
    if (queryObj.deadlineStatus === 'overdue') {
      filterQuery.dueDate = { $lt: today };
      filterQuery.status = { $ne: 'completed' };
    } else if (queryObj.deadlineStatus === 'upcoming') {
      filterQuery.dueDate = { $gte: today };
      filterQuery.status = { $ne: 'completed' };
    }
    delete queryObj.deadlineStatus;
  }

  const taskQuery = new QueryBuilder(
    Task.find(filterQuery)
      .populate('project', 'name status deadline')
      .populate('assignedMember', 'name email role'),
    queryObj
  )
    .search(['title', 'description'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await taskQuery.modelQuery;
  const meta = await taskQuery.countTotal();

  return {
    meta,
    data: result,
  };
};

const getSingleTaskFromDB = async (id: string, user: JwtPayload) => {
  const task = await Task.findById(id)
    .populate('project', 'name status deadline members')
    .populate('assignedMember', 'name email role');

  if (!task || task.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Task not found');
  }

  // Access check: Team member must belong to the project
  if (user.role === 'team_member') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projectMembers = (task.project as any)?.members || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isMember = projectMembers.some((m: any) => m.toString() === user.userId);
    if (!isMember) {
      throw new AppError(httpStatus.FORBIDDEN, 'You do not have access to this task');
    }
  }

  return task;
};

const updateTaskInDB = async (id: string, user: JwtPayload, payload: Partial<TTask>) => {
  const task = await Task.findById(id).populate('project', 'name members');
  if (!task || task.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Task not found');
  }

  // Permissions Check:
  // Admin and PM can update anything.
  // Team Member can only update tasks assigned to them.
  if (user.role === 'team_member') {
    if (!task.assignedMember || task.assignedMember.toString() !== user.userId) {
      throw new AppError(httpStatus.FORBIDDEN, 'Team members can only update tasks assigned to them.');
    }
    
    // Team member should not be allowed to change assignee or project or due date. Let's strip those!
    delete payload.assignedMember;
    delete payload.project;
    delete payload.dueDate;
    delete payload.title;
  }

  // Rule: Prevent setting past dates as deadlines (for PM/Admin updating dates)
  if (payload.dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(payload.dueDate) < today) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Please select a valid deadline.');
    }
  }

  // Rule: Prevent duplicate task titles inside the same project
  if (payload.title && payload.title.trim().toLowerCase() !== task.title.toLowerCase()) {
    const projectTarget = payload.project || task.project._id;
    const duplicate = await Task.findOne({
      project: projectTarget,
      title: { $regex: new RegExp(`^${payload.title.trim()}$`, 'i') },
      _id: { $ne: id },
      isDeleted: false,
    });
    if (duplicate) {
      throw new AppError(httpStatus.BAD_REQUEST, 'This task already exists in the project.');
    }
  }

  // Rule: Prevent assigning completed tasks / Completed tasks cannot be reassigned
  if (task.status === 'completed' && payload.assignedMember && payload.assignedMember.toString() !== task.assignedMember?.toString()) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Completed tasks cannot be reassigned.');
  }

  // Keep track of change description for activity logs
  let changeDescription = `Task "${task.title}" updated by ${user.email}`;

  // If status is updated to completed
  if (payload.status && payload.status !== task.status) {
    changeDescription = `Task "${task.title}" marked as ${payload.status} by ${user.email}`;

    // Send notifications if someone else completed it, or send to PM/Creator
    if (task.assignedMember && task.assignedMember.toString() !== user.userId) {
      await Notification.create({
        recipient: task.assignedMember,
        sender: user.userId,
        message: `Your task "${task.title}" status was updated to "${payload.status}" by ${user.email}`,
        type: 'task_updated',
        relatedId: task._id,
      });
    }
  }

  // If task is being reassigned
  if (payload.assignedMember && payload.assignedMember.toString() !== task.assignedMember?.toString()) {
    const newAssignee = await User.findById(payload.assignedMember);
    if (newAssignee) {
      changeDescription = `Task "${task.title}" reassigned to ${newAssignee.name} by ${user.email}`;

      // Trigger Notification to new assignee
      await Notification.create({
        recipient: payload.assignedMember,
        sender: user.userId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        message: `You have been assigned the task: "${task.title}" in project "${(task.project as any)?.name}"`,
        type: 'task_assigned',
        relatedId: task._id,
      });
    }
  }

  const result = await Task.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .populate('project', 'name status deadline')
    .populate('assignedMember', 'name email role');

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Task update failed');
  }

  // Log activity
  await ActivityLogService.logActivity({
    action: 'TASK_UPDATE',
    description: changeDescription,
    metadata: { taskId: result._id, projectId: task.project._id, updatedFields: Object.keys(payload) },
    timestamp: new Date(),
    createdBy: user.userId,
  });

  return result;
};

const deleteTaskFromDB = async (id: string, user: JwtPayload) => {
  const task = await Task.findById(id);
  if (!task || task.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Task not found');
  }

  // Only Admin or Project Manager can delete tasks
  if (user.role === 'team_member') {
    throw new AppError(httpStatus.FORBIDDEN, 'Only Admins and Project Managers can delete tasks');
  }

  task.isDeleted = true;
  await task.save();

  // Log activity
  await ActivityLogService.logActivity({
    action: 'TASK_DELETE',
    description: `Task "${task.title}" deleted by ${user.email}`,
    metadata: { taskId: task._id, projectId: task.project },
    timestamp: new Date(),
    createdBy: user.userId,
  });

  return task;
};

// Workload analytics summary
const getStaffLoadSummary = async () => {
  // Aggregate tasks group by assignedMember where task is not deleted and status is not completed
  const summary = await Task.aggregate([
    {
      $match: {
        isDeleted: false,
        assignedMember: { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: '$assignedMember',
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
        pendingTasks: {
          $sum: { $cond: [{ $ne: ['$status', 'completed'] }, 1, 0] },
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userInfo',
      },
    },
    {
      $unwind: '$userInfo',
    },
    {
      $project: {
        _id: 0,
        staffId: '$_id',
        name: '$userInfo.name',
        role: '$userInfo.role',
        totalTasks: 1,
        completedTasks: 1,
        pendingTasks: 1,
        load: { $concat: [{ $toString: '$pendingTasks' }, ' / 5'] }, // load representation
      },
    },
  ]);

  return summary;
};

// Dashboard KPI stats
const getDashboardStats = async (user: JwtPayload) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filterQuery: Record<string, any> = { isDeleted: false };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projectFilterQuery: Record<string, any> = { isDeleted: false };

  // For team member, we only show projects/tasks they belong to
  if (user.role === 'team_member') {
    const memberProjects = await Project.find({ members: user.userId, isDeleted: false }).select('_id');
    const projectIds = memberProjects.map((p) => p._id);
    filterQuery.project = { $in: projectIds };
    projectFilterQuery.members = user.userId;
  }

  const totalProjects = await Project.countDocuments(projectFilterQuery);
  const totalTasks = await Task.countDocuments(filterQuery);

  const completed = await Task.countDocuments({
    ...filterQuery,
    status: 'completed',
  });

  const pending = await Task.countDocuments({
    ...filterQuery,
    status: { $ne: 'completed' },
  });

  const overdue = await Task.countDocuments({
    ...filterQuery,
    status: { $ne: 'completed' },
    dueDate: { $lt: new Date() },
  });

  // Calculate project progress levels
  const projectsData = await Project.find(projectFilterQuery).select('_id name deadline status');
  const projectSummaries = [];

  for (const proj of projectsData) {
    const projectTasksCount = await Task.countDocuments({ project: proj._id, isDeleted: false });
    const projectTasksCompleted = await Task.countDocuments({ project: proj._id, status: 'completed', isDeleted: false });
    
    let progressPercentage = 0;
    if (projectTasksCount > 0) {
      progressPercentage = Math.round((projectTasksCompleted / projectTasksCount) * 100);
    }

    const pendingCount = projectTasksCount - projectTasksCompleted;
    
    // Build descriptive message (e.g., "5 tasks pending", "80% completed", etc.)
    let summaryText = `${pendingCount} tasks pending`;
    if (proj.status === 'completed') {
      summaryText = '100% completed';
    } else if (progressPercentage > 0) {
      summaryText = `${progressPercentage}% completed`;
    } else {
      const daysLeft = Math.ceil((new Date(proj.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      if (daysLeft > 0 && daysLeft <= 2) {
        summaryText = `Deadline in ${daysLeft} days`;
      }
    }

    projectSummaries.push({
      projectId: proj._id,
      name: proj.name,
      tasksCount: projectTasksCount,
      completedCount: projectTasksCompleted,
      progressPercentage,
      summaryText,
    });
  }

  return {
    totalProjects,
    totalTasks,
    completed,
    pending,
    overdue,
    projectSummaries,
  };
};

const bulkUpdateTasksInDB = async (
  user: JwtPayload,
  taskIds: string[],
  status: 'todo' | 'in_progress' | 'completed'
) => {
  const results = [];
  for (const id of taskIds) {
    const result = await updateTaskInDB(id, user, { status });
    results.push(result);
  }
  return results;
};

const bulkDeleteTasksFromDB = async (user: JwtPayload, taskIds: string[]) => {
  const results = [];
  for (const id of taskIds) {
    const result = await deleteTaskFromDB(id, user);
    results.push(result);
  }
  return results;
};

export const TaskService = {
  createTaskIntoDB,
  getAllTasksFromDB,
  getSingleTaskFromDB,
  updateTaskInDB,
  deleteTaskFromDB,
  getStaffLoadSummary,
  getDashboardStats,
  bulkUpdateTasksInDB,
  bulkDeleteTasksFromDB,
};
