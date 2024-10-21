const express = require('express');
const userInfoModel = require('../models/userInfo');
const bcrypt = require('bcryptjs');

const router = express.Router();

// All routes start with /login

router.get('/', (req, res) => {
    if(req.query.success === 'true') {
        res.send(userInfoModel.findById(req.query.id));
    } else if (req.query.success === 'false') {
        res.send("Your login attempt failed.");
    } else {
        res.send(userInfoModel.get());
    }
});

router.post('/', (req, res, next) => {
    userInfoModel.matchLogin(req.body.username, req.body.password)
    .then(matchedUser => {
        if(!matchedUser)
            res.redirect('/login?success=false');
        else
            res.redirect('/login?success=true&id=' + matchedUser.id);
    })
    .catch(err => next(err));
});

router.post('/register', (req, res, next) => {
    if(userInfoModel.findByUsername(req.body.username)) {
        res.redirect('/login?success=false');
    }

    bcrypt.genSalt(10)
    .then(salt => bcrypt.hash(req.body.password, salt))
    .then(secPass => {
         let user = req.body;
         user.password = secPass;
         const id = userInfoModel.addNewUser(user);
         res.redirect('/login?success=true&id=' + id);
    })
    .catch(err => next(err));
});


module.exports = router;