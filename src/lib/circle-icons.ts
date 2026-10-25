// Central icon map for the circle cards / intros / watch pages.
// Astro templates render the real inline SVG through `<Icon name={circleIcon(circle.id)} />`;
// the React island on the homepage keeps using `circle.icon` (its emoji prop fallback).
export const CIRCLE_ICONS: Record<string, string> = {
  flutter: "simple-icons:flutter",
  "front-end": "lucide:layout-template",
  android: "simple-icons:android",
  backend: "lucide:server",
  cloud: "lucide:cloud",
  "computer-science": "lucide:cpu",
  cybersecurity: "lucide:shield-check",
  "data-science": "lucide:chart-scatter",
  embedded: "lucide:circuit-board",
  english: "lucide:languages",
  "game-dev": "simple-icons:unity",
  ios: "simple-icons:ios",
  media: "lucide:clapperboard",
  ui: "simple-icons:figma",
};

export function circleIcon(id: string): string {
  return CIRCLE_ICONS[id] ?? "lucide:book-open";
}
