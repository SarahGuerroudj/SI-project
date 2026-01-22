export const API_BASE_URL = 'http://localhost:8000/api/v1';

export const ENDPOINTS = {
    // Auth
    LOGIN: '/token/',
    REFRESH: '/token/refresh/',
    REGISTER: '/register/',
    GOOGLE_AUTH: '/auth/google/',

    // Users
    USERS: '/users/',

    // Logistics
    SHIPMENTS: '/shipments/',
    DESTINATIONS: '/destinations/',
    SERVICE_TYPES: '/service-types/',
    PRICING_RULES: '/pricing-rules/',
    ROUTES: '/routes/',

    // Fleet
    VEHICLES: '/vehicles/',
    DRIVERS: '/drivers/',
    INCIDENTS: '/incidents/',


    // Support
    COMPLAINTS: '/complaints/',
    AUDIT_LOGS: '/audit-logs/',

    // Billing
    INVOICES: '/invoices/',
    PAYMENTS: '/payments/',
};
