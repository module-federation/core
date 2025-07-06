import { CounterButton } from './CounterButton';
import { useCounter } from './useCounter';

export const Counter: React.FC = () => {
  const { count, increment, decrement } = useCounter();

  return (
    <div>
      <h2>
        <span id="mf-e2e-lib-title">Counter From Rslib MF Format: </span>
        <span id="mf-e2e-lib-content">{count}</span>
      </h2>
      <CounterButton id="mf-e2e-lib-decrease" onClick={decrement} label="-" />
      <CounterButton id="mf-e2e-lib-increase" onClick={increment} label="+" />
    </div>
  );
};
