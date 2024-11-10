require('dotenv').config(); // load dotenvs

const express = require('express');
const methodOverride = require('method-override');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const accountRouter = require('./routes/accountRouter');
const postRouter = require('./routes/postRouter');
const mongoose = require('mongoose');
const { S3Client, PutObjectcommand } = require('@aws-sdk/client-s3');

// Create app
const app = express();

// Set configs
let port = 5000;
let host = 'localhost';
const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri)
.then(() => {
    app.listen(port, () => console.log("Backend is running on port", port));
})
.catch(err => console.log(err));

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// mount middleware
app.use(cookieParser());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.use((req, res, next) => {
    req.s3 = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
    });
    next();
});


// backend only -- shows backend running on port 5000 in local host.
app.get("/", (req, res) => {
    res.send("Default backend response.");
});

// Redirect all account paths to the account router
app.use('/account', accountRouter);

// Post paths to the post router
app.use('/posts', postRouter);


app.use((err, req, res, next) => {
    console.error(err.stack);
    if(!err.status) {
        err.status = 500;
        err.message = ("Internal Server Error");
    }

    res.status(err.status);
    res.json({ success: false, message: 'Error: ' + err.message });
});
