const express = require('express');
const methodOverride = require('method-override');
const userInfoModel = require('./models/userInfo');

// Create app
const app = express();

// Set configs
let port = 5000;
let host = 'localhost';

// mount middleware
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));


// backend only -- shows backend running on port 5000 in local host.
app.get("/", (req, res) => {
    res.send("Default backend response.");
});

// TODO: Move routes to separate files should we have a lot of them
app.get('/login', (req, res) => {
    // console.log(req.query);
    if(req.query.success === 'true') {
        console.log("worked");
        res.send(userInfoModel.findById(req.query.id));
    } else if (req.query.success === 'false') {
        console.log("worked but false");
        res.send("Your login attempt failed.");
    } else {
        console.log("neither");
        res.send(userInfoModel.get());
    }
});

app.post('/login', (req, res) => {
    const matchedUser = userInfoModel.matchLogin(req.query.username, req.query.password);
    if(!matchedUser)
        res.redirect('/login?success=false');
    else
        res.redirect('/login?success=true&id=' + matchedUser.id);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    if(!err.status) {
        err.status = 500;
        err.message = ("Internal Server Error");
    }

    res.status(err.status);
    res.send(err.status + ' Error: ' + err.message);
});

app.listen(port, () => console.log("Backend is running"));
// frontend runs automatically with react on different port. 