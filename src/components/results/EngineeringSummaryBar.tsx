import type { ClimateProfile, ProductSpec } from "@/types/quiz";

interface StampProps {
  label: string;
  value: string;
  detail: string;
  accent?: boolean;
}

/** A specification stamp — the block a submittal sheet carries along its head. */
function Stamp({ label, value, detail, accent = false }: StampProps) {
  return (
    <div
      className={
        accent
          ? "border-l-[3px] border-gold px-5 py-4"
          : "border-l border-white/20 px-5 py-4"
      }
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">{label}</p>
      <p className="spec-num mt-1.5 text-20p font-black tracking-tight text-white">{value}</p>
      <p className="mt-1 text-[11px] leading-snug text-stone-400">{detail}</p>
    </div>
  );
}

interface EngineeringSummaryBarProps {
  climate: ClimateProfile;
  spec: ProductSpec;
}

export function EngineeringSummaryBar({ climate, spec }: EngineeringSummaryBarProps) {
  return (
    <section className="bg-hardie-800">
      <div className="grid divide-y divide-white/20 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
        <Stamp
          label="Climate Zone"
          value={`${climate.zone}®`}
          detail={climate.zone === "HZ5" ? "Freeze/thaw engineered" : "Heat · humidity · UV engineered"}
        />
        <Stamp label="Fire Rating" value="CLASS A" detail="ASTM E136 non-combustible" />
        <Stamp label="Substrate Warranty" value="30 YR" detail="Non-prorated · transferable" accent />
        <Stamp
          label="Finish"
          value="COLORPLUS®"
          detail={`15-year finish warranty · ${spec.zone}® line`}
        />
      </div>
    </section>
  );
}
