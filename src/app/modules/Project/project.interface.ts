import { Types } from 'mongoose';

export interface TProject {
  name: string;
  description: string;
  deadline: Date;
  status: 'active' | 'completed' | 'on_hold';
  members: Types.ObjectId[];
  createdBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
