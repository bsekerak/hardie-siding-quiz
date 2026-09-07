import { ButtonLink, CtaArrow } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-2 text-32p font-black tracking-tight text-slateCharcoal">
        That page isn&apos;t part of the guide
      </h1>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-slateCharcoal-muted">
        Head back to the start, or jump straight into the questions.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/" variant="secondary">
          Back home
        </ButtonLink>
        <ButtonLink href="/quiz">
          Start your siding plan
          <CtaArrow />
        </ButtonLink>
      </div>
    </div>
  );
}
