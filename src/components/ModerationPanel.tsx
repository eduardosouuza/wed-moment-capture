import { useState, useEffect, useCallback } from 'react';
import { X, Check, Trash2, Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Event } from '@/types/database';

interface PendingMedia {
  id: string;
  file_path: string;
  media_type: 'photo' | 'video';
  uploaded_at: string;
  url: string;
}

interface ModerationPanelProps {
  event: Event;
  onClose: () => void;
  onCountChange: (count: number) => void;
}

export function ModerationPanel({ event, onClose, onCountChange }: ModerationPanelProps) {
  const [pending, setPending] = useState<PendingMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<Set<string>>(new Set());

  const fetchPending = useCallback(async () => {
    const { data } = await supabase
      .from('media')
      .select('id, file_path, media_type, uploaded_at')
      .eq('event_id', event.id)
      .eq('moderation_status', 'pending')
      .order('uploaded_at', { ascending: true });

    const items = (data ?? []).map(m => ({
      ...m,
      url: supabase.storage.from('media-bucket').getPublicUrl(m.file_path).data.publicUrl,
    })) as PendingMedia[];

    setPending(items);
    onCountChange(items.length);
    setLoading(false);
  }, [event.id, onCountChange]);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const approve = async (id: string) => {
    setProcessing(prev => new Set(prev).add(id));
    await supabase
      .from('media')
      .update({ is_approved: true, moderation_status: 'approved' })
      .eq('id', id);
    setPending(prev => {
      const next = prev.filter(m => m.id !== id);
      onCountChange(next.length);
      return next;
    });
    setProcessing(prev => { const s = new Set(prev); s.delete(id); return s; });
  };

  const reject = async (id: string) => {
    setProcessing(prev => new Set(prev).add(id));
    await supabase
      .from('media')
      .update({ is_approved: false, moderation_status: 'rejected' })
      .eq('id', id);
    setPending(prev => {
      const next = prev.filter(m => m.id !== id);
      onCountChange(next.length);
      return next;
    });
    setProcessing(prev => { const s = new Set(prev); s.delete(id); return s; });
  };

  const approveAll = async () => {
    const ids = pending.map(m => m.id);
    await supabase
      .from('media')
      .update({ is_approved: true, moderation_status: 'approved' })
      .in('id', ids);
    setPending([]);
    onCountChange(0);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FDF2F4] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#E85A70]" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Moderação de Fotos</p>
              <p className="text-xs text-gray-400">{event.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pending.length > 1 && (
              <button
                onClick={approveAll}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
              >
                Aprovar todas ({pending.length})
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-[#E85A70]" />
            </div>
          ) : pending.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-emerald-500" />
              </div>
              <p className="font-semibold text-gray-700">Tudo em dia!</p>
              <p className="text-sm text-gray-400 mt-1">Não há fotos pendentes de aprovação.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {pending.map(item => (
                <div key={item.id} className="relative group rounded-xl overflow-hidden bg-gray-100 aspect-square">
                  {item.media_type === 'photo' ? (
                    <img src={item.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <video src={item.url} className="w-full h-full object-cover" muted />
                  )}

                  {/* Overlay com botões */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3 gap-2">
                    <button
                      disabled={processing.has(item.id)}
                      onClick={() => approve(item.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      {processing.has(item.id) ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                      Aprovar
                    </button>
                    <button
                      disabled={processing.has(item.id)}
                      onClick={() => reject(item.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      Rejeitar
                    </button>
                  </div>

                  {/* Mobile: botões sempre visíveis na parte inferior */}
                  <div className="sm:hidden absolute bottom-0 inset-x-0 flex gap-1 p-1.5 bg-black/50">
                    <button
                      disabled={processing.has(item.id)}
                      onClick={() => approve(item.id)}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold disabled:opacity-50"
                    >
                      ✓
                    </button>
                    <button
                      disabled={processing.has(item.id)}
                      onClick={() => reject(item.id)}
                      className="flex-1 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold disabled:opacity-50"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
