require('dotenv').config(); // load dotenvs

const express = require('express');
const methodOverride = require('method-override');
const loginRouter = require('./routes/loginRouter');
const postRouter = require('./routes/postsRouter');
const mongoose = require('mongoose');

// Create app
const app = express();

// Set configs
let port = 5000;
let host = 'localhost';
const mongoUri = 'mongodb+srv://Merchsy_Application:SecurePassword@merchsyinstance.j0zx1.mongodb.net/Merchsy?retryWrites=true&w=majority&appName=MerchsyInstance';

mongoose.connect(mongoUri)
.then(() => {
    app.listen(port, () => console.log("Backend is running on port", port));
})
.catch(err => console.log(err));

// mount middleware
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));


// backend only -- shows backend running on port 5000 in local host.
app.get("/", (req, res) => {
    res.send("Default backend response.");
});

// Redirect all login paths to the router
app.use('/login', loginRouter);

app.use('/posts', postRouter);


app.use((err, req, res, next) => {
    console.error(err.stack);
    if(!err.status) {
        err.status = 500;
        err.message = ("Internal Server Error");
    }

    res.status(err.status);
    res.send(err.status + ' Error: ' + err.message);
});
