import { describe, expect, it } from 'vitest';
import { quellenAusGlob } from './begleiter';
import { NOTIZEN } from '../data/begleiter';
import { METHODEN } from '../components/methoden';

// Audit Tag 4 (27.11.2026, tag4-vorbereitung/begleiter-vorsicht-tag4.md): Vorsicht-Hinweise im Begleiter. Form: ein
// kern-Eintrag, der mit „Vorsicht beim Erzählen:“ oder „Nicht behaupten:“ beginnt, mit Quelle. concept-story (zwei Hinweise)
// folgt in einem eigenen PR; prototyp-spike hat keinen. Die Hinweise stehen am Ende der kern-Liste ihrer Folie.
const quellen = quellenAusGlob(import.meta.glob('/src/pages/innolab/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);
const seite = (p: string) => quellen[p] ?? '';
const folie = (p: string, id: string) => {
  const q = seite(p);
  const a = q.indexOf(`<h2 id="${id}">`);
  return a < 0 ? '' : q.slice(q.lastIndexOf('<Folie', a), q.indexOf('</Folie>', a));
};
const handout = (f: string) => (f.includes('<div class="nur-handout">') ? f.slice(f.indexOf('<div class="nur-handout">')) : f.slice(f.indexOf('class="nur-handout"')));
const beamer = (f: string) => (f.includes('class="nur-handout"') ? f.slice(0, f.indexOf('class="nur-handout"')) : f);

const SEITEN = ['tag-4', 'methoden/geschaeftsmodell', 'methoden/experiment', 'methoden/story-map', 'methoden/usage-story', 'methoden/scrum', 'tag-5'];
const VORSICHT = /^(Vorsicht beim Erzählen|Nicht behaupten): /;

const hinweise = () =>
  SEITEN.flatMap((s) =>
    Object.entries(NOTIZEN[`/innolab/${s}`] ?? {}).flatMap(([id, n]) =>
      (n.kern ?? []).filter((k) => VORSICHT.test(k.text)).map((k) => ({ wo: `${s}#${id}`, text: k.text, quelle: k.quelle })),
    ),
  );

describe('Begleiter Tag 4: Vorsicht-Hinweise', () => {
  it('jeder Hinweis steht an seiner Folie, keiner fehlt, keiner doppelt', () => {
    expect(hinweise().map((h) => `${h.wo} | ${h.text.slice(0, 60).trimEnd()}`)).toStrictEqual([
      'tag-4#was-bauen-wir | Vorsicht beim Erzählen: Alle Zahlen und Zitate der Kaffeebar',
      'tag-4#slice-im-baum | Vorsicht beim Erzählen: Torres hängt keine Slices in ihren B',
      'tag-4#slice-im-baum | Vorsicht beim Erzählen: Patton kennt keinen Opportunity Solu',
      'tag-4#slice-im-baum | Vorsicht beim Erzählen: „derselbe Satz wie im Brief“ gilt fü',
      'tag-4#slice-im-baum | Vorsicht beim Erzählen: „Zurück in den Baum“ heißt bei Torre',
      'tag-4#abschluss | Vorsicht beim Erzählen: FitCounter hat Lichaw fiktionalisier',
      'tag-4#origin-beispiel | Nicht behaupten: Bland empfehle dieselbe Reihenfolge. Bei ih',
      'methoden/geschaeftsmodell#vor-experiment | Vorsicht beim Erzählen: Torres sagt, die meisten Teams haben',
      'methoden/geschaeftsmodell#dreieck | Vorsicht beim Erzählen: „Über die Hälfte aller App-Entwickle',
      'methoden/experiment#annahmen-der-idee | Vorsicht beim Erzählen: „Wochen“ ist unsere Schätzung; Torre',
      'methoden/experiment#karte | Vorsicht beim Erzählen: Thomke spricht von „two versions of',
      'methoden/experiment#vorher-entscheiden | Vorsicht beim Erzählen: 30, 10 und 5 hat der Kurs gesetzt –',
      'methoden/experiment#test-arten | Vorsicht beim Erzählen: „bis mittel“ gilt nur für den Aufste',
      'methoden/experiment#test-arten | Vorsicht beim Erzählen: Der Concierge der Kaffeebar – Hallen',
      'methoden/experiment#karte-e1 | Nicht behaupten: Bland nenne den Eintrag einen mittleren Bel',
      'methoden/experiment#lernkarte | Vorsicht beim Erzählen: „Verlässlichkeit: mittel“ ist unsere',
      'methoden/story-map#varianten | Vorsicht beim Erzählen: Die Farben (blau = Detail, orange =',
      'methoden/story-map#verschlafen-slice | Vorsicht beim Erzählen: Das rote Sticky „Desired Outcome“ in',
      'methoden/story-map#schritt-reihen | Vorsicht beim Erzählen: Der Name vorn auf dem Sticky („Baris',
      'methoden/story-map#schritt-erkunden | Vorsicht beim Erzählen: Die Farben (blau = Detail, orange =',
      'methoden/story-map#schritt-schneiden | Nicht behaupten: „Slice 1 hat selten mehr als ein, zwei Stic',
      'methoden/usage-story#nahe-am-ende | Vorsicht beim Erzählen: Die Peak-End-Regel nur benennen (Tag',
      'methoden/usage-story#nahe-am-ende | Nicht behaupten: Lichaw sage, ein Satz reiche als Boom. Sie',
      'methoden/scrum#foliensatz | Vorsicht beim Erzählen: „3-5-3“ (Foliensatz 42) ist eine Mer',
      'methoden/scrum#foliensatz | Nicht behaupten: Royce habe den Wasserfall empfohlen (Folien',
      'methoden/scrum#abweichungen | Vorsicht beim Erzählen: Eine Woche ist nach dem Guide erlaub',
      'tag-5#debrief | Vorsicht beim Erzählen: „Verlässlichkeit: mittel“ auf Lernka',
    ]);
  });

  it('die Kernaussage jedes Hinweises steht so im Begleiter', () => {
    const t = (wo: string) => hinweise().filter((h) => h.wo === wo).map((h) => h.text).join(' ');
    expect(t('tag-4#origin-beispiel')).toContain('Bei ihm steht oben das Wertversprechen, darunter die Handlung, erst darunter Pains, Lösung und Gains (S. 261).');
    expect(t('methoden/experiment#karte-e1')).toContain('Bei ihm ist er „relatively weak“ (S. 52).');
    expect(t('methoden/scrum#abweichungen')).toContain('Die Abweichung ist, dass es nur einen Sprint gibt und kein nächster sofort folgt.');
    expect(t('methoden/usage-story#nahe-am-ende')).toContain('sie datiert sie falsch auf die 1970er');
    expect(t('methoden/scrum#foliensatz')).toContain('ist eine Merkhilfe, kein Begriff des Guides');
  });

  it('die Hinweise stehen am Ende der kern-Liste ihrer Folie', () => {
    const vorne = SEITEN.flatMap((s) =>
      Object.entries(NOTIZEN[`/innolab/${s}`] ?? {}).filter(([, n]) => {
        const k = (n.kern ?? []).map((x) => VORSICHT.test(x.text));
        const erster = k.indexOf(true);
        return erster >= 0 && k.slice(erster).includes(false);
      }).map(([id]) => `${s}#${id}`));
    expect(vorne).toStrictEqual([]);
  });

  it('test-arten: „bis mittel“ nur für den Aufsteller, die Landingpage online bleibt eher schwach', () => {
    const t = hinweise().find((h) => h.wo === 'methoden/experiment#test-arten')?.text;
    expect(t).toContain('„bis mittel“ gilt nur für den Aufsteller');
    expect(t).toContain('Die Landingpage online bleibt „eher schwach“');
  });

  it('jeder Hinweis hat eine Quelle und kein Etikett „Kursregel“', () => {
    const h = hinweise();
    expect(h.filter((x) => !(x.quelle ?? '').trim()).map((x) => x.wo)).toStrictEqual([]);
    expect(h.flatMap((x) => `${x.text} ${x.quelle}`.match(/Kursregel/g) ?? [])).toStrictEqual([]);
  });
});

describe('Tag 4: drei korrigierte Sachfehler', () => {
  it('tag-4#origin-beispiel: Bland empfiehlt nicht dieselbe Reihenfolge; Pain zuerst ist die Lesart des Kurses von Lichaws Bogen', () => {
    const f = folie('/innolab/tag-4', 'origin-beispiel');
    expect(f).not.toContain('dieselbe Reihenfolge empfiehlt Bland');
    expect(handout(f)).toContain('– das ist die Lesart des Kurses von Lichaws Bogen der Origin Story: erst das Problem, dann die Hürde, dann sieht die Person den Wert ({LICHAW}, Abb. 4.3). Bland baut eine Landingpage anders auf: oben das Wertversprechen, darunter die Handlung, erst darunter Pains, Lösung und Gains ({BLAND}, S. 261).');
    expect(f).not.toContain('Entscheidung des Kurses');
    const k = (NOTIZEN['/innolab/tag-4']['origin-beispiel'].kern ?? []).map((x) => `${x.text} ${x.quelle}`).join(' ');
    expect(k).toContain('Pain zuerst ist die Lesart des Kurses von Lichaws Bogen der Origin Story (Abb. 4.3)');
    expect(k).toContain('ist die Lesart des Kurses von Lichaws Bogen (Abb. 4.3).');
    expect(k).not.toContain('Entscheidung des Kurses');
    // Die Folie behält die Reihenfolge des Aufstellers.
    expect(beamer(f)).toContain('<p class="folie-satz">Erst der Pain, dann das Produkt, dann die Antwort auf die Hürde.</p>');
    expect(JSON.stringify(NOTIZEN['/innolab/tag-4']['origin-beispiel'])).not.toMatch(/Dieselbe Reihenfolge empfiehlt Bland/i);
  });

  it('experiment#karte-e1: der Eintrag ist bei Bland schwach, „mittel“ ist die Einordnung des Kurses', () => {
    const f = folie('/innolab/methoden/experiment', 'karte-e1');
    expect(f).not.toContain('darum ein mittlerer Beleg');
    expect(handout(f)).toContain('Ein Eintrag ist ein kleiner Einsatz und bei Bland ein schwacher Beleg, „relatively weak evidence of interest“ ({BLAND}, S. 52); weil der Aufsteller in der echten Situation steht, ordnen wir ihn als mittel ein.');
    // Dieselbe Einordnung in der Tabelle „Vier Tests“ und auf der Lernkarte.
    const ta = folie('/innolab/methoden/experiment', 'test-arten');
    expect(beamer(ta)).toContain('<td>trägt sich ein</td><td>online eher schwach, Aufsteller bis mittel</td>');
    expect(beamer(ta)).not.toContain('<td>eher schwach bis mittel</td>');
    expect(handout(ta)).toContain('„Bis mittel“ gilt nur für den Aufsteller; die Landingpage online bleibt eher schwach: Bland nennt die E-Mail „a rather weak strength of evidence“ ({BLAND}, S. 262); mittel wird es bei uns, weil der Aufsteller in der echten Situation steht.');
    expect(folie('/innolab/methoden/experiment', 'lernkarte')).toContain('Verlässlichkeit: mittel – echte Situation, aber ein kleiner Einsatz.');
  });

  it('scrum#abweichungen: eine Woche ist im Guide erlaubt, abweichend ist der einzige Sprint', () => {
    const f = folie('/innolab/methoden/scrum', 'abweichungen');
    expect(f).not.toContain('Ein einziger Sprint, eine Woche');
    expect(beamer(f)).toContain('<li data-schritt><strong>Nur ein Sprint</strong> – eine Woche erlaubt der Guide, aber kein nächster folgt.</li>');
    expect(handout(f)).toContain('Sprints sind „fixed length events of one month or less“, und „A new Sprint starts immediately after the conclusion of the previous Sprint“ (S. 7). Eine Woche liegt also im Rahmen des Guides; abweichend ist, dass es bei uns nur einen gibt');
    expect(seite('/innolab/methoden/scrum')).not.toMatch(/einziger Sprint (von einer|, eine) Woche/i);
    expect(NOTIZEN['/innolab/methoden/scrum'].abweichungen.live).toContain('Nur ein Sprint (eine Woche ist erlaubt); Daily dazwischen schriftlich in Linear.');
    expect(JSON.stringify(NOTIZEN['/innolab/methoden/scrum'].abweichungen.live)).not.toMatch(/Ein Sprint, eine Woche/);
    const punkt = METHODEN.find((m) => m.slug === 'scrum')?.pruefliste?.find((p) => p.id === 'scrum-abweichungen')?.text;
    expect(punkt).toBe('Unter „Abweichungen vom Scrum Guide“ stehen mindestens: drei Produkte in einem Takt, nur ein Sprint ohne nächsten danach, schriftliches Daily.');
  });
});

describe('Tag 4: Setzungen des Kurses auf den Seiten markiert', () => {
  // Review #489 (Markus): Herkunftsvermerke („Faustregel des Kurses, nicht Pattons“) stehen nicht auf Folie oder Handout,
  // sondern im Begleiter; das Handout nennt die Regel schlicht.
  it('story-map: „ein, zwei Stickies“ schlicht im Handout, Faustregel des Kurses im Begleiter', () => {
    const h = handout(folie('/innolab/methoden/story-map', 'schritt-schneiden'));
    expect(h).toContain('Slice 1 hat selten mehr als ein, zwei Stickies pro Aktivität.');
    expect(h).not.toMatch(/Faustregel|nicht Pattons/);
    const kern = JSON.stringify(NOTIZEN['/innolab/methoden/story-map']['schritt-schneiden'].kern);
    expect(kern).toContain('„Slice 1 hat selten mehr als ein, zwei Stickies pro Aktivität“ sei Pattons Regel – es ist eine Faustregel des Kurses.');
  });
  it('usage-story: ein Satz als Boom ist Übertrag des Kurses', () => {
    expect(handout(folie('/innolab/methoden/usage-story', 'nahe-am-ende'))).toContain('Lichaw nennt eine Animation; dass auch ein einziger Satz reicht, ist ein Übertrag des Kurses');
  });
  it('experiment: „Wochen“ ist unsere Schätzung', () => {
    expect(handout(folie('/innolab/methoden/experiment', 'annahmen-der-idee'))).toContain('„Wochen“ auf der Folie ist unsere Schätzung, eine Dauer nennt Torres dort nicht.');
  });
  it('geschaeftsmodell: blinder Fleck nach Torres’ Wortlaut, nicht „bei vielen Teams“', () => {
    const f = folie('/innolab/methoden/geschaeftsmodell', 'vor-experiment');
    expect(f).not.toContain('bei vielen Teams der blinde Fleck');
    expect(beamer(f)).toContain('<strong>Oft vergessen:</strong> Kosten und Einnahmen – die meisten Teams haben einen blinden Fleck, manche genau diesen.');
  });
  it('keine Seite trägt dafür das Etikett „Kursregel“', () => {
    for (const [p, id] of [['story-map', 'schritt-schneiden'], ['usage-story', 'nahe-am-ende'], ['experiment', 'annahmen-der-idee'], ['geschaeftsmodell', 'vor-experiment']]) {
      expect(folie(`/innolab/methoden/${p}`, id), `${p}#${id}`).not.toContain('Kursregel');
    }
  });
});

describe('experiment#vorher-entscheiden: Warum 30, warum ab 10 (Markus 27.11.)', () => {
  const n = NOTIZEN['/innolab/methoden/experiment']['vorher-entscheiden'];
  const kern = (n.kern ?? []).map((k) => k.text).join(' ');
  it('was die Quellen sagen, wörtlich und mit Seite', () => {
    expect(kern).toContain('„This is a subjective decision. … You want to test your assumption with as few people as possible (as it will be faster) but with the number of people that still gives your team the information they need to act on the data.“');
    expect(kern).toContain('„How many people would convince you this assumption is more known? That’s the negotiation you are having as a team.“');
    expect(kern).toContain('„Be explicit from the get-go about how many people you will test with when defining your success criteria.“');
    expect(kern).toContain('„The more data points you have, the better. Five quotes from personal customer interviews is obviously weaker than 100 quotes.“ (S. 56)');
    expect(kern).toContain('„For early stage validation we recommend 10% –15%“ der Aufrufe (S. 262)');
  });
  it('was der Kurs gesetzt hat und warum: 30, ein Drittel, halbe Schwelle', () => {
    const k = (n.kern ?? []).find((x) => x.text.startsWith('So kommt die Kaffeebar auf 30, 10 und 5.'));
    expect(k?.text).toContain('Gezählt wird nur, wer bei Schlange wählt (Automat oder Aufsteller)');
    expect(k?.text).toContain('5: die halbe Schwelle');
    expect(k?.quelle).toContain('Setzung des Kurses');
  });
  it('Fragen „Warum 30? Warum ab 10?“ und „Wie finden wir unsere eigenen Zahlen?“', () => {
    const f = Object.fromEntries((n.fragen ?? []).map((x) => [x.frage, x.antwort]));
    expect(f['Warum 30? Warum ab 10?']).toContain('Keine Quelle schreibt eine Zahl vor');
    expect(f['Wie finden wir unsere eigenen Zahlen?']).toContain('Die Schwelle als Anzahl, nicht als Prozent (S. 144–145)');
    // Passt zur Verständnisfrage „8 von 30“: dasselbe Band.
    expect(n.verstaendnis?.antwort).toContain('8 liegt im Band 5–9');
  });
});

describe('experiment#test-arten: Concierge ausführlich (Markus 27.11.)', () => {
  const n = NOTIZEN['/innolab/methoden/experiment']['test-arten'];
  const kern = (titel: string) => (n.kern ?? []).find((k) => k.text.startsWith(`${titel}:`));
  it('Bewertung, Ablauf, Messgrößen, Paarungen und Fall mit Blands Wortlaut und Seiten', () => {
    expect(kern('Concierge – Bewertung')?.text).toContain('Kosten 1 von 5 Punkten, Aufbau 2, Laufzeit 3, Belegstärke 5');
    expect(kern('Concierge – Bewertung')?.text).toContain('„Concierge is not ideal for scaling a product or business.“');
    expect(kern('Concierge – Ablauf')?.text).toContain('„Create a board to track the orders and steps needed.“');
    expect(kern('Concierge – Ablauf')?.quelle).toContain('S. 249');
    expect(kern('Concierge – gemessen, und warum stark')?.text).toContain('„because you are asking for feedback after the value was delivered to the customer, instead of a hypothetical situation“');
    expect(kern('Concierge – davor und danach')?.text).toContain('Simple Landing Page („to collect interest in your concierge experiment“)');
    expect(kern('Concierge – davor und danach')?.text).toContain('„Once they’ve conducted a few presales, B2C services can deliver the value manually to refine it before scaling.“');
    expect(kern('Concierge – Blands Fall, Realtor.com')?.quelle).toContain('S. 252–253');
    expect(kern('Concierge – Kaffeebar')?.quelle).toContain('Kaffeebar: Kurs');
  });
  it('Fragen für den Raum, und der Verweis von #vorher-entscheiden', () => {
    const f = Object.fromEntries((n.fragen ?? []).map((x) => [x.frage, x.antwort]));
    expect(f['Ist Concierge nicht einfach das Produkt ohne App?']).toContain('es ist ein Test auf Zeit, kein Start');
    expect(f['Warum Concierge und nicht gleich Wizard of Oz?']).toContain('„Unlike Concierge, the people involved aren’t visible to the customer“ (Bland, S. 284)');
    const v = NOTIZEN['/innolab/methoden/experiment']['vorher-entscheiden'].fragen?.find((x) => x.frage === 'Was heißt „ab 10 → Concierge“ genau?');
    expect(v?.antwort).toContain('Begleiter zur Folie „Vier Tests zur Auswahl“');
  });
  it('Karte E1: Handout und Folie beschreiben denselben Concierge', () => {
    const f = folie('/innolab/methoden/experiment', 'karte-e1');
    expect(f).not.toContain('per Nachricht vorbestellen');
    expect(handout(f)).toContain('ein Concierge: ein paar Morgen nimmt jemand an der Hallentür Bestellungen von Hand an und gibt sie an die Bar.');
  });
});

describe('Review #487: Wortlaut und Etiketten', () => {
  // Alle Folien, an denen dieser PR Begleiter-Einträge hinzugefügt hat: kein Etikett „Kursregel“ in kern und fragen.
  const BERUEHRT: [string, string[]][] = [
    ['tag-4', ['was-bauen-wir', 'abschluss', 'origin-beispiel']],
    ['methoden/geschaeftsmodell', ['vor-experiment', 'dreieck']],
    ['methoden/experiment', ['annahmen-der-idee', 'karte', 'test-arten', 'karte-e1', 'lernkarte', 'vorher-entscheiden']],
    ['methoden/story-map', ['schritt-schneiden']],
    ['methoden/usage-story', ['nahe-am-ende']],
    ['methoden/scrum', ['foliensatz', 'abweichungen']],
    ['tag-5', ['debrief']],
  ];
  it('kein „Kursregel“ in kern und fragen der berührten Folien', () => {
    const treffer = BERUEHRT.flatMap(([s, ids]) => ids.flatMap((id) => {
      const n = NOTIZEN[`/innolab/${s}`]?.[id];
      expect(n, `${s}#${id}`).toBeDefined();
      const texte = [...(n?.kern ?? []).flatMap((k) => [k.text, k.quelle]), ...(n?.fragen ?? []).flatMap((f) => [f.frage, f.antwort])];
      return texte.filter((t) => /Kursregel/.test(t ?? '')).map((t) => `${s}#${id}: ${(t ?? '').slice(0, 50)}`);
    }));
    expect(treffer).toStrictEqual([]);
  });
  it('karte-e1-Handout: die Grenze als Setzung des Kurses', () => {
    const f = folie('/innolab/methoden/experiment', 'karte-e1');
    expect(f).not.toContain('Kursregel');
    expect(handout(f)).toContain('als Setzung des Kurses liegt sie bei etwa der halben Schwelle');
  });
  it('Intuit im Handout wie bei Thomke: „two versions of the software“, keine „zwei Knöpfe“', () => {
    const f = folie('/innolab/methoden/experiment', 'karte');
    expect(f).not.toContain('zwei Knöpfe');
    expect(handout(f)).toContain('bot „two versions of the software“ an – eine mit der Option „Pay employees first“, eine mit „Do set-up first“');
  });
  it('tag-5#debrief: der Hinweis gilt nur für Lernkarte E1', () => {
    const t = hinweise().find((h) => h.wo === 'tag-5#debrief')?.text ?? '';
    expect(t).toContain('auf Lernkarte E1');
    expect(t).not.toMatch(/Lernkarten|E2/);
  });
  it('Concierge der Kaffeebar: „ein paar Morgen“, wie auf der Folie', () => {
    const n = NOTIZEN['/innolab/methoden/experiment']['test-arten'];
    const concierge = (n.kern ?? []).filter((k) => /Concierge/.test(k.text) && /Kaffeebar/.test(k.text)).map((k) => k.text);
    expect(concierge.length).toBeGreaterThan(1);
    for (const t of concierge) expect(t).not.toContain('drei Morgen');
    expect(folie('/innolab/methoden/experiment', 'karte-e1')).toContain('ein paar Morgen nimmt jemand an der Hallentür Bestellungen von Hand an');
  });
});
