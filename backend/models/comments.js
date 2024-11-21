const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
    text: { type: String, required: [true, 'Comment text is required'] },
    likes: { type: Number, default: 0 }, 
  }, { timestamps: true });
  
  const Comment = mongoose.model('Comment', commentSchema);

  module.exports = Comment;