
export enum ShipmentStatus {
  PENDING = 'Pending',
  IN_TRANSIT = 'In Transit',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
  DELAYED = 'Delayed'
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  balance: number;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  status: 'Available' | 'On Route' | 'Off Duty';
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  capacityKg: number;
  status: 'Available' | 'In Use' | 'Maintenance';
}

export interface ShipmentHistoryEvent {
  date: string;
  status: ShipmentStatus;
  location: string;
  description?: string;
}

export interface Shipment {
  id: string;
  clientId: string;
  clientName: string;
  destinationId: string;
  destination: string;
  weight: number;
  volume: number;
  price: number;
  currency?: 'EUR' | 'DZD';
  status: ShipmentStatus;
  dateCreated: string;
  estimatedDelivery: string;
  history: ShipmentHistoryEvent[];
  routeId?: string; // Assigned route, if any
  driverId?: string; // Assigned driver, if known
  isLocked?: boolean; // Prevents modification/deletion if assigned to route
}

export interface Route {
  id: string;
  driverId: string;
  vehicleId: string;
  shipmentIds: string[];
  date: string;
  status: 'Planned' | 'Active' | 'Completed';
  teamId?: string; // Assigned team, if applicable
  actualDistance?: number;
  actualDuration?: number;
  fuelConsumed?: number;
}

export interface Invoice {
  id: string;
  clientId: string;
  shipmentIds: string[];
  amountHT: number;
  tva: number;
  amountTTC: number;
  paidAmount: number;
  outstandingBalance: number;
  date: string;
  status: 'Paid' | 'Partial' | 'Unpaid';
  currency?: 'EUR' | 'DZD';
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  currency?: 'EUR' | 'DZD';
  method: 'Cash' | 'Check' | 'Card' | 'Transfer';
  notes?: string;
}

export interface Incident {
  id: string;
  type: 'Accident' | 'Delay' | 'Damaged Goods' | 'Other';
  description: string;
  date: string;
  resolved: boolean;
  relatedEntityId?: string; // Could be shipment or route ID
  photo?: string;
  attachment?: string;
}

export interface Complaint {
  id: string;
  clientId: string;
  relatedItems: ComplaintItem[];
  description: string;
  date: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High';
}

export interface ComplaintItem {
  type: 'shipment' | 'invoice' | 'service';
  entityId: string;
  description?: string;
}

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  category: 'Delivery' | 'Logistics' | 'Handling' | 'Extras';
  basePrice: number;
  pricePerKm?: number;
  estimatedDeliveryTime: string;
  requirements: string[];
  status: 'Active' | 'Inactive';
  pricingModel?: 'Flat' | 'Distance-based' | 'Tiered';
  additionalFees?: number;
  allowedPackageSizes?: string[];
  driverNotes?: string;
}

export interface DestinationRate {
  id: string;
  destination: string;
  baseRate: number;
  weightRate: number; // Per kg
  volumeRate: number; // Per m³
}

export interface PricingRule {
  id: string;
  serviceTypeId: string;
  destinationId: string;
  basePrice: number;
  pricePerKm?: number;
  isActive: boolean;
}

export type DestinationType = 'Stock Warehouse' | 'Main Hub' | 'Checkpoint' | 'Regular';

export type DestinationStatus = 'Active' | 'Inactive';

export interface DestinationRecord {
  id: string;
  name: string;
  country: string;
  city: string;
  deliveryZone: string;
  distanceKm: number;
  type: DestinationType;
  packagesCapacity?: number;
  availableSpace?: number;
  activeDeliveries: number;
  status: DestinationStatus;
  mapPin: string;
  contact: string;
  serviceArea: string;
  linkedRoutes: string[];
  drivers: string[];
  operatingHours?: string;
  dailyHandoffs?: number;
}

// Represents a user-pinned favorite feature/tool/page
export interface FavoriteItem {
  id: string; // Unique identifier for the favorite (e.g., route path or feature key)
  title: string; // Display name
  icon: string; // Lucide icon name (e.g., 'Home', 'Truck', 'BarChart')
  path: string; // Route path to navigate to
}
