const posts = require('./posts');
// get, findById, updatePost, newPost, deletePost

const testingPosts = [
    {
      _id: "67169bdf58329a43cdc22954",
      title: "most likely to be the post ever",
      description: "This is one of the posts of all time.",
      price: 32.39,
      owner: "66eda5f1c49d80aeb5f5dcff",
      image: null,
      imagetype: "shirt",
      sizes: ["S", "M", "L"]
    },
    {
      _id: "67169bdf58329a43cdc22955",
      title: "ultimate hoodie",
      description: "A hoodie like no other.",
      price: 45.99,
      owner: "66eda5f1c49d80aeb5f5dcff",
      image: null,
      imagetype: "hoodie",
      sizes: ["S", "M", "L", "XL"]
    },
    {
      _id: "67169bdf58329a43cdc22956",
      title: "classic cap",
      description: "A cap for every occasion.",
      price: 15.50,
      owner: "66eda5f1c49d80aeb5f5dcff",
      image: null,
      imagetype: "cap",
      sizes: ["One Size"]
    },
    {
      _id: "67169bdf58329a43cdc22957",
      title: "graphic tee",
      description: "A stylish graphic tee.",
      price: 25.00,
      owner: "66eda5f1c49d80aeb5f5dcff",
      image: null,
      imagetype: "shirt",
      sizes: ["S", "M", "L", "XL", "XXL"]
    },
    {
      _id: "67169bdf58329a43cdc22958",
      title: "leather jacket",
      description: "A timeless leather jacket.",
      price: 150.00,
      owner: "66eda5f1c49d80aeb5f5dcff",
      image: null,
      imagetype: "jacket",
      sizes: ["M", "L", "XL"]
    },
    {
      _id: "67169bdf58329a43cdc22959",
      title: "running shoes",
      description: "Comfortable running shoes.",
      price: 75.00,
      owner: "66eda5f1c49d80aeb5f5dcff",
      image: null,
      imagetype: "shoes",
      sizes: ["8", "9", "10", "11"]
    },
    {
      _id: "67169bdf58329a43cdc22960",
      title: "denim jeans",
      description: "Classic blue jeans.",
      price: 60.00,
      owner: "66eda5f1c49d80aeb5f5dcff",
      image: null,
      imagetype: "pants",
      sizes: ["30", "32", "34", "36"]
    },
    {
      _id: "67169bdf58329a43cdc22961",
      title: "beanie",
      description: "A warm winter beanie.",
      price: 12.00,
      owner: "66eda5f1c49d80aeb5f5dcff",
      image: null,
      imagetype: "hat",
      sizes: ["One Size"]
    },
    {
      _id: "67169bdf58329a43cdc22962",
      title: "summer dress",
      description: "Light and breezy summer dress.",
      price: 45.00,
      owner: "66eda5f1c49d80aeb5f5dcff",
      image: null,
      imagetype: "dress",
      sizes: ["S", "M", "L"]
    },
    {
      _id: "67169bdf58329a43cdc22963",
      title: "sneakers",
      description: "Trendy sneakers for everyday wear.",
      price: 80.00,
      owner: "66eda5f1c49d80aeb5f5dcff",
      image: null,
      imagetype: "shoes",
      sizes: ["7", "8", "9", "10"]
    }
  ];

  const Post = require('./posts');
  const mongoose = require('mongoose');
  require('dotenv').config(); // load dotenvs
  
  const mongoUri = process.env.MONGO_URI;
  
  describe('Post Schema Test', () => {
    // Array to keep track of created post IDs
    let testPostIds = [];
  
    // Connect to MongoDB before running tests
    beforeAll(async () => {
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    });
  
    // Clear test posts after each test
    afterEach(async () => {
      if (testPostIds.length > 0) {
        await Post.collection.deleteOne({ _id: { $in: testPostIds } });
        testPostIds = []; // Reset the array
      }
    });
  
    // Disconnect after all tests
    afterAll(async () => {
      await mongoose.connection.close();
    });
  
    // Test valid post creation
    it('should create & save post successfully', async () => {
      const validPost = new Post({
        title: 'Test Post',
        description: 'Test Description',
        price: 99.99,
        owner: new mongoose.Types.ObjectId(),
        itemType: 'clothing',
        tags: ['summer', 'casual'],
        sizes: ['S', 'M', 'L']
      });
  
      const savedPost = await validPost.save();
      testPostIds.push(savedPost._id); // Track the created post
      
      expect(savedPost._id).toBeDefined();
      expect(savedPost.title).toBe(validPost.title);
      expect(savedPost.description).toBe(validPost.description);
      expect(savedPost.price).toBe(validPost.price);
      expect(savedPost.owner).toEqual(validPost.owner);
      expect(savedPost.itemType).toBe(validPost.itemType);
      expect(savedPost.tags).toEqual(expect.arrayContaining(validPost.tags));
      expect(savedPost.sizes).toEqual(expect.arrayContaining(validPost.sizes));
      expect(savedPost.likeCount).toBe(0); // Default value
      expect(savedPost.image).toBe(''); // Default value
      expect(savedPost.createdAt).toBeDefined();
      expect(savedPost.updatedAt).toBeDefined();
    });
  
    // Test required fields
    it('should fail to save post without required fields', async () => {
      const postWithoutRequiredFields = new Post({});
  
      let err;
      try {
        const savedPost = await postWithoutRequiredFields.save();
        if (savedPost) {
          testPostIds.push(savedPost._id); // Track if somehow saved
        }
      } catch (error) {
        err = error;
      }
  
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.title).toBeDefined();
      expect(err.errors.description).toBeDefined();
      expect(err.errors.price).toBeDefined();
    });
  
    // Test price validation
    it('should fail to save post with negative price', async () => {
      const postWithNegativePrice = new Post({
        title: 'Test Post',
        description: 'Test Description',
        price: -10.00,
        owner: new mongoose.Types.ObjectId(),
        itemType: 'clothing'
      });
  
      let err;
      try {
        const savedPost = await postWithNegativePrice.save();
        if (savedPost) {
          testPostIds.push(savedPost._id); // Track if somehow saved
        }
      } catch (error) {
        err = error;
      }
  
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.price).toBeDefined();
    });
  
    // Test default values
    it('should set default values when not provided', async () => {
      const postWithoutDefaults = new Post({
        title: 'Test Post',
        description: 'Test Description',
        price: 99.99,
        owner: new mongoose.Types.ObjectId(),
        itemType: 'clothing'
      });
  
      const savedPost = await postWithoutDefaults.save();
      testPostIds.push(savedPost._id); // Track the created post
      
      expect(savedPost.likeCount).toBe(0);
      expect(savedPost.image).toBe('');
      expect(savedPost.tags).toEqual([]);
      expect(savedPost.sizes).toEqual([]);
    });
  
    // Test updating post
    it('should update post successfully', async () => {
      const post = new Post({
        title: 'Original Title',
        description: 'Original Description',
        price: 99.99,
        owner: new mongoose.Types.ObjectId(),
        itemType: 'clothing'
      });
  
      const savedPost = await post.save();
      testPostIds.push(savedPost._id); // Track the created post
      
      const updatedTitle = 'Updated Title';
      savedPost.title = updatedTitle;
      const updatedPost = await savedPost.save();
  
      expect(updatedPost.title).toBe(updatedTitle);
      expect(updatedPost.updatedAt).not.toEqual(updatedPost.createdAt);
    });
  
    // Test incrementing like count
    it('should increment like count correctly', async () => {
      const post = new Post({
        title: 'Test Post',
        description: 'Test Description',
        price: 99.99,
        owner: new mongoose.Types.ObjectId(),
        itemType: 'clothing'
      });
  
      const savedPost = await post.save();
      testPostIds.push(savedPost._id); // Track the created post
      
      expect(savedPost.likeCount).toBe(0);
  
      savedPost.likeCount += 1;
      const updatedPost = await savedPost.save();
      expect(updatedPost.likeCount).toBe(1);
    });
  });