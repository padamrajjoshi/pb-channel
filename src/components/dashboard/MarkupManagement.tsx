'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Plus, Trash2, Shield } from 'lucide-react';
import useSWR from 'swr';
import { api } from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export const MarkupManagement = () => {
  const { data: rules, mutate } = useSWR('/settings/markup-rules', fetcher);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    try {
      await api.delete(`/settings/markup-rules/${id}`);
      mutate();
    } catch (e) {
      alert('Failed to delete rule');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Dynamic Markup Rules</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20">
          <Plus className="w-4 h-4" /> Add Rule
        </button>
      </div>

      <div className="grid gap-4">
        {rules?.map((rule: any) => (
          <div key={rule.id} className="flex items-center justify-between p-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-bold capitalize">{rule.app_source} - {rule.markup_type}</p>
                <p className="text-sm text-gray-500">Value: <span className="text-blue-600 font-bold">{rule.value}{rule.markup_type === 'percentage' ? '%' : ' Fixed'}</span> • Priority: {rule.priority}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {rule.tenant_id ? (
                <span className="text-[10px] font-bold bg-purple-500/10 text-purple-600 px-2 py-1 rounded-md uppercase tracking-widest border border-purple-500/20">Custom</span>
              ) : (
                <span className="text-[10px] font-bold bg-gray-500/10 text-gray-600 px-2 py-1 rounded-md uppercase tracking-widest border border-gray-500/20">Global</span>
              )}
              <button 
                onClick={() => handleDelete(rule.id)}
                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {(!rules || rules.length === 0) && (
          <div className="text-center py-8 text-gray-500 text-sm italic">No custom markup rules defined. Platform defaults will apply.</div>
        )}
      </div>
    </div>
  );
};
