"use client";

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface FormMessageProps {
  message: string | null | undefined;
  variant?: 'error' | 'success' | 'info' | 'warning';
  className?: string;
}

export function FormMessage({ message, variant = 'error', className = '' }: FormMessageProps) {
  if (!message) return null;

  if (variant === 'error') {
    return (
      <Alert variant="destructive" className={`mt-2 ${className}`.trim()}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          {message}
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === 'success') {
    return (
      <div className={`mt-2 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-green-700 text-sm ${className}`.trim()}>
        <CheckCircle2 className="h-4 w-4" />
        <span>{message}</span>
      </div>
    );
  }

  // info / warning fallbacks: simple subtle banner
  return (
    <div className={`mt-2 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 text-sm ${className}`.trim()}>
      <Info className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
}

export default FormMessage;
