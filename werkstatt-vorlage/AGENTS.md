# Hinweise für Agenten (Claude Code und andere)

Dieses Repo ist die Mappe einer Person aus dem Innolab. Die Werkstatt auf der Kurswebsite schreibt sie. Lies sie gern, aber verändere sie nicht.

**Nicht direkt in diesem Repo schreiben – Änderungen nur über die Werkstatt.** Auch Vorschläge gehören nicht als Commit hierher: Sag der Person, was dir auffällt, und lass sie es selbst in der Werkstatt formulieren.

## Was in `mappe/` liegt

- `mappe/<artefakt>.json` ist die Quelle: strukturierte Daten mit `schema: "<artefakt>@<version>"` und `stand` (ISO-Datum).
- `mappe/<artefakt>.md` ist daraus generiert (gleicher Inhalt, lesbar). Nie von Hand ändern; beim nächsten Speichern wird sie überschrieben.
- Artefakte jetzt: `brief`, `entscheidungen`, `leitfaden`, `annahmen`.
- Interviews, Vorschläge und Prüfungen kommen in späteren Kurstagen dazu.
- `werkstatt.json` im Wurzelverzeichnis: Zuordnung des Repos (`kohorte`, `githubId`) und `schemaVersionen`, also welche Schema-Versionen dieses Repo nutzt. Nicht ändern.
- Die `README.md` im Wurzelverzeichnis wird von der Werkstatt generiert.

## IDs

Jedes Element hat eine ID: Präfix plus Nummer, optional mit Unternummer (`A12`, `I2-4`). Nummern beginnen bei 1 und werden nie wiederverwendet. Verweise zwischen Elementen sind Felder (`belegIds`, `ersetzt`), kein Fließtext.

| Präfix | Bedeutung |
|---|---|
| D | Entscheidung |
| F | Leitfaden-Frage |
| A | Annahme |
| I | Interview; Zitat `I2-4` ist Zitat 4 aus Interview 2 |
| J / P / G | Job / Pain / Gain |
| H | How-Might-We-Frage |
| L | Lösungsidee |
| E | Experiment |
| S | Story-Map-Slice |

## Belegstufen

Annahmen und Entscheidungen tragen `beleg` mit einem von vier Werten. Die vier Stufen heißen „noch keiner · gesagt · erzählt · getan“ (Skala von sagen zu tun):

| Wert in der JSON | Anzeige |
|---|---|
| `keiner` | noch keiner |
| `gesagt` | gesagt |
| `erzaehlt` | erzählt |
| `getan` | getan |

`belegIds` nennt die IDs, die den Beleg tragen (zum Beispiel Interviewzitate wie `I2-3`). `belegNotiz` (optional) ist ein freier Hinweis auf einen Beleg außerhalb der Mappe, zum Beispiel „Kassendaten September“. Eine hohe Stufe ohne `belegIds` **und** ohne `belegNotiz` ist ein Hinweis, nachzufragen. Mit `belegNotiz` frag nach, wo der Beleg liegt; werte die Zeile nicht als „unbelegt“.

## Wie du hilfst

- Erst fragen, was die Person selbst schon sieht, dann prüfen.
- Höchstens drei Befunde, jeweils mit wörtlichem Zitat aus der Mappe.
- Keine Texte für die Mappe formulieren. Rückfragen stellen statt Lösungen liefern.
- Interviews erscheinen nur mit Pseudonym. Versuche nicht, Personen zu identifizieren.
