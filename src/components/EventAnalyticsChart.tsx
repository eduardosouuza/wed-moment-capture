import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Camera, Clock, TrendingUp } from 'lucide-react';

interface Props {
  eventId: string;
}

interface HourBucket {
  hour: number;
  count: number;
}

export function EventAnalyticsChart({ eventId }: Props) {
  const [data, setData] = useState<HourBucket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: rows } = await supabase
        .from('media')
        .select('uploaded_at')
        .eq('event_id', eventId);

      if (!active) return;

      const counts = new Array(24).fill(0);
      rows?.forEach(({ uploaded_at }) => {
        counts[new Date(uploaded_at).getHours()]++;
      });
      setData(counts.map((count, hour) => ({ hour, count })));
      setLoading(false);
    })();
    return () => { active = false; };
  }, [eventId]);

  if (loading) {
    return <div className="h-12 rounded-xl bg-gray-100 animate-pulse mt-3" />;
  }

  const total = data.reduce((s, d) => s + d.count, 0);

  if (total === 0) {
    return (
      <p className="text-xs text-gray-400 text-center py-3 mt-3 border-t border-gray-50">
        Sem dados ainda — as fotos aparecem aqui assim que forem tiradas.
      </p>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count));
  const peakHour = data.find(d => d.count === maxCount)!;
  const activeHours = data.filter(d => d.count > 0);
  const minHour = Math.max(0, Math.min(...activeHours.map(d => d.hour)) - 1);
  const maxHour = Math.min(23, Math.max(...activeHours.map(d => d.hour)) + 1);
  const visible = data.slice(minHour, maxHour + 1);

  return (
    <div className="mt-3 pt-3 border-t border-gray-50 space-y-2.5">
      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Camera className="w-3 h-3 text-[#E85A70]" />
          <span className="text-xs font-bold text-gray-700">{total}</span>
          <span className="text-xs text-gray-400">total</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-[#E85A70]" />
          <span className="text-xs font-bold text-gray-700">{peakHour.hour}h</span>
          <span className="text-xs text-gray-400">pico</span>
          <span className="text-xs text-[#E85A70] font-semibold">({peakHour.count})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3 h-3 text-[#E85A70]" />
          <span className="text-xs font-bold text-gray-700">{activeHours.length}h</span>
          <span className="text-xs text-gray-400">ativas</span>
        </div>
      </div>

      {/* Bar chart */}
      <div>
        <div className="flex items-end gap-px h-10">
          {visible.map(({ hour, count }) => (
            <div
              key={hour}
              className="flex-1 rounded-t-sm min-w-0 transition-all duration-500"
              style={{
                height: count === 0
                  ? '6%'
                  : `${Math.max((count / maxCount) * 100, 10)}%`,
                background: count === maxCount
                  ? '#E85A70'
                  : count > 0
                  ? '#fbdde2'
                  : '#f3f4f6',
              }}
              title={`${hour}h: ${count} foto${count !== 1 ? 's' : ''}`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-0.5">
          <span className="text-[9px] text-gray-400 font-medium tabular-nums">{minHour}h</span>
          <span className="text-[9px] text-gray-500 font-semibold">Fotos por hora</span>
          <span className="text-[9px] text-gray-400 font-medium tabular-nums">{maxHour}h</span>
        </div>
      </div>
    </div>
  );
}
