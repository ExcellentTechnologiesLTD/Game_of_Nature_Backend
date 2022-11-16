const express = require("express");

const app = express();
const cors = require("cors");

const client = require("./connection");
const { query } = require("./connection");

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

app.get("/get-details/:id", (req, res) => {
    const id = req.params.id;
    console.log(id);
    let query = `SELECT * FROM public.products Where product_id ='${id}'`;

    client.query(query, (err, result) => {
        if (!err) {
            res.send(result.rows[0]);
        } else {
            console.log(err);
        }
    });
    client.end;
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
    // res.send("Hello developer Welcome to Game of Nature server. Bhalo Achen??");
});

app.post("/add-item", (req, res) => {
    const { itemName, category, quantity, price, description, imgUrl } = req.body;
    console.log(imgUrl);
    queryInsertItem = `INSERT INTO public.products(
        product_name, quantity_in_stock, price, category, description, photo_url)
        VALUES ('${itemName}', '${quantity}', '${price}', '${category}', '${description}','${imgUrl}')
        RETURNING product_id;
        ;`;

    client.query(queryInsertItem, (err, result) => {
        if (!err) {
            // console.log(result.rows[0].product_id);
            if (result.rowCount == 1 && result.rows[0].product_id) {
                res.send({
                    status: "Success",
                    msg: "Item Added Successfully",
                    product_id: result.rows[0].product_id,
                });
            } else {
                res.send({
                    status: "Error",
                    msg: "Could not add item. Call Developer.",
                });
            }
        } else {
            console.log(err);
        }
    });
});

app.delete("/delete-item/:id", (req, res) => {
    const id = req.params.id;
    console.log(id);

    const queryDeleteItem = `DELETE FROM public.products WHERE "product_id"=${id};`;

    client.query(queryDeleteItem, (err, result) => {
        if (!err) {
            res.send({ msg: "Deleted successfully", deleted: true });
        } else {
            console.log(err);
        }
    });
});