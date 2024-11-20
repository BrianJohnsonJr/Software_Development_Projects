const express = require('express');
const User = require('../models/users');
const Post = require('../models/posts');
const { AuthorizeUser, VerifyLastId, VerifyParamsId } = require('../services/authService');
const { uploadToMemory, uploadToCloud, replaceFilePath, verifyS3 } = require('../services/fileService');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const router = express.Router();

/**
 * Queries the posts and returns posts matching the specified query.
 * Allows for paging with lastId=<id>
 */
router.get('/search', verifyS3, async (req, res, next) => {
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
            $and: [
                ...searchQuery,
                ...pageQuery
            ],
        };

        const postsFound = await Post.find(wholeQuery).populate('owner', 'username name').sort({ _id: -1 }).limit(25);
        const totalFound = await Post.countDocuments(wholeQuery); // Count the amount of results

        if(posts.length > 0) {
            await replaceFilePath(req.s3, postsFound);
            res.json({ success: true, posts: postsFound, resultCount: totalFound });
        }
        else res.json([]);

    }
    catch (err) { next(err); }
});

router.post('/create', AuthorizeUser, uploadToMemory.single('image'), async (req, res, next) => {
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
});

/**
 * This route will give the data for the 25 most recent posts following.
 * query with lastId=<id> to get another page (the last id of the page previous)
*/
router.get('/following', AuthorizeUser, VerifyLastId, verifyS3, async (req, res, next) => {
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
});

/**
 * This route displays the newest posts.
 * query with lastId=<id> to get another page (send the last id of the page previous)
*/
router.get('/explore', VerifyLastId, verifyS3, async (req, res, next) => {
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
});

/*
router.get('/search-results', async (req, res, next) => {
    try {
        // Collect search parameters
        const { searchTerm } = req.query;

        if (!searchTerm || searchTerm.trim() === "") {
            return res.status(400).json({ message: 'Search term is required.' });
        }

        console.log("Search term: ", searchTerm);
        const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters

        // Use the escaped search term in regex
        const searchRegex = new RegExp(escapedSearchTerm, 'i');

        // Search criteria for users
        const userCriteria = {
            $or: [
                { username: { $regex: searchRegex } },
                { name: { $regex: searchRegex } },
                { bio: { $regex: searchRegex } }
            ]
        };

        // Search criteria for posts
        const postCriteria = {
            $or: [
                { title: { $regex: searchRegex } },
                { description: { $regex: searchRegex } },
                { 'owner.username': { $regex: searchRegex } },
                { 'owner.name': { $regex: searchRegex } }
            ]
        };
        // Fetch users and posts
        const [users, posts] = await Promise.all([
            User.find(userCriteria).select('-password'), // Exclude password
            Post.find(postCriteria).limit(25).sort({ _id: -1 }) // Latest 25 posts
        ]);

        // Return combined results
        res.json({ users, posts });
    }
    catch (error) { next(error); }
});*/

/**
 * Route used to find all the posts by the signed in person 
 * query with lastId=<id> to get another page (send the last id of the page previous)
*/
router.get('/user', AuthorizeUser, VerifyLastId, verifyS3, async (req, res, next) => {
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
});

/**
 * Provides the post data with the specified id
 */
router.get('/:id', VerifyParamsId, verifyS3, async (req, res, next) => {
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
});

module.exports = router;