// ─────────────────────────────────────────────
// PRODUCT TYPES
// ─────────────────────────────────────────────
export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  color?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  colorHex?: string;
  price: number;
  comparePrice?: number;
  stock: number;
  isActive: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  parentId?: string;
}

export type Gender = "MEN" | "WOMEN" | "UNISEX" | "KIDS";
export type Terrain = "ROAD" | "TRAIL" | "TRACK" | "TREADMILL" | "MULTI";
export type CushionLevel = "MINIMAL" | "LOW" | "MEDIUM" | "HIGH" | "MAX";
export type Stability = "NEUTRAL" | "STABILITY" | "MOTION_CONTROL";

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description?: string;
  longDescription?: string;
  brand?: Brand;
  gender: Gender;
  terrain: Terrain;
  cushionLevel: CushionLevel;
  stability: Stability;
  drop?: number;
  weight?: number;
  features: string[];
  materials?: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  avgRating: number;
  reviewCount: number;
  categories: (Category | { category: Category })[];
  variants: ProductVariant[];
  images: ProductImage[];
  createdAt: string;
}

export interface ProductFilters {
  gender?: Gender[];
  terrain?: Terrain[];
  brand?: string[];
  size?: string[];
  priceMin?: number;
  priceMax?: number;
  cushionLevel?: CushionLevel[];
  stability?: Stability[];
  dropMin?: number;
  dropMax?: number;
  weightMin?: number;
  weightMax?: number;
  color?: string[];
  category?: string[];
  inStock?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
}

export type SortOption =
  | "best-sellers"
  | "new-arrivals"
  | "price-asc"
  | "price-desc"
  | "top-rated"
  | "name-asc";

// ─────────────────────────────────────────────
// CART TYPES
// ─────────────────────────────────────────────
export interface CartItem {
  id: string;
  product: Pick<Product, "id" | "name" | "slug" | "images" | "brand">;
  variant: ProductVariant;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

// ─────────────────────────────────────────────
// ORDER TYPES
// ─────────────────────────────────────────────
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  items: OrderItem[];
  createdAt: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  size: string;
  color: string;
  imageUrl?: string;
  price: number;
  quantity: number;
  total: number;
}

// ─────────────────────────────────────────────
// ADDRESS
// ─────────────────────────────────────────────
export interface Address {
  id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

// ─────────────────────────────────────────────
// USER
// ─────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  savedShoeSize?: string;
  savedWidth?: string;
  role: "CUSTOMER" | "ADMIN";
}

// ─────────────────────────────────────────────
// REVIEW
// ─────────────────────────────────────────────
export interface Review {
  id: string;
  rating: number;
  title?: string;
  body?: string;
  verified: boolean;
  helpful: number;
  runnerType?: string;
  shoeSize?: string;
  user: Pick<User, "firstName" | "lastName" | "avatarUrl">;
  createdAt: string;
}

// ─────────────────────────────────────────────
// BLOG
// ─────────────────────────────────────────────
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  imageUrl?: string;
  author: string;
  category?: string;
  tags: string[];
  publishedAt?: string;
}

// ─────────────────────────────────────────────
// SHOE FINDER
// ─────────────────────────────────────────────
export interface ShoeFinderAnswers {
  surface?: "road" | "trail" | "treadmill" | "track";
  distance?: "short" | "medium" | "long" | "ultra";
  experience?: "beginner" | "intermediate" | "advanced";
  support?: "neutral" | "stability" | "motion-control";
  goal?: "speed" | "comfort" | "marathon" | "casual";
  cushion?: "minimal" | "moderate" | "plush";
}

// ─────────────────────────────────────────────
// API RESPONSES
// ─────────────────────────────────────────────
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
