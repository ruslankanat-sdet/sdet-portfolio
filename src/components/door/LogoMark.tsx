interface LogoMarkProps {
  size?: number;
}

export function LogoMark({ size = 18 }: LogoMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M2 9L6 5L8 7L12 3M12 3H15M12 3V6"
        stroke="currentColor"
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={14} cy={13} r={2} stroke="currentColor" strokeWidth={1.5} fill="none" />
    </svg>
  );
}
