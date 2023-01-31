// Make sure you install dev dependencies to test!
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
})

app.use(express.static(__dirname));

app.listen(port, () => {
    console.log("Testing on port 5000");
})