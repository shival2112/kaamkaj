'use client';

import { useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import type { ToastData } from '@/components/ui/Toast';

const STATUS_LABELS: Record<string, string> = {
  REVIEWING:   'is being reviewed',
  SHORTLISTED: 'has been shortlisted! 🎉',
  REJECTED:    'was not selected this time',
  HIRED:       'has been accepted! 🎊',
};

interface Props {
  userId: string;
  onNotification: (toast: Omit<ToastData, 'id'>) => void;
}

export function RealtimeStatusListener({ userId, onNotification }: Props) {
  useEffect(() => {
    const supabase = createSupabaseClient();

    const channel = supabase
      .channel(`candidate-apps-${userId}`)
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'applications',
          filter: `candidate_id=eq.${userId}`,
        },
        (payload) => {
          const newStatus = (payload.new as { status?: string }).status;
          if (!newStatus || newStatus === (payload.old as { status?: string }).status) return;

          const label = STATUS_LABELS[newStatus];
          if (!label) return;

          onNotification({
            title:   'Application update',
            message: `Your application ${label}.`,
            variant: newStatus === 'SHORTLISTED' || newStatus === 'HIRED' ? 'success' : 'default',
          });
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Listening for application status changes');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onNotification]);

  return null;
}
