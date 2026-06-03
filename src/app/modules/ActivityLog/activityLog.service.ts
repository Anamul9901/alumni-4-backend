import { JwtPayload } from 'jsonwebtoken';
import QueryBuilder from '../../builder/QueryBuilder';
import { TActivityLog } from './activityLog.interface';
import { ActivityLog } from './activityLog.model';
import { Project } from '../Project/project.model';
import { Task } from '../Task/task.model';

const logActivity = async (payload: TActivityLog) => {
    const result = await ActivityLog.create(payload);
    return result;
};

const getRecentLogs = async (user: JwtPayload, query: Record<string, unknown>) => {
    const queryObj = { ...query };
    if (!queryObj.sort) {
        queryObj.sort = '-timestamp';
    }
    if (queryObj.actionType) {
        queryObj.action = { $regex: `^${queryObj.actionType}`, $options: 'i' };
        delete queryObj.actionType;
    }

    const deletedProjects = await Project.find({ isDeleted: true }).select('_id');
    const deletedProjectIds = [
        ...deletedProjects.map(p => p._id),
        ...deletedProjects.map(p => p._id.toString())
    ];

    const deletedTasks = await Task.find({ isDeleted: true }).select('_id');
    const deletedTaskIds = [
        ...deletedTasks.map(t => t._id),
        ...deletedTasks.map(t => t._id.toString())
    ];

    const deletionFilter = {
        $or: [
            { action: { $in: ['PROJECT_DELETE', 'TASK_DELETE'] } },
            {
                $and: [
                    { action: { $nin: ['PROJECT_DELETE', 'TASK_DELETE'] } },
                    { 'metadata.projectId': { $nin: deletedProjectIds } },
                    { 'metadata.taskId': { $nin: deletedTaskIds } }
                ]
            }
        ]
    };

    let baseQuery: any = deletionFilter;

    if (user.role === 'team_member') {
        const memberProjects = await Project.find({ members: user.userId }).select('_id');
        const projectIds = memberProjects.map(p => p._id);

        const tasks = await Task.find({ project: { $in: projectIds } }).select('_id');
        const taskIds = tasks.map(t => t._id);

        baseQuery = {
            $and: [
                deletionFilter,
                {
                    $or: [
                        { 'metadata.projectId': { $in: projectIds } },
                        { 'metadata.taskId': { $in: taskIds } }
                    ]
                }
            ]
        };
    }

    const logQuery = new QueryBuilder(
        ActivityLog.find(baseQuery).populate('createdBy', 'name email'),
        queryObj
    )
        .filter()
        .sort()
        .paginate();

    const result = await logQuery.modelQuery;
    const meta = await logQuery.countTotal();

    return {
        meta,
        data: result,
    };
};

export const ActivityLogService = {
    logActivity,
    getRecentLogs,
};
