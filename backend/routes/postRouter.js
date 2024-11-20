const express = require('express');
const User = require('../models/users');
const Post = require('../models/posts');
const { AuthorizeUser, VerifyId } = require('../services/authService');
const { uploadToMemory, uploadToCloud } = require('../services/uploadService');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const router = express.Router();

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
        
        // COMMENT BACK IN WHEN IMAGE UPLOAD IS FULLY FUNCTIONAL
        // const file = await uploadToCloud(req.s3, req.file);
        // newPost.image = file.filename;

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

router.get('/explore', async (req, res, next) => {
    try {
        // grab 25 posts, sorted by time (id) desc. 25 newest posts.
        console.log('Request received on /posts/explore');
        const posts = await Post.find().limit(25).sort({ _id: -1 }); 
        console.log('Posts fetched:', posts);
        if(posts.length > 0)
            res.json(posts);
        else
            res.json([]);
    }
    catch (error) { next(error); }
});

router.get('/following', AuthorizeUser, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id, { password: 0 });
        if(!user.following || user.following.length === 0) {
            res.json([]);
        } else {
            const following = user.following;
            // grab 25 posts, sorted by time (id) desc. 25 newest posts.
            const posts = await Post.find({ owner: {$in: following }}, null, { limit: 25, sort: { _id: -1 } });
            if(posts.length > 0)
                res.json(posts);
            else
                res.json([]);
        }
    }
    catch (error) { next(error); }
});

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
});

// Route used to find all the posts by the signed in person (maybe not in the best place?)
router.get('/user', AuthorizeUser, async (req, res, next) => {
    try {
        if(!req.user.id) {
            let err = new Error("User not signed in");
            err.status = 400;
            next(err);
        }
        const posts = await Post.find({ owner: req.user.id }, null, { limit: 25, sort: { _id: -1 } });
        if(posts.length > 0)
            res.json(posts);
        else
            res.json([]);
    }
    catch (error) { next(error); }
});

router.get('/:id', VerifyId, async (req, res, next) => {
    try {
        let id = req.params.id;
        
        console.log('Fetching post with ID:', id);

        const post = await Post.findById(id).populate('owner', 'username');
        if(!post){
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const imageKey = post.image || 'default_image.png';
        let signedUrl = null;

        if (req.s3) {
            const command = new GetObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: imageKey,
            });

            signedUrl = await getSignedUrl(req.s3, command, { expiresIn: 60 });
        }

        // const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`;
        post.image = signedUrl || post.image;
    
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