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
    // console.log(req.body);
    // console.log("Checking....");
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

    // console.log("only req: ", req.body);

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
    // console.log(req.body);

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
    // console.log(id);
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
    // console.log(category);
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
    // console.log(imgUrl);
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
    // console.log(id);

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
        user_id,
        orderedItems,
        totalAmount,
        paymentMethod,
        discountAmount,
        voucherName,
        full_name,
        address,
        city,
        shipping_charge,
        postal_code,
        phoneNumber,
        date,
        time,
    } = req.body.orderInfo;

    const orderData = {
        user_id: user_id,
        orderedItems: orderedItems,
        totalAmount: totalAmount,
        discountAmount: discountAmount,
        voucherName: voucherName,
        date: date,
        time: time,
        paymentMethod: paymentMethod,
        date: date,
        time: time,
        full_name: full_name,
        address: address,
        city: city,
        shipping_charge: shipping_charge,
        postal_code: postal_code,
        phone: phoneNumber,
    };

    // console.log("req.body:\n\n");
    // console.log(req.body.orderInfo);
    console.log(orderData);

    const orderResult = await functions.insertOrderDetails(orderData);
    if (
        orderResult.status == 200 &&
        orderResult.success &&
        orderResult.order_id
    ) {
        // console.log("Order added successfully.");
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
});

app.get("/getmyorders/:userid", async(req, res) => {
    const id = req.params.userid;
    // console.log(id);

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

app.get("/getallorders", async(req, res) => {
    const allOrders = await functions.getAllOrders();
    if (allOrders.status == 200 && allOrders.success) {
        res.send(allOrders.result);
    } else {
        res.send({
            status: 404,
            success: false,
            msg: "Error in query. Call developer.",
            data: allOrders,
        });
    }
});

app.get("/getuser-infobyid/:userid", async(req, res) => {
    const userid = req.params.userid;
    // console.log(userid);

    const userInfo = await functions.getUserInfoByID(userid);
    if (userInfo.status == 200 && userInfo.success) {
        res.send(userInfo.info);
    } else {
        res.send({
            status: 404,
            success: false,
            msg: "Error in query. Call developer.",
            data: userInfo,
        });
    }
});

app.delete("/delete-order/:orderid", async(req, res) => {
    const orderID = req.params.orderid;
    // console.log(orderID);

    const orderDeleted = await functions.deleteOrder(orderID);
    if (orderDeleted.success && orderDeleted.status == 200) {
        res.send({
            status: 200,
            success: true,
            msg: "Order deleted.",
        });
    } else {
        res.send({ status: 404, success: false, msg: "Could not delete order." });
    }
});

app.put("/update-order", async(req, res) => {
    const { orderID, status } = req.body;
    // console.log(req.body);

    const updatedOrder = await functions.updateOrderStatus(orderID, status);
    if (updatedOrder.status == 200 && updatedOrder.success) {
        res.send({
            status: 200,
            success: true,
            msg: "Order status updated. Packaging started.",
        });
    } else {
        res.send({
            status: 404,
            success: false,
            msg: "ERROR. Couldn't update order status.",
        });
    }
});

app.post("/add-voucher", async(req, res) => {
    const { voucherName, voucherAmount } = req.body;
    // console.log(req.body);

    const result = await functions.addVoucher(voucherName, voucherAmount);
    if (result.status == 200 && result.success) {
        res.send({
            status: 200,
            success: true,
            msg: "Voucher Added.",
            voucherID: result.voucherID,
        });
    } else {
        res.send({
            status: 404,
            success: false,
            msg: result.msg,
        });
    }
});

app.get("/getall-vouchers", async(req, res) => {
    const result = await functions.getAllVoucher();
    if ((result.status = 200 && result.success)) {
        res.send(result.result);
    } else {
        res.send({
            status: 404,
            success: false,
            msg: "Could not find any voucher.",
        });
    }
    // console.log(result.result);
});

app.patch("/changestatus-voucher", async(req, res) => {
    const { voucherID, status } = req.body;

    const result = await functions.changeStatusVoucher(voucherID, status);
    // console.log(result);
    if (result.status == 200 && result.success) {
        res.send(result);
    } else {
        res.send(result);
    }
});

app.delete("/delete-voucher/:voucherid", async(req, res) => {
    const voucherID = req.params.voucherid;
    // console.log(voucherID);

    const result = await functions.deleteVoucher(voucherID);
    if ((result.status = 200 && result.success)) {
        res.send({ success: true, status: 200, msg: "Voucher Deleted." });
    } else {
        res.send({ success: false, status: 404, msg: result.msg });
    }
});

app.get("/get-voucher/:vouchername", async(req, res) => {
    const voucherName = req.params.vouchername;
    // console.log(voucherName);
    const result = await functions.getVoucher(voucherName);
    if (result.status == 200 && result.success) {
        // console.log("YES\n\n", result);
        res.send(result.data);
    } else {
        // console.log("NO\n\n", result);
        res.send(result);
    }
});

app.post("/print-invoice", async(req, res) => {
    const { orderID } = req.body;
    console.log("order id: >> ", orderID);
});

app.get("/get-policies", async(req, res) => {
    const policies = await functions.getPolicies();
    console.log(policies.info);
    res.send(policies);
});

app.put("/update-policy", async(req, res) => {
    console.log(req.body);
    const updatedPolicy = await functions.updatePolicy(req.body);
    res.send(updatedPolicy);
});