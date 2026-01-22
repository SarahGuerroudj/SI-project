
## Core Features

- **Modular Logistics**: End-to-end management of shipments, routes, and destinations.
- **AI Forecasting**: Predictive delivery analytics powered by Google Gemini.
- **Fleet Intelligence**: Incident reporting and real-time vehicle/driver status monitoring.
- **Automated Billing**: Dynamic pricing rules and PDF invoice generation.
- **Secure RBAC**: Multi-role access control (Admin, Manager, Driver, Client).

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite.
- **Backend**: Django 5.0 (Architected into 12 modular apps), DRF, Simple JWT.
- **Database**: SQLite (Dev) / PostgreSQL (Prod).
- **Intelligence**: Google Gemini Pro API.

---

## Quick Setup

### Backend
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 👥 Access for Testing

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@routemind.com` | `admin123` |
| **Manager** | `manager@routemind.com` | `manager123` |
| **Client** | `client@routemind.com` | `client123` |
| **Driver** | `driver@routemind.com` | `driver123` |

**Admin Panel**: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

---

## 🧠 AI Configuration
To enable AI-driven insights, add your API key to `frontend/.env.local`:
```env
GEMINI_API_KEY=your_key_here
```
