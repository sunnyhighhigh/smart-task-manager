const oracledb = require('oracledb');
oracledb.fetchAsString = [oracledb.CLOB];

async function migrate() {
    let localConn, cloudConn;
    try {
        console.log("Connecting to local database...");
        localConn = await oracledb.getConnection({
            user: 'SYSTEM',
            password: 'Oracle1964',
            connectString: 'localhost:1522/XE'
        });

        // 1. Fetch Users
        const usersResult = await localConn.execute("SELECT user_id, name, email, password_hash FROM USERS");
        const users = usersResult.rows;
        console.log(`Found ${users.length} users locally.`);

        // 2. Fetch Tasks
        const tasksResult = await localConn.execute("SELECT * FROM TASKS");
        const tasks = tasksResult.rows;
        console.log(`Found ${tasks.length} tasks locally.`);

        await localConn.close();
        localConn = null;

        console.log("Connecting to cloud database...");
        // Setup wallet
        const path = require('path');
        const walletPath = path.join(__dirname, 'wallet');
        process.env.TNS_ADMIN = walletPath;
        oracledb.configDir = walletPath;

        cloudConn = await oracledb.getConnection({
            user: 'ADMIN',
            password: 'Peterboroughgoa1!',
            connectString: 'usnq9fyrl57oqdaz_high',
            walletLocation: walletPath,
            walletPassword: 'Oracle1964'
        });

        // 3. Insert Users
        console.log("Migrating users...");
        for (const user of users) {
            try {
                await cloudConn.execute(
                    `INSERT INTO USERS (name, email, password_hash) VALUES (:1, :2, :3)`,
                    [user[1], user[2], user[3]],
                    { autoCommit: true }
                );
            } catch (e) {
                if (e.message.includes('unique constraint')) {
                    console.log(`User ${user[2]} already exists in cloud.`);
                } else {
                    console.error("User insert error:", e.message);
                }
            }
        }

        // Map local user ID to cloud user ID
        const cloudUsersRes = await cloudConn.execute("SELECT user_id, email FROM USERS");
        const cloudUsers = cloudUsersRes.rows;
        const emailToCloudId = {};
        for(const cu of cloudUsers) {
             emailToCloudId[cu[1]] = cu[0];
        }

        const localIdToEmail = {};
        for(const lu of users) {
             localIdToEmail[lu[0]] = lu[2];
        }

        // 4. Insert Tasks
        console.log("Migrating tasks...");
        let tasksInserted = 0;
        for (const task of tasks) {
            try {
                const localUserId = task[1];
                const email = localIdToEmail[localUserId];
                const cloudUserId = emailToCloudId[email];

                if (!cloudUserId) continue;

                // task indexes match the SELECT * from the local DB. We verified earlier it has 16 columns.
                // 0:TASK_ID, 1:USER_ID, 2:TITLE, 3:DESCRIPTION, 4:CATEGORY, 5:PRIORITY, 6:STATUS, 7:DUE_DATE
                // 8:SCHOOL_DISTRICT, 9:SCHOOL_NAME, 10:START_TIME, 11:STOP_TIME, 12:START_TIME_2, 13:STOP_TIME_2
                // 14:CREATED_DATE, 15:SUBSTITUTE_NAME
                await cloudConn.execute(
                    `INSERT INTO TASKS (
                        user_id, title, description, category, priority, status, 
                        due_date, school_district, school_name, start_time, stop_time, 
                        start_time_2, stop_time_2, substitute_name
                    ) VALUES (
                        :1, :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, :12, :13, :14
                    )`,
                    [
                        cloudUserId, 
                        task[2] || 'Legacy Task', 
                        task[3] || '', 
                        task[4] || 'Work', 
                        task[5] || 'Medium', 
                        task[6] || 'Pending', 
                        task[7] || null, 
                        task[8] || '', 
                        task[9] || '', 
                        task[10] || '', 
                        task[11] || '', 
                        task[12] || '', 
                        task[13] || '', 
                        task[15] || ''
                    ],
                    { autoCommit: true }
                );
                tasksInserted++;
            } catch (e) {
                console.error("Task insert error:", e.message);
            }
        }
        
        console.log(`Successfully migrated ${tasksInserted} tasks to the cloud!`);

    } catch (e) {
        console.error("Migration Error:", e.message);
    } finally {
        if (localConn) await localConn.close();
        if (cloudConn) await cloudConn.close();
        process.exit();
    }
}

migrate();
