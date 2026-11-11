// Ebene eines Knotens im Opportunity Solution Tree aus seiner Tiefe (0 = Outcome). Mit Momenten ist Tiefe 1 eine
// oberste Chance, die einen Moment der Experience Map wiedergibt (Torres S. 87, 91) – keine eigene Ebene über den
// Chancen, nur anders eingefärbt; alles darunter rückt eine Ebene tiefer, bis „Experiment“ (alles Tiefere bleibt Experiment).
const NAMEN = ['Outcome', 'Chance', 'Lösung', 'Experiment'] as const;

export function baumEbene(tiefe: number, momente: boolean): { name: string; klasse: string; stufe: number | null } {
  if (momente && tiefe === 1) return { name: 'Oberste Chance', klasse: 'em', stufe: null };
  const stufe = Math.min(momente && tiefe > 1 ? tiefe - 1 : tiefe, 3);
  return { name: NAMEN[stufe], klasse: `e${stufe}`, stufe };
}
