const express = require('express');

// Create app
const app = express();

// Set configs
let port = 5000;
let host = 'localhost';



// backend only -- shows backend running on port 5000 in local host.
app.get(
    "/",
    (req, res) => {
        res.send("hello");
    }
)
app.listen(
    5000,
    () => console.log("Backend is running")
)
// frontend runs automatically with react on different port. 