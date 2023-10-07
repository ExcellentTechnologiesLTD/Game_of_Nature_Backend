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
            password,
            city,
            postal_code,
        } = info;

        const queryInsertNewUser = `INSERT INTO public."Users"(
      "First_Name", "Email", "Mobile", "Address", "User_Type", "Last_Name","password", "city", "postal_code")
      VALUES ($1, $2, $3, $4, 'Customer', $5, $6, $7, $8)
      RETURNING user_id;`;

        const params = [
            firstName,
            email,
            phoneNumber,
            address,
            lastName,
            password,
            city,
            postal_code,
        ];

        const result = await client.query(queryInsertNewUser, params);
        // console.log("Result here", result);
        if (result && result.rowCount) {
            // OR (result)
            // console.log("User registered.");
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
    // console.log("Checking: ", email);
    try {
        let queryCheckUserExistence = `SELECT * FROM public."Users" Where "Email" = '${email}'`;
        const result = await client.query(queryCheckUserExistence);
        if (result.rowCount > 0 && result.rows[0].Email === email) {
            return {
                status: 200,
                msg: "User Found In DB.",
                success: true,
                user_id: result.rows[0].user_id,
                info: result.rows[0],
            };
        }
        // console.log("User Not Found");
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
        const {
            user_id,
            orderedItems,
            totalAmount,
            discountAmount,
            voucherName,
            date,
            time,
            paymentMethod,
            full_name,
            address,
            city,
            postal_code,
            phone,
        } = info;

        let queryInsertOrderData = `INSERT INTO public.orders(
            "user_id", "items", "total_amount", "voucher_name", "voucher_amount", "ordered_date","ordered_time","payment_method","full_name","address","city","postal_code","phone","order_status")
            VALUES ($1,$2 ,$3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'processing')
            RETURNING order_id;`;

        const params = [
            user_id,
            orderedItems,
            totalAmount,
            voucherName,
            discountAmount,
            date,
            time,
            paymentMethod,
            full_name,
            address,
            city,
            postal_code,
            phone,
        ];

        const result = await client.query(queryInsertOrderData, params);
        if (result.rowCount == 1 && result.rows[0].order_id != null) {
            // console.log("Order added successfully.");
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
    // console.log("Checking: ", userID);
    try {
        let queryGetUserInfo = `SELECT * FROM public."Users" Where "user_id" = '${userID}'`;
        const result = await client.query(queryGetUserInfo);
        // console.log("result \n", result);

        if (result.rowCount > 0 && result.rows[0].user_id == userID) {
            // console.log("User found in DB.");
            // console.log("User Found");
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
        // console.log("result : \n");
        // console.log(result);

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
// Admin panel Manage orders
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

async function updateOrderStatus(orderID, status) {
    try {
        let queryUpdateOrderStatus = `UPDATE public.orders
        SET "order_status"='${status}' WHERE "order_id"='${orderID}'`;

        const result = await client.query(queryUpdateOrderStatus);

        if (result.rowCount == 1) {
            return {
                status: 200,
                success: true,
                msg: "Order status updated. Packaging started.",
            };
        }
        console.log("ERROR. Couldn't update order status.");
        return {
            status: 404,
            success: false,
            msg: "ERROR. Couldn't update order status.",
        };
    } catch (error) {
        console.log(error);
        return {
            status: 404,
            success: false,
            msg: "Error in query. Call Developer.",
            data: error,
        };
    }
}
// Vouchers
async function addVoucher(voucherName, voucherAmount) {
    try {
        let queryInsertVoucherData = `INSERT INTO public."Vouchers"(
            voucher_name, discount_amount, "isActive")
            VALUES ($1, $2, 'true')
            RETURNING voucher_id`;

        const params = [voucherName, voucherAmount];

        const result = await client.query(queryInsertVoucherData, params);

        if (result.rowCount == 1 && result.rows[0].voucher_id != null) {
            return {
                status: 200,
                success: true,
                msg: "Voucher Added.",
                voucherID: result.rows[0].voucher_id,
            };
        }
        console.log("Could not add voucher.");
        return {
            status: 404,
            success: false,
            msg: "Could not add voucher.",
            voucherID: null,
        };
    } catch (error) {
        console.log(error);
        return {
            status: 404,
            success: false,
            msg: "Error in query. Call Developer.",
            data: error,
        };
    }
}

async function getAllVoucher() {
    try {
        let queryGetAllVouchers = `SELECT * FROM public."Vouchers"
        ORDER BY voucher_id DESC `;

        const result = await client.query(queryGetAllVouchers);

        if (result.rowCount >= 1 && result.rows[0].voucher_id != null) {
            return {
                status: 200,
                success: true,
                msg: "Found results",
                result: result.rows,
            };
        }
        // console.log("No Vouchers.");
        return {
            status: 200,
            success: true,
            msg: "No vouchers",
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

async function changeStatusVoucher(voucherID, status) {
    try {
        let queryChangeStatus = `UPDATE public."Vouchers" 
                SET "isActive"='${status}'
                WHERE voucher_id='${voucherID}'`;

        const result = await client.query(queryChangeStatus);

        if (result.rowCount == 1) {
            return { status: 200, success: true, msg: "Status Changed." };
        }
        console.log("Could not change Status");
        return { status: 404, success: false, msg: "Could not change Status." };
    } catch (error) {
        console.log(error);
        return {
            status: 404,
            success: false,
            msg: "Error in query. Call Developer.",
            data: error,
        };
    }
}

async function deleteVoucher(voucherID) {
    try {
        let queryDeleteVoucher = `DELETE FROM public."Vouchers"
                WHERE voucher_id='${voucherID}'`;

        const result = await client.query(queryDeleteVoucher);
        if (result.rowCount == 1) {
            return {
                status: 200,
                success: true,
            };
        }
        console.log("Could not delete voucher.");
        return {
            status: 404,
            success: false,
            msg: "Could not delete voucher.",
        };
    } catch (error) {
        console.log(error);
        return {
            status: 404,
            success: false,
            msg: "Error in query. Call Developer.",
            data: error,
        };
    }
}

async function getVoucher(voucherName) {
    try {
        let queryGetVoucher = `SELECT * FROM public."Vouchers"
        Where "voucher_name"='${voucherName}' AND "isActive"='true'`;

        const result = await client.query(queryGetVoucher);

        if (result.rowCount >= 1 && result.rows[0].voucher_id != null) {
            return {
                status: 200,
                success: true,
                msg: "vocuher found.",
                data: result.rows[0],
            };
        }
        // console.log("Cannot find voucher with this name.");
        return {
            status: 404,
            success: false,
            msg: "Cannot find voucher with this name",
        };
    } catch (error) {
        console.log(error);
        return {
            status: 404,
            success: false,
            msg: "Error in query. Call Developer.",
            data: error,
        };
    }
}
async function getPolicies() {
    try {
        let queryGetPolicies = `SELECT * FROM public."Policies"`;
        const result = await client.query(queryGetPolicies);
        if (result.rowCount > 0) {
            return {
                status: 200,
                msg: "policies found",
                success: true,
                info: result.rows[0],
            };
        }
        // console.log("User Not Found");
        return { status: 404, msg: "No policies found.", success: false };
    } catch (error) {
        console.error("Error", error);
        return {
            status: false,
            error: error,
        };
    }
}

async function updatePolicy(jsonBody) {
    try {
        let queryUpdatePolicy = `UPDATE public."Policies"
        SET "Terms_and_Condition"='${jsonBody.Terms_and_Condition}', "Return_and_Refund"='${jsonBody.Return_and_Refund}', "Inside_Dhaka_Delivery_Cost"='${jsonBody.Inside_Dhaka_Delivery_Cost}', "Outside_Dhaka_Delivery_Cost"='${jsonBody.Outside_Dhaka_Delivery_Cost}'`;

        const result = await client.query(queryUpdatePolicy);

        if (result.rowCount == 1) {
            return {
                status: 200,
                success: true,
                msg: "Policies updated.",
            };
        }
        console.log("ERROR. Couldn't update policy.");
        return {
            status: 404,
            success: false,
            msg: "ERROR. Couldn't update policy.",
        };
    } catch (error) {
        console.log(error);
        return {
            status: 404,
            success: false,
            msg: "Error in query. Call Developer.",
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
    updateOrderStatus,
    addVoucher,
    getAllVoucher,
    changeStatusVoucher,
    deleteVoucher,
    getVoucher,
    getPolicies,
    updatePolicy,
};