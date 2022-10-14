const { Client, DatabaseError } = require("pg");

const client = new Client({
    host: "db.thin.dev",
    user: "qnSNSWmHbPjGewzWMazpXHohVygtSqFM",
    port: 5432,
    password: "vjYZlrUWMTZfXbVlwhgGVkXRWGMZibGV",
    database: "edb7fe11-9682-4d03-9995-9ca2c7a8a297",
});

module.exports = client;