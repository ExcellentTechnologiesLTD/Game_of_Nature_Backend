const { Client, DatabaseError } = require("pg");

const client = new Client({
    host: "db.thin.dev",
    user: "OMxeTIqYtuaizgERZMqdAfKNNArveIcg",
    port: 5432,
    password: "ZmohRdCxNnBAImPQIHzwrquqSUAodwYV",
    database: "43b0e7d6-ac6f-497d-89b5-557ca7e77ea2",
});

module.exports = client;