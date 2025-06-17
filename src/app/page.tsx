'use client';

import { useEffect } from 'react';
import useSWR from 'swr';
import { api, fetcher } from '@/lib/api';
import { RowTable } from '@/components/RowTable';
import { RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const { data: rows, error, isLoading, mutate } = useSWR('/rows', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  });

  const handleRefresh = () => {
    mutate();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          Failed to load data. Please check your connection and try again.
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {rows && !isLoading && (
        <RowTable rows={rows} />
      )}

      {rows && rows.length === 0 && !isLoading && (
        <div className="text-center py-12 text-gray-500">
          <p>No rows available yet.</p>
          <p className="text-sm mt-2">Rows from Google Sheets will appear here.</p>
        </div>
      )}
    </div>
  );
}