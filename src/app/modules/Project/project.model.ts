import { Schema, model } from 'mongoose';
import { TProject } from './project.interface';

const projectSchema = new Schema<TProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'on_hold'],
      default: 'active',
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true,
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Query middleware to exclude soft-deleted projects by default
projectSchema.pre(/^find/, function (next) {
  const filter = (this as any).getFilter();
  if (filter.isDeleted === undefined) {
    (this as any).find({ isDeleted: { $ne: true } });
  }
  next();
});

export const Project = model<TProject>('Project', projectSchema);
