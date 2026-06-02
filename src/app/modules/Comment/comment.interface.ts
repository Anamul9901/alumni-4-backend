import { Types } from 'mongoose';

export interface TComment {
  task: Types.ObjectId;
  user: Types.ObjectId;
  comment: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
