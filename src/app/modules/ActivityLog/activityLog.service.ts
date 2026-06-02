import QueryBuilder from '../../builder/QueryBuilder';
import { TActivityLog } from './activityLog.interface';
import { ActivityLog } from './activityLog.model';

const logActivity = async (payload: TActivityLog) => {
    const result = await ActivityLog.create(payload);
    return result;
};

const getRecentLogs = async (query: Record<string, unknown>) => {
    const queryObj = { ...query };
    if (queryObj.actionType) {
        queryObj.action = { $regex: `^${queryObj.actionType}`, $options: 'i' };
        delete queryObj.actionType;
    }
    const logQuery = new QueryBuilder(
        ActivityLog.find().populate('createdBy', 'name email'),
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
