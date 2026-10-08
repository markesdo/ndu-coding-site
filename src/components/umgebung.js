// Entscheidungslogik des Umschalters Codespace / Laptop macOS / Laptop Windows (UmgebungWahl.astro).
// Bewusst schlichtes JavaScript ohne Abhängigkeiten: UmgebungWahl.astro bettet diese Datei als Text in sein
// Inline-Skript ein (ohne die Wörter „export“), damit die Wahl vor dem ersten Zeichnen feststeht. Die Tests
// importieren dieselbe Datei – es gibt nur eine Fassung der Logik.
//
// Zustand: { umgebung: 'codespace' | 'lokal', os: 'mac' | 'windows' }. Gespeichert und per ?umgebung= gesetzt
// wird eine Wahl: 'codespace' | 'mac' | 'windows'.

/** @typedef {{ umgebung: 'codespace' | 'lokal', os: 'mac' | 'windows' }} Zustand */
/** @typedef {'codespace' | 'mac' | 'windows'} Wahl */

/** @param {unknown} w @returns {w is Wahl} */
export function istWahl(w) {
  return w === 'codespace' || w === 'mac' || w === 'windows';
}

// Betriebssystem raten: früher gespeicherte OS-Wahl (Schlüssel ndu-os), sonst der Browser.
/** @param {string | null} alt @param {string} userAgent @returns {'mac' | 'windows'} */
export function osRaten(alt, userAgent) {
  if (alt === 'mac' || alt === 'windows') return alt;
  return /Windows/i.test(userAgent) ? 'windows' : 'mac';
}

// „Codespace“ lässt das OS stehen – der Installationsteil im Setup zeigt trotzdem das passende System.
/** @param {Zustand} zustand @param {Wahl} wahl @returns {Zustand} */
export function waehle(zustand, wahl) {
  return wahl === 'codespace' ? { umgebung: 'codespace', os: zustand.os } : { umgebung: 'lokal', os: wahl };
}

// Reihenfolge: ?umgebung= in der Adresse, dann gespeicherte Wahl, sonst Laptop mit geratenem OS (ab Tag 2 der Standard).
/**
 * @param {{ query: string | null, gespeichert: string | null, alt: string | null, userAgent: string }} quellen
 * @returns {Zustand}
 */
export function startZustand(quellen) {
  var os = osRaten(quellen.alt, quellen.userAgent);
  var wahl = istWahl(quellen.query) ? quellen.query : istWahl(quellen.gespeichert) ? quellen.gespeichert : os;
  return wahl === 'codespace' ? { umgebung: 'codespace', os: os } : { umgebung: 'lokal', os: wahl };
}

// Nur-OS-Umschalter (nurLaptop, z. B. im Setup-Abschnitt „lokal“): ändert nur das System, nicht die Umgebung.
/** @param {Zustand} zustand @param {'mac' | 'windows'} os @returns {Zustand} */
export function waehleOs(zustand, os) {
  return { umgebung: zustand.umgebung, os: os };
}

// Was ein Nur-OS-Knopf speichert: Im Laptop-Modus die Wahl selbst (ndu-umgebung), sonst nur das OS (ndu-os),
// damit eine Codespace-Wahl erhalten bleibt.
/** @param {Zustand} zustand @param {'mac' | 'windows'} os @returns {{ schluessel: string, wert: string }} */
export function speicherOs(zustand, os) {
  return zustand.umgebung === 'lokal' ? { schluessel: 'ndu-umgebung', wert: os } : { schluessel: 'ndu-os', wert: os };
}

/** @param {Zustand} zustand @param {Wahl} wahl */
export function gedrueckt(zustand, wahl) {
  return wahl === 'codespace' ? zustand.umgebung === 'codespace' : zustand.umgebung === 'lokal' && zustand.os === wahl;
}

// Zustand, in dem ein Block mit data-nur=… sichtbar ist. mac/windows hängen nur am OS, nicht an der Umgebung.
/** @param {Zustand} zustand @param {string} nur @returns {Zustand} */
export function zeigeBlock(zustand, nur) {
  if (nur === 'codespace' || nur === 'lokal') return { umgebung: nur, os: zustand.os };
  if (nur === 'mac' || nur === 'windows') return { umgebung: zustand.umgebung, os: nur };
  return zustand;
}
