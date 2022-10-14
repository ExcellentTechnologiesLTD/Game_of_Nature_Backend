const express = require("express");
const app = express();
const cors = require("cors");

const client = require("./connection");

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ extended: false }));

client.connect();

app.listen(PORT, (error) => {
    if (!error) {
        console.log("Server running and listening on port ", PORT);
    }
});

app.get("/", (req, res) => {
    let query = `SELECT * FROM public.products`;

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
});