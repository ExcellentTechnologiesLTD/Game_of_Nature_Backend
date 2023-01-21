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

app.post("/check-existence", async(req, res) => {
    const { email } = req.body;
    console.log(req.body);
    console.log("Checking....");
    const userExistence = await functions.checkUserExistence(email);
    if (
        userExistence.status == 200 &&
        userExistence.success &&
        userExistence.user_id
    ) {
        res.send({
            status: 200,
            msg: "User Found In DB.",
            success: true,
            user_id: userExistence.user_id,
            info: userExistence.info,
        });
    } else {
        res.send({ status: 404, msg: "User Not Found.", success: false });
    }
});

app.post("/signup", async(req, res) => {
    // console.log("from signup: \n", req.body);
    const {
        firstName,
        lastName,
        address,
        email,
        phoneNumber,
        password,
        city,
        postal_code,
    } = req.body;

    console.log("only req: ", req.body);

    const userSignUp = await functions.signUp(req.body);
    if (userSignUp.status === "Success" && userSignUp.user_id) {
        res.send({
            status: "Success",
            msg: "User Registered Successfully",
            user_id: userSignUp.user_id,
        });
    } else {
        res.send({
            status: "Error",
            msg: "Could not register user. Call Developer.",
        });
    }
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

app.post("/confirm-order", async(req, res) => {
    const {
        email,
        user_id,
        orderedItems,
        totalAmount,
        paymentMethod,
        firstName,
        lastName,
        address,
        city,
        postal_code,
        phoneNumber,
        password,
    } = req.body.orderInfo;

    //*********Date & Time******************************************************
    var today = new Date();
    var date =
        today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes();
    //*********Date & Time******************************************************
    const orderData = {
        user_id: user_id,
        orderedItems: orderedItems,
        totalAmount: totalAmount,
        date: date,
        time: time,
        paymentMethod: paymentMethod,
    };

    const signUpData = {
        email: email,
        firstName: firstName,
        lastName: lastName,
        address: address,
        city: city,
        postal_code: postal_code,
        phoneNumber: phoneNumber,
    };
    console.log("req.body:\n\n");
    console.log(req.body);
    console.log("OrderData:\n\n");
    console.log(orderData);
    console.log("signUpData:\n\n");
    console.log(signUpData);

    // if user Found
    if (user_id) {
        // insert order data into table
        const orderResult = await functions.insertOrderDetails(orderData);
        if (
            orderResult.status == 200 &&
            orderResult.success &&
            orderResult.order_id
        ) {
            console.log("Order added successfully.");
            res.send({
                status: 200,
                success: true,
                msg: "Order placed.",
                order_id: orderResult.order_id,
                user_id: user_id,
            });
        } else {
            res.send({
                status: 404,
                success: false,
                msg: "Error, order not placed.",
            });
        }
    } else {
        // create account
        console.log("Creating user...");
        const data = await functions.signUp(signUpData);
        console.log("Data: ", data);

        if (
            data.status === "Success" &&
            (data.user_id != undefined || data.user_id != null || data.user_id > 0)
        ) {
            // ******************************************************************************
            // if user created enter order Info in DB
            const orderDataAfterSignUp = {
                user_id: data.user_id,
                orderedItems: orderedItems,
                totalAmount: totalAmount,
                date: date,
                time: time,
                paymentMethod: paymentMethod,
            };
            console.log("Placing Order....");
            const orderInserted = await functions.insertOrderDetails(
                orderDataAfterSignUp
            );
            if (
                orderInserted.status == 200 &&
                orderInserted.success &&
                orderInserted.order_id
            ) {
                console.log("Order added successfully.");
                res.send({
                    status: 200,
                    success: true,
                    msg: "Order placed.",
                    order_id: orderInserted.order_id,
                    user_id: data.user_id,
                });
            } else {
                res.send({
                    status: 404,
                    success: false,
                    msg: "Error, order not placed.",
                });
            }
        }
    }
});

app.get("/getmyorders/:userid", async(req, res) => {
    const id = req.params.userid;
    console.log(id);

    const myOrders = await functions.getMyOrders(id);
    if (myOrders.status == 200 && myOrders.success) {
        res.send(myOrders.result);
    } else {
        res.send({
            status: 404,
            success: false,
            msg: "Error in query. Call developer.",
            data: myOrders,
        });
    }
});