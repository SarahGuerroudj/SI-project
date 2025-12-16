
## Project Overview
RouteMind is a modern, AI-driven logistics management platform. It consists of a React/TypeScript frontend and a Django REST Framework backend. It provides real-time shipment tracking, intelligent route planning, billing management, and AI-powered analytics for logistics companies.

## Architecture

### Technology Stack
- **Frontend**:
  - React 19 + TypeScript 5.8
  - Vite 6
  - React Router v7
  - Tailwind CSS + Lucide React
  - React Query (TanStack Query) for data fetching
  - Recharts for analytics
  - Google GenAI SDK (Gemini 2.5-flash) for forecasting
- **Backend**:
  - Python 3.10+
  - Django 5.x
  - Django REST Framework (DRF)
  - Simple JWT for Authentication
  - SQLite (or PostgreSQL in production)

### Project Structure
```
├── backend/            # Django Backend
│   ├── config/         # Project configuration (settings, urls)
│   ├── logistics/      # Core logistics app (Shipments, Clients, Drivers)
│   ├── fleet/          # Fleet management (vehicles, incidents)
│   ├── billing/        # Invoicing and payments
│   ├── users/          # User authentication and management
│   └── manage.py
├── frontend/           # React Frontend
│   ├── src/
│   │   ├── api/        # Axios instances and endpoint definitions
│   │   ├── components/ # UI components and pages
│   │   ├── contexts/   # React Contexts (Auth, Theme, Data)
│   │   ├── services/   # AI services (Gemini)
│   │   └── types.ts    # TypeScript definitions
│   ├── index.html
│   └── vite.config.ts
└── README.md
```

## Key Patterns & Conventions

### Data Fetching & State
- **React Query**: Primary method for server state (Shipments, Orders, etc.).
- **Axios**: Used for HTTP requests, with interceptors for JWT token attachment and refreshing.
- **Context API**:
  - `AuthContext`: Manages login/logout status and user profile.
  - `DataContext`: Wrapper around React Query hooks to expose data to components.
  - `ThemeContext`: Dark/Light mode toggling.

### Authentication
- **JWT (JSON Web Tokens)**:
  - Access tokens are short-lived (stored in memory/headers).
  - Refresh tokens allow staying logged in.
  - login/register endpoints provided by Django.

### Mock Data Strategy
- **Deprecated**: Old `MOCK_` constants in `constants.ts` are being phased out.
- **Live Data**: Components should use `useData()` hook from `DataContext` or direct `useQuery` calls to fetch data from the Django API.

### Environment Configuration
- **Frontend**: `.env.local` contains `VITE_API_URL` and `GEMINI_API_KEY`.
- **Backend**: `.env` (python-dotenv) manages `SECRET_KEY`, `DEBUG`, and database credentials.

## API & Backend Patterns
- **ViewSets**: Using `ModelViewSet` for standard CRUD operations.
- **Serializers**: `ModelSerializer` used for mapping DB models to JSON.
- **Routers**: `DefaultRouter` used to register ViewSets in `urls.py`.

## Development Workflow

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### TypeScript & types.ts
- Ensure `types.ts` in frontend matches the JSON response structure from `serializers.py` in backend.
- Snake_case from backend is often mapped to camelCase in frontend, or kept as snake_case depending on serializer configuration (currently standardizing on camelCase where possible or handling mapping).

### AI Integration
- `geminiService.ts` fetches analysis based on live dashboard data.
- The prompt includes context about revenue, delays, and fleet utilization.

## Common Tasks

### Adding a New Feature
1. **Backend**: Create Model -> Serializer -> ViewSet -> Register in `urls.py`.
2. **Frontend**: Update `types.ts` -> Add endpoint in `api/endpoints.ts` -> Update `DataContext` or create custom hook -> Build Component.

### Accessing Admin
- Django Admin available at `http://127.0.0.1:8000/admin/`.
- Use `python manage.py createsuperuser` to create an admin account.
