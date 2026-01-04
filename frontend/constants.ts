
import {
    Shipment,
    Client,
    Driver,
    Vehicle,
    Complaint,
    Incident,
    ServiceType,
    DestinationRate,
    Invoice,
    PaymentRecord
} from './types';

// Mock Data for Development
export const MOCK_CLIENTS: Client[] = [];
export const MOCK_DRIVERS: Driver[] = [];
export const MOCK_VEHICLES: Vehicle[] = [];
export const MOCK_SHIPMENTS: Shipment[] = [];
export const MOCK_ROUTES: any[] = [];
export const MOCK_INVOICES: Invoice[] = [];
export const MOCK_PAYMENTS: PaymentRecord[] = [];
export const MOCK_COMPLAINTS: Complaint[] = [];
export const MOCK_INCIDENTS: Incident[] = [];
export const MOCK_SERVICE_TYPES: ServiceType[] = [
    {
        id: '1',
        name: 'Standard',
        description: 'Standard delivery',
        category: 'Delivery',
        basePrice: 500,
        pricePerKm: 15,
        estimatedDeliveryTime: '3-5 days',
        requirements: [],
        status: 'Active'
    },
    {
        id: '2',
        name: 'Express',
        description: 'Express delivery',
        category: 'Delivery',
        basePrice: 1200,
        pricePerKm: 25,
        estimatedDeliveryTime: '24-48 hours',
        requirements: [],
        status: 'Active'
    }
];
export const MOCK_DESTINATION_RATES: DestinationRate[] = [];
