// Frame-Name auf dem Team-Board → Miro-Frame-ID (für den Deep Link mit moveToWidget). Die IDs sind nicht geheim:
// Ohne die Board-Adresse (MIRO_BOARD_URL, nur auf Vercel) führen sie nirgendwohin.
// Der Name steht genau so im Frame-Titel auf dem Board und in <MiroFrame name="…"> bzw. <MiroLink name="…">; ein Test
// prüft, dass jeder Name aus den Seiten hier steht und jeder Eintrag hier auf einer Seite benutzt wird (sonst raus). Neuer Frame auf dem Board → ID hier eintragen (Miro: Frame anklicken, „Copy link“,
// die Zahl hinter moveToWidget=).
export const MIRO_FRAMES: Readonly<Record<string, string>> = {
  'Start hier · So arbeitet ihr auf diesem Board': '3458764687728125024',
  'T1 · 1 · Experience Map': '3458764687728125026',
  'T1 · 2 · Problem-Rahmen & Produkt-Brief': '3458764687406008349',
  'T1 · 3 · Annahmen-Map': '3458764687406008351',
  'T1 · 4 · Interviewleitfaden': '3458764687406008350',
  'T1 · 5 · Interview-Snapshots (Hausaufgabe)': '3458764687728446144',
  'T2 · 1 · Experience Map': '3458764687841241005',
  'T2 · 2 · Opportunity Solution Tree': '3458764687841227908',
  'T2 · 3 · Ziel-Chance': '3458764687841534117',
  'T2 · 4 · How Might We': '3458764687841534441',
  'T2 · 5 · Ideation': '3458764687841681125',
  'T3 · 1 · Kundenprofil & Value Map': '3458764687841769171',
  'T3 · 2 · Annahmen der Idee': '3458764687894872786',
  'T3 · 3 · Story Map': '3458764687894872787',
  'T4 · 1 · Teamaufstellung & DoD': '3458764687968670113',
  'T4 · 2 · Backlog-Reihenfolge': '3458764687968819129',
  'T4 · 3 · Wertkurve & ERRC': '3458764687968975610',
};
