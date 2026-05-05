// User types
export type UserRole = 'client' | 'therapist' | 'admin';
export type SessionType = 'video' | 'audio' | 'in_person';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';
export type PaymentType = 'session' | 'wallet_topup' | 'gift_card';
export type ConversationType = 'therapy' | 'dating';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  timezone: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TherapistProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  title: string;
  avatarUrl?: string;
  bio: string;
  licenseType: string;
  licenseNumber: string;
  licenseExpiry: string;
  yearsOfExperience: number;
  education: EducationEntry[];
  languages: string[];
  sessionTypes: SessionType[];
  concerns: string[];
  therapyTypes: string[];
  sessionRate: number;
  consultationRate: number;
  currency: string;
  timezone: string;
  isApproved: boolean;
  isFeatured: boolean;
  rating: number;
  totalReviews: number;
  totalSessions: number;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  year: number;
}

export interface TherapistAvailability {
  id: string;
  therapistId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Booking {
  id: string;
  clientId: string;
  therapistId: string;
  sessionType: SessionType;
  therapyType: string;
  status: BookingStatus;
  scheduledAt: Date;
  durationMinutes: number;
  amount: number;
  currency: string;
  notes?: string;
  cancellationReason?: string;
  dailyRoomUrl?: string;
  dailyRoomName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  userId: string;
  bookingId?: string;
  giftCardId?: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  type: PaymentType;
  createdAt: Date;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  updatedAt: Date;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  amount: number;
  type: 'credit' | 'debit';
  reference: string;
  description: string;
  createdAt: Date;
}

export interface GiftCard {
  id: string;
  code: string;
  amount: number;
  currency: string;
  purchasedBy: string;
  redeemedBy?: string;
  redeemedAt?: Date;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface Review {
  id: string;
  bookingId: string;
  clientId: string;
  therapistId: string;
  rating: number;
  comment?: string;
  isVisible: boolean;
  createdAt: Date;
}

export interface DatingProfile {
  id: string;
  userId: string;
  displayName: string;
  dateOfBirth: string;
  gender: string;
  lookingFor: string[];
  bio: string;
  interests: string[];
  photos: string[];
  location: string;
  latitude?: number;
  longitude?: number;
  maxDistanceKm: number;
  minAge: number;
  maxAge: number;
  isActive: boolean;
  isVerified: boolean;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatingMatch {
  id: string;
  profile1Id: string;
  profile2Id: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  participant1Id: string;
  participant2Id: string;
  matchId?: string;
  bookingId?: string;
  lastMessageAt?: Date;
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

export interface Assessment {
  id: string;
  userId: string;
  type: string;
  answers: Record<string, unknown>;
  result: Record<string, unknown>;
  recommendedTherapistIds: string[];
  createdAt: Date;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  authorId: string;
  isPublished: boolean;
  publishedAt?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  role: 'client' | 'therapist';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Socket event types
export interface SocketEvents {
  join_conversation: { conversationId: string };
  send_message: { conversationId: string; content: string };
  typing_start: { conversationId: string };
  typing_stop: { conversationId: string };
  mark_read: { conversationId: string };
  new_message: Message;
  user_typing: { userId: string; conversationId: string };
  user_stopped_typing: { userId: string; conversationId: string };
  messages_read: { conversationId: string };
  new_notification: Notification;
  new_match: DatingMatch;
}
