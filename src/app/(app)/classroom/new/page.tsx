'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function NewClassroomPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/classroom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });

    if (res.ok) {
      router.push('/classroom');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Create Classroom
      </h1>
      <Card>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            id="name"
            label="Classroom Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Spring 2026 Cohort"
            required
          />
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this classroom for?"
              rows={3}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
            />
          </div>
          <Button type="submit" className="w-full" loading={loading}>
            Create Classroom
          </Button>
        </form>
      </Card>
    </div>
  );
}
