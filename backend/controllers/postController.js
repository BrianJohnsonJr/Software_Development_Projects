const User = require('../models/users');
const Post = require('../models/posts');
const { uploadToCloud, replaceFilePath } = require('../services/fileService');

/**
 * Searches for posts based on a search term, with optional pagination and filtering by tags.
 * The search term is applied to the title, description, and tags of posts.
 * 
 * Supports pagination by using `lastId` to fetch posts before the provided ID.
 */
exports.search = async (req, res, next) => {
    try {
        const searchParams = req.query.query?.trim() || '';
        const searchQuery = searchParams ? {
            $or: [
                { title: { $regex: searchParams, $options: 'i' }},
                { description: { $regex: searchParams, $options: 'i' }},
                { tags: { $elemMatch: { $regex: searchParams, $options: 'i' }}}
            ],
        }
        : {};

        const lastId = req.query.lastId || null;
        const pageQuery = lastId ? { _id: { $lt: lastId }} : {};
        
        // Combine our 4 branching paths into 1 full query
        const wholeQuery = {
            ...searchQuery,
            ...pageQuery
        };


        const postsFound = await Post.find(wholeQuery).populate('owner', 'username name').sort({ _id: -1 }).limit(25);
        const totalFound = await Post.countDocuments(wholeQuery); // Count the amount of results

        if(postsFound.length > 0) {
            await replaceFilePath(req.s3, postsFound);
            res.json({ success: true, posts: postsFound, resultCount: totalFound });
        }
        else res.json([]);

    }
    catch (err) { next(err); }
};

/**
 * Creates a new post by validating input, uploading the post image to the cloud, and saving the post to the database.
 * The post is associated with the authenticated user who is creating it.
 * 
 * Required fields include title, description, price, and itemType. Tags and sizes are optional.
 */
exports.newPost = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // grab user w/o password'
        
        if(!user) {
            let err = new Error('No user logged in')
            err.status = 401;
            next(err);
        }

        const { title, description, price, image, tags, itemType, sizes } = req.body;

        // Validate required fields
        if (!title || !description || !price || !itemType) {
            let err = new Error('Missing required fields');
            err.status = 400;
            return next(err);
        }

        const newPost = new Post({
            title, 
            description,
            price,
            image,
            tags: tags || [],
            itemType,
            sizes: sizes || [],
            owner: user._id,
        });
        
        const file = await uploadToCloud(req.s3, req.file);
        newPost.image = file.filename;

        // Save the new post to the database
        const savedPost = await newPost.save();
        
        // Respond with success and the created post's ID
        res.status(201).json({ 
            success: true, 
            message: 'Post successfully created', 
            postId: savedPost._id 
        });
    }
    catch (error) {
        if(error.name === 'ValidationError')
            error.status = 400;
        next(error);
    }
};

/**
 * Retrieves posts from users that the authenticated user is following.
 * Supports pagination using `lastId` to fetch posts before a certain post ID.
 */
exports.following = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id, { password: 0 });
        if(!user.following || user.following.length === 0) {
            res.json([]);
        } else {
            
            const lastId = req.query.lastId || null;
            const following = user.following;
            
            const query = lastId ? { $and: [
                { _id: { $lt: lastId }},
                { owner: {$in: following }}
            ],
            }
            : { owner: {$in: following }};

            // grab 25 posts, sorted by time (id) desc. 25 newest posts.
            const posts = await Post.find(query).populate('owner', 'username name').sort({ _id: -1 }).limit(25);
            
            if(posts.length > 0) {
                await replaceFilePath(req.s3, posts);
                res.json(posts);
            }
            else res.json([]);
        }
    }
    catch (error) { next(error); }
};

/**
 * Retrieves 25 of the newest posts, not filtered by user or following.
 * Supports pagination using `lastId` to fetch posts before a specific post ID.
 */
exports.explore = async (req, res, next) => {
    try {
        // grab 25 posts, sorted by time (id) desc. 25 newest posts.
        const lastId = req.query.lastId || null;
        const query = lastId ? { _id: { $lt: lastId }} : {};
        const posts = await Post.find(query).populate('owner', 'username name').sort({ _id: -1 }).limit(25);

        if(posts.length > 0) {
            await replaceFilePath(req.s3, posts);
            res.json(posts);
        }
        else res.json([]);
    }
    catch (error) { next(error); }
};

/**
 * Retrieves posts created by the authenticated user. Supports pagination with `lastId`.
 */
exports.userPosts = async (req, res, next) => {
    try {
        if(!req.user.id) { // maybe not needed?
            let err = new Error("User not signed in");
            err.status = 400;
            next(err);
        }
        
        const lastId = req.query.lastId || null;
        const query = lastId ? { _id: { $lt: lastId }} : {};
        const posts = await Post.find({$and: [{query}, { owner: req.user.id }]}).populate('owner', 'username name').sort({ _id: -1 }).limit(25);
        
        if(posts.length > 0) {
            await replaceFilePath(req.s3, posts);
            res.json(posts);
        }
        else res.json([]);
    }
    catch (error) { next(error); }
};

/**
 * Retrieves detailed information about a specific post by its ID.
 * This route is designed to be the last route in the controller because it catches unmatched post routes.
 */
exports.getPostInfo = async (req, res, next) => {
    // THIS ROUTE NEEDS TO BE LAST BECAUSE IT CATCHES OTHER ROUTES OTHERWISE!
    try {
        let id = req.params.id;
      
        const post = await Post.findById(id).populate('owner', 'username name');
        if(!post){
            let err = new Error('Post not found');
            err.status = 404;
            return next(err);
        }
      
        await replaceFilePath(req.s3, post);
        res.json({ success: true, post: post});
    }
    catch (error) { 
        if (error.kind === 'ObjectId') {
            // Handle invalid ObjectId errors
            return res.status(400).json({ success: false, message: 'Invalid post ID format' });
        }
        next(error); 
    }
}