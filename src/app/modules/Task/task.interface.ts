import { Types } from 'mongoose';

export interface TTask {
  title: string;
  description: string;
  project: Types.ObjectId;
  assignedMember?: Types.ObjectId;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'completed';
  attachments: string[];
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
