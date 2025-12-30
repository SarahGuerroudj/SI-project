# RouteMind - AI-Driven Logistics Platform

RouteMind is a modern, full-stack logistics management platform designed to empower small businesses with AI-driven insights, real-time tracking, and automated workflows.

## Project Structure

This project uses a monorepo-style structure:

*   **`backend/`**: Django REST Framework API.
*   **`frontend/`**: React + TypeScript + Vite application.

---

##  Getting Started

Follow these steps to set up the project locally.

### Prerequisites

*   Python 3.10+
*   Node.js 18+
*   npm

### 1. Backend Setup (Django)

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Create a virtual environment:
    ```bash
    # Windows
    python -m venv venv
    venv\Scripts\activate

    # Mac/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  Run migrations to set up the database:
    ```bash
    python manage.py migrate
    ```

5.  **Create a Superuser (Admin Access)**: deja creato dero fl username admin password admin 
    This allows you to access the Django Admin panel to view and manage tables.
    ```bash
    python manage.py createsuperuser
    ```
    Follow the prompts to set a username, email, and password.

6.  Start the backend server:
    ```bash
    python manage.py runserver
    ```

### 2. Frontend Setup (React)

1.  Open a new terminal and navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```
---

##  Viewing Database Tables (Django Admin)

To view and manage your data (Shipments, Drivers, Clients, etc.) directly:

1.  Ensure the backend server is running (`python manage.py runserver`).
2.  Open your browser and search for: **`http://127.0.0.1:8000/admin/`**
3.  Log in with the **superuser credentials** you created in step 1.5.
4.  You will see a dashboard listing all your Apps (Logistics, Fleet, Billing, etc.) and tables. You can Add, Edit, and Delete records here.

---

##  AI Integration

To enable the AI features (Forecasts/Analytics):
1.  Obtain a Google Gemini API Key.
2.  Create a `.env.local` file in the `frontend/` directory.
3.  Add your key:
    ```
    GEMINI_API_KEY=your_api_key_here
    ```

## 🛠 Tech Stack

*   **Frontend**: React, TypeScript, Tailwind CSS, Lucide Icons, React Query.
*   **Backend**: Django, Django REST Framework, Simple JWT.
*   **Database**: SQLite
