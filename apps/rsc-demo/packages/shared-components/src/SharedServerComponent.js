// Server Component (no directive)
import {getSharedCounter} from './SharedServerAction';

export default async function SharedServerComponent() {
  const count = await getSharedCounter();
  return (
    <div style={{border: '2px solid purple', padding: '16px', margin: '8px'}}>
      <h3>Shared Server Component</h3>
      <p>Shared counter value: {count}</p>
    </div>
  );
}
