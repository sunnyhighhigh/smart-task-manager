const oracledb = require('oracledb');
require('dotenv').config();

// Ensure output is formatted as JSON objects instead of arrays
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

async function getConnection() {
    try {
        const connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECTION_STRING
        });
        return connection;
    } catch (err) {
        console.error('Failed to connect to Oracle DB:', err);
        throw err;
    }
}

module.exports = {
    getConnection
};
