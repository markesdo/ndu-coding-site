import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/methoden/annahmen.astro (Tag 1, 13:15–14:00).
// Seiten: Torres = Seitenmarker der Quellen-Datei (wie auf der Kursseite zitiert); Bland TBI gedruckt = PDF − 16;
// Cagan Inspired gedruckt = PDF − 22; Mom Test gedruckt = PDF + 1.
export const NOTIZEN_ANNAHMEN: Record<string, Notiz> = {
  warum: {
    live: [
      'Portland erzählen: gute Absicht, viel Geld, falsches Produkt',
      'Niemand hat die Annahme „kleine Wohnungen helfen den meisten“ geprüft',
      'Zwei Denkfehler: Confirmation Bias, Escalation of Commitment',
      'Annahmen testen geht schneller als Ideen testen – und man verliebt sich weniger',
      'Euer Brief von heute Vormittag steckt voller solcher Annahmen',
    ],
    ueberleitung: 'Wie findet man die gefährlichste Annahme? Mit zwei Fragen pro Annahme – das ist die Map.',
    kern: [
      {
        text: 'Stadt und Bauträger trafen Annahmen darüber, was verdrängte Familien als Wohnung brauchen, und keiner von beiden kam auf die Idee, sie zu prüfen. Gebaut wurden vor allem Ein- und Zweizimmerwohnungen, die meisten Familien hatten vier oder mehr Personen. Torres: Jedes Produktteam hat das schon erlebt – Zeit, Energie und Geld in das falsche Produkt gesteckt.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 116',
      },
      {
        text: 'Confirmation Bias: Wir suchen eher bestätigende als widerlegende Belege und merken uns, was unsere Sicht stützt. Escalation of Commitment: Je mehr wir in eine Idee investieren, desto stärker hängen wir an ihr. Produktteams sind besonders anfällig, weil sie ihre Ideen gegenüber Stakeholdern verteidigen müssen und sich dabei noch fester binden.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 116–117',
      },
      {
        text: 'Statt ganzer Ideen testet man die Annahmen, die stimmen müssen, damit die Idee funktioniert. Wer sie ausdrücklich aufzählt, kann gezielt nach bestätigenden und widerlegenden Belegen suchen. Annahmen-Tests sind meist schneller als Ideen-Tests; im Original: „The less time we invest in an idea, the less likely we are to fall in love with it.“',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 117',
      },
      {
        text: 'Das größte Hindernis ist nicht das Testen, sondern überhaupt zu bemerken, welche Annahmen man trifft. Deshalb gibt das Kapitel Techniken, um versteckte Annahmen sichtbar zu machen (Story Map, Pre-Mortem, Pfade im Opportunity Solution Tree, mögliche Schäden).',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 117–128',
      },
    ],
    geschichte: {
      text: 'Torres liest eines Morgens einen Zeitungsartikel über ein Wohnprojekt in Portland, Oregon. Die Stadt hatte jahrzehntelang eine Politik verfolgt, die viele Familien aus dem historisch Schwarzen Viertel verdrängte. Um das wiedergutzumachen, steckte sie Millionen in ein Gebäude mit Eigentumswohnungen, die nur verdrängte Familien kaufen durften, unter Marktpreis, mit Steuererleichterungen für den Bauträger. Jahre später, lange nachdem das Haus voll sein sollte, waren die meisten Wohnungen nicht verkauft. Am Ende musste die Stadt sie auf dem freien Markt verkaufen lassen. Der Grund: Gebaut wurden fast nur Ein- und Zweizimmerwohnungen, weil Stadt und Bauträger glaubten, so den meisten Familien zu helfen. Die meisten Familien hatten aber vier oder mehr Mitglieder. Beide Seiten freuten sich über positives Feedback und übersahen das negative. Torres: Zig Millionen Steuergeld, kaum Wirkung – das falsche Produkt für das richtige Ziel.',
      quelle: 'Teresa Torres, Continuous Discovery Habits, S. 115–116',
    },
    zusatz: [
      {
        titel: 'Hintergrund Portland: N/NE Preference Policy',
        text: 'Torres nennt das Projekt nicht beim Namen. Die Portland Mercury berichtet 2018 über Portlands „N/NE Preference Policy“, die aus Nord- und Nordost-Portland verdrängten Menschen Vorrang bei Wohnungen gibt, und verweist auf einen Bericht der Oregonian von 2016: Ein früher Versuch, kleine Eigentumswohnungen über dieses Programm zu verkaufen, stieß auf kein Interesse. Dass es dasselbe Projekt wie bei Torres ist, ist naheliegend, aber nicht belegt – so auch erzählen.',
        quelle: 'Dirk VanderHart, Portland Mercury, 28.02.2018: https://www.portlandmercury.com/news/2018/02/28/19706866/portlands-trying-to-bring-displaced-residents-back-to-their-old-neighborhoods',
      },
    ],
    fragen: [
      {
        frage: 'Ist das nicht einfach normale Risikoanalyse?',
        antwort: 'Ähnlich, aber kleiner und schneller: Jede Annahme wird ein einzelner, prüfbarer Satz, sortiert nach Wichtigkeit und Beleg, und die riskanteste wird sofort getestet (Torres S. 117, 129–130).',
      },
      {
        frage: 'Warum nicht gleich die ganze Idee testen, z. B. mit einem A/B-Test?',
        antwort: 'Dauert zu lange, besonders bei mehreren Ideen. Annahmen-Tests sind schneller und schützen vor Escalation of Commitment (Torres S. 117).',
      },
    ],
  },

  worum: {
    live: [
      'Zwei Fragen pro Annahme: Wie wichtig? Welcher Beleg?',
      'Wichtig heißt: Ist sie falsch, fällt die Idee um, der Rest wird egal',
      'Oben rechts zuerst testen, oben links den Beleg hinterfragen',
      'Schnell und relativ sortieren, nicht exakt',
      'Heute Kundschaft und Problem, Lösungs-Annahmen an Tag 3',
    ],
    ueberleitung: 'Damit ihr beim Sammeln keine Art von Risiko überseht, gibt es vier Arten von Annahmen.',
    kern: [
      {
        text: 'x-Achse Beleg: links, wer relevante, beobachtbare und aktuelle Belege vorlegen kann; rechts, wer keine hat und sie erst erzeugen muss. y-Achse Wichtigkeit: oben, was für den Erfolg absolut kritisch ist – im Original: „if that hypothesis is proven wrong, your business idea will fail and all other hypotheses become irrelevant.“ Unten, was man nicht als Erstes testen würde.',
        quelle: 'David J. Bland & Alexander Osterwalder, Testing Business Ideas, S. 38',
      },
      {
        text: 'Oben links heißt bei Bland „Share“: mit dem Team teilen und den Beleg hinterfragen, ob er wirklich trägt – nicht einfach abhaken. Oben rechts heißt „Experiment“: Daraus entstehen die nächsten Experimente.',
        quelle: 'David J. Bland & Alexander Osterwalder, Testing Business Ideas, S. 38',
      },
      {
        text: 'Assumptions Mapping ist eine Teamübung: Wünschbarkeits-, Machbarkeits- und Wirtschaftlichkeits-Hypothesen werden explizit gemacht und nach Wichtigkeit und Beleg priorisiert. Jede radikal neue Idee braucht einen „leap of faith“ – wichtige, unbewiesene Teile, die das Geschäft tragen oder brechen. Bland gibt an, die Übung sei von Gothelf & Seiden („Lean UX“) adaptiert.',
        quelle: 'David J. Bland & Alexander Osterwalder, Testing Business Ideas, S. 36',
      },
      {
        text: 'Torres empfiehlt, zuerst den Beleg einzuschätzen, dann die Wichtigkeit. Die Übung muss nicht präzise sein: Man ordnet relativ zur vorigen Annahme ein. Schnelle Teams (höchstens zehn Minuten pro Idee) schneiden genauso gut ab wie langsame; im Original: „So, save yourself some time, and go fast.“ Wenn alles oben rechts klebt, ist das okay – wichtig ist nur die relative Lage.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 129–130',
      },
      {
        text: 'Getestet wird nicht der ganze Quadrant oben rechts, sondern die zwei, drei Annahmen ganz oben rechts in der Ecke – die wichtigsten mit dem schwächsten Beleg, Blands „leap of faith“-Annahmen.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 130',
      },
    ],
    fragen: [
      {
        frage: 'Was, wenn fast alles oben rechts landet?',
        antwort: 'Normal. Torres: Es zählt nur die Lage relativ zueinander; ihr startet mit den zwei, drei ganz in der Ecke (S. 130).',
      },
      {
        frage: 'Warum heute keine Annahmen über die Lösung?',
        antwort: 'Lösungs-Annahmen (bestellt jemand im Gehen, rechnet es sich) lassen sich im Interview kaum prüfen. Die kommen an Tag 3 in eine eigene Map pro Idee (Torres Kap. 9–10); heute zählt, was die Interviews bis Tag 2 klären können.',
      },
      {
        frage: 'Ist die Achse nicht gespiegelt gegenüber anderen Vorlagen?',
        antwort: 'Bei Bland und Torres steht „kein Beleg“ rechts und oben rechts wird zuerst getestet; die Folie folgt beiden Büchern (Bland S. 38, Torres S. 129).',
      },
    ],
  },

  arten: {
    live: [
      'Vier Fragen: wollen sie es, können wir es, trägt es sich, kommen sie damit zurecht',
      'Am Kaffeebar-Beispiel je eine Annahme durchgehen',
      'Teams haben meist eine Lieblingsart und einen blinden Fleck',
      'Bland hat drei Arten, Cagan vier, Torres fünf: dazu „Kann es schaden?“',
      'Zeitungs-Test als schnelle Ethik-Frage',
    ],
    ueberleitung: 'Jetzt habt ihr die Annahmen – wie belegt sie sind, hängt davon ab, was als Beleg zählt.',
    kern: [
      {
        text: 'Bland unterscheidet drei Arten (adaptiert von Larry Keeley, Doblin Group und IDEO): Desirable – „Do they want this?“ (Risiko: Markt zu klein, zu wenige wollen das Wertversprechen, Kundschaft nicht erreichbar oder zu halten), Feasible – „Can we do this?“ (Ressourcen, Aktivitäten, Partner nicht zu managen oder zu skalieren), Viable – „Should we do this?“ (nicht mehr Umsatz als Kosten).',
        quelle: 'David J. Bland & Alexander Osterwalder, Testing Business Ideas, S. 32',
      },
      {
        text: 'Bland gibt eine Reihenfolge vor: Wünschbarkeit zuerst erkunden, Machbarkeit als Zweites, Wirtschaftlichkeit als Drittes. Er empfiehlt verschiedenfarbige Stickies pro Art und genau eine Hypothese pro Sticky.',
        quelle: 'David J. Bland & Alexander Osterwalder, Testing Business Ideas, S. 34–35, 37',
      },
      {
        text: 'Cagan nennt vier Risiken, die moderne Teams angehen, bevor sie entscheiden, etwas zu bauen: Value risk (kaufen oder nutzen Kund*innen es?), Usability risk (finden Nutzer*innen sich zurecht?), Feasibility risk (können die Entwickler*innen es mit Zeit, Können und Technik bauen?), Business viability risk (funktioniert es für Vertrieb, Marketing, Finanzen, Recht?). Die Meinung der Produktmanagerin reicht dafür nicht; man braucht Belege.',
        quelle: 'Marty Cagan, Inspired, S. 24, 165',
      },
      {
        text: 'Torres führt fünf Kategorien: Desirability, Viability, Feasibility (auch: erlaubt es Recht, Security, Kultur?), Usability (auch: ist es barrierefrei?) und Ethical – kann es schaden? Diese fünfte sei bei vielen Teams „grossly underdeveloped“. Fragen dazu: Welche Daten sammeln wir, wie nutzen wir sie, wer bleibt außen vor, setzen wir Geld, Zeit, Internet voraus, wie könnten Trolle das missbrauchen?',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 118, 126–127',
      },
      {
        text: 'Zeitungs-Test: Wenn eine große Zeitung auf der Titelseite über die Lösung berichten würde, samt eurer internen Gespräche, der gesammelten Daten und wer davon profitiert – wäre das gut? Wenn nicht, warum nicht? Und: Viele Teams verwechseln Wünschbarkeit mit Bedienbarkeit; nur weil etwas bedienbar ist, will es noch niemand.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 127–128, 132',
      },
    ],
    fragen: [
      {
        frage: 'Warum nicht Torres’ fünf Arten, wenn Ethik so wichtig ist?',
        antwort: 'Die Werkstatt arbeitet mit Cagans vier; die Schadens-Frage stellt ihr zusätzlich beim Sammeln (Kursentscheidung, Torres S. 118, 126–128). Eine Ethik-Annahme ordnet ihr dort ein, wo sie das Produkt bedroht.',
      },
      {
        frage: 'Wo ist der Unterschied zwischen wünschenswert und bedienbar?',
        antwort: 'Wünschenswert: Wollen sie es überhaupt? Bedienbar: Kommen sie damit zurecht, wenn sie es wollen? Ein Produkt kann leicht bedienbar und trotzdem ungewollt sein (Torres S. 132).',
      },
      {
        frage: 'Ist „Kaffee schmeckt gut“ eine Annahme?',
        antwort: 'Ja, wünschenswert. Ob sie wichtig ist, entscheidet die Map: Fällt das Produkt um, wenn sie falsch ist?',
      },
    ],
  },

  beleg: {
    live: [
      'Zeile für Zeile: Meinung gegen Tatsache, sagen gegen tun',
      'Testsituation verändert Verhalten',
      'E-Mail hinterlassen kostet nichts, vorbestellen schon',
      'Werkstatt-Skala: noch keiner – gesagt – erzählt – getan',
      'Interviews schaffen höchstens „erzählt“, „getan“ erst ab Tag 3',
    ],
    ueberleitung: 'Wie das zusammen aussieht, zeigt die Map der Kaffeebar.',
    kern: [
      {
        text: 'Beleg ist, womit ihr Hypothesen stützt oder widerlegt: Daten aus Recherche oder Experimenten, Fakten, in vielen Formen (Zitate, Verhalten, Conversion, Bestellungen, Käufe), schwach oder stark. Wie stark ein Beleg ist, entscheidet, wie verlässlich er eine Hypothese stützt oder widerlegt.',
        quelle: 'David J. Bland & Alexander Osterwalder, Testing Business Ideas, S. 52',
      },
      {
        text: 'Vier Prüfpunkte: Meinungen („I would…“, „I think … is important“) gegen Fakten („Last week I …“, „In that situation I usually …“); was Menschen sagen gegen was sie tun – beobachtbares Verhalten sagt künftiges Verhalten gut voraus; Laborsituation gegen echte Situation – am verlässlichsten ist, was Menschen tun, wenn sie nicht wissen, dass getestet wird; kleine Investition (E-Mail-Anmeldung) gegen große (vorab bezahlen, den beruflichen Ruf aufs Spiel setzen).',
        quelle: 'David J. Bland & Alexander Osterwalder, Testing Business Ideas, S. 52',
      },
      {
        text: 'Torres überträgt das auf Annahmen-Tests: Ziel ist, eine Annahme auf der Map von rechts nach links zu schieben. Wie im Interview zählt, was Menschen in einem bestimmten Kontext tatsächlich tun, nicht was sie allgemein denken oder zu tun glauben. Ein guter Test simuliert eine Situation, in der sich jemand gemäß der Annahme verhält – oder eben nicht.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 135',
      },
      {
        text: 'Darum bringt das Interview „erzählt“: Fitzpatricks zweite Regel lautet „Ask about specifics in the past instead of generics or opinions about the future“ – also nach dem letzten konkreten Mal fragen statt nach „würdest du“.',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 13',
      },
      {
        text: 'Die vierstufige Skala der Werkstatt (noch keiner, gesagt, erzählt, getan) ist eine Vereinfachung des Kurses nach Blands Tabelle; sie steht so nicht im Buch.',
        quelle: 'Kursergänzung nach Bland & Osterwalder, Testing Business Ideas, S. 52',
      },
    ],
    zusatz: [
      {
        titel: 'New Coke: Testsituation gegen echte Situation',
        text: 'Coca-Cola ersetzte am 23. April 1985 die alte Rezeptur durch eine süßere, nachdem sie in Geschmackstests, Umfragen und Fokusgruppen klar vorn gelegen hatte. In Fokusgruppen reagierte ein Teil der Testpersonen aber schon verärgert auf den Gedanken, das Original zu verlieren. Nach dem Start überlastete der Protest die Hotline, und am 11. Juli 1985, 79 Tage später, kündigte die Firma die Rückkehr der alten Rezeptur an. Der Blindtest maß Geschmack im Labor, nicht das Verhalten von Menschen, denen man ihre Marke wegnimmt.',
        quelle: 'https://en.wikipedia.org/wiki/New_Coke (mit Verweis auf Coca-Cola, „The Real Story of New Coke“, und Mark Pendergrast, „For God, Country and Coca-Cola“)',
      },
    ],
    fragen: [
      {
        frage: 'Ist „erzählt“ nicht auch nur „gesagt“?',
        antwort: 'Beides kommt aus dem Mund, aber Bland trennt Meinung („Ich würde …“) von Fakt („Letzte Woche habe ich …“). Ein erzähltes letztes Mal ist ein Ereignis, keine Prognose – stärker, aber schwächer als beobachtetes Tun (S. 52).',
      },
      {
        frage: 'Zählt eine Statistik oder Studie als Beleg?',
        antwort: 'Ja, Bland nennt Daten aus Recherche ausdrücklich (S. 52). Für oben links fragt er, ob der Beleg relevant, beobachtbar und aktuell ist (S. 38) – passt er wirklich zu euren Pendler*innen?',
      },
    ],
  },

  beispiel: {
    live: [
      'A1 durchgehen: Annahme über Verhalten, nicht über die Lösung',
      'Ist A1 falsch, hilft keine Vorbestellung, egal wie gut gebaut',
      'Darum wichtiger als die 20 Sekunden (A3)',
      'A2 und A4 oben/unten links: belegt, aber Beleg prüfen',
      'A1 wird Forschungsfrage, gefragt wird nach dem letzten Morgen',
    ],
    ueberleitung: 'Jetzt baut ihr eure eigene Map – so geht ihr vor.',
    kern: [
      {
        text: 'Kaffeebar-Map (annahmen.json): A1 wünschenswert, wichtig hoch, Beleg keiner – die riskanteste. A2 machbar (40 Bestellungen in 30 min), hoch, Beleg „getan“. A3 bedienbar (bestellen in 20 s im Gehen), mittel, keiner. A4 wirtschaftlich (rechnet sich ohne weitere Kraft), niedrig, „getan“.',
        quelle: 'Kurs-Beispieldaten src/werkstatt/beispiele/annahmen.json',
      },
      {
        text: 'A1 steht auch im Produkt-Brief als offene Frage: „Entscheiden Pendler*innen schon vor der Ankunft am Bahnhof, ob sie Kaffee holen?“ Der rote Faden: offene Frage im Brief → riskanteste Annahme → Forschungsfrage des Leitfadens.',
        quelle: 'Kurs-Beispieldaten src/werkstatt/beispiele/brief.json',
      },
      {
        text: 'A2 liegt oben links. Blands Regel dafür: den Beleg mit dem Team teilen und hinterfragen, ob er wirklich trägt (S. 38). In der Beispieldatei steht „getan“, aber keine Beleg-ID – genau so ein Fall, bei dem man nachfragt.',
        quelle: 'David J. Bland & Alexander Osterwalder, Testing Business Ideas, S. 38; annahmen.json',
      },
      {
        text: 'Forschungsfrage und Interviewfrage sind verschieden: Die Forschungsfrage („Wann und wo entscheiden Pendler*innen, ob sie Kaffee holen?“) fragt man nicht direkt. Gefragt wird nach einem konkreten vergangenen Morgen – Mom-Test-Regel „specifics in the past“.',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 13',
      },
    ],
    fragen: [
      {
        frage: 'Stimmt A1 denn?',
        antwort: 'Offen lassen, das klären die Interviews. Nur für dich: Die Kaffeebar-Interviews von Tag 2 sprechen dagegen, z. B. I2-4 „Ich schau auf die Tafel, dann auf die Schlange, und dann entscheid ich.“ und I5-3 „Das entscheid ich, wenn ich die Halle seh.“ Nicht heute verraten.',
      },
      {
        frage: 'Warum ist A1 „wünschenswert“ und nicht einfach Verhalten?',
        antwort: 'Die Werkstatt hat keine eigene Art für Verhalten; A1 betrifft, ob die Kundschaft das will und tut, was die Idee voraussetzt – das fällt unter Wünschbarkeit (Torres S. 118: „willing to do the things that we need them to do“).',
      },
      {
        frage: 'Woher kommt der Beleg für A2?',
        antwort: 'Die Beispieldatei nennt keine Quelle – gute Gelegenheit für Blands Regel oben links: Beleg hinterfragen (S. 38).',
      },
    ],
  },

  vorgehen: {
    live: [
      'Erst allein, damit niemand die anderen mitzieht',
      'Pro Art mindestens drei „Wir glauben, dass …“',
      'Dreierrunde: schieben, wo ihr anderer Meinung seid',
      'Zum Schluss Werkstatt, riskanteste markieren, Prüfliste und Red Team',
    ],
    ueberleitung: 'Nach der Übung: Welche Annahme ist bei euch das „schon vor der Ankunft entscheiden“?',
    uebung: { dauer: '45 min (10 + 10 + 10 + 15)', form: 'allein, dann zu dritt' },
    miro: {
      frame: 'T1 · 3 · Annahmen-Map',
      schritte: [
        '„Alle zu mir holen“ auf T1 · 3. Links die Kaffeebar: A1 bis A4 in vier Farben, A1 im roten Feld „Zuerst testen“. Dazu sagen: Nach oben wichtiger, nach rechts weniger Beleg.',
        'Farbe = Art: gelb wünschenswert, blau machbar, grün wirtschaftlich, lila bedienbar. Ein Satz „Wir glauben, dass …“ pro Sticky; dafür ein Sticky der passenden Farbe mit Cmd+D bzw. Strg+D kopieren und neu beschreiben.',
        'Allein sammeln in der eigenen Spalte „Produkt von: …“. Die Verbindungen mit „?“ aus T1 · 1 sind Kandidaten.',
        'Einordnen: jedes Sticky in eines der vier Felder der eigenen Spalte – „Beleg prüfen, darauf bauen“ (oben links), „Zuerst testen“ (oben rechts), „Abhaken“ (unten links), „Später prüfen“ (unten rechts).',
        'Dreierrunde: „Alle zu mir holen“, Spalte für Spalte. Hier gilt eine Ausnahme von „Start hier“, die du ansagst: Die anderen dürfen in der fremden Spalte Stickies verschieben, wo sie anderer Meinung sind, und ergänzen, was fehlt. Gelöscht wird nichts.',
        'Danach vom Board in die Werkstatt: eine Annahme pro Zeile mit Art, Wichtigkeit und Beleg. Kandidat für die riskanteste ist, was oben rechts im roten Feld „Zuerst testen“ liegt.',
      ],
    },
    ablauf: {
      schritte: [
        'Allein sammeln (10 min): je Art mindestens drei Sätze „Wir glauben, dass …“, ein Sticky pro Satz im Frame „T1 · 3 · Annahmen-Map“.',
        'Einordnen (10 min): jede Annahme in die Matrix, Wichtigkeit nach oben, fehlender Beleg nach rechts.',
        'Dreierrunde (10 min): die anderen schieben Stickies, wo sie anderer Meinung sind, und ergänzen, was fehlt.',
        'Festhalten und prüfen (15 min): in der Werkstatt speichern (Art, Wichtigkeit, Beleg pro Zeile), riskanteste wählen, Prüfliste mit Claude, dann Red-Team-Prompt.',
      ],
      achten: [
        'Positiv formuliert, so wie es stimmen muss: „Kund*innen merken sich ihr Passwort“, nicht „… vergessen es“ (Torres S. 131). Bland rät zusätzlich zu ein paar Gegen-Hypothesen gegen Confirmation Bias (S. 30) – die Quellen unterscheiden sich hier.',
        'Konkret genug zum Testen: Wofür haben Kund*innen Zeit, was genau müssen sie wissen (Torres S. 131)?',
        'Alle vier Arten vertreten; viele Teams vergessen eine Art, fast alle die Ethik (Torres S. 128, 132).',
        'Heute vor allem Annahmen über Kundschaft und Problem, nicht über eine Lösung.',
        'Tempo: Torres findet schnelles Einordnen genauso gut wie langes Diskutieren (S. 130).',
        'Red Team: Claude soll höchstens drei Stellen aus dem Brief zitieren und fragen, die Annahmen formulieren die Studierenden selbst.',
      ],
      fehler: [
        'Zu wenige Annahmen: Torres kommt selbst bei einfachen Ideen auf 20–30; was nicht gesammelt ist, kann die Map nicht sortieren (S. 131).',
        'Mehrere Annahmen auf einem Sticky oder Aufzählungen statt einem Satz (Bland S. 37).',
        'Vage Sätze wie „Kund*innen haben Zeit“ (Torres S. 131).',
        'Lösungs-Annahmen statt Annahmen über Verhalten und Problem.',
        '„Getan“ eintragen für etwas, das nur jemand gesagt hat.',
      ],
    },
    kern: [
      {
        text: 'Annahmen sammeln ist divergent wie Ideenfindung: möglichst viele „gotchas“, damit die riskantesten dabei sind. Die meisten sind harmlos und werden nie getestet; die Map findet die riskanten.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 124, 131',
      },
      {
        text: 'Bland: Hypothesen mit „We believe that…“ beginnen; jede so spezifisch wie möglich nach heutigem Wissen, kurz und präzise („No blah blah blah“), eine pro Sticky, im Team abgestimmt. Gute Hypothesen sind testbar, präzise (wer, was, wann) und diskret (nur eine Sache).',
        quelle: 'David J. Bland & Alexander Osterwalder, Testing Business Ideas, S. 30–31, 37',
      },
      {
        text: 'Torres’ Techniken, wenn das Sammeln stockt: Story Map der Schritte, Pre-Mortem („Stell dir vor, es ist ein halbes Jahr später und das Produkt ist komplett gescheitert – was ging schief?“, als sicheres Scheitern formuliert), die Pfade im Opportunity Solution Tree entlang und die Frage nach möglichen Schäden. Man muss nicht alle nutzen, sondern die, die den eigenen blinden Fleck abdecken.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 119–128',
      },
    ],
    zusatz: [
      {
        titel: 'Pre-Mortem nach Gary Klein',
        text: 'Der Psychologe Gary Klein beschreibt die Methode in der Harvard Business Review: Das Team nimmt an, das Projekt sei bereits gescheitert, und sucht die Gründe dafür, statt nur zu fragen, was schiefgehen könnte. Er stützt sich auf Forschung zu „prospective hindsight“ von Mitchell, Russo und Pennington, die auch Torres zitiert. Brauchbar als Joker, wenn in Schritt 1 nach fünf Minuten nichts mehr kommt.',
        quelle: 'Gary Klein, „Performing a Project Premortem“, Harvard Business Review, Sept. 2007: https://hbr.org/2007/09/performing-a-project-premortem; vgl. Torres S. 125',
      },
    ],
    fragen: [
      {
        frage: 'Wie viele Annahmen sollen es sein?',
        antwort: 'Die Folie sagt mindestens drei pro Art, also zwölf pro Person. Torres kommt bei einer einfachen Idee auf 20–30 (S. 131).',
      },
      {
        frage: 'Darf eine Annahme negativ formuliert sein?',
        antwort: 'Torres sagt: so formulieren, wie sie stimmen muss (S. 131). Bland empfiehlt einzelne Gegen-Hypothesen gegen Confirmation Bias (S. 30). Für die Map: positiv.',
      },
      {
        frage: 'Was, wenn wir uns bei der Einordnung nicht einig sind?',
        antwort: 'Genau dafür ist die Dreierrunde: schieben, kurz begründen, weiter. Relativ statt exakt (Torres S. 130); gibt es echten Streit, ist das ein Hinweis auf fehlenden Beleg.',
      },
    ],
  },

  uebertrag: {
    live: [
      'Frage an alle: Was ist bei euch das „schon vor der Ankunft entscheiden“?',
      'Die Annahme, ohne die alles andere egal ist',
      'Reihum: jede*r nennt die eigene riskanteste in einem Satz',
      'Die wird gleich die Forschungsfrage im Leitfaden',
    ],
    ueberleitung: 'Wie man diese Annahme im Gespräch prüft, ohne nach ihr zu fragen: Jobs to be Done.',
    kern: [
      {
        text: 'Zuerst werden die zwei, drei Annahmen ganz oben rechts getestet, nicht der ganze Quadrant. Für den Leitfaden reicht eine davon als Forschungsfrage.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 130',
      },
      {
        text: 'Die riskanteste Annahme ist eine Annahme über Verhalten, kein Feature: Ist sie falsch, hilft keine Lösung. Im Interview wird nicht nach ihr gefragt, sondern nach dem letzten konkreten Mal.',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 13',
      },
    ],
    fragen: [
      {
        frage: 'Wir haben mehrere gleich riskante Annahmen – welche nehmen wir?',
        antwort: 'Die, ohne die alles andere egal wird (Blands Wichtigkeit, S. 38) und die ein Interview überhaupt klären kann. Die anderen bleiben in der Map für Tag 3.',
      },
      {
        frage: 'Unsere riskanteste Annahme ist eine Lösungs-Annahme. Was jetzt?',
        antwort: 'Fragen, welche Annahme über Kundschaft oder Problem darunter liegt – die prüft ihr im Interview; die Lösungs-Annahme kommt an Tag 3 in ein Experiment.',
      },
    ],
  },
};
