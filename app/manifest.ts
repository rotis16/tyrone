import type { MetadataRoute } from "next";

/** Installable as a PWA — web-first, no app store review cycle blocking v1. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lab Intelligence",
    short_name: "Lab Intel",
    description:
      "Understand your lab results in plain language and track each biomarker over time. Your results are stored only on your device.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2a78d6",
    icons: [],
  };
}
