import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FIELD_LABELS } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getFieldLabel(field: string): string {
  return FIELD_LABELS[field as keyof typeof FIELD_LABELS] || field;
}

export function getInterviewTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    behavioral: 'Behavioral',
    technical: 'Technical',
    system_design: 'System Design',
  };
  return labels[type] || type;
}
