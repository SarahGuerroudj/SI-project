# RouteMind - Smart Logistics Management System

RouteMind is a state-of-the-art logistics and fleet management platform designed to streamline shipment tracking, route optimization, and client management. Built with a modern tech stack, it provides a premium, responsive experience for Managers, Drivers, and Clients.

## 🚀 Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [React Query (TanStack) 5](https://tanstack.com/query/latest)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Charts**: [Recharts](https://recharts.org/)

### Backend
- **Framework**: [Django 5.0](https://www.djangoproject.com/)
- **API**: [Django REST Framework](https://www.django-rest-framework.org/)
- **Auth**: JWT (SimpleJWT) & Google OAuth
- **Database**: PostgreSQL (Production) / SQLite (Development)
- **Media Handling**: Pillow (for asset management)

---

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)
- **Git**

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed initial accounts (Manager, Driver, Client)
python manage.py seed_accounts

# Start backend server
python manage.py runserver
```

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## ⚙️ Configuration & Environment Variables

### Backend (.env)
Create a `.env` file in the `backend/` directory:
```env
DEBUG=True
SECRET_KEY=your_django_secret_key
DATABASE_URL=postgres://user:password@localhost:5432/routemind
GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
```

### Frontend (.env.local)
Create a `.env.local` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 📦 Key Dependencies Explained

| Package | Purpose |
| :--- | :--- |
| `@tanstack/react-query` | Efficient data fetching, caching, and synchronization. |
| `@react-oauth/google` | Seamless Google Sign-In integration. |
| `jspdf` & `jspdf-autotable` | Generating professional PDF invoices and reports. |
| `lucide-react` | Clean, consistent iconography throughout the UI. |
| `whitenoise` | Serving static files efficiently in production. |
| `djangorestframework-simplejwt` | Secure, stateless authentication using JSON Web Tokens. |

---

## 🏗️ Building for Production
```bash
# Frontend
cd frontend
npm run build

# Backend (Production Ready)
cd backend
python manage.py collectstatic
gunicorn core.wsgi:application
```
