import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  boolean,
  timestamp,
  text,
  integer,
  decimal,
  date,
  time,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['client', 'therapist', 'admin']);

export const sessionTypeEnum = pgEnum('session_type', ['video', 'audio', 'in_person']);

export const bookingStatusEnum = pgEnum('booking_status', [
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'no_show',
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'succeeded',
  'failed',
  'refunded',
]);

export const paymentTypeEnum = pgEnum('payment_type', [
  'session',
  'wallet_topup',
  'gift_card',
]);

export const walletTransactionTypeEnum = pgEnum('wallet_transaction_type', [
  'credit',
  'debit',
]);

export const conversationTypeEnum = pgEnum('conversation_type', ['therapy', 'dating']);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    passwordHash: varchar('password_hash', { length: 255 }),
    role: userRoleEnum('role').notNull().default('client'),
    googleId: varchar('google_id', { length: 255 }),
    isVerified: boolean('is_verified').notNull().default(false),
    isActive: boolean('is_active').notNull().default(true),
    verificationToken: varchar('verification_token', { length: 255 }),
    resetToken: varchar('reset_token', { length: 255 }),
    resetTokenExpires: timestamp('reset_token_expires'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
    googleIdIdx: index('users_google_id_idx').on(table.googleId),
  }),
);

export const clientProfiles = pgTable(
  'client_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    dateOfBirth: date('date_of_birth'),
    phone: varchar('phone', { length: 50 }),
    avatarUrl: varchar('avatar_url', { length: 500 }),
    bio: text('bio'),
    timezone: varchar('timezone', { length: 100 }).notNull().default('UTC'),
    language: varchar('language', { length: 10 }).notNull().default('en'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('client_profiles_user_id_idx').on(table.userId),
  }),
);

export const therapistProfiles = pgTable(
  'therapist_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    title: varchar('title', { length: 100 }).notNull(),
    avatarUrl: varchar('avatar_url', { length: 500 }),
    bio: text('bio').notNull(),
    licenseType: varchar('license_type', { length: 100 }).notNull(),
    licenseNumber: varchar('license_number', { length: 100 }).notNull(),
    licenseExpiry: date('license_expiry').notNull(),
    yearsOfExperience: integer('years_of_experience').notNull(),
    education: jsonb('education').notNull(),
    languages: text('languages').array().notNull(),
    sessionTypes: text('session_types').array().notNull(),
    concerns: text('concerns').array().notNull(),
    therapyTypes: text('therapy_types').array().notNull(),
    sessionRate: decimal('session_rate', { precision: 10, scale: 2 }).notNull(),
    consultationRate: decimal('consultation_rate', { precision: 10, scale: 2 })
      .notNull()
      .default('0'),
    currency: varchar('currency', { length: 10 }).notNull().default('USD'),
    timezone: varchar('timezone', { length: 100 }).notNull(),
    isApproved: boolean('is_approved').notNull().default(false),
    isFeatured: boolean('is_featured').notNull().default(false),
    approvalDate: timestamp('approval_date'),
    rejectionReason: text('rejection_reason'),
    rating: decimal('rating', { precision: 3, scale: 2 }).notNull().default('0'),
    totalReviews: integer('total_reviews').notNull().default(0),
    totalSessions: integer('total_sessions').notNull().default(0),
    location: varchar('location', { length: 255 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('therapist_profiles_user_id_idx').on(table.userId),
    isApprovedIdx: index('therapist_profiles_is_approved_idx').on(table.isApproved),
    ratingIdx: index('therapist_profiles_rating_idx').on(table.rating),
  }),
);

export const therapistAvailability = pgTable(
  'therapist_availability',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    therapistId: uuid('therapist_id')
      .notNull()
      .references(() => therapistProfiles.id, { onDelete: 'cascade' }),
    dayOfWeek: integer('day_of_week').notNull(),
    startTime: time('start_time').notNull(),
    endTime: time('end_time').notNull(),
    isAvailable: boolean('is_available').notNull().default(true),
  },
  (table) => ({
    therapistIdIdx: index('therapist_availability_therapist_id_idx').on(table.therapistId),
    dayIdx: index('therapist_availability_day_idx').on(table.dayOfWeek),
  }),
);

export const bookings = pgTable(
  'bookings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clientId: uuid('client_id')
      .notNull()
      .references(() => clientProfiles.id, { onDelete: 'restrict' }),
    therapistId: uuid('therapist_id')
      .notNull()
      .references(() => therapistProfiles.id, { onDelete: 'restrict' }),
    sessionType: sessionTypeEnum('session_type').notNull(),
    therapyType: varchar('therapy_type', { length: 100 }).notNull(),
    status: bookingStatusEnum('status').notNull().default('pending'),
    scheduledAt: timestamp('scheduled_at').notNull(),
    durationMinutes: integer('duration_minutes').notNull().default(60),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 10 }).notNull(),
    notes: text('notes'),
    cancellationReason: text('cancellation_reason'),
    dailyRoomUrl: varchar('daily_room_url', { length: 500 }),
    dailyRoomName: varchar('daily_room_name', { length: 255 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    clientIdIdx: index('bookings_client_id_idx').on(table.clientId),
    therapistIdIdx: index('bookings_therapist_id_idx').on(table.therapistId),
    statusIdx: index('bookings_status_idx').on(table.status),
    scheduledAtIdx: index('bookings_scheduled_at_idx').on(table.scheduledAt),
  }),
);

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    bookingId: uuid('booking_id').references(() => bookings.id, { onDelete: 'set null' }),
    giftCardId: uuid('gift_card_id'),
    stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 })
      .notNull()
      .unique(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 10 }).notNull(),
    status: paymentStatusEnum('status').notNull().default('pending'),
    type: paymentTypeEnum('type').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('payments_user_id_idx').on(table.userId),
    bookingIdIdx: index('payments_booking_id_idx').on(table.bookingId),
    statusIdx: index('payments_status_idx').on(table.status),
  }),
);

export const wallets = pgTable(
  'wallets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    balance: decimal('balance', { precision: 10, scale: 2 }).notNull().default('0'),
    currency: varchar('currency', { length: 10 }).notNull().default('USD'),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('wallets_user_id_idx').on(table.userId),
  }),
);

export const walletTransactions = pgTable(
  'wallet_transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    walletId: uuid('wallet_id')
      .notNull()
      .references(() => wallets.id, { onDelete: 'cascade' }),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    type: walletTransactionTypeEnum('type').notNull(),
    reference: varchar('reference', { length: 255 }).notNull(),
    description: varchar('description', { length: 500 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    walletIdIdx: index('wallet_transactions_wallet_id_idx').on(table.walletId),
    createdAtIdx: index('wallet_transactions_created_at_idx').on(table.createdAt),
  }),
);

export const giftCards = pgTable(
  'gift_cards',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 10 }).notNull(),
    purchasedBy: uuid('purchased_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    redeemedBy: uuid('redeemed_by').references(() => users.id, { onDelete: 'set null' }),
    redeemedAt: timestamp('redeemed_at'),
    expiresAt: timestamp('expires_at').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    codeIdx: uniqueIndex('gift_cards_code_idx').on(table.code),
    purchasedByIdx: index('gift_cards_purchased_by_idx').on(table.purchasedBy),
    redeemedByIdx: index('gift_cards_redeemed_by_idx').on(table.redeemedBy),
  }),
);

export const reviews = pgTable(
  'reviews',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    bookingId: uuid('booking_id')
      .notNull()
      .unique()
      .references(() => bookings.id, { onDelete: 'cascade' }),
    clientId: uuid('client_id')
      .notNull()
      .references(() => clientProfiles.id, { onDelete: 'cascade' }),
    therapistId: uuid('therapist_id')
      .notNull()
      .references(() => therapistProfiles.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(),
    comment: text('comment'),
    isVisible: boolean('is_visible').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    therapistIdIdx: index('reviews_therapist_id_idx').on(table.therapistId),
    clientIdIdx: index('reviews_client_id_idx').on(table.clientId),
  }),
);

export const datingProfiles = pgTable(
  'dating_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    displayName: varchar('display_name', { length: 100 }).notNull(),
    dateOfBirth: date('date_of_birth').notNull(),
    gender: varchar('gender', { length: 50 }).notNull(),
    lookingFor: text('looking_for').array().notNull(),
    bio: text('bio').notNull(),
    interests: text('interests').array().notNull(),
    photos: text('photos').array().notNull(),
    location: varchar('location', { length: 255 }).notNull(),
    latitude: decimal('latitude', { precision: 10, scale: 7 }),
    longitude: decimal('longitude', { precision: 10, scale: 7 }),
    maxDistanceKm: integer('max_distance_km').notNull().default(50),
    minAge: integer('min_age').notNull().default(18),
    maxAge: integer('max_age').notNull().default(99),
    isActive: boolean('is_active').notNull().default(true),
    isVerified: boolean('is_verified').notNull().default(false),
    lastActive: timestamp('last_active').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('dating_profiles_user_id_idx').on(table.userId),
    isActiveIdx: index('dating_profiles_is_active_idx').on(table.isActive),
    locationIdx: index('dating_profiles_location_idx').on(table.latitude, table.longitude),
  }),
);

export const datingLikes = pgTable(
  'dating_likes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    likerId: uuid('liker_id')
      .notNull()
      .references(() => datingProfiles.id, { onDelete: 'cascade' }),
    likedId: uuid('liked_id')
      .notNull()
      .references(() => datingProfiles.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    likerLikedIdx: uniqueIndex('dating_likes_liker_liked_idx').on(table.likerId, table.likedId),
    likerIdIdx: index('dating_likes_liker_id_idx').on(table.likerId),
    likedIdIdx: index('dating_likes_liked_id_idx').on(table.likedId),
  }),
);

export const datingMatches = pgTable(
  'dating_matches',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    profile1Id: uuid('profile_1_id')
      .notNull()
      .references(() => datingProfiles.id, { onDelete: 'cascade' }),
    profile2Id: uuid('profile_2_id')
      .notNull()
      .references(() => datingProfiles.id, { onDelete: 'cascade' }),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    profile1Profile2Idx: uniqueIndex('dating_matches_profile1_profile2_idx').on(
      table.profile1Id,
      table.profile2Id,
    ),
    profile1IdIdx: index('dating_matches_profile1_id_idx').on(table.profile1Id),
    profile2IdIdx: index('dating_matches_profile2_id_idx').on(table.profile2Id),
  }),
);

export const conversations = pgTable(
  'conversations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: conversationTypeEnum('type').notNull(),
    participant1Id: uuid('participant_1_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    participant2Id: uuid('participant_2_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    matchId: uuid('match_id').references(() => datingMatches.id, { onDelete: 'set null' }),
    bookingId: uuid('booking_id').references(() => bookings.id, { onDelete: 'set null' }),
    lastMessageAt: timestamp('last_message_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    participant1Idx: index('conversations_participant1_idx').on(table.participant1Id),
    participant2Idx: index('conversations_participant2_idx').on(table.participant2Id),
    lastMessageAtIdx: index('conversations_last_message_at_idx').on(table.lastMessageAt),
  }),
);

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    senderId: uuid('sender_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    isRead: boolean('is_read').notNull().default(false),
    readAt: timestamp('read_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    conversationIdIdx: index('messages_conversation_id_idx').on(table.conversationId),
    senderIdIdx: index('messages_sender_id_idx').on(table.senderId),
    createdAtIdx: index('messages_created_at_idx').on(table.createdAt),
  }),
);

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 100 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    data: jsonb('data'),
    isRead: boolean('is_read').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('notifications_user_id_idx').on(table.userId),
    isReadIdx: index('notifications_is_read_idx').on(table.isRead),
    createdAtIdx: index('notifications_created_at_idx').on(table.createdAt),
  }),
);

export const assessments = pgTable(
  'assessments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 100 }).notNull(),
    answers: jsonb('answers').notNull(),
    result: jsonb('result').notNull(),
    recommendedTherapistIds: uuid('recommended_therapist_ids').array().notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('assessments_user_id_idx').on(table.userId),
    typeIdx: index('assessments_type_idx').on(table.type),
  }),
);

export const blogPosts = pgTable(
  'blog_posts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 500 }).notNull(),
    slug: varchar('slug', { length: 500 }).notNull().unique(),
    content: text('content').notNull(),
    excerpt: text('excerpt').notNull(),
    coverImage: varchar('cover_image', { length: 500 }).notNull(),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    isPublished: boolean('is_published').notNull().default(false),
    publishedAt: timestamp('published_at'),
    tags: text('tags').array().notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex('blog_posts_slug_idx').on(table.slug),
    authorIdIdx: index('blog_posts_author_id_idx').on(table.authorId),
    isPublishedIdx: index('blog_posts_is_published_idx').on(table.isPublished),
    publishedAtIdx: index('blog_posts_published_at_idx').on(table.publishedAt),
  }),
);

// ─── Type Exports ─────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type ClientProfile = typeof clientProfiles.$inferSelect;
export type NewClientProfile = typeof clientProfiles.$inferInsert;

export type TherapistProfile = typeof therapistProfiles.$inferSelect;
export type NewTherapistProfile = typeof therapistProfiles.$inferInsert;

export type TherapistAvailability = typeof therapistAvailability.$inferSelect;
export type NewTherapistAvailability = typeof therapistAvailability.$inferInsert;

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export type Wallet = typeof wallets.$inferSelect;
export type NewWallet = typeof wallets.$inferInsert;

export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type NewWalletTransaction = typeof walletTransactions.$inferInsert;

export type GiftCard = typeof giftCards.$inferSelect;
export type NewGiftCard = typeof giftCards.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

export type DatingProfile = typeof datingProfiles.$inferSelect;
export type NewDatingProfile = typeof datingProfiles.$inferInsert;

export type DatingLike = typeof datingLikes.$inferSelect;
export type NewDatingLike = typeof datingLikes.$inferInsert;

export type DatingMatch = typeof datingMatches.$inferSelect;
export type NewDatingMatch = typeof datingMatches.$inferInsert;

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

export type Assessment = typeof assessments.$inferSelect;
export type NewAssessment = typeof assessments.$inferInsert;

export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
