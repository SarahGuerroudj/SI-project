import { Vehicle } from '../types';

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'VEH-001',
    plate: 'TR-123-A',
    model: 'Volvo FH16',
    capacityKg: 25000,
    status: 'Available',
  },
  {
    id: 'VEH-002',
    plate: 'TR-456-B',
    model: 'Scania R-series',
    capacityKg: 24000,
    status: 'In Use',
  },
  {
    id: 'VEH-003',
    plate: 'UT-789-C',
    model: 'Ford Transit',
    capacityKg: 3500,
    status: 'Maintenance',
  },
  {
    id: 'VEH-004',
    plate: 'UT-101-D',
    model: 'Mercedes Sprinter',
    capacityKg: 3000,
    status: 'Available',
  },
];
