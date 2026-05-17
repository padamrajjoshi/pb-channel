'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, ShoppingCart, Search, ArrowUpRight } from 'lucide-react';
import useSWR from 'swr';
import { api } from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export const AnalyticsOverview = () => {
  const { data, error, isLoading } = useSWR('/settings/analytics/performance', fetcher);

  if (isLoading) return <div className="animate-pulse h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl" />;
  if (error) return <div className="text-red-500">Failed to load analytics</div>;

  const metrics = data?.metrics || { searches: 0, bookings: 0, conversion_rate: 0 };

  const cards = [
    { title: 'Total Searches', value: metrics.searches, icon: Search, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Total Bookings', value: metrics.bookings, icon: ShoppingCart, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'Conversion Rate', value: `${metrics.conversion_rate}%`, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
    { title: 'Active Tenants', value: '1', icon: Users, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Performance Overview</h2>
        <div className="text-sm text-gray-500">Last 30 days</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.bg} dark:bg-opacity-10`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
                +12% <ArrowUpRight className="w-3 h-3 ml-1" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
              <h3 className="text-3xl font-bold tabular-nums">{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
