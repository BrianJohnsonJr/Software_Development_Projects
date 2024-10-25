const express = require('express');
const userInfoModel = require('../models/userInfo');
const bcrypt = require('bcryptjs');

const router = express.Router();

// All routes start with /login

router.get('/', async (req, res) => {
    if(req.query.success === 'true') {
        const id = await userInfoModel.findById(req.query.id);
        res.send(id);
    } else if (req.query.success === 'false') {
        res.send("Your login attempt failed.");
    } else {
        const users = await userInfoModel.get();
        res.send(users);
    }
});

router.post('/', async (req, res, next) => {
    try {
        matchedUser = await userInfoModel.verifyUsernameAndPassword(req.body.username, req.body.password);

        if(!matchedUser)
            res.redirect('/login?success=false');
        else {
            accessToken = await userInfoModel.tokenizeLogin(matchedUser);
            res.json({ token: accessToken });
            res.redirect('/login?success=true&id=' + matchedUser.id);
        }
    }
    catch (err) { next(err) }
});

router.post('/register', async (req, res, next) => {
    try {
        if(userInfoModel.findByUsername(req.body.username)) {
            res.redirect('/login?success=false');
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password, salt);
        let user = req.body;
        user.password = hash;
        const id = userInfoModel.addNewUser(user);
        res.redirect('/login?success=true&id=' + id);
    }
    catch (err) { next(err); }
});


module.exports = router;