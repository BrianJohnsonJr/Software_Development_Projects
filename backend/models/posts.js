const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: { type: String, required: [true, 'Name is required'] },
  description: { type: String, required: [true, 'Description is required'] },
  price: { type: Number, required: [true, 'Price is required'], min: 0.00 },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  image: { type: String, default: '' },
  tags: [{ type: String }],
  itemType: { type: String, required: [true, 'Item type is required'] },
  sizes: [{ type: String }],
  likeCount: { type: Number, default: 0 }
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
/*
const { uuid } = require('uuidv4');

const posts = [
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

exports.get = () => {
    return posts;
};

exports.findById = id => {
    return posts.find(post => post.id === String(id));
};

exports.findByTitle = title => {
    
};

exports.updatePost = post => {
    const index = posts.findIndex(post => post.id === String(id));
    
};

exports.newPost = post => {

};

exports.deletePost = post => {

};
*/