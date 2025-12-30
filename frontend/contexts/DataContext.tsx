import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { Client, Driver, Vehicle, DestinationRate, ServiceType, DestinationRecord, PricingRule } from '../types';

interface Identifiable {
  id: string;
}

type Entity = Client | Driver | Vehicle | DestinationRate | ServiceType | DestinationRecord | PricingRule;
type EntityType =
  | 'clients'
  | 'drivers'
  | 'vehicles'
  | 'shipments'
  | 'destinations'
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
  addItem: <T extends Entity>(entityType: EntityType, item: Omit<T, 'id'>) => Promise<void>;
  updateItem: <T extends Entity>(entityType: EntityType, item: T) => Promise<void>;
  deleteItem: (entityType: EntityType, id: string) => Promise<void>;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  // Use React Query for data fetching
  const queries = {
    clients: useQuery({
      queryKey: ['clients'],
      queryFn: async () => {
        const res = await apiClient.get(ENDPOINTS.USERS);
        return res.data.map((u: any) => ({
          id: u.id.toString(),
          name: u.first_name || u.name || u.username || 'Unknown',
          email: u.email || '',
          phone: u.phone || '',
          address: u.address || '',
          balance: parseFloat(u.balance) || 0,
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
          destinationId: s.destination,
          destination: s.destination_details?.name || 'Unknown',
          weight: s.weight_kg,
          volume: s.volume_m3,
          price: parseFloat(s.price),
          status: s.status,
          dateCreated: s.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          estimatedDelivery: s.estimated_delivery?.split('T')[0] || '',
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
          // Use nested details for display if available
          driverName: r.driver_details?.user_details?.name || r.driver_details?.user_details?.username || 'Unknown',
          vehiclePlate: r.vehicle_details?.plate || 'Unknown',
          date: r.date,
          status: r.status
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
    serviceTypes: useQuery({ queryKey: ['serviceTypes'], queryFn: () => apiClient.get(ENDPOINTS.SERVICE_TYPES).then(res => res.data) }),
    pricing: useQuery({ queryKey: ['pricing'], queryFn: () => [] }), // Pricing API not implemented yet
    destinationRecords: useQuery({
      queryKey: ['destinationRecords'],
      queryFn: async () => {
        const res = await apiClient.get(ENDPOINTS.DESTINATIONS);
        // Map backend snake_case to frontend camelCase
        return res.data.map((d: any) => ({
          id: d.id,
          name: d.name,
          country: d.country,
          city: d.city,
          deliveryZone: d.delivery_zone,
          distanceKm: d.distance_km,
          type: d.type,
          status: d.is_active ? 'Active' : 'Inactive',
          // Default values for fields not in backend yet but required by UI
          activeDeliveries: 0,
          packagesCapacity: 1000,
          availableSpace: 1000,
          contact: '',
          serviceArea: '',
          linkedRoutes: [],
          drivers: []
        }));
      }
    }),
  };

  const isLoading = Object.values(queries).some(q => q.isLoading);

  const getItems = <T extends Entity>(entityType: EntityType): T[] => {
    const query = queries[entityType as keyof typeof queries];
    if (entityType === 'clients') {
      console.log('DataContext: getItems(clients) query state:', {
        isLoading: query.isLoading,
        error: query.error,
        data: query.data
      });
    }
    return (query?.data || []) as T[];
  };

  const addItem = async <T extends Entity>(entityType: EntityType, item: Omit<T, 'id'>) => {
    try {
      const generateUsername = (name: string) => {
        return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9@.+_-]/g, '') + '_' + Math.floor(Math.random() * 1000);
      };

      if (entityType === 'clients') {
        const payload = {
          ...item,
          username: generateUsername((item as any).name),
          first_name: (item as any).name,
          password: 'password123',
          role: 'client'
        };
        await apiClient.post(ENDPOINTS.REGISTER, payload);
        queries['clients'].refetch();

      } else if (entityType === 'drivers') {
        // Driver creation: 1. Create User, 2. Create Driver Profile
        const driverItem = item as any;
        const userPayload = {
          username: generateUsername(driverItem.name),
          first_name: driverItem.name,
          password: 'password123',
          role: 'driver',
          phone: driverItem.phone
        };

        // 1. Create User
        const userRes = await apiClient.post(ENDPOINTS.REGISTER, userPayload);
        const userId = userRes.data.id;

        if (userId) {
          // 2. Create Driver linked to User
          const driverPayload = {
            user: userId,
            license_number: driverItem.licenseNumber,
            status: driverItem.status
          };
          await apiClient.post(ENDPOINTS.DRIVERS, driverPayload);
          queries['drivers'].refetch();
        }

      } else if (entityType === 'shipments') {
        const shipmentItem = item as any;
        const payload = {
          client: shipmentItem.clientId,
          destination: shipmentItem.destinationId, // Use destinationId from form
          weight_kg: shipmentItem.weight,
          volume_m3: shipmentItem.volume,
          price: shipmentItem.price,
          status: shipmentItem.status || 'Pending',
          estimated_delivery: shipmentItem.estimatedDelivery || null,
        };
        await apiClient.post(ENDPOINTS.SHIPMENTS, payload);
        queries['shipments'].refetch();

      } else if (entityType === 'destinations' || entityType === 'destinationRecords') {
        const destItem = item as any;
        const payload = {
          name: destItem.name,
          country: destItem.country,
          city: destItem.city,
          delivery_zone: destItem.deliveryZone,
          distance_km: destItem.distanceKm,
          type: destItem.type,
          is_active: destItem.status === 'Active'
        };
        await apiClient.post(ENDPOINTS.DESTINATIONS, payload);
        // Refetch both keys just in case
        queries['destinations'].refetch();
        queries['destinationRecords'].refetch();

      } else if (entityType === 'vehicles') {
        // Map frontend camelCase to backend snake_case
        const vehicleItem = item as any;
        const payload = {
          plate: vehicleItem.plate,
          model: vehicleItem.model,
          capacity_kg: vehicleItem.capacityKg, // Mapping here
          status: vehicleItem.status
        };
        await apiClient.post(ENDPOINTS.VEHICLES, payload);
        queries['vehicles'].refetch();

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
        queries['routes'].refetch();
        // Shipments might be updated (e.g. status locked), so refetch them too
        queries['shipments'].refetch();

      } else if (entityType === 'payments') {
        const paymentItem = item as any;
        const payload = {
          invoice: paymentItem.invoiceId,
          amount: paymentItem.amount,
          date: paymentItem.date || new Date().toISOString().split('T')[0],
          method: paymentItem.method || 'Bank Transfer'
        };
        await apiClient.post(ENDPOINTS.PAYMENTS, payload);
        queries['payments'].refetch();
        queries['invoices'].refetch(); // Update invoice status/balance

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

        // Check for file in a special property 'photoFile' passed from component
        if (incItem.photoFile) {
          formData.append('photo', incItem.photoFile);
        }

        await apiClient.post(ENDPOINTS.INCIDENTS, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        queries['incidents'].refetch();

      } else if (entityType === 'complaints') {
        const compItem = item as any;
        const payload = {
          client: compItem.clientId,
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
        queries['complaints'].refetch();

      } else {
        const endpoint = getEndpointForEntity(entityType);
        if (endpoint) {
          await apiClient.post(endpoint, item);
          queries[entityType as keyof typeof queries].refetch();
        }
      }
    } catch (e: any) {
      console.error("Add item failed", e);
      // If 401/403, the interceptor handles the redirect/logout. don't alert.
      if (e.response && (e.response.status === 401 || e.response.status === 403)) {
        return;
      }

      if (e.response) {
        console.error("Server Response Error Data:", e.response.data);
        console.error("Server Response Status:", e.response.status);
        // Try to show a more user-friendly message if available
        const msg = e.response.data.detail || e.response.data.message || JSON.stringify(e.response.data);
        alert(`Error adding item: ${msg}`);
      } else {
        alert(`Error adding item: ${e.message}`);
      }
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
            license_number: driverItem.licenseNumber, // Map back
            // name and phone are passed as-is and handled by backend serializer custom update logic
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
            delivery_zone: destItem.deliveryZone,
            distance_km: destItem.distanceKm,
            type: destItem.type,
            is_active: destItem.status === 'Active'
          };
        } else if (entityType === 'shipments') {
          const shipmentItem = item as any;
          payload = {
            id: shipmentItem.id,
            client: shipmentItem.clientId,
            destination: shipmentItem.destinationId,
            weight_kg: shipmentItem.weight,
            volume_m3: shipmentItem.volume,
            price: shipmentItem.price,
            status: shipmentItem.status,
            estimated_delivery: shipmentItem.estimatedDelivery ? shipmentItem.estimatedDelivery.split('T')[0] : null,
            currency: shipmentItem.currency
          };
        } else if (entityType === 'routes') {
          const routeItem = item as any;
          payload = {
            status: routeItem.status,
            actual_distance_km: routeItem.actualDistance,
            actual_duration_hours: routeItem.actualDuration,
            fuel_consumed_liters: routeItem.fuelConsumed
          };
        }


        await apiClient.put(`${endpoint}${item.id}/`, payload);
        queries[entityType as keyof typeof queries].refetch();
      }
    } catch (e: any) {
      console.error("Update item failed", e);
      if (e.response) {
        alert(`Error updating item: ${JSON.stringify(e.response.data)}`);
      } else {
        alert(`Error updating item: ${e.message}`);
      }
    }
  };

  const deleteItem = async (entityType: EntityType, id: string) => {
    try {
      const endpoint = getEndpointForEntity(entityType);
      if (endpoint) {
        await apiClient.delete(`${endpoint}${id}/`);
        queries[entityType as keyof typeof queries].refetch();
      }
    } catch (e) {
      console.error("Delete item failed", e);
    }
  };

  const getEndpointForEntity = (type: EntityType) => {
    switch (type) {
      case 'clients': return ENDPOINTS.USERS; // Note: Filtering by role might be needed
      case 'drivers': return ENDPOINTS.DRIVERS;
      case 'vehicles': return ENDPOINTS.VEHICLES;
      case 'shipments': return ENDPOINTS.SHIPMENTS;
      case 'destinations': return ENDPOINTS.DESTINATIONS;
      case 'destinationRecords': return ENDPOINTS.DESTINATIONS;
      case 'destinations': return ENDPOINTS.DESTINATIONS;
      case 'destinationRecords': return ENDPOINTS.DESTINATIONS;
      case 'serviceTypes': return ENDPOINTS.SERVICE_TYPES;
      case 'routes': return ENDPOINTS.ROUTES;
      case 'invoices': return ENDPOINTS.INVOICES;
      case 'payments': return ENDPOINTS.PAYMENTS;
      case 'incidents': return ENDPOINTS.INCIDENTS;
      case 'complaints': return ENDPOINTS.COMPLAINTS;
      // ... others
      default: return '';
    }
  }

  return (
    <DataContext.Provider value={{ getItems, addItem, updateItem, deleteItem, isLoading }}>
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
