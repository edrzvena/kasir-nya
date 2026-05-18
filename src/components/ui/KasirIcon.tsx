interface KasirIconProps {
  className?: string;
}

export default function KasirIcon({ className }: KasirIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Receipt body with zigzag torn bottom */}
      <path
        d="M4 2L20 2L20 20L18 18L16 20L14 18L12 20L10 18L8 20L6 18L4 20Z"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Item lines — mimics printed receipt text */}
      <path
        d="M7 7h10M7 10.5h6M7 14h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
