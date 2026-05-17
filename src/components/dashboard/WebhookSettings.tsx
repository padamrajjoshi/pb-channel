'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Webhook, Plus, Trash2, Key, CheckCircle2 } from 'lucide-react';
import useSWR from 'swr';
import { api } from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export const WebhookSettings = () => {
  const { data: webhooks, mutate } = useSWR('/settings/webhooks', fetcher);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Partner Webhooks</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20">
          <Plus className="w-4 h-4" /> Add Webhook
        </button>
      </div>

      <div className="grid gap-4">
        {webhooks?.map((webhook: any) => (
          <div key={webhook.id} className="p-5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600">
                  <Webhook className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold truncate max-w-[300px]">{webhook.url}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Tenant: {webhook.tenant_id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded-md uppercase tracking-widest border border-emerald-500/20">Active</span>
                <button className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                <Key className="w-3 h-3" /> 
                <span className="truncate">Secret: {webhook.secret.substring(0, 8)}...</span>
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                {webhook.event_types.map((type: string) => (
                  <span key={type} className="text-[9px] font-bold bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded text-gray-500 border border-gray-200 dark:border-white/5">{type}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
        {(!webhooks || webhooks.length === 0) && (
          <div className="text-center py-8 text-gray-500 text-sm italic">No webhook subscriptions configured.</div>
        )}
      </div>
    </div>
  );
};
