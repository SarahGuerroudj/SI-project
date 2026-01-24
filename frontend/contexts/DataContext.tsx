import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import auditLog from '../services/auditLog';
import { useToast } from './ToastContext';
import {
  Client, Driver, Vehicle, DestinationRate, ServiceType, DestinationRecord, PricingRule,
  Shipment, Route, Invoice, PaymentRecord, Incident, Complaint
} from '../types';

interface Identifiable {
  id: string;
}

type Entity = Client | Driver | Vehicle | DestinationRate | ServiceType | DestinationRecord | PricingRule | Shipment | Route | Invoice | PaymentRecord | Incident | Complaint;
type EntityType =
  | 'clients'
  | 'drivers'
  | 'vehicles'
  | 'shipments'
  | 'destinations'
  | 'serviceTypes'
  | 'pricing'
  | 'destinationRecords'
  | 'routes'
  | 'invoices'
  | 'payments'
  | 'incidents'
  | 'complaints';

interface DataContextType {
  getItems: <T extends Entity>(entityType: EntityType) => T[];
  addItem: <T extends Entity>(entityType: EntityType, item: Omit<T, 'id'>) => Promise<boolean>;
  updateItem: <T extends Entity>(entityType: EntityType, item: T) => Promise<void>;
  deleteItem: (entityType: EntityType, id: string) => Promise<void>;
  isLoading: boolean;
  isClientsLoading: boolean;
  refetchClients: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { addToast } = useToast();
  // Use React Query for data fetching
  const queries = {
    clients: useQuery({
      queryKey: ['clients'],
      queryFn: async () => {
        const res = await apiClient.get(ENDPOINTS.CLIENTS);
        return res.data.map((c: any) => ({
          id: c.id.toString(),
          userId: c.user?.toString() || c.user_details?.id?.toString() || '',
          name: c.user_details?.first_name || c.user_details?.username || 'Unknown',
          email: c.user_details?.email || '',
          phone: c.user_details?.phone || '',
          address: c.user_details?.address || '',
          balance: parseFloat(c.user_details?.balance) || 0,
          clientType: c.client_type,
          companyName: c.company_name,
          taxId: c.tax_id,
          website: c.website,
        }));
      }
    }),
    drivers: useQuery({
      queryKey: ['drivers'],
      queryFn: async () => {
        const res = await apiClient.get(ENDPOINTS.DRIVERS);
        return res.data.map((d: any) => ({
          id: d.id.toString(),
          name: d.user_details?.first_name || d.user_details?.username || 'Unknown',
          licenseNumber: d.license_number || '',
          phone: d.user_details?.phone || '',
          status: d.status || 'Available'
        }));
      }
    }),
    vehicles: useQuery({
      queryKey: ['vehicles'],
      queryFn: async () => {
        const res = await apiClient.get(ENDPOINTS.VEHICLES);
        return res.data.map((v: any) => ({
          id: v.id.toString(),
          plate: v.plate,
          model: v.model,
          capacityKg: v.capacity_kg || 0,
          status: v.status
        }));
      }
    }),
    shipments: useQuery({
      queryKey: ['shipments'],
      queryFn: async () => {
        const res = await apiClient.get(ENDPOINTS.SHIPMENTS);
        return res.data.map((s: any) => ({
          id: s.id.toString(),
          clientId: s.client,
          // Use client_details for name if available, otherwise fallback
          clientName: s.client_details?.first_name || s.client_details?.username || 'Unknown',
          client: s.client_details,
          destinationId: s.destination,
          destination: s.destination_details?.name || 'Unknown',
          destinationObj: s.destination_details,
          weight: s.weight,
          volume: s.volume,
          price: parseFloat(s.price),
          status: s.status,
          dateCreated: s.dateCreated?.split('T')[0] || new Date().toISOString().split('T')[0],
          estimatedDelivery: s.estimatedDelivery?.split('T')[0] || '',
          history: s.history || [],
          isLocked: s.status !== 'Pending', // Simple logic for now
        }));
      }
    }),
    destinations: useQuery({ queryKey: ['destinations'], queryFn: () => apiClient.get(ENDPOINTS.DESTINATIONS).then(res => res.data) }),
    routes: useQuery({
      queryKey: ['routes'],
      queryFn: async () => {
        const res = await apiClient.get(ENDPOINTS.ROUTES);
        return res.data.map((r: any) => ({
          id: r.id.toString(),
          driverId: r.driver,
          vehicleId: r.vehicle,
          shipmentIds: r.shipments || [],
          // Expanded fields
          driver: r.driver_details,
          vehicle: r.vehicle_details,
          shipments: r.shipments_details,
          // Use nested details for display if available
          driverName: r.driver_details?.user_details?.name || r.driver_details?.user_details?.username || r.driver_details?.user_details?.first_name || 'Unknown',
          vehiclePlate: r.vehicle_details?.plate || 'Unknown',
          date: r.date,
          status: r.status,
          actualDistance: r.actual_distance_km,
          actualDuration: r.actual_duration_hours,
          fuelConsumed: r.fuel_consumed_liters,
          actual_distance_km: r.actual_distance_km,
          actual_duration_hours: r.actual_duration_hours,
          fuel_consumed_liters: r.fuel_consumed_liters,
        }));
      }
    }),
    invoices: useQuery({
      queryKey: ['invoices'],
      queryFn: async () => {
        const res = await apiClient.get(ENDPOINTS.INVOICES);
        return res.data.map((inv: any) => ({
          id: inv.id.toString(),
          invoiceNumber: `INV-${inv.id.toString().padStart(5, '0')}`,
          clientId: inv.client,
          // clientName: inv.client_details?.username || 'Unknown', // Not strictly needed if we look up via getClients
          amount: parseFloat(inv.amount_ht), // Frontend might use amount or amountTTC
          amountTTC: parseFloat(inv.amount_ttc),
          paidAmount: parseFloat(inv.paid_amount),
          outstandingBalance: parseFloat(inv.amount_ttc) - parseFloat(inv.paid_amount),
          date: inv.date,
          dueDate: inv.date, // Assuming due date is same or calculated, backend could provide it
          status: inv.status,
          items: [], // Detail items if needed
          currency: 'EUR' // Default for now
        }));
      }
    }),
    payments: useQuery({
      queryKey: ['payments'],
      queryFn: async () => {
        const res = await apiClient.get(ENDPOINTS.PAYMENTS);
        return res.data.map((p: any) => ({
          id: p.id.toString(),
          invoiceId: p.invoice,
          amount: parseFloat(p.amount),
          date: p.date,
          method: p.method
        }));
      }
    }),
    incidents: useQuery({
      queryKey: ['incidents'],
      queryFn: async () => {
        const res = await apiClient.get(ENDPOINTS.INCIDENTS);
        return res.data.map((i: any) => ({
          id: i.id.toString(),
          type: i.type,
          description: i.description,
          date: i.date,
          relatedEntityId: i.related_entity_id, // Flexible mapping
          resolved: i.resolved,
          driverId: i.driver,
          vehicleId: i.vehicle,
          // Add resolved details if needed
        }));
      }
    }),
    complaints: useQuery({
      queryKey: ['complaints'],
      queryFn: async () => {
        const res = await apiClient.get(ENDPOINTS.COMPLAINTS);
        return res.data.map((c: any) => ({
          id: c.id.toString(),
          clientId: c.client,
          description: c.description,
          date: c.date,
          status: c.status,
          priority: c.priority,
          relatedItems: c.related_items.map((ri: any) => ({
            type: ri.type,
            entityId: ri.entity_id,
            description: ri.description
          })),
        }));
      }
    }),
    serviceTypes: useQuery({
      queryKey: ['serviceTypes'],
      queryFn: async () => {
        const res = await apiClient.get(ENDPOINTS.SERVICE_TYPES);
        return res.data.map((s: any) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          category: s.category,
          basePrice: parseFloat(s.basePrice || s.base_price || 0),
          pricePerKm: (s.pricePerKm || s.price_per_km) ? parseFloat(s.pricePerKm || s.price_per_km) : undefined,
          estimatedDeliveryTime: s.estimatedDeliveryTime || s.estimated_delivery_time || '',
          isActive: s.isActive !== undefined ? s.isActive : s.is_active,
          requirements: s.requirements || [],
          pricingModel: s.pricingModel || s.pricing_model,
          additionalFees: (s.additionalFees || s.additional_fees) ? parseFloat(s.additionalFees || s.additional_fees) : 0,
          allowedPackageSizes: s.allowedPackageSizes || s.allowed_package_sizes || [],
          driverNotes: s.driverNotes || s.driver_notes
        }));
      }
    }),
    pricing: useQuery({
      queryKey: ['pricing'],
      queryFn: async () => {
        const res = await apiClient.get(ENDPOINTS.PRICING_RULES);
        return res.data.map((p: any) => ({
          id: p.id,
          serviceTypeId: p.serviceTypeId,
          destinationId: p.destinationId,
          basePrice: parseFloat(p.basePrice || p.base_price || 0),
          pricePerKm: (p.pricePerKm || p.price_per_km) ? parseFloat(p.pricePerKm || p.price_per_km) : undefined,
          isActive: p.isActive !== undefined ? p.isActive : p.is_active
        }));
      }
    }),
    destinationRecords: useQuery({
      queryKey: ['destinationRecords'],
      queryFn: async () => {
        const res = await apiClient.get(ENDPOINTS.DESTINATIONS);
        return res.data.map((d: any) => ({
          id: d.id,
          name: d.name,
          country: d.country,
          city: d.city,
          deliveryZone: d.deliveryZone || d.delivery_zone,
          distanceKm: d.distanceKm || d.distance_km || 0,
          type: d.type,
          destinationType: d.destinationType || d.destination_type || 'Domestic',
          status: (d.isActive !== undefined ? d.isActive : d.is_active) ? 'Active' : 'Inactive',
          isActive: d.isActive !== undefined ? d.isActive : d.is_active,
          activeDeliveries: 0,
          packagesCapacity: 1000,
          availableSpace: 1000,
          contact: d.contact || '',
          serviceArea: d.serviceArea || d.service_area || '',
          linkedRoutes: d.linkedRoutes || d.linked_routes || [],
          drivers: d.drivers || []
        }));
      }
    }),
  };

  const isLoading = Object.values(queries).some(q => q.isLoading);
  const isClientsLoading = queries.clients.isLoading;

  const refetchClients = async () => {
    await queries.clients.refetch();
  };

  const getItems = <T extends Entity>(entityType: EntityType): T[] => {
    const query = queries[entityType as keyof typeof queries];

    // Log errors and empty states to help debugging
    if (query?.isError) {
      console.error(`DataContext: Error fetching ${entityType}:`, query.error);
    }

    const data = (query?.data || []) as T[];
    if (data.length === 0 && !query?.isLoading) {
      console.warn(`DataContext: ${entityType} list is empty.`);
    }

    return data;
  };

  const addItem = async <T extends Entity>(entityType: EntityType, item: Omit<T, 'id'>): Promise<boolean> => {
    try {
      const generateUsername = (name: string) => {
        return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9@.+_-]/g, '') + '_' + Math.floor(Math.random() * 1000);
      };

      if (entityType === 'clients') {
        const clientItem = item as any;
        // Step 1: Register a new user with role='client'
        const userPayload = {
          username: generateUsername(clientItem.name),
          first_name: clientItem.name,
          email: clientItem.email,
          phone: clientItem.phone,
          address: clientItem.address,
          password: 'password123',
          role: 'client'
        };
        const userRes = await apiClient.post(ENDPOINTS.REGISTER, userPayload);
        const userId = userRes.data.id;

        // Step 2: Create the Client profile linked to the new user
        if (userId) {
          const clientPayload = {
            user: userId,
            client_type: clientItem.clientType || 'Individual',
            company_name: clientItem.companyName || null,
            tax_id: clientItem.taxId || null,
            website: clientItem.website || null
          };
          await apiClient.post(ENDPOINTS.CLIENTS, clientPayload);
        }
        await queries['clients'].refetch();

      } else if (entityType === 'drivers') {
        const driverItem = item as any;
        const userPayload = {
          username: generateUsername(driverItem.name),
          first_name: driverItem.name,
          password: 'password123',
          role: 'driver',
          phone: driverItem.phone
        };

        const userRes = await apiClient.post(ENDPOINTS.REGISTER, userPayload);
        const userId = userRes.data.id;

        if (userId) {
          const driverPayload = {
            user: userId,
            license_number: driverItem.licenseNumber,
            status: driverItem.status
          };
          await apiClient.post(ENDPOINTS.DRIVERS, driverPayload);
          await queries['drivers'].refetch();
        }

      } else if (entityType === 'shipments') {
        const shipmentItem = item as any;
        // Find the client to get the userId (User ID, not Client model ID)
        const clients = queries.clients.data || [];
        const selectedClient = clients.find((c: any) => c.id === shipmentItem.clientId);
        const userId = selectedClient?.userId || shipmentItem.userId;
        
        if (!userId) {
          throw new Error('Client user ID not found. Please select a valid client.');
        }
        
        const payload = {
          client: userId, // Use User ID, not Client model ID
          destination: shipmentItem.destinationId,
          weight: shipmentItem.weight,
          volume: shipmentItem.volume,
          price: shipmentItem.price,
          status: shipmentItem.status || 'Pending',
          estimatedDelivery: shipmentItem.estimatedDelivery || null,
        };
        await apiClient.post(ENDPOINTS.SHIPMENTS, payload);
        await queries['shipments'].refetch();

      } else if (entityType === 'destinations' || entityType === 'destinationRecords') {
        const destItem = item as any;
        const payload = {
          name: destItem.name,
          country: destItem.country,
          city: destItem.city,
          deliveryZone: destItem.deliveryZone,
          distanceKm: destItem.distanceKm,
          type: destItem.type,
          destinationType: destItem.destinationType || 'Domestic',
          isActive: destItem.status === 'Active'
        };
        await apiClient.post(ENDPOINTS.DESTINATIONS, payload);
        await queries['destinations'].refetch();
        await queries['destinationRecords'].refetch();

      } else if (entityType === 'vehicles') {
        const vehicleItem = item as any;
        const payload = {
          plate: vehicleItem.plate,
          model: vehicleItem.model,
          capacity_kg: vehicleItem.capacityKg,
          status: vehicleItem.status
        };
        await apiClient.post(ENDPOINTS.VEHICLES, payload);
        await queries['vehicles'].refetch();

      } else if (entityType === 'routes') {
        const routeItem = item as any;
        const payload = {
          driver: routeItem.driverId,
          vehicle: routeItem.vehicleId,
          shipments: routeItem.shipmentIds,
          date: routeItem.date,
          status: routeItem.status || 'Planned'
        };
        await apiClient.post(ENDPOINTS.ROUTES, payload);
        await queries['routes'].refetch();
        await queries['shipments'].refetch();

      } else if (entityType === 'payments') {
        const paymentItem = item as any;
        const payload = {
          invoice: paymentItem.invoiceId,
          amount: paymentItem.amount,
          date: paymentItem.date || new Date().toISOString().split('T')[0],
          method: paymentItem.method || 'Bank Transfer'
        };
        await apiClient.post(ENDPOINTS.PAYMENTS, payload);
        await queries['payments'].refetch();
        await queries['invoices'].refetch();

      } else if (entityType === 'incidents') {
        const incItem = item as any;
        const formData = new FormData();
        formData.append('type', incItem.type);
        formData.append('description', incItem.description);
        formData.append('date', incItem.date);
        formData.append('resolved', String(incItem.resolved || false));
        if (incItem.relatedEntityId) formData.append('related_entity_id', incItem.relatedEntityId);
        if (incItem.driverId) formData.append('driver', incItem.driverId);
        if (incItem.vehicleId) formData.append('vehicle', incItem.vehicleId);

        if (incItem.photoFile) {
          formData.append('photo', incItem.photoFile);
        }

        await apiClient.post(ENDPOINTS.INCIDENTS, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        await queries['incidents'].refetch();

      } else if (entityType === 'complaints') {
        const compItem = item as any;
        // Find the client to get the userId (User ID, not Client model ID)
        const clients = queries.clients.data || [];
        const selectedClient = clients.find((c: any) => c.id === compItem.clientId);
        const userId = selectedClient?.userId || compItem.userId;
        
        if (!userId) {
          throw new Error('Client user ID not found. Please select a valid client.');
        }
        
        const payload = {
          client: userId, // Use User ID, not Client model ID
          description: compItem.description,
          date: compItem.date,
          status: compItem.status,
          priority: compItem.priority,
          related_items_data: compItem.relatedItems.map((ri: any) => ({
            type: ri.type,
            entity_id: ri.entityId,
            description: ri.description
          }))
        };
        await apiClient.post(ENDPOINTS.COMPLAINTS, payload);
        await queries['complaints'].refetch();

      } else if (entityType === 'pricing') {
        const pricingItem = item as any;
        const payload = {
          serviceTypeId: pricingItem.serviceTypeId,
          destinationId: pricingItem.destinationId,
          basePrice: pricingItem.basePrice,
          pricePerKm: pricingItem.pricePerKm,
          isActive: pricingItem.isActive
        };
        await apiClient.post(ENDPOINTS.PRICING_RULES, payload);
        await queries['pricing'].refetch();

      } else if (entityType === 'serviceTypes') {
        const serviceItem = item as any;
        const payload = {
          name: serviceItem.name,
          description: serviceItem.description,
          category: serviceItem.category,
          basePrice: Number(serviceItem.basePrice) || 0,
          pricePerKm: serviceItem.pricePerKm ? Number(serviceItem.pricePerKm) : undefined,
          estimatedDeliveryTime: serviceItem.estimatedDeliveryTime,
          isActive: serviceItem.isActive,
          requirements: serviceItem.requirements,
          pricingModel: serviceItem.pricingModel,
          additionalFees: Number(serviceItem.additionalFees) || 0,
          allowedPackageSizes: serviceItem.allowedPackageSizes,
          driverNotes: serviceItem.driverNotes
        };
        await apiClient.post(ENDPOINTS.SERVICE_TYPES, payload);
        await queries['serviceTypes'].refetch();

      } else {
        const endpoint = getEndpointForEntity(entityType);
        if (endpoint) {
          await apiClient.post(endpoint, item);
          await queries[entityType as keyof typeof queries].refetch();
        }
      }

      // Skip generic success toast for shipments - handled in Shipments.tsx
      if (entityType !== 'shipments') {
        addToast('success', `Successfully created ${entityType.slice(0, -1)}`);
      }

      // Log success
      auditLog.log(`Created ${entityType}`, 'info', null, {
        resource_type: entityType,
        item_data: item
      });

      return true;

    } catch (e: any) {
      console.error("Add item failed", e);
      if (e.response && (e.response.status === 401 || e.response.status === 403)) {
        return;
      }

      if (e.response) {
        console.error("Server Response Error Data:", e.response.data);
        const msg = e.response.data.detail || e.response.data.message || JSON.stringify(e.response.data);
        addToast('error', `Error adding item: ${msg}`);
      } else {
        addToast('error', `Error adding item: ${e.message}`);
      }
      return false;
    }
  };

  const updateItem = async <T extends Entity>(entityType: EntityType, item: T) => {
    try {
      const endpoint = getEndpointForEntity(entityType);
      if (endpoint) {
        let payload: any = item;

        if (entityType === 'drivers') {
          const driverItem = item as any;
          payload = {
            ...driverItem,
            license_number: driverItem.licenseNumber,
          };
        } else if (entityType === 'vehicles') {
          const vehicleItem = item as any;
          payload = {
            ...vehicleItem,
            capacity_kg: vehicleItem.capacityKg
          };
        } else if (entityType === 'destinations' || entityType === 'destinationRecords') {
          const destItem = item as any;
          payload = {
            name: destItem.name,
            country: destItem.country,
            city: destItem.city,
            deliveryZone: destItem.deliveryZone,
            distanceKm: destItem.distanceKm,
            type: destItem.type,
            destinationType: destItem.destinationType || 'Domestic',
            isActive: destItem.status === 'Active' || destItem.isActive
          };
        } else if (entityType === 'shipments') {
          const shipmentItem = item as any;
          // Find the client to get the userId (User ID, not Client model ID)
          const clients = queries.clients.data || [];
          const selectedClient = clients.find((c: any) => c.id === shipmentItem.clientId);
          const userId = selectedClient?.userId || shipmentItem.userId;
          
          if (!userId) {
            throw new Error('Client user ID not found. Please select a valid client.');
          }
          
          payload = {
            id: shipmentItem.id,
            client: userId, // Use User ID, not Client model ID
            destination: shipmentItem.destinationId,
            weight: shipmentItem.weight,
            volume: shipmentItem.volume,
            price: shipmentItem.price,
            status: shipmentItem.status,
            estimatedDelivery: shipmentItem.estimatedDelivery || null,
            currency: shipmentItem.currency
          };
        } else if (entityType === 'complaints') {
          const compItem = item as any;
          // Find the client to get the userId (User ID, not Client model ID)
          const clients = queries.clients.data || [];
          const selectedClient = clients.find((c: any) => c.id === compItem.clientId);
          const userId = selectedClient?.userId || compItem.userId;
          
          if (!userId) {
            throw new Error('Client user ID not found. Please select a valid client.');
          }
          
          payload = {
            id: compItem.id,
            client: userId, // Use User ID, not Client model ID
            description: compItem.description,
            date: compItem.date,
            status: compItem.status,
            priority: compItem.priority
          };
        } else if (entityType === 'incidents') {
          const incItem = item as any;
          payload = {
            id: incItem.id,
            type: incItem.type,
            description: incItem.description,
            date: incItem.date,
            resolved: incItem.resolved,
            related_entity_id: incItem.relatedEntityId,
            driver: incItem.driverId,
            vehicle: incItem.vehicleId
          };
        } else if (entityType === 'routes') {
          const routeItem = item as any;
          payload = {
            status: routeItem.status,
            actual_distance_km: routeItem.actualDistance,
            actual_duration_hours: routeItem.actualDuration,
            fuel_consumed_liters: routeItem.fuelConsumed
          };
        } else if (entityType === 'pricing') {
          const pricingItem = item as any;
          payload = {
            id: pricingItem.id,
            serviceTypeId: pricingItem.serviceTypeId,
            destinationId: pricingItem.destinationId,
            basePrice: pricingItem.basePrice,
            pricePerKm: pricingItem.pricePerKm,
            isActive: pricingItem.isActive
          };
        } else if (entityType === 'serviceTypes') {
          const serviceItem = item as any;
          payload = {
            name: serviceItem.name,
            description: serviceItem.description,
            category: serviceItem.category,
            basePrice: Number(serviceItem.basePrice) || 0,
            pricePerKm: serviceItem.pricePerKm ? Number(serviceItem.pricePerKm) : undefined,
            estimatedDeliveryTime: serviceItem.estimatedDeliveryTime,
            isActive: serviceItem.isActive !== undefined ? serviceItem.isActive : true,
            requirements: serviceItem.requirements,
            pricingModel: serviceItem.pricingModel,
            additionalFees: Number(serviceItem.additionalFees) || 0,
            allowedPackageSizes: serviceItem.allowedPackageSizes,
            driverNotes: serviceItem.driverNotes
          };
        }

        await apiClient.patch(`${endpoint}${item.id}/`, payload);
        await queries[entityType as keyof typeof queries].refetch();

        addToast('success', `Successfully updated ${entityType.slice(0, -1)}`);

        // Log success
        auditLog.log(`Updated ${entityType}`, 'info', null, {
          resource_type: entityType,
          resource_id: item.id,
          updated_fields: Object.keys(payload)
        });
      }
    } catch (e: any) {
      console.error("Update item failed", e);
      if (e.response) {
        addToast('error', `Error updating item: ${JSON.stringify(e.response.data)}`);
      } else {
        addToast('error', `Error updating item: ${e.message}`);
      }
    }
  };

  const deleteItem = async (entityType: EntityType, id: string) => {
    try {
      const endpoint = getEndpointForEntity(entityType);
      if (endpoint) {
        await apiClient.delete(`${endpoint}${id}/`);
        await queries[entityType as keyof typeof queries].refetch();
        addToast('success', `Successfully deleted ${entityType.slice(0, -1)}`);

        // Log success
        auditLog.log(`Deleted ${entityType}`, 'warning', null, {
          resource_type: entityType,
          resource_id: id
        });
      }
    } catch (e) {
      console.error("Delete item failed", e);
    }
  };

  const getEndpointForEntity = (type: EntityType) => {
    switch (type) {
      case 'clients': return ENDPOINTS.CLIENTS;
      case 'drivers': return ENDPOINTS.DRIVERS;
      case 'vehicles': return ENDPOINTS.VEHICLES;
      case 'shipments': return ENDPOINTS.SHIPMENTS;
      case 'destinations': return ENDPOINTS.DESTINATIONS;
      case 'destinationRecords': return ENDPOINTS.DESTINATIONS;
      case 'serviceTypes': return ENDPOINTS.SERVICE_TYPES;
      case 'pricing': return ENDPOINTS.PRICING_RULES;
      case 'routes': return ENDPOINTS.ROUTES;
      case 'invoices': return ENDPOINTS.INVOICES;
      case 'payments': return ENDPOINTS.PAYMENTS;
      case 'incidents': return ENDPOINTS.INCIDENTS;
      case 'complaints': return ENDPOINTS.COMPLAINTS;
      default: return '';
    }
  }

  return (
    <DataContext.Provider value={{ getItems, addItem, updateItem, deleteItem, isLoading, isClientsLoading, refetchClients }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
