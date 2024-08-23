import {CommentDto} from "../models/comment/comment-dto";

type CommentHolder = {
  parentId: string,
  childComments: CommentDto[],
};

export const unflattener = (comments: CommentDto[]) => {
  const holder: CommentHolder[] = [];
  comments.forEach(c => {
    const existingHolder = holder.find(h => h.parentId == c.parentCommentId);
    if (existingHolder) {
      existingHolder.childComments.push(c);
    } else {
      holder.push({parentId: c.parentCommentId, childComments: [c]});
    }
  });
  comments.forEach(c => {
    c.childComments = holder.find(h => h.parentId === c._id.toString())?.childComments||[];
  });
  return comments.filter(c => c.parentCommentId === "");
}