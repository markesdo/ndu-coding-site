// Prompt „Handy-Ansicht reparieren“ – steht in Konzept 7 (UI-Schleife) und in der Prompt-Bibliothek.
export const HANDY_PROMPT =
  'Prüf die Seite [z. B. /gegenstaende] am Handy. Starte die App mit npm run dev (http://localhost:3000), falls sie nicht läuft. ' +
  'Richte Playwright ein, falls es fehlt (nur Chromium), und mach Screenshots bei 375 px und 1280 px Breite in den Ordner screenshots/ (trag ihn in .gitignore ein); nenn sie vorher-375.png und vorher-1280.png. ' +
  'Prüf auf den Bildern zuerst, dass du die richtige Seite siehst und nicht die Anmeldung – sonst hör auf und sag es mir. ' +
  'Nenn mir dann, was am Handy nicht passt: abgeschnittener oder zu kleiner Text, waagrechtes Scrollen, Buttons oder Links kleiner als 44 px, Elemente, die sich überlappen. ' +
  'Behebe nur das, ohne das Aussehen am Laptop zu ändern. Mach danach neue Screenshots (nachher-375.png, nachher-1280.png) und zeig mir vorher und nachher, Handy und Laptop. Höchstens drei Runden.';
