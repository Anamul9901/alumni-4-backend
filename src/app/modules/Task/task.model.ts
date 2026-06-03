import { Schema, model } from 'mongoose';
import { TTask } from './task.interface';

const taskSchema = new Schema<TTask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    assignedMember: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'completed'],
      default: 'todo',
    },
    attachments: [
      {
        type: String,
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce unique task titles per project while ignoring deleted tasks
taskSchema.index(
  { project: 1, title: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

// Query middleware to exclude soft-deleted tasks by default
taskSchema.pre(/^find/, function (next) {
  const filter = (this as any).getFilter();
  if (filter.isDeleted === undefined) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).find({ isDeleted: { $ne: true } });
  }
  next();
});

export const Task = model<TTask>('Task', taskSchema);
