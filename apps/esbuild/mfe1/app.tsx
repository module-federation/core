import React from 'react';
export function App() {
  const [state, setState] = React.useState(null);
  React.useEffect(() => {
    setState('Hooks work');
  });

  return (
    <div id="container">
      <h1>Flights</h1>
      <div>
        <input type="text" placeholder="From"></input>
      </div>
      <div>
        <input type="text" placeholder="To"></input>
      </div>
      <div>
        <button id="search">Search!</button>
        <button id="terms">Terms...</button>
      </div>
      <p>testing hooks: {state}</p>
    </div>
  );
}
