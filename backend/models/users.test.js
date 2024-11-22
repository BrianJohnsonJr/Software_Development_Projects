
const testingUserInfo = [
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

  const mongoose = require('mongoose');
  const User = require('./users');
  require('dotenv').config();
  const mongoUri = process.env.MONGO_URI;
  
  describe('User Schema Test', () => {
    // Array to keep track of created user IDs
    let testUserIds = [];
  
    // Connect to MongoDB before running tests
    beforeAll(async () => {
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    });
  
    // Clear test users after each test
    afterEach(async () => {
      if (testUserIds.length > 0) {
        await User.collection.deleteOne({ _id: { $in: testUserIds } });
        testUserIds = [];
      }
    });
  
    // Disconnect after all tests
    afterAll(async () => {
      await mongoose.connection.close();
    });
  
    // Test valid user creation
    it('should create & save user successfully', async () => {
      const validUser = new User({
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'password123',
        bio: 'Hello, I am John',
        postIds: [new mongoose.Types.ObjectId()],
        addressIds: [new mongoose.Types.ObjectId()]
      });
  
      const savedUser = await validUser.save();
      testUserIds.push(savedUser._id);
      
      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe(validUser.name);
      expect(savedUser.email).toBe(validUser.email);
      expect(savedUser.username).toBe(validUser.username);
      expect(savedUser.password).toBe(validUser.password);
      expect(savedUser.bio).toBe(validUser.bio);
      expect(savedUser.profilePicture).toBe('');
      expect(savedUser.postIds).toEqual(expect.arrayContaining(validUser.postIds));
      expect(savedUser.addressIds).toEqual(expect.arrayContaining(validUser.addressIds));
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });
  
    // Test required fields
    it('should fail to save user without required fields', async () => {
      const userWithoutRequiredFields = new User({});
  
      let err;
      try {
        const savedUser = await userWithoutRequiredFields.save();
        if (savedUser) {
          testUserIds.push(savedUser._id);
        }
      } catch (error) {
        err = error;
      }
  
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.name).toBeDefined();
      expect(err.errors.email).toBeDefined();
      expect(err.errors.username).toBeDefined();
      expect(err.errors.password).toBeDefined();
    });
  
    // Test unique email constraint
    it('should fail to save user with duplicate email', async () => {
      // Create first user
      const firstUser = new User({
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe1',
        password: 'password123'
      });
      const savedFirstUser = await firstUser.save();
      testUserIds.push(savedFirstUser._id);
  
      // Try to create second user with same email
      const secondUser = new User({
        name: 'Jane Doe',
        email: 'john@example.com',
        username: 'janedoe',
        password: 'password456'
      });
  
      let err;
      try {
        const savedSecondUser = await secondUser.save();
        if (savedSecondUser) {
          testUserIds.push(savedSecondUser._id);
        }
      } catch (error) {
        err = error;
      }
  
      expect(err).toBeDefined();
      expect(err.code).toBe(11000);
    });
  
    // Test unique username constraint
    it('should fail to save user with duplicate username', async () => {
      // Create first user
      const firstUser = new User({
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'password123'
      });
      const savedFirstUser = await firstUser.save();
      testUserIds.push(savedFirstUser._id);
  
      // Try to create second user with same username
      const secondUser = new User({
        name: 'Jane Doe',
        email: 'jane@example.com',
        username: 'johndoe', // Same username
        password: 'password456'
      });
  
      let err;
      try {
        const savedSecondUser = await secondUser.save();
        if (savedSecondUser) {
          testUserIds.push(savedSecondUser._id);
        }
      } catch (error) {
        err = error;
      }
  
      expect(err).toBeDefined();
      expect(err.code).toBe(11000);
    });
  
    // Test bio maxLength
    it('should fail to save user with bio exceeding maxLength', async () => {
      const userWithLongBio = new User({
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'password123',
        bio: 'a'.repeat(301)
      });
  
      let err;
      try {
        const savedUser = await userWithLongBio.save();
        if (savedUser) {
          testUserIds.push(savedUser._id);
        }
      } catch (error) {
        err = error;
      }
  
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.bio).toBeDefined();
    });
  
    // Test default value for profilePicture
    it('should set default profilePicture when not provided', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'password123'
      });
  
      const savedUser = await user.save();
      testUserIds.push(savedUser._id);
      expect(savedUser.profilePicture).toBe('');
    });
  
    // Test updating user
    it('should update user successfully', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'password123'
      });
  
      const savedUser = await user.save();
      testUserIds.push(savedUser._id);
      
      const newName = 'John Updated';
      savedUser.name = newName;
      const updatedUser = await savedUser.save();
  
      expect(updatedUser.name).toBe(newName);
      expect(updatedUser.updatedAt).not.toEqual(updatedUser.createdAt);
    });
  
    // Test adding posts and addresses
    it('should add postIds and addressIds successfully', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'password123'
      });
  
      const savedUser = await user.save();
      testUserIds.push(savedUser._id);
      
      const newPostId = new mongoose.Types.ObjectId();
      const newAddressId = new mongoose.Types.ObjectId();
      
      savedUser.postIds.push(newPostId);
      savedUser.addressIds.push(newAddressId);
      
      const updatedUser = await savedUser.save();
  
      expect(updatedUser.postIds).toContainEqual(newPostId);
      expect(updatedUser.addressIds).toContainEqual(newAddressId);
    });
  });