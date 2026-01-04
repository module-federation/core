/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// Error early if this is accidentally imported on the client.
import 'server-only';

// Mock database with in-memory notes
const mockNotes = [
  {
    id: 1,
    title: 'Welcome to React Notes',
    body: 'This is a demo of React Server Components with server actions.\n\nTry clicking "New" to create a note, or click on a note to view it.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Server Components',
    body: 'Server Components run only on the server and never ship JavaScript to the client.\n\nThis note list and viewer are Server Components!',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Client Components',
    body: 'Files with "use client" are Client Components.\n\nThey can use hooks like useState and useEffect, and handle user interactions.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let nextId = 4;

/**
 * Mock database pool that works without PostgreSQL
 */
export const db = {
  query: async (sql, params = []) => {
    // SELECT note by ID
    if (/select \* from notes where id/i.test(sql)) {
      const id = parseInt(params[0], 10);
      return { rows: mockNotes.filter((n) => n.id === id) };
    }

    // SELECT notes with search (ilike)
    if (/select \* from notes where title ilike/i.test(sql)) {
      const search = (params[0] || '').replace(/%/g, '').toLowerCase();
      const filtered = search
        ? mockNotes.filter((n) => n.title.toLowerCase().includes(search))
        : mockNotes;
      return { rows: filtered.sort((a, b) => b.id - a.id) };
    }

    // SELECT all notes ordered
    if (/select \* from notes order by/i.test(sql)) {
      return { rows: [...mockNotes].sort((a, b) => b.id - a.id) };
    }

    // INSERT new note
    if (/insert into notes/i.test(sql)) {
      const newNote = {
        id: nextId++,
        title: params[0] || 'Untitled',
        body: params[1] || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockNotes.push(newNote);
      return { rows: [{ id: newNote.id }] };
    }

    // UPDATE note
    if (/update notes set/i.test(sql)) {
      // Server uses: [title, body, now, id]
      const id = parseInt(params[3], 10);
      const note = mockNotes.find((n) => n.id === id);
      if (note) {
        note.title = params[0] || note.title;
        note.body = params[1] || note.body;
        note.updated_at = new Date().toISOString();
      }
      return { rows: [] };
    }

    // DELETE note
    if (/delete from notes/i.test(sql)) {
      const id = parseInt(params[0], 10);
      const idx = mockNotes.findIndex((n) => n.id === id);
      if (idx !== -1) {
        mockNotes.splice(idx, 1);
      }
      return { rows: [] };
    }

    // Default: empty result
    return { rows: [] };
  },
};
