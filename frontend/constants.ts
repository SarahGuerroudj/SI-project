
import { Client, Driver, Vehicle, Shipment, ShipmentStatus, Invoice, Incident, Complaint, PaymentRecord, DestinationRate, Route } from './types';

export const MOCK_CLIENTS: Client[] = [
  { id: 'c1', name: 'sarah guerroudj.', email: 'logistics@techsolutions.com', phone: '+33 1 23 45 67 89', address: '12 Rue de la Paix, Paris', balance: 1200 },
  { id: 'c2', name: 'GreenGrocers Ltd.', email: 'supply@greengrocers.com', phone: '+33 4 56 78 90 12', address: '45 Avenue Jean Jaurès, Lyon', balance: 0 },
  { id: 'c3', name: 'AutoParts Express', email: 'orders@autoparts.com', phone: '+33 5 67 89 01 23', address: '8 Boulevard Victor Hugo, Marseille', balance: 450 },
];

export const MOCK_DRIVERS: Driver[] = [
  { id: 'd1', name: 'Jean Dupont', licenseNumber: 'B-123456', phone: '06 12 34 56 78', status: 'Available' },
  { id: 'd2', name: 'Marie Curie', licenseNumber: 'C-987654', phone: '06 98 76 54 32', status: 'On Route' },
  { id: 'd3', name: 'Pierre Martin', licenseNumber: 'C-456789', phone: '06 11 22 33 44', status: 'Available' },
];

export const MOCK_VEHICLES: Vehicle[] = [
  { id: 'v1', plate: 'AB-123-CD', model: 'Renault Master', capacityKg: 1500, status: 'Available' },
  { id: 'v2', plate: 'EF-456-GH', model: 'Mercedes Sprinter', capacityKg: 2000, status: 'In Use' },
  { id: 'v3', plate: 'IJ-789-KL', model: 'Volvo FH16', capacityKg: 20000, status: 'Available' },
];

export const MOCK_SHIPMENTS: Shipment[] = [
  { 
    id: 'SH-001', 
    clientId: 'c1', 
    clientName: 'TechSolutions Inc.', 
    destination: 'Lille', 
    weight: 120, 
    volume: 1.5, 
    price: 150, 
    status: ShipmentStatus.DELIVERED, 
    dateCreated: '2023-10-01', 
    estimatedDelivery: '2023-10-03',
    history: [
      { date: '2023-10-01 09:00', status: ShipmentStatus.PENDING, location: 'Paris HQ', description: 'Order received' },
      { date: '2023-10-01 14:30', status: ShipmentStatus.IN_TRANSIT, location: 'Paris Hub', description: 'Loaded onto truck' },
      { date: '2023-10-02 10:15', status: ShipmentStatus.IN_TRANSIT, location: 'A1 Highway', description: 'En route to Lille' },
      { date: '2023-10-03 11:45', status: ShipmentStatus.DELIVERED, location: 'Lille', description: 'Signed by recipient' }
    ],
    routeId: 'RT-002',
    driverId: 'd1',
    isLocked: true
  },
  { 
    id: 'SH-002', 
    clientId: 'c2', 
    clientName: 'GreenGrocers Ltd.', 
    destination: 'Bordeaux', 
    weight: 500, 
    volume: 4.0, 
    price: 450, 
    status: ShipmentStatus.IN_TRANSIT, 
    dateCreated: '2023-10-05', 
    estimatedDelivery: '2023-10-07',
    history: [
      { date: '2023-10-05 08:30', status: ShipmentStatus.PENDING, location: 'Lyon Depot', description: 'Order processing' },
      { date: '2023-10-05 16:00', status: ShipmentStatus.IN_TRANSIT, location: 'Lyon Distribution Center', description: 'Departed facility' }
    ],
    routeId: 'RT-001',
    driverId: 'd2',
    isLocked: true
  },
  { 
    id: 'SH-003', 
    clientId: 'c3', 
    clientName: 'AutoParts Express', 
    destination: 'Nice', 
    weight: 50, 
    volume: 0.2, 
    price: 80, 
    status: ShipmentStatus.PENDING, 
    dateCreated: '2023-10-06', 
    estimatedDelivery: '2023-10-09',
    history: [
      { date: '2023-10-06 13:45', status: ShipmentStatus.PENDING, location: 'Marseille Warehouse', description: 'Awaiting pickup' }
    ],
    isLocked: false
  },
  { 
    id: 'SH-004', 
    clientId: 'c1', 
    clientName: 'TechSolutions Inc.', 
    destination: 'Toulouse', 
    weight: 200, 
    volume: 2.5, 
    price: 220, 
    status: ShipmentStatus.PENDING, 
    dateCreated: '2023-10-06', 
    estimatedDelivery: '2023-10-10',
    history: [
      { date: '2023-10-06 15:20', status: ShipmentStatus.PENDING, location: 'Paris HQ', description: 'Order created' }
    ],
    isLocked: false
  },
  { 
    id: 'SH-005', 
    clientId: 'c2', 
    clientName: 'GreenGrocers Ltd.', 
    destination: 'Paris', 
    weight: 1000, 
    volume: 8.0, 
    price: 800, 
    status: ShipmentStatus.DELIVERED, 
    dateCreated: '2023-09-28', 
    estimatedDelivery: '2023-09-30',
    history: [
      { date: '2023-09-28 09:00', status: ShipmentStatus.PENDING, location: 'Rungis Market', description: 'Goods prepared' },
      { date: '2023-09-28 11:00', status: ShipmentStatus.IN_TRANSIT, location: 'Paris Beltway', description: 'Traffic check ok' },
      { date: '2023-09-30 08:30', status: ShipmentStatus.DELIVERED, location: 'Paris Center', description: 'Delivered to loading dock' }
    ],
    routeId: 'RT-002',
    driverId: 'd1',
    isLocked: true
  },
];

export const MOCK_ROUTES: Route[] = [
  {
    id: 'RT-001',
    driverId: 'd2',
    vehicleId: 'v2',
    shipmentIds: ['SH-002'],
    date: '2023-10-05',
    status: 'Active'
  },
  {
    id: 'RT-002',
    driverId: 'd1',
    vehicleId: 'v1',
    shipmentIds: ['SH-001', 'SH-005'],
    date: '2023-09-28',
    status: 'Completed'
  }
];

export const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-2023-001', clientId: 'c1', shipmentIds: ['SH-001'], amountHT: 150, tva: 28.5, amountTTC: 178.5, paidAmount: 178.5, outstandingBalance: 0, date: '2023-10-01', status: 'Paid', currency: 'EUR' },
  { id: 'INV-2023-002', clientId: 'c2', shipmentIds: ['SH-002', 'SH-005'], amountHT: 800, tva: 152, amountTTC: 952, paidAmount: 0, outstandingBalance: 952, date: '2023-09-28', status: 'Unpaid', currency: 'EUR' },
];

export const MOCK_INCIDENTS: Incident[] = [
  { id: 'INC-001', type: 'Delay', description: 'Traffic jam on A6 causing 2h delay.', date: '2023-10-05', resolved: true, relatedEntityId: 'SH-002' },
  { id: 'INC-002', type: 'Damaged Goods', description: 'Package crushed during loading.', date: '2023-10-06', resolved: false, relatedEntityId: 'SH-004' },
];

export const MOCK_PAYMENT_RECORDS: PaymentRecord[] = [
  { id: 'PAY-001', invoiceId: 'INV-2023-001', amount: 178.5, date: '2023-10-01', method: 'Transfer', notes: 'Full payment received', currency: 'EUR' },
];

export const MOCK_COMPLAINTS: Complaint[] = [
  { 
    id: 'CMP-001', 
    clientId: 'c3', 
    relatedItems: [
      { type: 'shipment', entityId: 'SH-004', description: 'Package arrived damaged' }
    ],
    description: 'Product arrived with visible damage to packaging and contents.',
    date: '2023-10-06',
    status: 'Open',
    priority: 'High'
  },
];

export const MOCK_DESTINATION_RATES: DestinationRate[] = [
  // Algerian destinations  show first in dropdown
  { id: 'ALG-001', destination: 'Algiers', baseRate: 220, weightRate: 1.6, volumeRate: 35 },
  { id: 'ALG-002', destination: 'Oran', baseRate: 210, weightRate: 1.5, volumeRate: 34 },
  { id: 'ALG-003', destination: 'Constantine', baseRate: 230, weightRate: 1.7, volumeRate: 36 },
  { id: 'ALG-004', destination: 'Annaba', baseRate: 200, weightRate: 1.4, volumeRate: 33 },
  { id: 'ALG-005', destination: 'Blida', baseRate: 215, weightRate: 1.55, volumeRate: 34 },
  { id: 'ALG-006', destination: 'Sétif', baseRate: 205, weightRate: 1.45, volumeRate: 33 },
  { id: 'ALG-007', destination: 'Bejaia', baseRate: 225, weightRate: 1.6, volumeRate: 35 },
  { id: 'ALG-008', destination: 'Tizi Ouzou', baseRate: 210, weightRate: 1.5, volumeRate: 34 },

  //  French destinations
  { id: 'FR-001', destination: 'Lille', baseRate: 50, weightRate: 0.5, volumeRate: 10 },
  { id: 'FR-002', destination: 'Bordeaux', baseRate: 75, weightRate: 0.6, volumeRate: 12 },
  { id: 'FR-003', destination: 'Nice', baseRate: 100, weightRate: 0.7, volumeRate: 15 },
  { id: 'FR-004', destination: 'Toulouse', baseRate: 80, weightRate: 0.6, volumeRate: 12 },
  { id: 'FR-005', destination: 'Paris', baseRate: 40, weightRate: 0.4, volumeRate: 8 },
  { id: 'FR-006', destination: 'Lyon', baseRate: 60, weightRate: 0.5, volumeRate: 10 },
];
