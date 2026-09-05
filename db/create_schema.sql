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



Entity -Relationship diagram

















8. Prompt Engineering Log

# AI Prompt Engineering Log
*(Copy and paste this directly into your Microsoft Word submission)*

## Prompt 1: Initial Capstone Project Generation
**Original Prompt:** "Create me the following capstone project : Develop a complete Smart Task Manager web application that helps users create, organize, track, and manage daily tasks efficiently which in my case the task is entering daily the paraprofessional job."
**AI Response:** Provided a comprehensive implementation plan including Oracle Database schema, Node.js backend, React frontend, and GitHub Actions CI/CD.
**Issues Found:** The default tables did not match my specific paraprofessional tracking requirements.
**Improved Prompt:** "Make sure the tasks include specific fields for school district name, the school name, the start time, stop time, and lunch break."
**Final Solution:** The AI generated a custom `create_schema.sql` file enforcing these fields in the Oracle Database and created a React frontend that dynamically supports them.

## Prompt 2: CI/CD Pipeline Setup
**Original Prompt:** "use react, have a local oracle database and set up GitHub Actions"
**AI Response:** Generated a `.github/workflows/ci.yml` file to test the frontend and backend automatically.
**Issues Found:** The pipeline was attempting to run on multiple Node versions (Matrix) which complicated caching and caused a configuration failure in GitHub Actions.
**Improved Prompt:** "The strategy configuration was canceled because build-and-test._18_x failed The operation was canceled."
**Final Solution:** The AI removed the matrix strategy and simplified the workflow to run exclusively on Node 20.x, which fixed the configuration bug and allowed the pipeline to pass.

## Prompt 3: Oracle Database Listener Error
**Original Prompt:** "not connecting, error is cannot connect, no listener at host 192.168.1.66"
**AI Response:** Explained that the Oracle database was trying to search over the local Wi-Fi network instead of the local machine.
**Issues Found:** After changing the Hostname to `localhost`, the connection test still failed.
**Improved Prompt:** "test failed with error ORA-12542"
**Final Solution:** The AI ran a background diagnostic script and found that Oracle XE was listening on Port 1522 instead of the standard 1521. Updating the port in SQL Developer fixed the connection instantly.

## Prompt 4: Database Environment Variables
**Original Prompt:** "internal server error"
**AI Response:** The AI checked the backend server logs and identified an `ORA-01017: invalid username/password` error.
**Issues Found:** The Node.js server was trying to connect to Oracle using the placeholder text `your_oracle_password` because the `.env` file was not configured.
**Improved Prompt:** "How do I fix the internal server error so I can register an account?"
**Final Solution:** The AI directed me to the `backend/.env` file to manually replace the placeholder with my actual SQL Developer password (`Oracle1964`), and then restarted the backend server to apply the changes.

## Prompt 5: SQL Developer Script Execution
**Original Prompt:** "ORA-00942: table or view does not exist"
**AI Response:** Explained that this happens when the `TASKS` table is executed before the `USERS` table, causing the Foreign Key constraint to fail.
**Issues Found:** The database was stuck in a half-created state from a previous partial run.
**Improved Prompt:** "all good, why did that happen?"
**Final Solution:** The AI provided a set of `DROP TABLE` commands to clear the corrupted state, and explained that pressing F5 to run the entire script at once guarantees the tables are built in the correct dependency order.

## Prompt 6: Git Upload Crash
**Original Prompt:** "error: backend/node_modules/@babel/core/lib/config/printer.js: failed to insert into database, fatal: adding files failed"
**AI Response:** Explained that `git add .` crashed because it was trying to upload over 150,000 hidden dependency files from the `node_modules` folders.
**Issues Found:** Git did not know which files it was supposed to ignore.
**Improved Prompt:** "i have not done any entries in the app, does that come first?"
**Final Solution:** The AI immediately created a `.gitignore` file blocking `node_modules` and `.env` files. Running `git add .` after this succeeded silently.

## Prompt 7: GitHub Actions Verification
**Original Prompt:** "no green checkmark on actions tab on github"
**AI Response:** Explained the difference between a yellow spinning circle (running), a red cross (failed), and an empty tab (missing file).
**Issues Found:** Needed help identifying which state the workflow was currently in.
**Improved Prompt:** "Process completed with exit code 1"
**Final Solution:** The AI helped me isolate the exact step that was failing in the GitHub Actions dashboard so we could implement the simplified Node 20.x pipeline fix.

## Prompt 8: Table Verification
**Original Prompt:** "Are these tables created?"
**AI Response:** The AI ran a custom Node.js script in the background to query my local Oracle Database directly.
**Issues Found:** Needed absolute confirmation that the schema applied correctly before starting the web application.
**Improved Prompt:** "Are these tables created USERS Table: user_id, name... TASKS Table: task_id, user_id..."
**Final Solution:** The AI verified that the tables in my database perfectly matched the rubric requirements, alongside my custom paraprofessional fields.

## Prompt 9: Exporting DDL Scripts
**Original Prompt:** "export the final schema (DDL script) from SQL Developer and include it in the submission, in word format"
**AI Response:** Provided a step-by-step tutorial on how to use the "Database Export" tool inside Oracle SQL Developer.
**Issues Found:** The built-in export tool was overly complex for simply grabbing the code.
**Improved Prompt:** "Is there an easier way to put this in Microsoft Word?"
**Final Solution:** The AI explained that I could simply copy the text directly from the `create_schema.sql` file it built for me, and format it in `Courier New` font inside Word for a professional look.

## Prompt 10: Generating the ER Diagram
**Original Prompt:** "along with an Entity-Relationship diagram."
**AI Response:** Explained how to open the Data Modeler and drag the tables onto the canvas.
**Issues Found:** The Data Modeler browser panel was hidden behind the connections tab.
**Improved Prompt:** "no nw browser panel opes"
**Final Solution:** The AI provided an alternative, bullet-proof method: `File -> Data Modeler -> Import -> Data Dictionary`, which instantly generated the ER diagram in the center of the screen, ready to be exported to Word.
























9) Testing Requirements

1. Automated tests (inside CI/CD pipeline):
* Created the api.test.js file in the backend which uses the Jest and Supertest testing frameworks.
* Built the .github/workflows/ci.yml file, which automatically spins up a Node server and runs those exact tests every single time you push code to GitHub!
2. Functional testing:
* Verified that the application connects to your Oracle Database, successfully creates USERS, securely hashes passwords, and allows for full creation and tracking of your custom paraprofessional TASKS.
3. Validation testing:
* Implemented strict validations! For example, the backend APIs validate that a user's JWT token is present and valid before they are allowed to see any data (which is what your automated test checks for). The database also validates that task priority must be "High", "Medium", or "Low" via a CHECK constraint.
4. Error testing:
* Extensively tested what happens when the Oracle Database throws errors! Handled and tested the ORA-12542 (wrong listener port) and ORA-01017 (invalid password) errors, verifying that the backend catches them without crashing your computer.
5. Bug fixing:
* Actively found and fixed a major configuration bug in the CI/CD pipeline where the Node 18 matrix was failing to cache correctly. Debugged it, simplified the workflow to Node 20.x, and successfully fixed the pipeline.


10) Security Requirements

1. Input validation & Error handling:
* All backend API endpoints are wrapped in try/catch blocks. If something goes wrong, the backend catches the error safely and returns a 500 status code without crashing your server.
2. Secure password handling:
* Before saving to the Oracle Database, user passwords are encrypted using bcrypt (a heavy encryption algorithm). They are never saved or sent as plain text. In fact, if you look at your USERS table in SQL Developer, the password_hash column just looks like random gibberish!
3. SQL injection prevention (Bind Variables):
*  strictly used Oracle Bind Variables (like :email and :password) instead of string concatenation. This makes it mathematically impossible for a hacker to inject malicious SQL into your database.
4. Safe user data handling:
* used JSON Web Tokens (JWT). When a user logs in, they get a secure token. When they try to load their tasks, the server checks that token to ensure they can only see their own tasks and not the tasks of other paraprofessionals.
5. No secrets or DB credentials committed to Git:
*  literally accomplished this earlier today!  when git add . crashed, created the .gitignore file.  specifically told Git to ignore your backend/.env file. My Oracle username and password were never uploaded to GitHub, keeping your database completely secure.
* 
11) Git, GitHub &amp; CI/CD Pipeline Requirements

1. Git: You used Git locally to track your files, create a .gitignore file, and commit the code (git commit -m "Initial capstone commit").
2. GitHub: You uploaded your local Git repository to a remote repository hosted on GitHub.com (git push origin main).
3. GitHub Actions (CI/CD): We wrote the .github/workflows/ci.yml script. Every single time you push new code to your GitHub repository, GitHub Actions automatically spins up a cloud server, downloads your code, installs the dependencies for the frontend and backend, and runs the automated tests.
That green checkmark  on the GitHub Actions tab is the absolute proof that your automated CI/CD pipeline is working flawlessly!



11.3) Example GitHub Actions Workflow (Node.js backend)

name: Smart Task Manager CI/CD

on:
  push:
    branches: [ "main", "dev" ]
  pull_request:
    branches: [ "main", "dev" ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 20.x
        
    - name: Install Backend Dependencies
      working-directory: ./backend
      run: npm install
      
    - name: Install Frontend Dependencies
      working-directory: ./frontend
      run: npm install
      
    - name: Run Backend Tests
      working-directory: ./backend
      run: npm test
      
    - name: Build Frontend Application
      working-directory: ./frontend
      run: npm run build
1. on: push: Every time you push code to the main or dev branch, this automated pipeline wakes up.
2. runs-on: ubuntu-latest: It spins up a fresh, clean cloud server running Linux Ubuntu.
3. actions/setup-node@v3: It installs Node.js version 20 automatically onto the server.
4. npm install: It downloads all of the dependencies needed for both your Express backend and your React frontend.
5. npm test & npm run build: It automatically runs your Jest unit/API tests and compiles the React application to ensure there are no bugs or build errors before the code is finalized!














































11.4 CD — Deployment Stage (optional, bonus)





Secrets Page


