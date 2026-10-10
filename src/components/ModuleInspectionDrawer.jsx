import { useState } from 'react'
import { X, Activity, Zap, Shield, Cpu, Gauge, AlertCircle, CheckCircle2 } from 'lucide-react'
import { playClick } from '../utils/audio'

export default function ModuleInspectionDrawer({ activeModule, onClose }) {
  if (!activeModule) return null

  const data = {
    cupola: {
      tag: 'MOD-01 // FORWARD OBSERVATION',
      name: 'Cupola Observation Bay & Life Support',
      nameZh: '穹顶全景观测舱与一回路生命维持系统',
      status: 'OPERATIONAL',
      integrity: '99.4%',
      metrics: [
        { label: 'CABIN PRESSURE', value: '101.32 kPa', sub: 'O2: 20.9% / N2: 78.1%' },
        { label: 'QUARTZ GLASS UV SHIELD', value: '99.8% ABSORPTION', sub: '7-Layer Fused Silica' },
        { label: 'CREW WORKSTATIONS', value: '2 ACTIVE', sub: 'EVA Monitoring Console' },
        { label: 'CO2 SCRUBBER RATE', value: '1.42 kg/h', sub: 'CDRA Loop Nominal' },
      ],
      desc: '360°七面多层石英防微流星体全景观测视窗。搭载地球遥感多光谱标定仪与舱外活动（EVA）机械臂遥控工作台。',
    },
    docking: {
      tag: 'MOD-02 // ADAPTER HUB',
      name: 'PMA-2 Hermetic Docking Interface',
      nameZh: '主动式多级密封对接适配器',
      status: 'LOCKED // SEALED',
      integrity: '100.0%',
      metrics: [
        { label: 'BERTHING MECHANISM', value: 'SOFT CAPTURE OK', sub: 'Hard Latches: 12/12 Closed' },
        { label: 'INTERFACE DELTA-P', value: '0.00 kPa', sub: 'Vestibule Equalized' },
        { label: 'CARGO TRANSFER STATUS', value: '2,480 KG ONBOARD', sub: 'Progress MS-24 Transfer' },
        { label: 'PROPELLANT CROSSFEED', value: 'HYDRAZINE 94%', sub: 'Orbital Reboost Ready' },
      ],
      desc: '国际标准化低冲击对接系统（IDSS）。集成快速流体对接口、千兆光纤总线与加压过渡舱，支持飞船轨道重提升与燃料补加。',
    },
    solar: {
      tag: 'MOD-03 // POWER GENERATION',
      name: 'Alpha Photovoltaic Solar Array 2B/4B',
      nameZh: '阿尔法双通道大面积柔性砷化镓光伏翼',
      status: 'MAX TRACKING',
      integrity: '98.7%',
      metrics: [
        { label: 'BUS POWER GENERATION', value: '124.8 kW', sub: '160V DC Regulated Bus' },
        { label: 'BAPTA ROTATION RATE', value: '1.00° / MIN', sub: 'Sun Tracking Beta: +14.2°' },
        { label: 'CELL TEMPERATURE', value: '-22.4 °C', sub: 'Active Radiator Cooling' },
        { label: 'BATTERY CHARGE STATE', value: '96.2%', sub: 'Lithium-Ion ORU Units (x24)' },
      ],
      desc: '双轴对日自动定向驱动机构（BAPTA）。双侧展开长度达 73 米，采用三结砷化镓光电电池，为全站生命维持与科学机柜提供主电力。',
    },
    propulsion: {
      tag: 'MOD-04 // ORBITAL ATTITUDE',
      name: 'Dual Hall-Effect Ion Thruster Unit',
      nameZh: '双通道霍尔效应离子电推进矢量舱',
      status: 'STANDBY // NOMINAL',
      integrity: '99.1%',
      metrics: [
        { label: 'XENON PROPELLANT', value: '184.2 KG', sub: 'Tank Pressure: 18.4 Bar' },
        { label: 'DISCHARGE VOLTAGE', value: '300 V', sub: 'Beam Current: 4.5 A' },
        { label: 'SPECIFIC IMPULSE (ISP)', value: '3,150 SEC', sub: 'Thrust: 180 mN per thruster' },
        { label: 'ORBIT RAISING PREDICTION', value: '+1.4 km / WEEK', sub: 'Counteracting Atmospheric Drag' },
      ],
      desc: '微波电离氙气电推进阵列。以极低工质消耗补偿热层微阻力带来的轨道高度衰减，维持空间站 408 公里平均运行轨道。',
    },
  }[activeModule] || null

  return (
    <div className="absolute inset-y-0 right-0 w-full sm:w-[420px] bg-[#0A0D14]/95 backdrop-blur-xl border-l border-white/15 p-6 z-30 flex flex-col justify-between shadow-[-20px_0_50px_rgba(0,0,0,0.8)] animate-in slide-in-from-right duration-300 select-none">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <span className="text-[9px] font-mono tracking-widest text-emerald-400 uppercase block">
              {data.tag}
            </span>
            <h3 className="text-lg font-black text-white tracking-tight uppercase mt-0.5">
              {data.name}
            </h3>
            <span className="text-xs text-zinc-400 font-sans block mt-0.5">{data.nameZh}</span>
          </div>

          <button
            onClick={() => {
              playClick()
              onClose()
            }}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between mt-4 p-2.5 rounded-xl bg-black/60 border border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono text-emerald-300 font-bold">{data.status}</span>
          </div>
          <div className="text-[10px] font-mono text-zinc-400">
            INTEGRITY: <strong className="text-white">{data.integrity}</strong>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {data.metrics.map((m, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
              <span className="text-[8px] font-mono text-zinc-400 uppercase block">{m.label}</span>
              <span className="text-xs font-mono font-bold text-white block">{m.value}</span>
              <span className="text-[8px] font-mono text-zinc-500 block truncate">{m.sub}</span>
            </div>
          ))}
        </div>

        {/* Technical Description */}
        <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] font-mono text-zinc-300 leading-relaxed">
          {data.desc}
        </div>
      </div>

      {/* Footer Diagnostic Actions */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
        <span className="text-zinc-500">BUS: MIL-STD-1553B</span>
        <button
          onClick={() => {
            playClick()
            onClose()
          }}
          className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all font-semibold"
        >
          CLOSE TELEMETRY
        </button>
      </div>
    </div>
  )
}
