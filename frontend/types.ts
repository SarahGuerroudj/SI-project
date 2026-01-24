
export enum ShipmentStatus {
  PENDING = 'Pending',
  IN_TRANSIT = 'In Transit',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
  DELAYED = 'Delayed'
}

export interface Client {
  id: string;
  userId: string; // User ID (needed for shipments, invoices, etc.)
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
  client?: any; // Nested client details
  destinationObj?: any; // Nested destination details
}

export interface Route {
  id: string;
  driverId: string;
  driver?: any;
  driverName?: string;
  vehicleId: string;
  vehicle?: any;
  vehiclePlate?: string;
  shipmentIds: string[];
  shipments?: any[];
  date: string;
  status: 'Planned' | 'Active' | 'Completed' | 'Pending' | 'In Progress';
  teamId?: string; // Assigned team, if applicable
  actualDistance?: number;
  actualDuration?: number;
  fuelConsumed?: number;
  actual_distance_km?: number;
  actual_duration_hours?: number;
  fuel_consumed_liters?: number;
  estimatedDistance?: number;
  estimatedDuration?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber?: string;
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
  related_entity_id?: string; // Could be shipment or route ID
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
  isActive?: boolean;
  status?: 'Active' | 'Inactive';
  requirements?: string[];
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
  destinationType?: 'Domestic' | 'International';
  packagesCapacity?: number;
  availableSpace?: number;
  activeDeliveries: number;
  status: DestinationStatus;
  isActive?: boolean;
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
