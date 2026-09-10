const db = require('./db.js');
(async () => {
  let conn;
  try {
    conn = await db.getConnection();
    const res = await conn.execute("SELECT column_name FROM user_tab_columns WHERE table_name = 'TASKS'");
    console.log(res.rows);
  } catch (e) {
    console.error(e.message);
  } finally {
    if (conn) await conn.close();
    process.exit();
  }
})();
