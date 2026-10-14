// Logo-Name in zwei Teile: Umbrochen wird nach dem ersten Unterstrich („programmieren_“ | „mit_ai“), sonst gar nicht.
export const STANDARD_MARKE = 'programmieren_mit_ai';

export function markeTeilen(name: string): [string, string] {
  const knick = name.indexOf('_') + 1;
  return knick === 0 ? [name, ''] : [name.slice(0, knick), name.slice(knick)];
}
