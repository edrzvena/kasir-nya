import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';

interface Props {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}

const DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS_ID  = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
];

function toStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

function fmtShort(s: string) {
  if (!s) return '';
  const [y, m, d] = s.split('-').map(Number);
  return `${d} ${MONTHS_ID[m - 1].slice(0, 3)} ${y}`;
}

export default function DateRangePicker({ from, to, onChange }: Props) {
  const now = new Date();
  const [open,        setOpen]        = useState(false);
  const [viewYear,    setViewYear]    = useState(now.getFullYear());
  const [viewMonth,   setViewMonth]   = useState(now.getMonth());
  const [pending,     setPending]     = useState<{ from: string; to: string }>({ from, to });
  const [step,        setStep]        = useState<'from' | 'to'>('from');
  const [hoverDate,   setHoverDate]   = useState('');
  const ref = useRef<HTMLDivElement>(null);

  // Sync when props change externally
  useEffect(() => { setPending({ from, to }); }, [from, to]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const openCalendar = () => {
    // Navigate view to current "from" month if set
    if (from) {
      const [y, m] = from.split('-').map(Number);
      setViewYear(y); setViewMonth(m - 1);
    }
    setPending({ from, to });
    setStep(from ? 'to' : 'from');
    setHoverDate('');
    setOpen(true);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const handleDayClick = (dateStr: string) => {
    if (step === 'from') {
      setPending({ from: dateStr, to: '' });
      setStep('to');
    } else {
      if (dateStr >= pending.from) {
        onChange(pending.from, dateStr);
        setOpen(false);
      } else {
        // Clicked before from → reset with this as new start
        setPending({ from: dateStr, to: '' });
      }
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('', '');
  };

  // Range highlighting helpers
  const effectiveTo = pending.to || (step === 'to' && hoverDate ? hoverDate : '');
  const rangeFrom = pending.from && effectiveTo && pending.from < effectiveTo ? pending.from : effectiveTo;
  const rangeTo   = pending.from && effectiveTo && pending.from < effectiveTo ? effectiveTo   : pending.from;

  const isStart   = (s: string) => !!pending.from && s === pending.from;
  const isEnd     = (s: string) => !!effectiveTo && s === effectiveTo && effectiveTo >= pending.from;
  const inRange   = (s: string) => !!rangeFrom && !!rangeTo && s > rangeFrom && s < rangeTo;

  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const todayStr = toStr(now.getFullYear(), now.getMonth(), now.getDate());

  const hasSelection = from && to;

  return (
    <div className="relative" ref={ref}>

      {/* Trigger pill */}
      <button
        onClick={openCalendar}
        className={`flex items-center gap-2 h-9 pl-3 rounded-xl border text-xs font-bold transition-all ${
          hasSelection
            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 pr-2'
            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 pr-3.5'
        }`}
      >
        <Calendar className="h-3.5 w-3.5 shrink-0" />
        <span className="leading-none">
          {hasSelection ? `${fmtShort(from)} → ${fmtShort(to)}` : 'Pilih Tanggal'}
        </span>
        {hasSelection && (
          <span
            onClick={handleClear}
            className="h-5 w-5 flex items-center justify-center rounded-lg hover:bg-indigo-100 transition-colors ml-0.5 cursor-pointer"
          >
            <X className="h-3 w-3 text-indigo-400" />
          </span>
        )}
      </button>

      {/* Calendar popup */}
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/80 p-4 w-[280px] select-none">

          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-extrabold text-slate-800 tracking-tight">
              {MONTHS_ID[viewMonth]} {viewYear}
            </span>
            <button
              onClick={nextMonth}
              className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS_SHORT.map(d => (
              <div key={d} className="text-center text-[9px] font-extrabold text-slate-400 uppercase py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {/* Leading empty cells */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day     = i + 1;
              const dateStr = toStr(viewYear, viewMonth, day);
              const start   = isStart(dateStr);
              const end     = isEnd(dateStr);
              const middle  = inRange(dateStr);
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={day}
                  className={`h-8 flex items-center justify-center relative ${
                    middle ? 'bg-indigo-50' : ''
                  } ${start && (pending.to || hoverDate) ? 'rounded-l-lg' : ''} ${end && pending.from ? 'rounded-r-lg' : ''}`}
                >
                  <button
                    onClick={() => handleDayClick(dateStr)}
                    onMouseEnter={() => { if (step === 'to' && pending.from) setHoverDate(dateStr); }}
                    onMouseLeave={() => setHoverDate('')}
                    className={`
                      h-7 w-7 flex items-center justify-center rounded-lg text-[11px] font-semibold transition-colors relative
                      ${start || end
                        ? 'bg-indigo-600 text-white font-extrabold shadow-sm shadow-indigo-200'
                        : middle
                          ? 'text-indigo-700 font-bold hover:bg-indigo-100'
                          : isToday
                            ? 'text-indigo-600 font-extrabold hover:bg-slate-100'
                            : 'text-slate-600 hover:bg-slate-100'
                      }
                    `}
                  >
                    {day}
                    {isToday && !start && !end && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[3px] w-[3px] rounded-full bg-indigo-400" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Step hint */}
          <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              {step === 'from' ? 'Pilih tanggal mulai' : pending.from ? `Mulai: ${fmtShort(pending.from)}` : 'Pilih tanggal akhir'}
            </span>
            {step === 'to' && pending.from && (
              <button
                onClick={() => { setStep('from'); setPending({ from: '', to: '' }); }}
                className="text-[9px] font-bold text-indigo-400 hover:text-indigo-600 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
