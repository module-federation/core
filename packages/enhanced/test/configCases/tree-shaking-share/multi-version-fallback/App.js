import { nanoid } from 'nanoid';
import { createLegacyId } from 'legacy-nanoid-v3';

export default function App() {
  return `${nanoid()}|${createLegacyId()}`;
}
