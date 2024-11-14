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
            err.status = 404;
            next(err);
        }

        const { title, description, price, image, tags, itemType, sizes } = req.body;

        const newPost = new Post({
            title, 
            description,
            price,
            image,
            tags,
            itemType,
            sizes
        });
        
        const file = await uploadToCloud(req.s3, req.file);
        newPost.image = file.filename;

        await newPost.save();
        res.json({ success: true, message: 'Post successfully posted' });
    }
    catch (error) {
        if(error.name === 'ValidationError')
            error.status = 400;

        next(error);
    }
});

router.get('/:id', VerifyId, async (req, res, next) => {
    try {
        let id = req.params.id;
        
        const post = await Post.findById(id);
        const imageKey = post.image || 'default_image.png';

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: imageKey,
        });
        
        const signedUrl = await getSignedUrl(req.s3, command, { expiresIn: 60 });

        // const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`;
        post.image = signedUrl;
    
        res.json({ success: true, post: post});
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

router.get('/explore', async (req, res, next) => {
    try {
        // grab 25 posts, sorted by time (id) desc. 25 newest posts.
        // unsure which is better...
        const posts = await Post.find({}, null, { limit: 25, sort: { _id: -1 } }); 
        // const posts = await Post.find().limit(25).sort({ _id: -1 }); 
        if(posts.length > 0)
            res.json(posts);
        else
            res.json([]);
    }
    catch (error) { next(error); }
});

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



module.exports = router;