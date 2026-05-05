import type { Metadata } from 'next';
import EmergencyClient from './EmergencyClient';

export const metadata: Metadata = {
  title: 'Crisis Support Resources | HealMate',
  description:
    'Immediate mental health crisis resources. If you are in danger, call 911. 988 Suicide & Crisis Lifeline available 24/7.',
};

export default function EmergencyPage() {
  return <EmergencyClient />;
}
