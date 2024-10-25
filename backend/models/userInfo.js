const { uuid } = require('uuidv4');
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
  addressIds: [Schema.Types.ObjectId]
},
{timestamps: true});

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
exports.findById = (id) => userInfo.find(user => user.id === `${id}`);

/**
 * Searches the user info array for a specific username
 * @param {string} username 
 * @returns the matched user object. Otherwise, returns undefined
 */
exports.findByUsername = (username) => userInfo.find(user => user.username === username);

/**
 * Accepts a username and password, and verifies if the details match a user.
 * @param {string} username 
 * @param {string} pass 
 * @returns the user who was found. Otherwise returns undefined.
 */
exports.verifyUsernameAndPassword = (username, pass) => {
  const user = userInfo.find(u => u.username === username);
  if(!user) return undefined;
  
  return new Promise((resolve, reject) => {
    bcrypt.compare(pass, user.password)
    .then(success => {
      if(success) resolve(user);
      // TODO: remove unhashed password check eventually
      else if (user.password === pass) resolve(user);
      else return resolve(undefined);
    })
    .catch(err => reject(err));
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
      const token = await jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: '1h'});
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
exports.addNewUser = (user) => {
  // TODO: add to database, not array.
    user.id = uuid();
    userInfo.push(user);
    return user.id;
};