'use client';

import { useRive } from '@rive-app/react-canvas';
import { useState, useEffect, useCallback } from 'react';

const ARTBOARD      = 'realTime whole';
const STATE_MACHINE = 'State Machine 1';

const INPUT_DEFS = [
  { label: 'ESS → Home',        key: 'isESSTohome',  anim: 'ESSTohome'  },
  { label: 'Grid → Home',       key: 'isgridTohome', anim: 'gridTohome' },
  { label: 'Grid → EV',         key: 'isgridToEV',   anim: 'gridToEV'   },
  { label: 'Grid → ESS',        key: 'isgridToESS',  anim: 'gridToESS'  },
  { label: 'PV → Home',         key: 'isPVTohome',   anim: 'PVTohome'   },
  { label: 'PV → ESS',          key: 'isPVToESS',    anim: 'PVToESS'    },
  { label: 'PV → Grid',         key: 'isPVToGrid',   anim: 'PTTogrid'   }
];

export default function EnergyDashboard() {
  const [values, setValues]   = useState<Record<string, boolean>>(
    Object.fromEntries(INPUT_DEFS.map(d => [d.key, false]))
  );
  const [ready, setReady] = useState(false);

  const { rive, RiveComponent } = useRive({
    src: '/rives/eresource.riv',
    artboard: ARTBOARD,
    stateMachines: STATE_MACHINE,
    autoplay: true,
    autoBind: true,
  } as any);

  useEffect(() => {
    if (!rive) return;
    const vmi = (rive as any).viewModelInstance;
    if (vmi) setReady(true);
  }, [rive]);

  const handleToggle = useCallback((key: string, checked: boolean) => {
    const def = INPUT_DEFS.find(d => d.key === key);

    if (rive && def?.anim) {
      if (checked) {
        // stop → play 순서로 항상 처음부터 재시작
        rive.stop(def.anim);
        rive.play(def.anim);
      } else {
        rive.stop(def.anim);
      }
    }

    setValues(prev => ({ ...prev, [key]: checked }));
  }, [rive]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-slate-50 h-full text-slate-900">

      {/* ── 캔버스 ── */}
      <div className="flex-[4] bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
        <h2 className="text-xl font-bold mb-3 text-indigo-600 uppercase tracking-tight">
          Energy Flow Control
        </h2>
        <div className="flex-1 min-h-0 bg-slate-950 rounded-xl overflow-hidden shadow-2xl">
          <RiveComponent className="w-full h-full" />
        </div>
      </div>

      {/* ── 컨트롤 패널 ── */}
      <div className="flex-1 min-w-[220px] bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
        <h3 className="text-lg font-bold mb-1">인터랙션 스위치</h3>
        <p className="text-xs text-slate-400 mb-6">
          {ready ? '✅ 연결됨' : '⏳ 로드 중...'}
        </p>

        {!ready ? (
          <div className="py-16 text-center text-slate-400 italic text-sm animate-pulse">
            Rive 로드 중...
          </div>
        ) : (
          <div className="space-y-3">
            {INPUT_DEFS.map(item => (
              <div
                key={item.key}
                className="flex justify-between items-center p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors"
              >
                <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={values[item.key]}
                    onChange={e => handleToggle(item.key, e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-300 rounded-full peer
                    peer-checked:bg-blue-600
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                    after:bg-white after:border after:border-gray-300 after:rounded-full
                    after:h-5 after:w-5 after:transition-all
                    peer-checked:after:translate-x-full peer-checked:after:border-white" />
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
