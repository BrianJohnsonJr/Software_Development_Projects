const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the user schema
const userSchema = new Schema({
  name: {type: String, required: [true, 'name is required']},
  email: {type: String, required: [true, 'email is required']},
  username: {type: String, required: [true, 'username is required']},
  password: {type: String, required: [true, 'password is required']},
  postIds: [Schema.Types.ObjectId],
  addressIds: [Schema.Types.ObjectId],
  pfp: String,
  recentlyViewed: [Schema.Types.ObjectId],
  bio: String,
  followers: [Schema.Types.ObjectId],
  following: [Schema.Types.ObjectId],
  likedPosts: [Schema.Types.ObjectId]
});

const userModel = mongoose.model('User', userSchema);

/** 
 * @deprecated Gets the entire array of user info. Should not be used once the DB is fully implemented.
 * @returns an array of all user objects
 */
exports.get = async () => {
  const allUsers = await userModel.find();
  return Array.from(allUsers);
};

/**
 *  Searches the user info array for a specific ID and returns it
 */
exports.findById = async (id) => await userModel.findById(id);

/**
 * Searches the user info array for a specific username
 * @param {string} username 
 * @returns the matched user object. Otherwise, returns undefined
 */
exports.findByUsername = async (username) => await userModel.find({ username: username });

/**
 * Accepts a username and password, and verifies if the details match a user.
 * @param {string} username 
 * @param {string} pass 
 * @returns the user who was found. Otherwise returns undefined.
 */
exports.verifyUsernameAndPassword = async (username, pass) => {
  const user = await findByUsername(username);
  if(!user) return undefined;
  
  return new Promise(async (resolve, reject) => {
    try {
      const success = await bcrypt.compare(pass, user.password);
  
      if(success) resolve(user);
      else resolve(undefined);
    }
    catch (err) { reject(err); }
  });
};

/**
 * Accepts a user object and returns a signed token.
 * @param {*} user 
 * @returns 
 */
exports.tokenizeLogin = (user) => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = await jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: '1h'}); // TODO: Change token expiration
      resolve(token);
    }
    catch (err) { reject(err); }

  })
}

/**
 * Accepts a token and verifies if it matches a user.
 * @param {string} token
 */
exports.verifyToken = (token) => {
  // TODO: use the function on line 124 to check after decoding the token.
}

/**
 * Adds a new user to the database
 * @param {*} user 
 * @returns 
 */
exports.addNewUser = async (user) => {
  const userToAdd = new model(user);
  await userToAdd.save(userToAdd);
  return userToAdd.id;
};