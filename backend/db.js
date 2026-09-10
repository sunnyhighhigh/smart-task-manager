const oracledb = require('oracledb');
require('dotenv').config();

// Ensure output is formatted as JSON objects instead of arrays
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.fetchAsString = [oracledb.CLOB];
oracledb.autoCommit = true;

async function getConnection() {
    try {
        const connectionParams = {
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECTION_STRING
        };
        
        if (process.env.WALLET_PASSWORD) {
            const path = require('path');
            const walletPath = path.join(__dirname, 'wallet');
            process.env.TNS_ADMIN = walletPath;
            oracledb.configDir = walletPath;
            connectionParams.walletLocation = walletPath;
            connectionParams.walletPassword = process.env.WALLET_PASSWORD;
        }

        const connection = await oracledb.getConnection(connectionParams);
        return connection;
    } catch (err) {
        console.error('Failed to connect to Oracle DB:', err);
        throw err;
    }
}

module.exports = {
    getConnection
};
