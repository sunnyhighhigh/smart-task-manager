-- =========================================================
-- Smart Task Manager (Paraprofessional) - Oracle DDL Schema
-- =========================================================

-- 1. Create USERS Table
CREATE TABLE USERS (
    user_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    email VARCHAR2(255) NOT NULL UNIQUE,
    password_hash VARCHAR2(255) NOT NULL,
    created_date TIMESTAMP DEFAULT SYSTIMESTAMP
);

-- 2. Create TASKS Table
CREATE TABLE TASKS (
    task_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER NOT NULL,
    title VARCHAR2(255) NOT NULL,
    description CLOB,
    category VARCHAR2(50),
    priority VARCHAR2(20),
    status VARCHAR2(20),
    due_date DATE,
    
    -- Paraprofessional Specific Fields
    school_district VARCHAR2(255),
    school_name VARCHAR2(255),
    start_time VARCHAR2(10),       -- Storing as HH:MM format
    stop_time VARCHAR2(10),        -- Storing as HH:MM format
    lunch_break_minutes NUMBER,
    
    created_date TIMESTAMP DEFAULT SYSTIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_tasks_users FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_priority CHECK (priority IN ('High', 'Medium', 'Low')),
    CONSTRAINT chk_status CHECK (status IN ('Pending', 'In Progress', 'Completed'))
);

-- 3. Create Indexes for Search/Filter Performance
CREATE INDEX idx_tasks_user_id ON TASKS(user_id);
CREATE INDEX idx_tasks_status ON TASKS(status);
CREATE INDEX idx_tasks_category ON TASKS(category);
CREATE INDEX idx_tasks_priority ON TASKS(priority);
CREATE INDEX idx_tasks_due_date ON TASKS(due_date);

-- =========================================================
-- End of Script
-- =========================================================
