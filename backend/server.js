const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getConnection } = require('./db');
const oracledb = require('oracledb');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_change_in_production';

// ==========================================
// User Authentication APIs
// ==========================================

// Register
app.post('/api/users/register', async (req, res) => {
    const { name, email, password } = req.body;
    let connection;
    try {
        const password_hash = await bcrypt.hash(password, 10);
        connection = await getConnection();
        
        const result = await connection.execute(
            `INSERT INTO USERS (name, email, password_hash) VALUES (:name, :email, :password_hash) RETURNING user_id INTO :user_id`,
            {
                name: name,
                email: email,
                password_hash: password_hash,
                user_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
            }
        );
        
        res.status(201).json({ 
            message: "User registered successfully", 
            user_id: result.outBinds.user_id[0] 
        });
    } catch (error) {
        console.error(error);
        if (error.message.includes('unique constraint')) {
            return res.status(400).json({ error: "Email already exists." });
        }
        res.status(500).json({ error: "Internal server error" });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

// Login
app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body;
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT * FROM USERS WHERE email = :email`,
            { email: email }
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        
        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.PASSWORD_HASH);
        if (!match) return res.status(401).json({ error: "Invalid email or password" });
        
        const token = jwt.sign({ user_id: user.USER_ID }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ message: "Login successful", token, name: user.NAME });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.sendStatus(401);
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// ==========================================
// Task Management APIs
// ==========================================

// Create Task
app.post('/api/tasks', authenticateToken, async (req, res) => {
    let connection;
    try {
        const { 
            title, description, category, priority, status, due_date, 
            school_district, school_name, start_time, stop_time, lunch_break_minutes 
        } = req.body;
        
        connection = await getConnection();
        
        const result = await connection.execute(
            `INSERT INTO TASKS (
                user_id, title, description, category, priority, status, due_date, 
                school_district, school_name, start_time, stop_time, lunch_break_minutes
            ) VALUES (
                :user_id, :title, :description, :category, :priority, :status, TO_DATE(:due_date, 'YYYY-MM-DD'), 
                :school_district, :school_name, :start_time, :stop_time, :lunch_break_minutes
            ) RETURNING task_id INTO :task_id`,
            {
                user_id: req.user.user_id,
                title: title,
                description: description || null,
                category: category || null,
                priority: priority || null,
                status: status || null,
                due_date: due_date || null,
                school_district: school_district || null,
                school_name: school_name || null,
                start_time: start_time || null,
                stop_time: stop_time || null,
                lunch_break_minutes: lunch_break_minutes || null,
                task_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
            }
        );
        
        res.status(201).json({ message: "Task created", task_id: result.outBinds.task_id[0] });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

// Get Tasks (with filtering and search)
app.get('/api/tasks', authenticateToken, async (req, res) => {
    let connection;
    try {
        const { search, category, priority, status } = req.query;
        connection = await getConnection();
        
        let query = `SELECT * FROM TASKS WHERE user_id = :user_id`;
        let params = { user_id: req.user.user_id };
        
        if (search) {
            query += ` AND title LIKE :search`;
            params.search = `%${search}%`;
        }
        if (category) {
            query += ` AND category = :category`;
            params.category = category;
        }
        if (priority) {
            query += ` AND priority = :priority`;
            params.priority = priority;
        }
        if (status) {
            query += ` AND status = :status`;
            params.status = status;
        }
        
        query += ` ORDER BY due_date ASC`;
        
        const result = await connection.execute(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

// Update Task Status/Details
app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
    let connection;
    try {
        const { 
            title, description, category, priority, status, due_date, 
            school_district, school_name, start_time, stop_time, lunch_break_minutes 
        } = req.body;
        
        connection = await getConnection();
        
        const result = await connection.execute(
            `UPDATE TASKS SET 
                title = COALESCE(:title, title),
                description = COALESCE(:description, description),
                category = COALESCE(:category, category),
                priority = COALESCE(:priority, priority),
                status = COALESCE(:status, status),
                due_date = COALESCE(TO_DATE(:due_date, 'YYYY-MM-DD'), due_date),
                school_district = COALESCE(:school_district, school_district),
                school_name = COALESCE(:school_name, school_name),
                start_time = COALESCE(:start_time, start_time),
                stop_time = COALESCE(:stop_time, stop_time),
                lunch_break_minutes = COALESCE(:lunch_break_minutes, lunch_break_minutes)
            WHERE task_id = :task_id AND user_id = :user_id`,
            {
                title: title || null,
                description: description || null,
                category: category || null,
                priority: priority || null,
                status: status || null,
                due_date: due_date || null,
                school_district: school_district || null,
                school_name: school_name || null,
                start_time: start_time || null,
                stop_time: stop_time || null,
                lunch_break_minutes: lunch_break_minutes || null,
                task_id: req.params.id,
                user_id: req.user.user_id
            }
        );
        
        if (result.rowsAffected === 0) return res.status(404).json({ error: "Task not found" });
        res.json({ message: "Task updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

// Delete Task
app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `DELETE FROM TASKS WHERE task_id = :task_id AND user_id = :user_id`, 
            { task_id: req.params.id, user_id: req.user.user_id }
        );
        
        if (result.rowsAffected === 0) return res.status(404).json({ error: "Task not found" });
        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

// Dashboard Analytics
app.get('/api/dashboard', authenticateToken, async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(`
            SELECT 
                COUNT(*) as total_tasks,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_tasks,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending_tasks,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_tasks
            FROM TASKS WHERE user_id = :user_id
        `, { user_id: req.user.user_id });
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
