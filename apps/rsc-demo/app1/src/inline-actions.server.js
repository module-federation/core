'use server';

// Shared in-memory store for the inline actions demo
let messages = ['Hello from server!'];
let messageCount = messages.length;

function extractMessage(input) {
  if (!input) return '';
  if (typeof input === 'string') return input;
  if (typeof input.get === 'function') {
    return input.get('message') || '';
  }
  if (typeof input.message === 'string') {
    return input.message;
  }
  return '';
}

export async function addMessage(formDataOrMessage) {
  const message = extractMessage(formDataOrMessage).trim();
  if (message) {
    messages.push(message);
    messageCount++;
  }
  return messageCount;
}

export async function clearMessages() {
  messages = [];
  messageCount = 0;
  return 0;
}

export async function getMessageCount() {
  return messageCount;
}

export async function getMessagesSnapshot() {
  return {
    count: messageCount,
    messages: [...messages],
  };
}
