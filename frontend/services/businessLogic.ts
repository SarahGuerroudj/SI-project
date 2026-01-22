import { Shipment, Invoice, Client, ShipmentStatus, DestinationRate, PaymentRecord } from '../types';
import { MOCK_DESTINATION_RATES } from '../constants';

/**
 * Business Logic Service
 * Implements all management rules for the logistics system
 */

// Rule 1: Customer Registration Validation
export const validateCustomerExists = (clientId: string, clients: Client[]): boolean => {
  return clients.some(c => c.id === clientId);
};

// Rule 2: Shipment Pricing Calculation (with destination rates)
export const calculateShipmentPrice = (
  destination: string,
  weight: number,
  volume: number,
  rates?: DestinationRate[]
): number => {
  const rateTable = rates || MOCK_DESTINATION_RATES;
  const destinationRate = rateTable.find(r => r.destination === destination);

  if (!destinationRate) {
    // Fallback to default rates if destination not found
    return 20 + weight * 0.5 + volume * 10;
  }

  return (
    destinationRate.baseRate +
    weight * destinationRate.weightRate +
    volume * destinationRate.volumeRate
  );
};

// Rule 3: Shipment Modification Lock
export const canModifyShipment = (shipment: Shipment): boolean => {
  return !shipment.isLocked && shipment.status === ShipmentStatus.PENDING;
};

export const lockShipmentForRoute = (shipment: Shipment, routeId: string): Shipment => {
  return {
    ...shipment,
    routeId,
    isLocked: true
  };
};

// Rule 4: Automatic Status Evolution
export const getNextShipmentStatus = (currentStatus: ShipmentStatus): ShipmentStatus | null => {
  const statusFlow: { [key in ShipmentStatus]: ShipmentStatus | null } = {
    [ShipmentStatus.PENDING]: ShipmentStatus.IN_TRANSIT,
    [ShipmentStatus.IN_TRANSIT]: ShipmentStatus.DELIVERED,
    [ShipmentStatus.DELAYED]: ShipmentStatus.IN_TRANSIT,
    [ShipmentStatus.DELIVERED]: null,
    [ShipmentStatus.CANCELLED]: null,
  };

  return statusFlow[currentStatus];
};

// Rule 5: Invoice Calculation with VAT
const VAT_RATE = 0.19; // 19% standard VAT

export const calculateInvoiceAmounts = (amountHT: number): { tva: number; amountTTC: number } => {
  const tva = amountHT * VAT_RATE;
  const amountTTC = amountHT + tva;
  return { tva, amountTTC };
};

// Rule 6: Partial Payment Handling
export const processPayment = (
  invoice: Invoice,
  paymentAmount: number
): { updatedInvoice: Invoice; payment: PaymentRecord } => {
  const newPaidAmount = invoice.paidAmount + paymentAmount;
  const newOutstandingBalance = invoice.amountTTC - newPaidAmount;

  const updatedInvoice: Invoice = {
    ...invoice,
    paidAmount: newPaidAmount,
    outstandingBalance: Math.max(0, newOutstandingBalance),
    status:
      newOutstandingBalance <= 0
        ? 'Paid'
        : newPaidAmount > 0
          ? 'Partial'
          : 'Unpaid',
  };

  const payment: PaymentRecord = {
    id: `PAY-${Date.now()}`,
    invoiceId: invoice.id,
    amount: paymentAmount,
    date: new Date().toISOString().split('T')[0],
    method: 'Transfer',
    currency: (invoice as any).currency || 'EUR',
  };

  return { updatedInvoice, payment };
};

// Rule 7: Customer Balance Update
export const updateCustomerBalance = (
  client: Client,
  outstandingAmount: number
): Client => {
  return {
    ...client,
    balance: outstandingAmount,
  };
};

// Rule 8: Invoice Deletion with Cascade
export const deleteInvoiceCascade = (
  invoice: Invoice,
  invoices: Invoice[],
  payments: PaymentRecord[],
  clients: Client[]
): {
  invoices: Invoice[];
  payments: PaymentRecord[];
  clients: Client[];
} => {
  // Remove invoice
  const updatedInvoices = invoices.filter(inv => inv.id !== invoice.id);

  // Remove related payments
  const updatedPayments = payments.filter(p => p.invoiceId !== invoice.id);

  // Update customer balance (add back the outstanding amount)
  const updatedClients = clients.map(client => {
    if (client.id === invoice.clientId) {
      return {
        ...client,
        balance: client.balance + invoice.outstandingBalance,
      };
    }
    return client;
  });

  return { invoices: updatedInvoices, payments: updatedPayments, clients: updatedClients };
};

// Complaint Item Linking
export const validateComplaintItems = (
  complaintItems: any[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!Array.isArray(complaintItems) || complaintItems.length === 0) {
    errors.push('At least one item must be linked to a complaint');
  }

  complaintItems.forEach((item, index) => {
    if (!['shipment', 'invoice', 'service'].includes(item.type)) {
      errors.push(`Item ${index + 1}: Invalid type. Must be shipment, invoice, or service`);
    }
    if (!item.entityId) {
      errors.push(`Item ${index + 1}: Entity ID is required`);
    }
  });

  return { isValid: errors.length === 0, errors };
};

// Utility: Get destination rate info
export const getDestinationRate = (
  destination: string,
  rates?: DestinationRate[]
): DestinationRate | undefined => {
  const rateTable = rates || MOCK_DESTINATION_RATES;
  return rateTable.find(r => r.destination === destination);
};

// Utility: Recalculate all invoice amounts based on shipments
export const calculateInvoiceFromShipments = (
  shipmentPrices: number[]
): { amountHT: number; tva: number; amountTTC: number } => {
  const amountHT = shipmentPrices.reduce((sum, price) => sum + price, 0);
  const { tva, amountTTC } = calculateInvoiceAmounts(amountHT);
  return { amountHT, tva, amountTTC };
};
