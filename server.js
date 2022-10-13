const express = require("express");
const app = express();
const cors = require("cors");

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ extended: false }));

app.listen(PORT, (error) => {
    if (!error) {
        console.log("Server running and listening on port ", PORT);
    }
});

app.get("/", (req, res) => {
    res.send("Hello developer Welcome to Game of Nature server.");
});