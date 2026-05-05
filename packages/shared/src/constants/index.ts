export const THERAPY_TYPES = [
  'Individual Therapy',
  'Couples Therapy',
  'Family Therapy',
  'Group Therapy',
  'Child & Adolescent Therapy',
  'Initial Consultation',
] as const;

export const CONCERNS = [
  'Anxiety',
  'Depression',
  'Trauma & PTSD',
  'Stress',
  'Relationship Issues',
  'Grief & Loss',
  'Self-Esteem',
  'Addiction',
  'Eating Disorders',
  'OCD',
  'Bipolar Disorder',
  'Anger Management',
  'Life Transitions',
  'LGBTQ+ Issues',
  'Chronic Illness',
  'Work Stress',
  'Parenting',
  'Loneliness',
  'Sleep Issues',
  'Phobias',
] as const;

export const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Mandarin',
  'Arabic',
  'Portuguese',
  'Hindi',
  'Japanese',
  'Korean',
] as const;

export const SESSION_DURATIONS = [30, 45, 60, 90] as const;

export const PLATFORM_FEE_PERCENT = 15;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Derived types from const arrays
export type TherapyType = (typeof THERAPY_TYPES)[number];
export type Concern = (typeof CONCERNS)[number];
export type Language = (typeof LANGUAGES)[number];
export type SessionDuration = (typeof SESSION_DURATIONS)[number];
