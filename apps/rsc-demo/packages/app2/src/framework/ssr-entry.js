/**
 * SSR Entry Point
 *
 * This file imports all client components so they're available during SSR.
 * The webpack SSR bundle uses this to resolve client component references
 * from the RSC flight stream.
 *
 * Each client component is exported with a key matching its module path
 * so the SSR worker can resolve them by ID.
 */

// Client components from the app - import as default, re-export with path keys
import DemoCounterButton from '../DemoCounterButton';
import EditButton from '../EditButton';
import InlineActionButton from '../InlineActionButton';
import NoteEditor from '../NoteEditor';
import SearchField from '../SearchField';
import SidebarNoteContent from '../SidebarNoteContent';

// Framework client components
import * as Router from './router';

// Re-export all components - the SSR worker will look them up by file path
export {
  DemoCounterButton,
  EditButton,
  InlineActionButton,
  NoteEditor,
  SearchField,
  SidebarNoteContent,
  Router,
};

// Also export a map for easier lookup by module ID
export const componentMap = {
  './src/DemoCounterButton.js': {default: DemoCounterButton},
  './src/EditButton.js': {default: EditButton},
  './src/InlineActionButton.js': {default: InlineActionButton},
  './src/NoteEditor.js': {default: NoteEditor},
  './src/SearchField.js': {default: SearchField},
  './src/SidebarNoteContent.js': {default: SidebarNoteContent},
  './src/framework/router.js': Router,
};
