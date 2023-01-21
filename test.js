const express = require("express");

const app = express();
const cors = require("cors");

const client = require("./connection");
const functions = require("./functions");

const PORT = process.env.PORT || 3300;

app.use(cors());
app.use(express.json({ extended: false }));

client.connect();
console.log("DB connected");

app.listen(PORT, (error) => {
    if (!error) {
        console.log("Server running and listening on port ", PORT);
    }
});

app.get("/", (req, res) => {
    let query = `SELECT * FROM public.products order by product_id asc`;

    // res.send("Hello developer welcome to teebay Backend.");
    client.query(query, (err, result) => {
        if (!err) {
            res.send(result.rows);
            // console.log(result.rows);
        } else {
            console.log(err);
        }
    });
    client.end;
    // res.send("Hello developer Welcome to Game of Nature server. Bhalo Achen??");
});

app.post("/signup", async(req, res) => {
    const { email } = req.body;
    const data = await functions.signUp(req.body);
    console.log("Data: ", data);
});