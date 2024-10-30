// userInfo.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the user schema
const userSchema = new Schema({
  name: { type: String, required: [true, 'Name is required'] },
  email: { type: String, required: [true, 'Email is required'], unique: true },
  username: { type: String, required: [true, 'Username is required'], unique: true },
  password: { type: String, required: [true, 'Password is required'] },
  profilePicture: { type: String, default: '' }, // profile picture optional
  bio: { type: String, maxLength: 300 },
  postIds: [{ type: Schema.Types.ObjectId, ref: 'Post', default: [] }],
  addressIds: [{ type: Schema.Types.ObjectId, ref: 'Address', default: [] }],
  recentlyViewed: [{ type: Schema.Types.ObjectId, ref: 'Post', default: [] }],
  followers: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  following: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  likedPosts: [{ type: Schema.Types.ObjectId, ref: 'Post', default: [] }],
}, { timestamps: true });

// Mongoose model
const User = mongoose.model('User', userSchema);

module.exports = User;
