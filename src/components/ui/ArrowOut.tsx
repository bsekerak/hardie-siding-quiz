/**
 * The diagonal arrow James Hardie uses on every card link. Matched to their
 * geometry: 24x24 box, 1.5 stroke, rounded caps.
 */
export function ArrowOut({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 20.25L19.91 4.34"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.91003 4.33997H19.91V19.34"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
