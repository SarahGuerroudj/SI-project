# RouteMind Project Structure

## Root Directory

| File/Folder | Description |
|-------------|-------------|
| `README.md` | Project overview and setup instructions |
| `.git/` | Git version control data |
| `backend/` | Django REST API server |
| `frontend/` | React/Vite web application |

---

## Backend (Django)

```
backend/
├── config/          # Django project settings
├── billing/         # Invoice and payment management
├── users/           # Authentication and user accounts
├── destinations/    # Delivery destinations (Algiers, Oran, etc.)
├── service_types/   # Logistics service definitions (Express, Standard)
├── shipments/       # Shipment tracking and status lifecycle
├── routes/          # Delivery route planning and driver assignment
├── pricing/         # Destination-based pricing rules and overrides
├── clients/         # Client profiles and business data
├── vehicles/        # Fleet vehicle management
├── drivers/         # Driver profiles and assignments
├── incidents/       # Roadside and delivery incident reporting
├── complaints/      # Customer support and complaint tracking
├── manage.py        # Django CLI entry point
├── requirements.txt # Python dependencies
├── db.sqlite3       # SQLite database (development)
└── venv/            # Python virtual environment
```


### App File Structure (Standard Django)

| File | Purpose |
|------|---------|
| `models.py` | Database models (ORM) |
| `views.py` | API endpoints (ViewSets) |
| `serializers.py` | JSON serialization/deserialization |
| `admin.py` | Django admin panel configuration |
| `apps.py` | App configuration |
| `signals.py` | Event-driven logic (e.g., auto-creating profiles) |
| `migrations/` | Database migration files |

---

## Frontend (React + Vite)

```
frontend/
├── api/             # API client configuration
├── components/      # Global atomic/structural React components
│   ├── auth/        # Security and protection components
│   ├── layout/      # Sidebar, Navbar, and structural wrappers
│   └── ui/          # Atomic reusable items (Modal, Chatbot, etc.)
├── config/          # Navigation and app configuration
├── contexts/        # React Context providers (state management)
├── features/        # Business logic modules (Domain-driven)
│   ├── admin/       # Audit logs and administrative tools
│   ├── clients/     # Client forms and list logic
│   ├── dashboards/  # Role-specific dashboard views
│   ├── drivers/     # Driver management logic
│   └── vehicles/    # Fleet and vehicle logic
├── hooks/           # Custom React hooks (useAuth, useData, etc.)
├── pages/           # High-level route views (Page containers)
├── services/        # External services (Gemini, Audit, etc.)
├── types/           # Domain-specific TypeScript types
├── App.tsx          # Root application component
├── index.tsx        # Application entry point
├── index.html       # HTML template
├── types.ts         # Shared global TypeScript types
├── constants.ts     # Application constants
└── vite.config.ts   # Vite bundler configuration
```

### Pages Directory

| File | Role |
|------|------|
| `Dashboard.tsx` | Main manager/admin analytics view |
| `Home.tsx` | Public landing page |
| `Shipments.tsx` | Shipment operations and tracking |
| `Routes.tsx` | Logic for planning and assignment |
| `Billing.tsx` | Financial overview and invoicing |
| `ResourcesPage.tsx` | Master view for drivers and fleet |
| `DestinationsPage.tsx`| Node and hub management |
| `ServiceTypesPage.tsx`| Logistics product configuration |
| `PricingPage.tsx` | Rate management and overrides |
| `Complaints.tsx` | Customer support portal |
| `Incidents.tsx` | Safety and delay reporting |
| `Account.tsx` | User profile and security |

### Components & Features

| Directory | Purpose |
|-----------|---------|
| **components/layout** | Houses `Layout.tsx`, `DashboardLayout`, and `Sidebar` |
| **components/ui** | Global elements like `Modal`, `Chatbot`, and `Notifications` |
| **features/** | Grouped sub-components and domain logic (e.g., `DriverForm`) |
| **contexts/** | Global state for Auth, Data, Favorites, and Theme |

### Contexts (State Management)

| Context | Purpose |
|---------|---------|
| `AuthContext.tsx` | User authentication state |
| `DataContext.tsx` | Application data (shipments, clients, etc.) |
| `FavoritesContext.tsx` | User favorites/bookmarks |
| `ThemeContext.tsx` | Dark/light theme toggle |
| `ToastContext.tsx` | Toast notification system |

### Services

| Service | Purpose |
|---------|---------|
| `businessLogic.ts` | Pricing calculations, business rules |
| `geminiService.ts` | Google Gemini AI integration |
| `auditLog.ts` | Activity logging |

### API Layer

| File | Purpose |
|------|---------|
| `client.ts` | Axios HTTP client configuration |
| `endpoints.ts` | API endpoint URL constants |

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | NPM dependencies and scripts |
| `tsconfig.json` | TypeScript compiler settings |
| `vite.config.ts` | Vite bundler configuration |
| `.env.local` | Environment variables (API keys) |
| `.gitignore` | Git ignore patterns |
| `.npmrc` | NPM configuration |

---

## Key Technologies

| Layer | Technologies |
|-------|--------------|
| **Backend** | Python 3, Django 5, Django REST Framework, SQLite |
| **Frontend** | React 19, TypeScript, Vite, TailwindCSS |
| **Auth** | JWT tokens, Google OAuth |
| **AI** | Google Gemini API |
| **PDF** | jsPDF, jspdf-autotable |


