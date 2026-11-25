import Image from "next/image";

export function clientAvatarUrl(id: string): string {
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(id)}`;
}

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
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const SIZES = {
  sm: { box: "size-10", px: 40 },
  md: { box: "size-16", px: 64 },
  lg: { box: "size-[4.5rem]", px: 72 },
  xl: { box: "size-24", px: 96 },
} as const;

export function ClientAvatar({ id, size = "md", className = "" }: ClientAvatarProps) {
  const { box, px } = SIZES[size];
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full ${box} ${toneFor(id)} ${className}`}
      aria-hidden
    >
      {/* DiceBear serves SVG; skip the optimizer (it rejects SVG by default). */}
      <Image src={clientAvatarUrl(id)} alt="" width={px} height={px} unoptimized className="size-full" />
    </div>
  );
}
