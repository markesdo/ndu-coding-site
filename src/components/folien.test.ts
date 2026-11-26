import { describe, expect, it } from 'vitest';
import { aktuelleFolie, lageZurFolie, restText, runterUm, seitenAusgang, tasteSteuertFolien, tastenZiel, timerFuerT, weiter, zurueck } from './folien';

describe('weiter (→ im Beamer)', () => {
  const folie = { versteckteSchritte: 0, offeneAufloesung: false, naechsteFolie: true };

  it('springt erst zur Folie, wenn man noch im Seitenkopf darüber steht und sie schon im Bildschirm beginnt', () => {
    expect(weiter({ ...folie, lage: 'vor', versteckteSchritte: 2 })).toBe('hierhin');
  });

  // Audit 26.11.: Auf Tag 4 übersprang das erste → den ganzen Ablauf (y 1093–2783) und beide Hinweise.
  it('liest einen langen Seitenkopf erst zu Ende: Beginnt die Folie unter dem Bildschirm, einen Bildschirm weiter', () => {
    expect(weiter({ ...folie, lage: 'vor', zielUnterhalb: true, versteckteSchritte: 2 })).toBe('runter');
  });

  it('deckt dann den nächsten Schritt der Folie auf', () => {
    expect(weiter({ ...folie, versteckteSchritte: 2, offeneAufloesung: true })).toBe('schritt');
  });

  it('dann die Auflösung, bevor es zur nächsten Folie geht', () => {
    expect(weiter({ ...folie, offeneAufloesung: true })).toBe('aufloesung');
  });

  it('eine zu lange Folie erst zu Ende scrollen', () => {
    expect(weiter({ ...folie, restUnten: true })).toBe('runter');
  });

  it('dann die nächste Folie', () => {
    expect(weiter(folie)).toBe('folie');
  });

  // Audit 26.11.: Auf scrum sprang → von #planen auf #team und übersprang den Hinweis dazwischen.
  it('steht zwischen dieser und der nächsten Folie sichtbarer Text, erst einen Bildschirm weiter', () => {
    expect(weiter({ ...folie, zielUnterhalb: true })).toBe('runter');
    expect(weiter({ ...folie, zielUnterhalb: true, sprung: true })).toBe('sprung');
  });

  it('nach der letzten Folie die nächste Seite', () => {
    expect(weiter({ ...folie, naechsteFolie: false })).toBe('seite');
  });

  it('data-weiter: am Ende der Folie dorthin statt zur nächsten Folie oder Seite – erst nach Schritten und Rest', () => {
    expect(weiter({ ...folie, sprung: true })).toBe('sprung');
    expect(weiter({ ...folie, naechsteFolie: false, sprung: true })).toBe('sprung');
    expect(weiter({ ...folie, sprung: true, versteckteSchritte: 1 })).toBe('schritt');
    expect(weiter({ ...folie, sprung: true, restUnten: true })).toBe('runter');
  });

  it('data-ende auf einer verschobenen Folie (nur halb zu sehen): erst ausrichten, dann „Ende“', () => {
    expect(weiter({ ...folie, ende: true, verschoben: true })).toBe('hierhin');
  });

  // Review 2 #447: Eine ende-Folie, höher als der Bildschirm, lief runter → oben ausrichten → runter … ohne Ende.
  it('data-ende auf einer zu hohen Folie: ist ihre Unterkante zu sehen, gilt das Ende – kein neues Ausrichten', () => {
    expect(weiter({ ...folie, ende: true, verschoben: true, zuHoch: true })).toBe('ende');
    expect(weiter({ ...folie, ende: true, verschoben: true, zuHoch: true, restUnten: true })).toBe('runter');
  });

  it('data-ende: am Ende der Folie nichts mehr, auch wenn danach noch Folien oder Seiten kämen', () => {
    expect(weiter({ ...folie, ende: true })).toBe('ende');
    expect(weiter({ ...folie, naechsteFolie: false, ende: true })).toBe('ende');
    expect(weiter({ ...folie, ende: true, versteckteSchritte: 1 })).toBe('schritt');
  });

  // Audit 26.11. (NDU-75-Klasse): Unter der letzten Folie von Tag 4 (#abschluss) ging → zur nächsten Seite – die Folie
  // über dem Bildschirm galt als aktuell. Unter einer Folie handelt → nie für sie (keine Schritte, kein data-weiter).
  describe('unter einer Folie (Handout-Text nach ihr)', () => {
    const unter = { ...folie, lage: 'unter' as const, versteckteSchritte: 2, offeneAufloesung: true, sprung: true };

    it('zur nächsten Folie, sobald sie im Bildschirm beginnt – Schritte und data-weiter der Folie darüber zählen nicht', () => {
      expect(weiter(unter)).toBe('folie');
    });

    it('beginnt die nächste Folie erst unter dem Bildschirm: einen Bildschirm weiter', () => {
      expect(weiter({ ...unter, zielUnterhalb: true })).toBe('runter');
    });

    // Review #447: Am Seitenende unter einer ende-Folie leuchtete „Ende“ außerhalb des Bildschirms, → war verschluckt.
    it('unter einer ende-Folie am Seitenende: erst zurück auf sie, damit „Ende“ zu sehen ist', () => {
      expect(weiter({ ...unter, naechsteFolie: false, sprung: false, ende: true, seiteRestUnten: false })).toBe('hierhin');
    });

    it('nach der letzten Folie bis zum Seitenende, dann gilt ihr Ende', () => {
      expect(weiter({ ...unter, naechsteFolie: false, seiteRestUnten: true })).toBe('runter');
      expect(weiter({ ...unter, naechsteFolie: false, sprung: false })).toBe('seite');
      expect(weiter({ ...unter, naechsteFolie: false })).toBe('sprung');
    });
  });
});

describe('runterUm (Bildschirm weiter)', () => {
  it('einen Bildschirm unter der Kopfleiste, 48 px überlappend', () => {
    expect(runterUm({ fensterHoehe: 720, kopfleiste: 47, rest: 5000 })).toBe(625);
  });

  // Ragte die Folie ein Stück in den Bildschirm, zöge scroll-snap (proximity) sie hoch: Text davor wäre übersprungen.
  it('nie über den nächsten Halt hinaus: der steht dann genau am unteren Rand', () => {
    expect(runterUm({ fensterHoehe: 720, kopfleiste: 47, rest: 300 })).toBe(300);
    expect(runterUm({ fensterHoehe: 720, kopfleiste: 47, rest: -10 })).toBe(0);
  });
});

describe('lageZurFolie', () => {
  it('auf der Folie, davor (Seitenkopf) oder darunter (ganz über dem Bildschirm)', () => {
    expect(lageZurFolie({ top: 47, bottom: 720 }, 47)).toBe('auf');
    expect(lageZurFolie({ top: -600, bottom: 300 }, 47)).toBe('auf');
    expect(lageZurFolie({ top: 900, bottom: 1573 }, 47)).toBe('vor');
    expect(lageZurFolie({ top: -1400, bottom: 40 }, 47)).toBe('unter');
  });
});

describe('zurueck (← im Beamer)', () => {
  it('verdeckt zuerst den zuletzt gezeigten Schritt – auch auf der ersten Folie unter dem Seitenkopf', () => {
    expect(zurueck({ gezeigteSchritte: 1, vorherigeFolie: false, kopfDarueber: true })).toBe('schritt');
  });

  it('dann die vorige Folie', () => {
    expect(zurueck({ gezeigteSchritte: 0, vorherigeFolie: true, kopfDarueber: true })).toBe('folie');
  });

  // Audit 26.11.: Von tag-4#abschluss sprang ← auf #arbeitsfluss und übersprang #was-bauen-wir.
  it('unter einer Folie zurück auf sie selbst, nicht auf die davor – auch mit gezeigten Schritten', () => {
    expect(zurueck({ gezeigteSchritte: 2, vorherigeFolie: true, kopfDarueber: true, lage: 'unter' })).toBe('hierhin');
  });

  // Am Seitenende von tag-4 ist „Ende Tag 4“ nur noch halb zu sehen (Oberkante −239 px): ← richtet sie erst wieder aus.
  it('steht die Folie verschoben (Oberkante über der Kopfleiste), zurück auf sie selbst', () => {
    expect(zurueck({ gezeigteSchritte: 0, vorherigeFolie: true, kopfDarueber: true, lage: 'auf', verschoben: true })).toBe('hierhin');
    expect(zurueck({ gezeigteSchritte: 1, vorherigeFolie: true, kopfDarueber: true, lage: 'auf', verschoben: true })).toBe('hierhin');
  });

  it('im Seitenkopf vor der ersten Folie zählen deren Schritte nicht: an den Seitenanfang', () => {
    expect(zurueck({ gezeigteSchritte: 1, vorherigeFolie: false, kopfDarueber: true, lage: 'vor' })).toBe('anfang');
  });

  // Review #447: Nach vier Bildschirmen Seitenkopf sprang ← ganz an den Anfang.
  it('liegt der vorige Halt mehr als einen Bildschirm darüber, erst einen Bildschirm hoch', () => {
    expect(zurueck({ gezeigteSchritte: 0, vorherigeFolie: false, kopfDarueber: true, lage: 'vor', weitWeg: true })).toBe('hoch');
    expect(zurueck({ gezeigteSchritte: 0, vorherigeFolie: true, kopfDarueber: true, lage: 'unter', weitWeg: true })).toBe('hoch');
    expect(zurueck({ gezeigteSchritte: 0, vorherigeFolie: true, kopfDarueber: true, lage: 'auf', weitWeg: true })).toBe('folie');
  });

  // Review 2 #447: → hielt am Text zwischen zwei Folien an, ← übersprang ihn.
  it('steht zwischen der vorigen Folie und dieser sichtbarer Text, erst hoch (dorthin, wo → anhielt)', () => {
    expect(zurueck({ gezeigteSchritte: 0, vorherigeFolie: true, kopfDarueber: true, lage: 'auf', zwischenOben: true })).toBe('hoch');
    expect(zurueck({ gezeigteSchritte: 1, vorherigeFolie: true, kopfDarueber: true, lage: 'auf', zwischenOben: true })).toBe('schritt');
    expect(zurueck({ gezeigteSchritte: 0, vorherigeFolie: true, kopfDarueber: true, lage: 'auf' })).toBe('folie');
  });

  it('data-zurueck: am Anfang der Folie dorthin statt zur Folie davor – erst nach verdeckten Schritten', () => {
    expect(zurueck({ gezeigteSchritte: 0, vorherigeFolie: true, kopfDarueber: true, sprung: true })).toBe('sprung');
    expect(zurueck({ gezeigteSchritte: 0, vorherigeFolie: false, sprung: true })).toBe('sprung');
    expect(zurueck({ gezeigteSchritte: 1, vorherigeFolie: true, sprung: true })).toBe('schritt');
    expect(zurueck({ gezeigteSchritte: 0, vorherigeFolie: true, sprung: true, lage: 'unter' })).toBe('hierhin');
  });

  it('vor der ersten Folie an den Seitenanfang, danach die vorige Seite', () => {
    expect(zurueck({ gezeigteSchritte: 0, vorherigeFolie: false, kopfDarueber: true })).toBe('anfang');
    expect(zurueck({ gezeigteSchritte: 0, vorherigeFolie: false })).toBe('seite');
  });
});

describe('aktuelleFolie', () => {
  it('ist die letzte Folie, die die Kopfleiste erreicht hat', () => {
    expect(aktuelleFolie([48, 768, 1488], 48)).toBe(0);
    expect(aktuelleFolie([-672, 48, 768], 48)).toBe(1);
    expect(aktuelleFolie([-1300, -580, 48], 48)).toBe(2);
  });

  it('bleibt bei einer überlangen Folie, auch wenn die nächste schon näher an der Kopfleiste liegt', () => {
    expect(aktuelleFolie([-1152, 848], 48)).toBe(0);
  });

  it('im Seitenkopf über allen Folien die erste; ohne Folien -1', () => {
    expect(aktuelleFolie([300, 1000], 48)).toBe(0);
    expect(aktuelleFolie([], 48)).toBe(-1);
  });
});

describe('timerFuerT (Taste T)', () => {
  const aus = { sichtbar: true, laeuft: false };
  const verdeckt = { sichtbar: false, laeuft: false };

  it('nimmt den letzten sichtbaren Timer – Timer in noch verdeckten Schritten zählen nicht', () => {
    expect(timerFuerT([aus, aus, verdeckt, verdeckt])).toStrictEqual({ klick: 1, pausieren: [] });
  });

  it('pausiert den Timer des vorigen Schritts, wenn der nächste startet', () => {
    expect(timerFuerT([{ sichtbar: true, laeuft: true }, aus])).toStrictEqual({ klick: 1, pausieren: [0] });
  });

  it('pausiert den laufenden letzten Timer selbst, ohne andere anzufassen', () => {
    expect(timerFuerT([{ sichtbar: true, laeuft: true }, { sichtbar: true, laeuft: true }])).toStrictEqual({ klick: 1, pausieren: [] });
  });

  it('ohne sichtbaren Timer nichts', () => {
    expect(timerFuerT([verdeckt])).toBeUndefined();
    expect(timerFuerT([])).toBeUndefined();
  });
});

describe('restText', () => {
  it('zeigt Minuten und Sekunden, aufgerundet', () => {
    expect(restText(180_000)).toBe('3:00');
    expect(restText(61_001)).toBe('1:02');
    expect(restText(9_000)).toBe('0:09');
  });

  it('wird nie negativ', () => {
    expect(restText(-5_000)).toBe('0:00');
  });
});

describe('tasteSteuertFolien (Fokus nach dem Mausklick)', () => {
  const mit = (el: Parameters<typeof tastenZiel>[0], rest = {}) => tasteSteuertFolien({ ziel: tastenZiel(el), ...rest });

  it('blättert ohne fokussiertes Element und auf Knopf, Link und Auflösungs-Inhalt', () => {
    expect(mit(null)).toBe(true);
    expect(mit({ tagName: 'BUTTON' })).toBe(true);
    expect(mit({ tagName: 'A' })).toBe(true);
    expect(mit({ tagName: 'DIV' })).toBe(true);
  });

  it('blättert weiter, wenn ein Haken oder Knopf-Input nach dem Klick den Fokus hat', () => {
    for (const typ of ['checkbox', 'button', 'submit', 'reset', 'image', 'file', 'color', 'hidden']) {
      expect(mit({ tagName: 'INPUT', type: typ }), typ).toBe(true);
    }
  });

  it('blättert nicht beim Tippen in Textfeld, Textbereich, Auswahl, contenteditable', () => {
    expect(mit({ tagName: 'INPUT', type: 'text' })).toBe(false);
    expect(mit({ tagName: 'INPUT' })).toBe(false);
    expect(mit({ tagName: 'INPUT', type: 'password' })).toBe(false);
    expect(mit({ tagName: 'TEXTAREA' })).toBe(false);
    expect(mit({ tagName: 'SELECT' })).toBe(false);
    expect(mit({ tagName: 'MARK', isContentEditable: true })).toBe(false);
  });

  it('sperrt auch, wenn nur ein Vorfahre contenteditable ist, nicht aber bei contenteditable=false', () => {
    expect(mit({ tagName: 'SPAN', closest: (sel: string) => (sel.startsWith('[contenteditable]') ? {} : null) })).toBe(false);
    expect(mit({ tagName: 'SPAN', closest: () => null })).toBe(true);
  });

  it('lässt Radio und Regler die Pfeile behalten', () => {
    expect(mit({ tagName: 'INPUT', type: 'radio' })).toBe(false);
    expect(mit({ tagName: 'INPUT', type: 'range' })).toBe(false);
  });

  it('blättert nicht bei offenem Dialog, Vollbild, Wiederholung oder schon behandelter Taste', () => {
    expect(mit({ tagName: 'BUTTON' }, { dialogOffen: true })).toBe(false);
    expect(mit({ tagName: 'BUTTON' }, { vollbild: true })).toBe(false);
    expect(mit({ tagName: 'BUTTON' }, { wiederholt: true })).toBe(false);
    expect(mit({ tagName: 'BUTTON' }, { schonBehandelt: true })).toBe(false);
  });
});

// Review #447: Der Knopf „Weiter: …“ zeigte auf scrum#weiter-tag-4 „Backlog aus Issues“, → führte aber in den Abschluss von Tag 4.
describe('seitenAusgang (Knopf „Weiter: …“)', () => {
  const folien = [{}, { weiter: '/innolab/tag-4#abschluss' }, {}, {}];
  it('von der aktuellen Folie an das erste data-weiter oder data-ende, sonst die nächste Seite', () => {
    expect(seitenAusgang(folien, 0)).toStrictEqual({ art: 'weiter', ziel: '/innolab/tag-4#abschluss' });
    expect(seitenAusgang(folien, 1)).toStrictEqual({ art: 'weiter', ziel: '/innolab/tag-4#abschluss' });
    expect(seitenAusgang(folien, 2)).toStrictEqual({ art: 'seite' });
    expect(seitenAusgang([{}, { ende: true }], 0)).toStrictEqual({ art: 'ende' });
    expect(seitenAusgang([{}, {}], -1)).toStrictEqual({ art: 'seite' });
  });
});
