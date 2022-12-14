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

app.post("/signup", (req, res) => {
    const { firstName, lastName, address, email, phoneNumber, password } =
    req.body;

    console.log(req.body);

    queryInsertNewUser = `INSERT INTO public."Users"(
        "First_Name", "Email", "Mobile", "Address", "User_Type", "Last_Name", "password")
        VALUES ('${firstName}', '${email}', '${phoneNumber}', '${address}', 'Customer', '${lastName}', '${password}')
        RETURNING user_id;`;

    client.query(queryInsertNewUser, (err, result) => {
        if (!err) {
            if (result.rowCount == 1) {
                console.log("User registered.");
                res.send({
                    status: "Success",
                    msg: "User Registered Successfully",
                    user_id: result.rows[0].user_id,
                });
            } else {
                console.log("Not Registered.");
                res.send({
                    status: "Error",
                    msg: "Could not register user. Call Developer.",
                });
            }
        } else {
            console.log(err);
        }
    });
});

app.post("/signin", (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);

    let queryCheckUser = `SELECT * FROM public."Users" Where "Email" = '${email}'`;

    client.query(queryCheckUser, (err, result) => {
        if (!err) {
            if (result.rows.length > 0 && result.rows[0].Email == email) {
                if (result.rows[0].password == password) {
                    res.send({
                        status: "Success",
                        msg: "Correct User Info.",
                        currentUserInfo: result.rows[0],
                    });
                } else {
                    res.send({
                        status: "Error",
                        msg: "Incorrect Password. Try Again",
                    });
                }
            } else {
                res.send({
                    status: "Error",
                    msg: "Incorrect email or password.",
                });
            }
        } else {
            console.log(err);
        }
    });
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

app.get("/get-detailsby/:category", (req, res) => {
    const category = req.params.category;
    console.log(category);
    let query = `SELECT * FROM public.products where category = '${category}';`;

    client.query(query, (err, result) => {
        if (!err) {
            res.send(result.rows);
        } else {
            console.log(err);
        }
    });
    client.end;
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