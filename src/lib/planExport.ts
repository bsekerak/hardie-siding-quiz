import { formatCurrency, formatRange } from "@/lib/finance";
import type { QuizAnswers, SidingPlan } from "@/types/quiz";

/**
 * Renders the finished plan as plain text so a homeowner can save it, print it
 * or paste it directly into an email to a contractor.
 */
export function planToText(plan: SidingPlan, answers: QuizAnswers, paletteIndex = 0): string {
  const lines: string[] = [];
  const rule = "=".repeat(64);

  lines.push("YOUR JAMES HARDIE SIDING PLAN");
  lines.push(rule);
  lines.push(`Generated: ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })}`);
  lines.push(`ZIP: ${plan.climate.zip}  |  Region: ${plan.climate.regionLabel}`);
  lines.push("");

  lines.push("WHERE YOU ARE");
  lines.push("-".repeat(64));
  lines.push(plan.stageAction.headline);
  lines.push(plan.stageAction.summary);
  lines.push(`NEXT STEP: ${plan.stageAction.nextMilestone}`);
  if (plan.diagnosis) {
    lines.push("");
    lines.push(`CONDITION READ: ${plan.diagnosis}`);
  }
  lines.push("");

  lines.push(`CLIMATE: ${plan.climate.zone}`);
  lines.push("-".repeat(64));
  lines.push(plan.climate.zoneHeadline);
  plan.climate.drivers.forEach((driver) => lines.push(`  * ${driver}`));
  lines.push("");

  lines.push("ENGINEERED PRODUCT SPECIFICATION");
  lines.push("-".repeat(64));
  lines.push(`Primary profile : ${plan.spec.primary.name}`);
  lines.push(`Texture         : ${plan.spec.primary.texture}`);
  lines.push(`Exposure        : ${plan.spec.primary.exposure}`);
  lines.push(`Product line    : ${plan.spec.zone} (${plan.spec.primary.productLine})`);
  if (plan.spec.accent) {
    lines.push(`Accent profile  : ${plan.spec.accent.name}`);
    lines.push(`Accent location : ${plan.spec.accentPlacement ?? "Per elevation"}`);
  }
  lines.push(`Finish          : ColorPlus(R) Technology factory finish`);

  lines.push(`Trim            : ${plan.spec.trim.brand} ${plan.spec.trim.product}`);
  lines.push(`Trim material   : ${plan.spec.trim.material}, ${plan.spec.trim.thickness}`);
  lines.push(`Install method  : ${plan.spec.install.method}`);
  lines.push(`Installer note  : ${plan.spec.install.contractorNote}`);
  lines.push(`Gutters         : ${plan.spec.gutters.label}`);
  if (plan.spec.gutters.downspout) {
    lines.push(`Downspouts      : ${plan.spec.gutters.downspout}`);
  }
  lines.push("");
  lines.push("Water management requirements:");
  plan.spec.waterManagement.forEach((item) => lines.push(`  * ${item}`));
  lines.push("");

  lines.push("CURATED COLORPLUS PALETTES");
  lines.push("-".repeat(64));
  plan.palettes.forEach((palette, index) => {
    const marker = index === paletteIndex ? "  <-- SELECTED" : "";
    lines.push(`${index + 1}. ${palette.name}${marker} — ${palette.tagline}`);
    lines.push(`   Body   : ${palette.body.name} (${palette.body.hex})`);
    lines.push(`   Trim   : ${palette.trim.name} (${palette.trim.hex})`);
    lines.push(`   Accent : ${palette.accent.name} (${palette.accent.hex})`);
    lines.push("");
  });

  lines.push("INVESTMENT RANGE");
  lines.push("-".repeat(64));
  lines.push(`Estimated wall area   : ${plan.cost.wallAreaSqFt.toLocaleString()} sq ft`);
  lines.push(`Siding system         : ${formatRange(plan.cost.sidingLow, plan.cost.sidingHigh)}`);
  plan.cost.lineItems.forEach((item) => {
    lines.push(`  ${item.label.padEnd(38)} ${formatRange(item.low, item.high)}`);
  });
  lines.push(`TOTAL PROJECT RANGE   : ${formatRange(plan.cost.totalLow, plan.cost.totalHigh)}`);
  lines.push(
    `Est. monthly payment  : ${formatCurrency(plan.cost.monthlyLow)} – ${formatCurrency(
      plan.cost.monthlyHigh,
    )} at ${(plan.cost.financeApr * 100).toFixed(2)}% over ${plan.cost.financeTermMonths} months`,
  );
  lines.push("");

  lines.push("HIDDEN COSTS AUDIT — CONFIRM EACH IN WRITING");
  lines.push("-".repeat(64));
  plan.audit.forEach((item) => {
    lines.push(`[ ] (${item.severity.toUpperCase()}) ${item.label}`);
    lines.push(`    ${item.detail}`);
  });
  lines.push("");

  lines.push("CONTRACTOR CONVERSATION SHEET");
  lines.push("-".repeat(64));
  plan.contractorQuestions.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.question}`);
    lines.push(`   Why it matters: ${item.whyItMatters}`);
    lines.push(`   A good answer : ${item.goodAnswer}`);
    lines.push("");
  });

  lines.push("YOUR INPUTS");
  lines.push("-".repeat(64));
  lines.push(`Stage: ${answers.stage ?? "n/a"}`);
  lines.push(`Home built: ${answers.homeAge ?? "n/a"} | Current siding: ${answers.currentSiding ?? "n/a"}`);
  lines.push(`Style: ${answers.archStyle ?? "n/a"} | Height: ${answers.height ?? "n/a"} | Scope: ${answers.scope ?? "n/a"}`);
  lines.push(`Priorities: ${answers.priorities.join(", ") || "n/a"}`);
  lines.push(`Staying: ${answers.timeline ?? "n/a"} | Installer: ${answers.installer ?? "n/a"} | Gutters: ${answers.gutters ?? "n/a"}`);
  lines.push("");
  lines.push(rule);
  lines.push(
    "Cost figures are directional planning estimates, not a quote. Color swatches are screen approximations — confirm against physical samples. Verify code, permit and insurance requirements locally.",
  );

  return lines.join("\n");
}

/** Triggers a client-side download of the plan without any server round-trip. */
export function downloadPlan(plan: SidingPlan, answers: QuizAnswers, paletteIndex = 0): void {
  const blob = new Blob([planToText(plan, answers, paletteIndex)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `hardie-siding-plan-${plan.climate.zip || "draft"}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
