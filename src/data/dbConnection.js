
//Dit moet ook in de integratie testen.
//Bij het testen, moet het niet praten tegen de productie database, maar een testdatabase
//Bij de assesments een testdatabase
//Robin zal een echte/testdatabase schrijven.
const mysql = require('mysql2');
require('dotenv').config();
const logr = require('../config/config').logger;

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    multipleStatements: true, 
    timezone: 'UTC'
})

module.exports = pool;

pool.on('acquire', function (connection) {
    logr.trace('Connection %d acquired', connection.threadId);
});

pool.on('release', function (connection) {
    logr.trace('Connection %d released', connection.threadId);
});