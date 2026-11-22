import { UserRound } from "lucide-react";

const AVATAR_TONES = [
  "bg-[#f0f0f0] text-[#717171]",
  "bg-[#ebebeb] text-[#595959]",
  "bg-[#f7f7f7] text-[#6a6a6a]",
  "bg-[#eeeeee] text-[#484848]",
];

function toneFor(id: string): string {
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
