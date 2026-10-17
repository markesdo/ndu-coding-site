// Island hinter <Bearbeiten artefakt=…>: der Editor des Artefakts samt Einstiegsknopf „Bearbeiten“ (EditorHuelle).
import type { ArtefaktName } from '../schemas/index.js';
import { EDITOREN } from './editoren/index.js';

export default function Bearbeiten({ artefakt }: { artefakt: ArtefaktName }) {
  const Editor = EDITOREN[artefakt];
  return <Editor />;
}
