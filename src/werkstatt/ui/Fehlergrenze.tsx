// Fängt Abstürze von Formular und Vorschau (zum Beispiel durch einen falsch geformten Entwurf), damit der Editor
// bedienbar bleibt: Text, „Entwurf verwerfen“, Speichern gesperrt (über onFehler).
import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onFehler: () => void;
  onVerwerfen: () => void;
}

export default class Fehlergrenze extends Component<Props, { kaputt: boolean }> {
  state = { kaputt: false };

  static getDerivedStateFromError(): { kaputt: boolean } {
    return { kaputt: true };
  }

  componentDidCatch(): void {
    this.props.onFehler();
  }

  render(): ReactNode {
    if (!this.state.kaputt) return this.props.children;
    return (
      <div className="wk-hinweis" role="alert">
        <p>Dieser Entwurf lässt sich nicht anzeigen.</p>
        <button type="button" className="wk-knopf wk-primaer" onClick={this.props.onVerwerfen}>Entwurf verwerfen</button>
      </div>
    );
  }
}

/**
 * Ruft `was` erst im Render dieser Komponente auf. Nur so landet ein Wurf von formular() oder bild() in der Fehlergrenze:
 * Ein Aufruf direkt im JSX des Eltern-Renders würde schon dort werfen, vor jeder Grenze.
 */
export function Ausfuehren({ was }: { was: () => ReactNode }): ReactNode {
  return was();
}
