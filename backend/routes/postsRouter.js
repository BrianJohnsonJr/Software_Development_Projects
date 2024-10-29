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
    catch (error) { next(error); }
});

router.get('/following', async (req, res, next) => {

});

router.get('/explore', async (req, res, next) => {

});



module.exports = router;