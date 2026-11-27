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
      'tag-4#abschluss | Vorsicht beim Erzählen: FitCounter hat Lichaw fiktionalisier',
      'tag-4#origin-beispiel | Nicht behaupten: Bland empfehle dieselbe Reihenfolge. Bei ih',
      'methoden/geschaeftsmodell#vor-experiment | Vorsicht beim Erzählen: Torres sagt, die meisten Teams haben',
      'methoden/geschaeftsmodell#dreieck | Vorsicht beim Erzählen: „Über die Hälfte aller App-Entwickle',
      'methoden/experiment#annahmen-der-idee | Vorsicht beim Erzählen: „Wochen“ ist unsere Schätzung; Torre',
      'methoden/experiment#karte | Vorsicht beim Erzählen: Thomke spricht von „two versions of',
      'methoden/experiment#test-arten | Vorsicht beim Erzählen: „bis mittel“ gilt nur für den Aufste',
      'methoden/experiment#karte-e1 | Nicht behaupten: Bland nenne den Eintrag einen mittleren Bel',
      'methoden/experiment#lernkarte | Vorsicht beim Erzählen: „Verlässlichkeit: mittel“ ist unsere',
      'methoden/story-map#schritt-schneiden | Nicht behaupten: „Slice 1 hat selten mehr als ein, zwei Stic',
      'methoden/usage-story#nahe-am-ende | Vorsicht beim Erzählen: Die Peak-End-Regel nur benennen (Tag',
      'methoden/usage-story#nahe-am-ende | Nicht behaupten: Lichaw sage, ein Satz reiche als Boom. Sie',
      'methoden/scrum#foliensatz | Vorsicht beim Erzählen: „3-5-3“ (Foliensatz 42) ist eine Mer',
      'methoden/scrum#foliensatz | Nicht behaupten: Royce habe den Wasserfall empfohlen (Folien',
      'methoden/scrum#abweichungen | Vorsicht beim Erzählen: Eine Woche ist nach dem Guide erlaub',
      'tag-5#debrief | Vorsicht beim Erzählen: „Verlässlichkeit: mittel“ auf den Le',
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
    expect(h.filter((x) => !x.quelle.trim()).map((x) => x.wo)).toStrictEqual([]);
    expect(h.flatMap((x) => `${x.text} ${x.quelle}`.match(/Kursregel/g) ?? [])).toStrictEqual([]);
  });
});

describe('Tag 4: drei korrigierte Sachfehler', () => {
  it('tag-4#origin-beispiel: Bland empfiehlt nicht dieselbe Reihenfolge; Pain zuerst ist Entscheidung des Kurses', () => {
    const f = folie('/innolab/tag-4', 'origin-beispiel');
    expect(f).not.toContain('dieselbe Reihenfolge empfiehlt Bland');
    expect(handout(f)).toContain('Bland baut eine Landingpage anders auf: oben das Wertversprechen, darunter die Handlung, erst darunter Pains, Lösung und Gains ({BLAND}, S. 261). Unser Aufsteller beginnt mit dem Pain, weil er im Vorbeigehen wirken muss – das ist eine Entscheidung des Kurses.');
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
    expect(NOTIZEN['/innolab/methoden/scrum'].abweichungen.live).toContain('Nur ein Sprint (eine Woche erlaubt der Guide); Daily schriftlich in Linear.');
    expect(JSON.stringify(NOTIZEN['/innolab/methoden/scrum'].abweichungen.live)).not.toMatch(/Ein Sprint, eine Woche/);
    const punkt = METHODEN.find((m) => m.slug === 'scrum')?.pruefliste?.find((p) => p.id === 'scrum-abweichungen')?.text;
    expect(punkt).toBe('Unter „Abweichungen vom Scrum Guide“ stehen mindestens: drei Produkte in einem Takt, nur ein Sprint ohne nächsten danach, schriftliches Daily.');
  });
});

describe('Tag 4: Setzungen des Kurses auf den Seiten markiert', () => {
  it('story-map: „ein, zwei Stickies“ ist Faustregel des Kurses', () => {
    expect(handout(folie('/innolab/methoden/story-map', 'schritt-schneiden'))).toContain('Slice 1 hat selten mehr als ein, zwei Stickies pro Aktivität – eine Faustregel des Kurses, nicht Pattons.');
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
