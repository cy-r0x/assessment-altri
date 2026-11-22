import { UserRound } from "lucide-react";

export const AVATAR_TONES = [
  "bg-[#ffe8ec] text-[#c13515]",
  "bg-[#e8f1ff] text-[#428bff]",
  "bg-[#e6f4ea] text-[#008a05]",
  "bg-[#f0f0f0] text-[#595959]",
  "bg-[#fff0e8] text-[#b35c1e]",
  "bg-[#efe8ff] text-[#6b4fbb]",
] as const;

export function toneFor(id: string): string {
  let hash = 0;
  for (const ch of id) hash = (hash + ch.charCodeAt(0)) % AVATAR_TONES.length;
  return AVATAR_TONES[hash] ?? AVATAR_TONES[0];
}

type ClientAvatarProps = {
  id: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = {
  sm: { box: "size-10", icon: 18 },
  md: { box: "size-14", icon: 26 },
  lg: { box: "size-20", icon: 36 },
} as const;

export function ClientAvatar({ id, size = "md", className = "" }: ClientAvatarProps) {
  const { box, icon } = SIZES[size];
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full ${box} ${toneFor(id)} ${className}`}
      aria-hidden
    >
      <UserRound size={icon} strokeWidth={1.75} />
    </div>
  );
}
