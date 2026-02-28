import React from 'react';
import InlineActionButton from './InlineActionButton';
import {
  addMessage,
  clearMessages,
  getMessageCount,
  getMessagesSnapshot,
} from './inline-actions.server';

export default async function InlineActionDemo() {
  const snapshot = await getMessagesSnapshot();

  return (
    <section
      style={{
        marginTop: 24,
        padding: 16,
        border: '1px solid #ddd',
        borderRadius: 4,
      }}
    >
      <h2>Inline Server Action Demo</h2>
      <p>This demonstrates server actions used from a Server Component.</p>
      <p>Current message count: {snapshot.count}</p>
      <ul>
        {snapshot.messages.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
      <InlineActionButton
        addMessage={addMessage}
        clearMessages={clearMessages}
        getMessageCount={getMessageCount}
      />
    </section>
  );
}
