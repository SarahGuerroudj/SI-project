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
    ROUTES: '/routes/',

    // Fleet
    VEHICLES: '/vehicles/',
    DRIVERS: '/drivers/',
    INCIDENTS: '/incidents/',


    // Support
    COMPLAINTS: '/complaints/',

    // Billing
    INVOICES: '/invoices/',
    PAYMENTS: '/payments/',
};
