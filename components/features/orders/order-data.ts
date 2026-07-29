import { ORDER_STATUSES, type DeliveryMethod, type OrderStatus } from '@/config/domain';

export type { DeliveryMethod, OrderStatus } from '@/config/domain';
export type TimelineStatus =
  | 'Order Placed'
  | 'Farmer Confirmed'
  | 'Preparing Order'
  | 'Ready for Pickup'
  | 'Transport Assigned'
  | 'Picked Up'
  | 'In Transit'
  | 'Delivered'
  | 'Payment Completed';

export interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: string;
  total: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  total: string;
  deliveryMethod: DeliveryMethod;
  farmer: {
    name: string;
    phone: string;
    location: string;
  };
  location: string;
  items: OrderItem[];
  eta: string;
  notes: string;
  paymentSummary: {
    subtotal: string;
    delivery: string;
    discount: string;
    total: string;
  };
  pickupCode?: string;
  pickupDate?: string;
  pickupTime?: string;
  proofOfDelivery?: string;
  driver?: {
    name: string;
    phone: string;
    vehicleNumber: string;
    vehicleType: string;
  };
  transporter?: {
    name: string;
    phone: string;
  };
  currentTimelineStatus: TimelineStatus;
}

export const ORDER_STATUS_OPTIONS = ['All', ...ORDER_STATUSES] as const;

export const TIMELINE_STATUSES: TimelineStatus[] = [
  'Order Placed',
  'Farmer Confirmed',
  'Preparing Order',
  'Ready for Pickup',
  'Transport Assigned',
  'Picked Up',
  'In Transit',
  'Delivered',
  'Payment Completed',
];

export const mockOrders: OrderRecord[] = [
  {
    id: 'ag-48291',
    orderNumber: 'AG-48291',
    createdAt: '2026-07-25',
    status: 'Pending',
    total: '$9.70',
    deliveryMethod: 'Farmer Delivery',
    farmer: { name: 'Green Valley Farms', phone: '+233 24 111 2222', location: 'Tamale' },
    location: 'Amina Yusuf, 14 Kukuo Road, Tamale',
    items: [
      { name: 'Organic Tomatoes', quantity: 2, unitPrice: '$3.20', total: '$6.40' },
      { name: 'Fresh Maize', quantity: 1, unitPrice: '$1.80', total: '$1.80' },
    ],
    eta: 'Today, 2:30 PM',
    notes: 'Leave package with the reception desk if the buyer is unavailable.',
    paymentSummary: { subtotal: '$8.20', delivery: '$2.50', discount: '-$1.00', total: '$9.70' },
    driver: { name: 'Ibrahim Musa', phone: '+233 20 333 4444', vehicleNumber: 'GH-203-11', vehicleType: 'Pickup Truck' },
    currentTimelineStatus: 'Preparing Order',
  },
  {
    id: 'ag-48302',
    orderNumber: 'AG-48302',
    createdAt: '2026-07-24',
    status: 'In Transit',
    total: '$14.80',
    deliveryMethod: 'Platform Transporter',
    farmer: { name: 'North Ridge Co-op', phone: '+233 24 555 6666', location: 'Bolgatanga' },
    location: 'Derrick Boateng, 9 Nalerigu Street, Accra',
    items: [
      { name: 'Cocoa Beans', quantity: 3, unitPrice: '$4.20', total: '$12.60' },
      { name: 'Groundnuts', quantity: 1, unitPrice: '$2.20', total: '$2.20' },
    ],
    eta: 'Tomorrow, 8:00 AM',
    notes: 'Please keep the produce cool during transit.',
    paymentSummary: { subtotal: '$14.80', delivery: '$4.00', discount: '$0.00', total: '$18.80' },
    driver: { name: 'Selorm Tetteh', phone: '+233 20 777 8888', vehicleNumber: 'GH-401-09', vehicleType: 'Refrigerated Van' },
    transporter: { name: 'RouteLink Logistics', phone: '+233 27 123 4567' },
    currentTimelineStatus: 'In Transit',
  },
  {
    id: 'ag-48315',
    orderNumber: 'AG-48315',
    createdAt: '2026-07-23',
    status: 'Preparing',
    total: '$5.90',
    deliveryMethod: 'Farmer Delivery',
    farmer: { name: 'Sunshine Grove', phone: '+233 24 444 3333', location: 'Wa' },
    location: 'Ruth Adom, 22 Abeka Lane, Accra',
    items: [{ name: 'Pineapples', quantity: 2, unitPrice: '$2.95', total: '$5.90' }],
    eta: 'Today, 6:15 PM',
    notes: 'Buyer prefers early evening handoff.',
    paymentSummary: { subtotal: '$5.90', delivery: '$1.50', discount: '$0.00', total: '$7.40' },
    driver: { name: 'Kwame Boateng', phone: '+233 20 111 2222', vehicleNumber: 'GH-772-58', vehicleType: 'Motorbike' },
    currentTimelineStatus: 'Ready for Pickup',
  },
  {
    id: 'ag-48328',
    orderNumber: 'AG-48328',
    createdAt: '2026-07-20',
    status: 'Delivered',
    total: '$11.20',
    deliveryMethod: 'Buyer Pickup',
    farmer: { name: 'Mango Bay Collective', phone: '+233 24 989 8989', location: 'Kumasi' },
    location: 'Mona Quaye, 8 Jubilee Road, Kumasi',
    items: [{ name: 'Fresh Mangoes', quantity: 4, unitPrice: '$2.80', total: '$11.20' }],
    eta: 'Delivered at 12:40 PM',
    notes: 'Buyer picked up from the agreed collection point.',
    paymentSummary: { subtotal: '$11.20', delivery: '$0.00', discount: '$0.00', total: '$11.20' },
    pickupCode: 'MNG-482',
    pickupDate: '2026-07-20',
    pickupTime: '12:30 PM',
    proofOfDelivery: 'Verified by buyer',
    currentTimelineStatus: 'Delivered',
  },
  {
    id: 'ag-48341',
    orderNumber: 'AG-48341',
    createdAt: '2026-07-18',
    status: 'Cancelled',
    total: '$4.40',
    deliveryMethod: 'Farmer Delivery',
    farmer: { name: 'Hillside Produce', phone: '+233 24 810 0101', location: 'Sunyani' },
    location: 'Abena Yeboah, 18 Yaw Street, Sunyani',
    items: [{ name: 'Garden Eggs', quantity: 2, unitPrice: '$2.20', total: '$4.40' }],
    eta: 'Cancelled',
    notes: 'Buyer requested an alternate pickup time and cancelled the order.',
    paymentSummary: { subtotal: '$4.40', delivery: '$1.20', discount: '$0.00', total: '$5.60' },
    currentTimelineStatus: 'Order Placed',
  },
  {
    id: 'ag-48356',
    orderNumber: 'AG-48356',
    createdAt: '2026-07-16',
    status: 'Pending',
    total: '$16.50',
    deliveryMethod: 'Platform Transporter',
    farmer: { name: 'Riverbank Farms', phone: '+233 24 202 3030', location: 'Ho' },
    location: 'Kwesi Armah, 11 Market Road, Ho',
    items: [
      { name: 'Cassava', quantity: 2, unitPrice: '$5.50', total: '$11.00' },
      { name: 'Plantain', quantity: 1, unitPrice: '$5.50', total: '$5.50' },
    ],
    eta: 'Today, 4:45 PM',
    notes: 'The buyer requested a silent dropoff at the gate.',
    paymentSummary: { subtotal: '$16.50', delivery: '$3.50', discount: '-$1.00', total: '$19.00' },
    transporter: { name: 'RouteLink Logistics', phone: '+233 27 123 4567' },
    driver: { name: 'Nana Kofi', phone: '+233 20 909 2323', vehicleNumber: 'GH-551-22', vehicleType: 'Cargo Van' },
    currentTimelineStatus: 'Transport Assigned',
  },
];

export function getOrderById(orderId: string) {
  return mockOrders.find((order) => order.id === orderId) ?? null;
}

export function getStatusVariant(status: OrderStatus) {
  switch (status) {
    case 'Delivered':
      return 'success' as const;
    case 'Preparing':
      return 'warning' as const;
    case 'Cancelled':
      return 'danger' as const;
    case 'In Transit':
      return 'default' as const;
    default:
      return 'outline' as const;
  }
}

export function getTimelineIndex(status: TimelineStatus) {
  return TIMELINE_STATUSES.indexOf(status);
}
