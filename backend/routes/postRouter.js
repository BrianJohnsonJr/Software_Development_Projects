const express = require('express');
const User = require('../models/users');
const Post = require('../models/posts');

const router = express.Router();

router.post('/create', async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // grab user w/o password'
        
        if(!user) {
            res.status(404);
            next(new Error('No user logged in'));
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

        await newPost.save();
        res.json({ success: true, message: 'Post successfully posted' });
    }
    catch (error) {
        if(error.name === 'ValidationError')
            error.status = 400;

        next(error);
    }
});

router.get('/following', async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id, { password: 0 });
        if(!user.following || user.following.length === 0) {
            res.json([]);
        } else {
            const following = user.following;
            // grab 25 posts, sorted by time (id) desc. 25 newest posts.
            const posts = await Post.find({ following: {$in: following }}, null, { limit: 25, sort: {_id: -1} }); 
            res.json(posts);
        }
    }
    catch (error) { next(error); }
});

router.get('/explore', async (req, res, next) => {
    try {
        // grab 25 posts, sorted by time (id) desc. 25 newest posts.
        // unsure which is better...
        const posts = await Post.find({}, null, { limit: 25, sort: {_id: -1} }); 
        // const posts = await Post.find().limit(25).sort({ _id: -1 }); 
        res.json(posts);
    }
    catch (error) { next(error); }
});

// router.get('/')



module.exports = router;