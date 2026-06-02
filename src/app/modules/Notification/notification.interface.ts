import { Types } from 'mongoose';

export interface TNotification {
  recipient: Types.ObjectId;
  sender: Types.ObjectId;
  message: string;
  type: 'task_assigned' | 'task_updated' | 'comment_added' | 'project_added';
  relatedId?: Types.ObjectId;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
