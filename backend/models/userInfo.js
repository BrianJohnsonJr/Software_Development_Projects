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
  postIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  addressIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }]
}, { timestamps: true });

// Mongoose model
const User = mongoose.model('User', userSchema);

// Helper functions
module.exports = {
    User,
    getAllUsers: () => User.find(),
    findById: (id) => User.findById(id),
    findByUsername: (username) => User.findOne({ username }),
    addNewUser: async (userData) => {
        const user = new User(userData);
        return await user.save();
    }
};
