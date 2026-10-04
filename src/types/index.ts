export interface User {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: "ADMIN" | "ORGANIZER" | "STAFF" | "USER";
}

export interface Venue {
  name: string;
  address: string;
  district: string;
  googleMaps?: string | null;
}

export interface EventCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Organizer {
  id: string;
  orgName: string;
  logoUrl?: string | null;
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  total: number;
  held: number;
  sold: number;
}

export interface EventListItem {
  id: string;
  title: string;
  slug: string;
  date: string;
  startTime: string;
  bannerUrl: string | null;
  organizer: Pick<Organizer, "id" | "orgName">;
  venue: Pick<Venue, "name" | "address" | "district"> | null;
  category: Pick<EventCategory, "name" | "slug">;
}

export interface EventDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  bannerUrl: string | null;
  date: string;
  startTime: string;
  endTime: string | null;
  seatingType: "GENERAL" | "BLOCK";
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  venue: Venue | null;
  category: EventCategory;
  organizer: Organizer;
  ticketTypes: TicketType[];
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Order {
  id: string;
  userId: string;
  eventId: string;
  total: number;
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
}

export interface PurchasedEvent {
  id: string;
  title: string;
  slug: string;
  status: string;
  venue: { district: string; address: string } | null;
  tickets: { name: string; quantity: number }[];
}

export interface MyTicket {
  id: string;
  qrCode: string;
  ticketTypeId: string;
  ticketType: string;
}

export interface OrgEventListItem {
  id: string;
  slug: string;
  title: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  date: string;
  category: { name: string };
  venue: { name: string; address: string; district: string } | null;
}

export interface OrgTicketType {
  id: string;
  name: string;
  price: number;
  total: number;
  sold: number;
  scanned: number;
}

export interface OrgEventDetail {
  id: string;
  slug: string;
  title: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  date: string;
  startTime: string | null;
  endTime: string | null;
  bannerUrl: string | null;
  description: string;
  seatingType: "GENERAL" | "BLOCK";
  category: { name: string };
  venue: {
    name: string;
    address: string;
    district: string;
    googleMaps: string | null;
  } | null;
  ticketTypes: OrgTicketType[];
}

