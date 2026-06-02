import { TActivityLog } from './activityLog.interface';
import { ActivityLog } from './activityLog.model';

const logActivity = async (payload: TActivityLog) => {
    const result = await ActivityLog.create(payload);
    return result;
};

const getRecentLogs = async () => {
    const result = await ActivityLog.find().sort({ timestamp: -1 }).limit(10).populate('createdBy', 'name');
    return result;
};

export const ActivityLogService = {
    logActivity,
    getRecentLogs,
};
