import { useState } from 'react';

export default function RemoteButton() {
  const [clicks, setClicks] = useState(0);

  return (
    <button type="button" onClick={() => setClicks((value) => value + 1)}>
      Rsbuild federation button: {clicks}
    </button>
  );
}
