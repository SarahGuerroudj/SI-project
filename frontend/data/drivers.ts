import { Driver } from '../types';

export const MOCK_DRIVERS: Driver[] = [
  {
    id: 'DRV-001',
    name: 'John Doe',
    licenseNumber: 'A12345678',
    phone: '555-0201',
    status: 'Available',
  },
  {
    id: 'DRV-002',
    name: 'Jane Smith',
    licenseNumber: 'B87654321',
    phone: '555-0202',
    status: 'On Route',
  },
  {
    id: 'DRV-003',
    name: 'Mike Johnson',
    licenseNumber: 'C11223344',
    phone: '555-0203',
    status: 'Off Duty',
  },
  {
    id: 'DRV-004',
    name: 'Emily Davis',
    licenseNumber: 'D99887766',
    phone: '555-0204',
    status: 'Available',
  },
];
