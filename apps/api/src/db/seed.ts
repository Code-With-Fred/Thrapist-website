import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB, mongoose } from './index.js';
import { User } from '../models/User.js';
import { ClientProfile } from '../models/ClientProfile.js';
import { TherapistProfile } from '../models/TherapistProfile.js';
import { Wallet } from '../models/Wallet.js';

const THERAPISTS = [
  { firstName: 'Sarah', lastName: 'Johnson', title: 'Licensed Clinical Psychologist', bio: 'Specializing in anxiety, depression and CBT with 10+ years experience.', concerns: ['Anxiety', 'Depression', 'Stress'], therapyTypes: ['CBT', 'DBT'], sessionRate: 15000, languages: ['English'], gender: 'female', sessionTypes: ['video', 'audio'] },
  { firstName: 'Michael', lastName: 'Chen', title: 'Licensed Marriage & Family Therapist', bio: 'Expert in couples therapy, trauma-informed care and EMDR.', concerns: ['Relationships', 'Trauma', 'Couples'], therapyTypes: ['EMDR', 'EFT'], sessionRate: 13000, languages: ['English', 'Mandarin'], gender: 'male', sessionTypes: ['video', 'in_person'] },
  { firstName: 'Amara', lastName: 'Osei', title: 'Psychotherapist', bio: 'Compassionate care for grief, PTSD and life transitions.', concerns: ['PTSD', 'Grief', 'Anxiety'], therapyTypes: ['EMDR', 'Somatic'], sessionRate: 12000, languages: ['English', 'French'], gender: 'female', sessionTypes: ['video'] },
  { firstName: 'James', lastName: 'Rivera', title: 'Licensed Professional Counselor', bio: 'Helping clients navigate addiction, self-esteem and work stress.', concerns: ['Addiction', 'Self-Esteem', 'Work Stress'], therapyTypes: ['Motivational Interviewing', 'ACT'], sessionRate: 11000, languages: ['English', 'Spanish'], gender: 'male', sessionTypes: ['video', 'audio', 'in_person'] },
  { firstName: 'Priya', lastName: 'Sharma', title: 'Child & Adolescent Psychologist', bio: 'Dedicated to supporting children and teens through life challenges.', concerns: ['Child', 'Adolescent', 'ADHD'], therapyTypes: ['Play Therapy', 'CBT'], sessionRate: 14000, languages: ['English', 'Hindi'], gender: 'female', sessionTypes: ['video', 'in_person'] },
];

async function seed() {
  await connectDB();
  console.log('Connected to MongoDB. Seeding...');
  const PASSWORD_HASH = await bcrypt.hash('Password123!', 10);

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    ClientProfile.deleteMany({}),
    TherapistProfile.deleteMany({}),
    Wallet.deleteMany({}),
  ]);

  // Admin
  const admin = await User.create({ email: 'admin@healmate.app', passwordHash: PASSWORD_HASH, role: 'admin', isVerified: true });
  await Wallet.create({ userId: admin._id });
  console.log('Created admin');

  // Clients
  for (let i = 1; i <= 5; i++) {
    const client = await User.create({ email: `client${i}@example.com`, passwordHash: PASSWORD_HASH, role: 'client', isVerified: true });
    await ClientProfile.create({ userId: client._id, firstName: `Client`, lastName: `${i}` });
    await Wallet.create({ userId: client._id });
  }
  console.log('Created 5 clients');

  // Therapists
  for (let i = 0; i < THERAPISTS.length; i++) {
    const t = THERAPISTS[i]!;
    const user = await User.create({ email: `therapist${i + 1}@example.com`, passwordHash: PASSWORD_HASH, role: 'therapist', isVerified: true });
    await TherapistProfile.create({
      userId: user._id,
      ...t,
      licenseType: 'LCSW',
      licenseNumber: `LIC${100 + i}`,
      licenseExpiry: '2026-12-31',
      yearsOfExperience: 5 + i,
      education: [{ institution: 'State University', degree: 'M.S. Psychology', year: 2015 + i }],
      isApproved: true,
      isAvailable: true,
      rating: 4.5 + (i % 5) * 0.1,
      reviewCount: 20 + i * 10,
    });
    await Wallet.create({ userId: user._id });
  }
  console.log('Created 5 therapists');

  console.log('\n✅ Seed complete!');
  console.log('Admin:     admin@healmate.app / Password123!');
  console.log('Clients:   client1@example.com … client5@example.com / Password123!');
  console.log('Therapists: therapist1@example.com … therapist5@example.com / Password123!');
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
