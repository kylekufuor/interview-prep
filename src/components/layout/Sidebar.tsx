'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Profile } from '@/lib/types';
import {
  LayoutDashboard,
  Mic,
  History,
  Users,
} from 'lucide-react';

const studentLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/interview/new', label: 'New Interview', icon: Mic },
  { href: '/classroom', label: 'Classrooms', icon: Users },
];

const teacherLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/classroom', label: 'Classrooms', icon: Users },
];

export default function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const links = profile.role === 'teacher' ? teacherLinks : studentLinks;

  return (
    <aside className="w-64 border-r border-gray-200 bg-gray-50 h-full">
      <nav className="p-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
