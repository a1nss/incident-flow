# 🚨 IncidentFlow

### Real-Time Incident Management Platform for Distributed Teams

**[Live Demo](https://incident-flow.vercel.app/)** 


## 📖 About The Project

In high-stakes engineering environments, seconds matter. **IncidentFlow** is a full-stack dashboard designed to replace chaotic email threads and Slack messages during system outages.

It acts as a "Single Source of Truth," allowing teams to report, track, and resolve critical incidents in real-time. Unlike traditional CRUD apps, IncidentFlow leverages **WebSockets** to push updates instantly to all connected clients—ensuring every engineer sees the same status at the same time without refreshing.

### Key Features
* **⚡ Real-Time Synchronization:** Built with **Socket.io** to broadcast incident updates to all active users instantly.
* **🔐 Secure Authentication:** Custom JWT (JSON Web Token) implementation with protected routes and middleware.
* **🗄️ Relational Data Model:** Normalized **PostgreSQL** schema to ensure data integrity for incidents and users.
* **🛡️ Production-Grade Security:** Implemented CORS policies, password hashing (bcrypt), and environment variable protection.
* **📱 Responsive Design:** Modern UI built with **React** and **Tailwind CSS**.

## 🛠️ Tech Stack

**Frontend:**
* React.js (Vite)
* Tailwind CSS
* Socket.io Client
* Axios

**Backend:**
* Node.js & Express
* PostgreSQL (hosted on Render)
* Socket.io (WebSockets)
* JsonWebToken (JWT) & Bcrypt

**Infrastructure:**
* **Database:** Render (PostgreSQL)
* **API Hosting:** Render
* **Frontend Hosting:** Vercel

## 🚀 Local Setup Instructions

If you want to run this project locally on your machine:

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/incident-flow.git](https://github.com/a1nss/incident-flow.git)
    cd incident-flow
    ```

2.  **Install Dependencies**
    ```bash
    # Install server dependencies
    cd server
    npm install

    # Install client dependencies
    cd ../client
    npm install
    ```

3.  **Database Setup**
    * Ensure you have PostgreSQL installed.
    * Create a local database named `incidentflow`.
    * Run the SQL scripts in `database.sql` (if provided) or manually create `users` and `incidents` tables.

4.  **Environment Variables**
    * Create a `.env` file in the `server` folder:
    ```env
    PORT=5001
    DB_USER=your_postgres_user
    DB_PASSWORD=your_postgres_password
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=incidentflow
    JWT_SECRET=secret_key_123
    ```

5.  **Run the App**
    * **Terminal 1 (Server):** `cd server && npm run dev`
    * **Terminal 2 (Client):** `cd client && npm run dev`



**Ainsley Bermisa** - [Email](mailto:ainsleybermisa25@gmail.com)

Project Link: (https://github.com/a1nss/incident-flow)
