import { Schema, model } from 'mongoose';
import { TActivityLog } from './activityLog.interface';

const activityLogSchema = new Schema<TActivityLog>(
    {
        action: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        metadata: {
            type: Map,
            of: Schema.Types.Mixed,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        }
    },
    {
        timestamps: false,
    }
);

activityLogSchema.index({ timestamp: -1 });

export const ActivityLog = model<TActivityLog>('ActivityLog', activityLogSchema);
