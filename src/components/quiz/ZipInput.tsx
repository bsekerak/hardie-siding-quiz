"use client";

import { useMemo } from "react";
import { Icon } from "@/components/ui/Icon";
import { buildClimateProfile, isValidZip } from "@/data/climate";

interface ZipInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function ZipInput({ value, onChange, onSubmit }: ZipInputProps) {
  const valid = isValidZip(value);
  const preview = useMemo(() => (valid ? buildClimateProfile(value) : null), [valid, value]);

  return (
    <div className="max-w-md">
      <label htmlFor="zip" className="mb-2 block text-sm font-semibold text-slateCharcoal">
        ZIP code
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slateCharcoal-muted">
          <Icon name="MapPin" className="h-5 w-5" />
        </span>
        <input
          id="zip"
          name="zip"
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={5}
          value={value}
          placeholder="e.g. 55416"
          aria-describedby="zip-help"
          onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 5))}
          onKeyDown={(event) => {
            if (event.key === "Enter" && valid) onSubmit();
          }}
          className="w-full rounded border border-stone-300 bg-white py-4 pl-12 pr-4 text-lg font-semibold tracking-[0.12em] text-slateCharcoal placeholder:font-normal placeholder:tracking-normal placeholder:text-stone-400 focus:border-hardie-500"
        />
      </div>
      <p id="zip-help" className="mt-2 text-[13px] text-slateCharcoal-muted">
        Used only to derive your climate requirements. Nothing is transmitted anywhere.
      </p>

      {preview ? (
        <div className="mt-5 border-l-2 border-hardie-500 bg-stone-100 p-4">
          <p className="eyebrow">Derived from your ZIP</p>
          <p className="mt-1.5 text-16p font-bold text-slateCharcoal">
            {preview.zone}® product line — {preview.regionLabel}
          </p>
          <ul className="mt-2 space-y-1">
            {preview.drivers.slice(0, 2).map((driver) => (
              <li key={driver} className="text-[13px] leading-relaxed text-slateCharcoal-light">
                {driver}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
