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

// This array will be replaced by our database in sprint 2 most likely.
const userInfo = [
    {
      _id: "66eda5f1c49d80aeb5f5dcff",
      name: "Jane Doe",
      email: "jane@abc.com",
      username: "jDoe26",
      postIds: ["databases", "painting", "soccer"],
      password: "jane123",
      addressIds: [""]
    },
    {
      _id: "55eda5f1c49d80aeb5f5dcff",
      name: "John Smith",
      email: "john@xyz.com",
      username: "jsmith88",
      postIds: ["gaming", "programming", "travel"],
      password: "john123",
      addressIds: ["address1"]
    },
    {
      _id: "77eda5f1c49d80aeb5f5dcff",
      name: "Alice Brown",
      email: "alice@xyz.com",
      username: "aliceB",
      postIds: ["fashion", "cooking", "fitness"],
      password: "alice456",
      addressIds: ["address2"]
    },
    {
      _id: "88eda5f1c49d80aeb5f5dcff",
      name: "Bob Johnson",
      email: "bob@abc.com",
      username: "bobbyJ",
      postIds: ["photography", "music", "writing"],
      password: "bob789",
      addressIds: ["address3"]
    },
    {
      _id: "99eda5f1c49d80aeb5f5dcff",
      name: "Charlie Green",
      email: "charlie@def.com",
      username: "charlieG23",
      postIds: ["movies", "sports", "technology"],
      password: "charlie321",
      addressIds: ["address4"]
    },
    {
      _id: "00eda5f1c49d80aeb5f5dcff",
      name: "Emily White",
      email: "emily@abc.com",
      username: "emilyW",
      postIds: ["photography", "travel", "fashion"],
      password: "emily123",
      addressIds: ["address5"]
    },
    {
      _id: "11eda5f1c49d80aeb5f5dcff",
      name: "David Harris",
      email: "david@xyz.com",
      username: "dHarris",
      postIds: ["sports", "gaming", "travel"],
      password: "david456",
      addressIds: ["address6"]
    },
    {
      _id: "22eda5f1c49d80aeb5f5dcff",
      name: "Sara King",
      email: "sara@def.com",
      username: "saraK",
      postIds: ["art", "music", "cooking"],
      password: "sara789",
      addressIds: ["address7"]
    },
    {
      _id: "33eda5f1c49d80aeb5f5dcff",
      name: "Tom Lee",
      email: "tom@abc.com",
      username: "tomL22",
      postIds: ["movies", "technology", "writing"],
      password: "tom123",
      addressIds: ["address8"]
    },
    {
      _id: "44eda5f1c49d80aeb5f5dcff",
      name: "Anna Scott",
      email: "anna@xyz.com",
      username: "annaS",
      postIds: ["photography", "art", "fashion"],
      password: "anna456",
      addressIds: ["address9"]
    }
  ];

/** 
 * @deprecated Gets the entire array of user info. Should not be used once the DB is fully implemented.
 * @returns a user object
 */
exports.get = () => userInfo;

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