'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function ToastContainer() {
  const { toasts } = useApp();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-[999] flex flex-col gap-3 max-w-[calc(100vw-2rem)] md:max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 bg-card text-card-foreground p-4 rounded-xl border border-border shadow-lg animate-fade-in relative overflow-hidden before:content-[""] before:absolute before:left-0 before:top-0 before:h-full before:w-1 ${
              isSuccess ? 'before:bg-emerald-600' : isError ? 'before:bg-rose-600' : 'before:bg-sky-500'
            }`}
          >
            <div className="mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {isError && <AlertTriangle className="w-5 h-5 text-rose-600" />}
              {isInfo && <Info className="w-5 h-5 text-sky-500" />}
            </div>
            <div className="text-sm font-medium pr-2">{toast.message}</div>
          </div>
        );
      })}
    </div>
  );
}
