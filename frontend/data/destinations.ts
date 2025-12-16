import { DestinationRate } from '../types';

export const MOCK_DESTINATIONS: DestinationRate[] = [
  {
    destination: 'Metropolis',
    baseRate: 50,
    weightRate: 0.5,
    volumeRate: 10,
  },
  {
    destination: 'Star City',
    baseRate: 60,
    weightRate: 0.6,
    volumeRate: 12,
  },
  {
    destination: 'Gotham',
    baseRate: 75,
    weightRate: 0.7,
    volumeRate: 15,
  },
  {
    destination: 'Central City',
    baseRate: 55,
    weightRate: 0.55,
    volumeRate: 11,
  },
];
