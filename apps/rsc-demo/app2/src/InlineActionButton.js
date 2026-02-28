'use client';

import React, { useState } from 'react';

export default function InlineActionButton({
  addMessage,
  clearMessages,
  getMessageCount,
}) {
  const [message, setMessage] = useState('');
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState('Last action result: 0 message');

  async function handleAdd(e) {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('message', message);
      await new Promise((r) => setTimeout(r, 50));
      const newCount = await addMessage(formData);
      const value = typeof newCount === 'number' ? newCount : (count ?? 0) + 1;
      setCount(value);
      setLastResult(`Last action result: ${value} message`);
      setMessage('');
    } catch (error) {
      console.error('Failed to add message:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    setLoading(true);
    try {
      const newCount = await clearMessages();
      const value = typeof newCount === 'number' ? newCount : 0;
      setCount(value);
      setLastResult(`Last action result: ${value} message`);
    } catch (error) {
      console.error('Failed to clear messages:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGetCount() {
    setLoading(true);
    try {
      const currentCount = await getMessageCount();
      const value =
        typeof currentCount === 'number' ? currentCount : (count ?? 0);
      setCount(value);
      setLastResult(`Last action result: ${value} message`);
    } catch (error) {
      console.error('Failed to get count:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      <form
        onSubmit={handleAdd}
        style={{ display: 'flex', gap: 8, marginBottom: 8 }}
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter a message"
          disabled={loading}
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit" disabled={loading || !message.trim()}>
          {loading ? 'Adding...' : 'Add Message'}
        </button>
      </form>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleClear} disabled={loading}>
          {loading ? 'Clearing...' : 'Clear All'}
        </button>
        <button onClick={handleGetCount} disabled={loading}>
          {loading ? 'Loading...' : 'Get Count'}
        </button>
      </div>
      <p style={{ marginTop: 8, color: '#666' }}>{lastResult}</p>
    </div>
  );
}
