const express = require('express');
const methodOverride = require('method-override');
const defaultRouter = require('./routes/defaultRouter');

// Create app
const app = express();

// Set configs
let port = 5000;
let host = 'localhost';

// mount middleware
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));


// backend only -- shows backend running on port 5000 in local host.
app.get("/", (req, res) => {
    res.send("Default backend response.");
});

// Redirect all further paths to the router
app.use('/', defaultRouter);


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