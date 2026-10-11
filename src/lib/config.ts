/* ============================================================
   BMTC SMART-ETM SYSTEM CONFIGURATION & CONSTANTS
   Central source of truth for timings, thresholds & fare stages
   ============================================================ */

export interface FareStop {
  fare: number;
  kn: string;
  en: string;
  stageCode?: string;
  highlight?: boolean;
}

export const BMTC_CONFIG = {
  route: {
    number: "335-E",
    originEn: "Majestic",
    originKn: "ಮೆಜೆಸ್ಟಿಕ್",
    destEn: "Electronic City",
    destKn: "ಇ-ಸಿಟಿ",
    via: "Corporation · MG Road · Halasuru · Indiranagar · Koramangala · Madiwala · Jayadeva · BTM Layout · Shivanahalli",
  },
  timings: {
    printDurationMs: 1250,
    autoResetDelayMs: 2800,
    undoCountdownSecs: 8,
    benchmarkTargetSecs: 4.0,
    legacyBaselineSecs: 12.4,
    holdToVoidMs: 650,
    bootDurationMs: 1400,
  },
  heuristics: [
    {
      id: "H1",
      number: 1,
      title: "Visibility of System Status",
      titleKn: "ವ್ಯವಸ್ಥೆಯ ಸ್ಥಿತಿಯ ಗೋಚರತೆ",
      targetElement: "status-strip",
      description:
        "The conductor always knows what the machine is doing: live battery percentage, real-time sync / offline queue indicator, GPS active stage chip, thermal printing progress bar, and 8-second undo countdown ring.",
      badge: "Real-time Feedback",
    },
    {
      id: "H2",
      number: 2,
      title: "Match Between System & Real World",
      titleKn: "ನೈಜ ಪ್ರಪಂಚ ಮತ್ತು ಸಿಸ್ಟಮ್ ಹೊಂದಾಣಿಕೆ",
      targetElement: "fare-ladder",
      description:
        "Uses authentic BMTC transit vernacular and bilingual Kannada/English destination signage (ಮಾದಿವಾಳ / ಮೆಜೆಸ್ಟಿಕ್), familiar rupee amounts, and physical tear-off thermal receipt that mimics actual mechanical ETMs.",
      badge: "Natural Metaphor",
    },
    {
      id: "H3",
      number: 3,
      title: "User Control and Freedom",
      titleKn: "ಬಳಕೆದಾರರ ನಿಯಂತ್ರಣ ಮತ್ತು ಸ್ವಾತಂತ್ರ್ಯ",
      targetElement: "undo-ring",
      description:
        "Instant 8-second Undo Ring allows immediate one-tap reversal if the passenger changes their mind or cash is short, avoiding paperwork or depot supervisor overrides.",
      badge: "Emergency Exit",
    },
    {
      id: "H4",
      number: 4,
      title: "Consistency and Standards",
      titleKn: "ಸ್ಥಿರತೆ ಮತ್ತು ಮಾನದಂಡಗಳು",
      targetElement: "pay-modes",
      description:
        "BMTC standard fare ladder increments (₹6, ₹12, ₹18, ₹25...), standardized UPI QR / Cash payment pill toggles, and official BMTC emerald transit branding consistent across all screens.",
      badge: "Platform Standards",
    },
    {
      id: "H5",
      number: 5,
      title: "Error Prevention",
      titleKn: "ದೋಷ ತಡೆಗಟ್ಟುವಿಕೆ",
      targetElement: "hold-void",
      description:
        "Destructive actions require intentional physical hold (650ms Hold-to-Void ring). Paper-out sensor locks printing before spool jams. Ergonomic thumb arc prevents mis-taps on jostling buses.",
      badge: "Mistake Proofing",
    },
    {
      id: "H6",
      number: 6,
      title: "Recognition Rather Than Recall",
      titleKn: "ನೆನಪಿಗಿಂತ ಗುರುತಿಸುವಿಕೆ",
      targetElement: "fare-tiles",
      description:
        "Destination name and exact fare are bundled directly on every single tile. Conductors don't have to memorize distance matrices or 4-digit depot stage codes.",
      badge: "Zero Mental Math",
    },
    {
      id: "H7",
      number: 7,
      title: "Flexibility and Efficiency of Use",
      titleKn: "ಹೊಂದಿಕೊಳ್ಳುವಿಕೆ ಮತ್ತು ದಕ್ಷತೆ",
      targetElement: "pax-pills",
      description:
        "Streamlined 3-tap flow issues 92% of tickets in under 3.3 seconds. Left-hand mode flips reachability for southpaw conductors; one-tap repeat passenger counts bypass numeric keypad entry.",
      badge: "Accelerators",
    },
    {
      id: "H8",
      number: 8,
      title: "Aesthetic and Minimalist Design",
      titleKn: "ಸರಳ ಮತ್ತು ಸುಂದರ ವಿನ್ಯಾಸ",
      targetElement: "device-screen",
      description:
        "Positive-polarity high contrast daylight interface with zero nested menus or secondary clutter. High legibility under direct glare of afternoon Karnataka sun (AAA contrast).",
      badge: "Focused Signal",
    },
    {
      id: "H9",
      number: 9,
      title: "Help Users Recognize & Recover from Errors",
      titleKn: "ದೋಷ ಗುರುತಿಸುವಿಕೆ ಮತ್ತು ಚೇತರಿಕೆ",
      targetElement: "paper-sheet",
      description:
        "When paper runs out or GPS signal dips in Bangalore underpasses, clear visual bottom sheets explain the exact issue and offer one-tap recovery (offline local queue / roll replacement guide).",
      badge: "Clear Recovery",
    },
    {
      id: "H10",
      number: 10,
      title: "Help and Documentation",
      titleKn: "ಸಹಾಯ ಮತ್ತು ದಾಖಲಾತಿ",
      targetElement: "sim-tools",
      description:
        "Interactive Nielsen Heuristic inspector, ⌘K command palette, keyboard shortcut cheat sheet, and conductor live speed benchmark gauge provide continuous on-the-job training.",
      badge: "Built-in Pedagogy",
    },
  ],
  themes: [
    {
      id: "midnight",
      name: "Midnight Depot",
      tagline: "Default high-tech conductor darkroom",
      canvas: "#090c12",
      panel: "#0f141d",
      accent: "#3b82f6",
    },
    {
      id: "heritage",
      name: "BMTC Heritage",
      tagline: "Official BMTC red-and-cream livery",
      canvas: "#140a0b",
      panel: "#1e1013",
      accent: "#dc2626",
    },
    {
      id: "phosphor",
      name: "Phosphor Terminal",
      tagline: "Retro CRT amber & green transport terminal",
      canvas: "#0a0800",
      panel: "#141008",
      accent: "#ffb000",
    },
    {
      id: "daylight",
      name: "Daylight Depot",
      tagline: "High-contrast daylight & projection mode",
      canvas: "#f8fafc",
      panel: "#ffffff",
      accent: "#2563eb",
    },
  ],
};

export const FARE_LADDER: FareStop[] = [
  { fare: 6, kn: "ಶಿವನೊಹಳ್ಳಿ", en: "Shivanahalli", stageCode: "ST-08" },
  { fare: 12, kn: "ಬಿಟಿಎಸ್", en: "BTM Layout", stageCode: "ST-09" },
  { fare: 18, kn: "ಮಾದಿವಾಳ", en: "Madiwala ★", stageCode: "ST-10", highlight: true },
  { fare: 25, kn: "ಜಯದೇವ", en: "Jayadeva", stageCode: "ST-11" },
  { fare: 31, kn: "ಇಂದಿರಾನಗರ", en: "Indiranagar", stageCode: "ST-12" },
  { fare: 38, kn: "ಹಲಸೂರು", en: "Halasuru", stageCode: "ST-13" },
  { fare: 44, kn: "ಎಂ.ಜಿ. ರಸ್ತೆ", en: "MG Road", stageCode: "ST-14" },
  { fare: 51, kn: "ಮೆಜೆಸ್ಟಿಕ್", en: "Majestic", stageCode: "ST-15" },
];

export const STAGES = [
  { code: "ST-10", name: "Jayanagar" },
  { code: "ST-11", name: "BTM Layout" },
  { code: "ST-12", name: "Koramangala" },
  { code: "ST-13", name: "Madiwala" },
  { code: "ST-14", name: "Electronic City" },
];
