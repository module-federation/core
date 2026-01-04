/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Suspense } from 'react';

import {
  EditButton,
  Note,
  NoteList,
  NoteListSkeleton,
  NoteSkeleton,
  SearchField,
} from '@rsc-demo/shared';
import DemoCounter from './DemoCounter.server';
import InlineActionDemo from './InlineActionDemo.server';
import SharedDemo from './SharedDemo.server';
import FederatedDemo from './FederatedDemo.server';
import RemoteButton from './RemoteButton';
import FederatedActionDemo from './FederatedActionDemo';

export default function App({ selectedId, isEditing, searchText }) {
  return (
    <div className="main">
      <section className="col sidebar">
        <section className="sidebar-header">
          <img
            className="logo"
            src="logo.svg"
            width="22px"
            height="20px"
            alt=""
            role="presentation"
          />
          <strong>React Notes</strong>
        </section>
        <section className="sidebar-menu" role="menubar">
          <SearchField />
          <EditButton noteId={null}>New</EditButton>
        </section>
        <nav>
          <Suspense fallback={<NoteListSkeleton />}>
            <NoteList searchText={searchText} />
          </Suspense>
        </nav>
      </section>
      <section key={selectedId} className="col note-viewer">
        <Suspense fallback={<NoteSkeleton isEditing={isEditing} />}>
          <Note selectedId={selectedId} isEditing={isEditing} />
        </Suspense>
        <DemoCounter />
        <InlineActionDemo />
        <SharedDemo />
        <FederatedDemo />
        <RemoteButton />
        <FederatedActionDemo />
      </section>
    </div>
  );
}
