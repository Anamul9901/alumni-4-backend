import { Schema, model } from 'mongoose';
import { TComment } from './comment.interface';

const commentSchema = new Schema<TComment>(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
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

// Query middleware to exclude soft-deleted comments
commentSchema.pre(/^find/, function (next) {
  const filter = (this as any).getFilter();
  if (filter.isDeleted === undefined) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).find({ isDeleted: { $ne: true } });
  }
  next();
});

export const Comment = model<TComment>('Comment', commentSchema);
