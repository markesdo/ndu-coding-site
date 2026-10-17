// Git-Blob-SHA wie `git hash-object`: sha1("blob <bytes>\0<inhalt>"). Gemeinsam für fakeSpeicher, fakeGithub und
// githubSpeicher (neuer basisSha ohne eigenen Blob-Aufruf).
import { createHash } from 'node:crypto';

export function blobSha(inhalt: string): string {
  const bytes = Buffer.from(inhalt, 'utf8');
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
}
