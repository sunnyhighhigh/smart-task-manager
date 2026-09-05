require('dotenv').config();
const oracledb = require('oracledb');

async function checkTables() {
  let conn;
  try {
    conn = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING
    });
    const result = await conn.execute("SELECT table_name FROM user_tables WHERE table_name IN ('USERS', 'TASKS')");
    console.log("Found Tables:", result.rows.map(r => r[0]).join(', '));
  } catch (err) {
    console.error("Database connection error:", err.message);
  } finally {
    if (conn) await conn.close();
  }
}

checkTables();
