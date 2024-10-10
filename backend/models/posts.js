const { uuid } = require('uuidv4');

const posts = [
    {
        title: "Epic post",
        description: "This post is so epic",
        ownerId: '1',
        price: 500,
        imageUrl: null,
        tags: ['cool', 'cheap'],
        likes: ['2', '4']
    },
    {
        title: "Awesome merch",
        description: "You won't believe how cool this is",
        ownerId: '2',
        price: 700,
        imageUrl: null,
        tags: ['cool', 'trending'],
        likes: ['1', '3', '5']
    },
    {
        title: "Limited edition",
        description: "Only a few left, grab yours now!",
        ownerId: '3',
        price: 1500,
        imageUrl: null,
        tags: ['rare', 'exclusive'],
        likes: ['2', '5', '6']
    },
    {
        title: "Classic design",
        description: "A timeless piece for any collection",
        ownerId: '4',
        price: 900,
        imageUrl: null,
        tags: ['vintage', 'classic'],
        likes: ['1', '2', '4']
    },
    {
        title: "Bold and Beautiful",
        description: "Make a statement with this item",
        ownerId: '5',
        price: 1200,
        imageUrl: null,
        tags: ['bold', 'fashion'],
        likes: ['3', '6']
    },
    {
        title: "Affordable fashion",
        description: "Look great without breaking the bank",
        ownerId: '6',
        price: 300,
        imageUrl: null,
        tags: ['cheap', 'style'],
        likes: ['1', '4', '7']
    },
    {
        title: "Exclusive drop",
        description: "Be the first to get this",
        ownerId: '1',
        price: 2000,
        imageUrl: null,
        tags: ['exclusive', 'new'],
        likes: ['2', '3', '6']
    },
    {
        title: "Summer vibes",
        description: "Perfect for those sunny days",
        ownerId: '2',
        price: 850,
        imageUrl: null,
        tags: ['summer', 'bright'],
        likes: ['3', '5']
    },
    {
        title: "Winter essentials",
        description: "Stay warm and stylish",
        ownerId: '3',
        price: 1300,
        imageUrl: null,
        tags: ['winter', 'cozy'],
        likes: ['1', '2', '7']
    },
    {
        title: "Sporty look",
        description: "For the active lifestyle",
        ownerId: '4',
        price: 600,
        imageUrl: null,
        tags: ['sport', 'comfortable'],
        likes: ['2', '5']
    },
    {
        title: "Retro vibes",
        description: "Step back in time with this classic",
        ownerId: '5',
        price: 1000,
        imageUrl: null,
        tags: ['retro', 'nostalgia'],
        likes: ['1', '4', '6']
    },
    {
        title: "Urban streetwear",
        description: "The latest in street style",
        ownerId: '6',
        price: 1100,
        imageUrl: null,
        tags: ['urban', 'street'],
        likes: ['3', '5']
    },
    {
        title: "Sleek design",
        description: "Modern and minimal",
        ownerId: '1',
        price: 750,
        imageUrl: null,
        tags: ['modern', 'sleek'],
        likes: ['2', '6']
    },
    {
        title: "Pop culture icon",
        description: "For the true fans",
        ownerId: '2',
        price: 950,
        imageUrl: null,
        tags: ['pop', 'culture'],
        likes: ['1', '4', '7']
    },
    {
        title: "Outdoor adventure",
        description: "Gear up for your next trip",
        ownerId: '3',
        price: 1700,
        imageUrl: null,
        tags: ['adventure', 'outdoors'],
        likes: ['2', '5']
    },
    {
        title: "Casual comfort",
        description: "Relax in style",
        ownerId: '4',
        price: 550,
        imageUrl: null,
        tags: ['casual', 'comfort'],
        likes: ['1', '6']
    },
    {
        title: "Elegant and chic",
        description: "For special occasions",
        ownerId: '5',
        price: 1800,
        imageUrl: null,
        tags: ['elegant', 'chic'],
        likes: ['3', '4', '7']
    },
    {
        title: "Festival must-have",
        description: "Stand out at your next event",
        ownerId: '6',
        price: 1400,
        imageUrl: null,
        tags: ['festival', 'fun'],
        likes: ['2', '5']
    },
    {
        title: "Minimalist vibe",
        description: "Clean lines and simple design",
        ownerId: '1',
        price: 650,
        imageUrl: null,
        tags: ['minimalist', 'modern'],
        likes: ['1', '6']
    },
    {
        title: "Bright and bold",
        description: "For those who love color",
        ownerId: '2',
        price: 900,
        imageUrl: null,
        tags: ['bold', 'bright'],
        likes: ['3', '4']
    },
    {
        title: "Handmade with love",
        description: "Crafted with care and precision",
        ownerId: '3',
        price: 2000,
        imageUrl: null,
        tags: ['handmade', 'unique'],
        likes: ['2', '6']
    }
    
];

exports.get = () => {

};

exports.findById = id => {

};

exports.updatePost = post => {

};

exports.newPost = post => {

};

exports.deletePost = post => {

};
