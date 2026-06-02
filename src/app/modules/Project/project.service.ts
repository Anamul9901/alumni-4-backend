import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { ActivityLogService } from '../ActivityLog/activityLog.service';
import { TProject } from './project.interface';
import { Project } from './project.model';

const createProjectIntoDB = async (user: JwtPayload, payload: TProject) => {
  // Ensure the creator is set
  payload.createdBy = user.userId;
  
  // Create project
  const result = await Project.create(payload);

  // Log activity
  await ActivityLogService.logActivity({
    action: 'PROJECT_CREATE',
    description: `Project "${result.name}" created by ${user.email}`,
    metadata: { projectId: result._id },
    timestamp: new Date(),
    createdBy: user.userId,
  });

  return result;
};

const getAllProjectsFromDB = async (user: JwtPayload, query: Record<string, unknown>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filterQuery: Record<string, any> = { isDeleted: { $ne: true } };

  // Team members can only see projects they are assigned to
  if (user.role === 'team_member') {
    filterQuery.members = user.userId;
  }

  const projectQuery = new QueryBuilder(
    Project.find(filterQuery)
      .populate('members', 'name email role')
      .populate('createdBy', 'name email'),
    query
  )
    .search(['name', 'description'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await projectQuery.modelQuery;
  const meta = await projectQuery.countTotal();

  return {
    meta,
    data: result,
  };
};

const getSingleProjectFromDB = async (id: string, user: JwtPayload) => {
  const project = await Project.findById(id)
    .populate('members', 'name email role')
    .populate('createdBy', 'name email');

  if (!project || project.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  // Restrict access for team members who are not part of the project
  if (
    user.role === 'team_member' &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    !project.members.some((m: any) => m._id.toString() === user.userId)
  ) {
    throw new AppError(httpStatus.FORBIDDEN, 'You do not have access to this project');
  }

  return project;
};

const updateProjectInDB = async (id: string, user: JwtPayload, payload: Partial<TProject>) => {
  const project = await Project.findById(id);

  if (!project || project.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  // Only Admin or Project Manager can edit projects
  if (user.role === 'team_member') {
    throw new AppError(httpStatus.FORBIDDEN, 'You do not have permission to edit projects');
  }

  const result = await Project.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .populate('members', 'name email role')
    .populate('createdBy', 'name email');

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project update failed');
  }

  // Log activity
  await ActivityLogService.logActivity({
    action: 'PROJECT_UPDATE',
    description: `Project "${result.name}" updated by ${user.email}`,
    metadata: { projectId: result._id, updatedFields: Object.keys(payload) },
    timestamp: new Date(),
    createdBy: user.userId,
  });

  return result;
};

const deleteProjectFromDB = async (id: string, user: JwtPayload) => {
  const project = await Project.findById(id);

  if (!project || project.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  // Only Admin or Project Manager can delete projects
  if (user.role === 'team_member') {
    throw new AppError(httpStatus.FORBIDDEN, 'You do not have permission to delete projects');
  }

  // Soft delete
  project.isDeleted = true;
  await project.save();

  // Log activity
  await ActivityLogService.logActivity({
    action: 'PROJECT_DELETE',
    description: `Project "${project.name}" deleted by ${user.email}`,
    metadata: { projectId: project._id },
    timestamp: new Date(),
    createdBy: user.userId,
  });

  return project;
};

export const ProjectService = {
  createProjectIntoDB,
  getAllProjectsFromDB,
  getSingleProjectFromDB,
  updateProjectInDB,
  deleteProjectFromDB,
};
