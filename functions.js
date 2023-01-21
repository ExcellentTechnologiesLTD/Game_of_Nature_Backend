const e = require("express");
const client = require("./connection");

async function signUp(info) {
    try {
        const {
            firstName,
            lastName,
            address,
            email,
            phoneNumber,
            // password,
            city,
            postal_code,
        } = info;

        console.log("only info: ", phoneNumber);

        const queryInsertNewUser = `INSERT INTO public."Users"(
      "First_Name", "Email", "Mobile", "Address", "User_Type", "Last_Name", "city", "postal_code")
      VALUES ($1, $2, $3, $4, 'Customer', $5, $6, $7)
      RETURNING user_id;`;

        const params = [
            firstName,
            email,
            phoneNumber,
            address,
            lastName,
            // password,
            city,
            postal_code,
        ];

        const result = await client.query(queryInsertNewUser, params);
        // console.log("Result here", result);
        if (result && result.rowCount) {
            // OR (result)
            console.log("User registered.");
            return {
                status: "Success",
                msg: "User Registered Successfully",
                user_id: result.rows[0].user_id,
            };
        }
        console.log("Not Registered.");
        return {
            status: "Error",
            msg: "Could not register user. Call Developer.",
        };
    } catch (error) {
        console.error("Error", error);
        return {
            status: false,
            error: error,
        };
    }
}

async function checkUserExistence(email) {
    console.log("Checking: ", email);
    try {
        let queryCheckUserExistence = `SELECT * FROM public."Users" Where "Email" = '${email}'`;
        const result = await client.query(queryCheckUserExistence);
        if (result.rowCount > 0 && result.rows[0].Email === email) {
            console.log("User found in DB.");
            console.log("User Found");
            return {
                status: 200,
                msg: "User Found In DB.",
                success: true,
                user_id: result.rows[0].user_id,
                info: result.rows[0],
            };
        }
        console.log("User Not Found");
        return { status: 404, msg: "User Not Found.", success: false };
    } catch (error) {
        console.error("Error", error);
        return {
            status: false,
            error: error,
        };
    }
}

async function insertOrderDetails(info) {
    try {
        const { user_id, orderedItems, totalAmount, date, time, paymentMethod } =
        info;
        console.log("info:\n\n\n", info);
        let queryInsertOrderData = `INSERT INTO public.orders(
            "user_id", "items", "total_amount", "ordered_date", "ordered_time","payment_method", "order_status")
            VALUES ($1,$2 ,$3, $4, $5, $6, 'processing')
            RETURNING order_id;`;

        const params = [
            user_id,
            orderedItems,
            totalAmount,
            date,
            time,
            paymentMethod,
        ];

        const result = await client.query(queryInsertOrderData, params);
        if (result.rowCount == 1 && result.rows[0].order_id != null) {
            console.log("Order added successfully.");
            return {
                status: 200,
                success: true,
                msg: "Order placed.",
                order_id: result.rows[0].order_id,
                user_id: user_id,
            };
        }
        console.log("Error, order not placed.");
        return {
            status: 404,
            success: false,
            msg: "Error, order not placed.",
        };
    } catch (error) {
        console.error("Error", error);
        return {
            status: false,
            error: error,
        };
    }
}

async function getUserInfoByID(userID) {
    console.log("Checking: ", userID);
    try {
        let queryGetUserInfo = `SELECT * FROM public."Users" Where "user_id" = '${userID}'`;
        const result = await client.query(queryGetUserInfo);
        console.log("result \n", result);

        if (result.rowCount > 0 && result.rows[0].user_id == userID) {
            console.log("User found in DB.");
            console.log("User Found");
            return {
                status: 200,
                msg: "User Found In DB.",
                success: true,
                user_id: result.rows[0].user_id,
                info: result.rows[0],
            };
        }
        console.log("User Not Found");
        return { status: 404, msg: "User Info Not Found.", success: false };
    } catch (error) {
        console.error("Error", error);
        return {
            status: false,
            error: error,
        };
    }
}

async function getMyOrders(user_id) {
    try {
        let queryGetMyOrders = `SELECT * FROM public.orders 
            Where "user_id"='${user_id}' 
            ORDER BY order_id DESC`;

        // const params = [user_id];

        const result = await client.query(queryGetMyOrders);
        console.log("result : \n");
        console.log(result);

        if (result.rowCount >= 1 && result.rows[0].order_id != null) {
            return {
                status: 200,
                success: true,
                msg: "Found results",
                result: result.rows,
            };
        }
        console.log("Error in function Database query.");
        return {
            status: 200,
            success: true,
            msg: "No Order History",
            result: result.rows,
        };
    } catch (error) {
        console.log(error);
        return {
            status: 404,
            success: false,
            msg: "Error in getting order history, Call Developer. \n ",
            Error: error,
        };
    }
}

async function getAllOrders() {
    try {
        let queryGetMyOrders = `SELECT * FROM public.orders ORDER BY order_id DESC `;

        const result = await client.query(queryGetMyOrders);

        if (result.rowCount >= 1 && result.rows[0].order_id != null) {
            return {
                status: 200,
                success: true,
                msg: "Found results",
                result: result.rows,
            };
        }
        console.log("Error in function Database query.");
        return {
            status: 200,
            success: true,
            msg: "No Orders",
            result: result.rows,
        };
    } catch (error) {
        console.log(error);
        return {
            status: 404,
            success: false,
            msg: "Error in getting order, Call Developer. \n ",
            Error: error,
        };
    }
}

async function deleteOrder(orderID) {
    try {
        let queryDeleteOrder = `DELETE FROM public.orders WHERE "order_id"=${orderID}`;

        const result = await client.query(queryDeleteOrder);
        // console.log("result: \n", result);
        if (result.rowCount == 1) {
            return {
                status: 200,
                success: true,
            };
        }
        console.log("Could not delete order.");
        return {
            status: 404,
            success: false,
        };
    } catch (error) {
        console.log(error);
        return {
            status: 404,
            success: false,
            msg: "Error",
            data: error,
        };
    }
}
module.exports = {
    signUp,
    insertOrderDetails,
    checkUserExistence,
    getMyOrders,
    getAllOrders,
    getUserInfoByID,
    deleteOrder,
};