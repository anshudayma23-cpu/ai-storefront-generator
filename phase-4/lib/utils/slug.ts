import { nanoid } from 'nanoid';

export function generateSlug(length: number = 8): string {
  return nanoid(length);
}
