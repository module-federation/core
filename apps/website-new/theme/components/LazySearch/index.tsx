import { lazy, Suspense, useEffect, useState } from 'react';
import { NoSSR } from '@rspress/core/runtime';
import { SearchButton } from '@rspress/core/theme-original';

const loadSearchPanel = () => import('./SearchPanel');

const SearchPanel = lazy(loadSearchPanel);

export function Search() {
  const [activated, setActivated] = useState(false);
  const [focused, setFocused] = useState(false);

  const openSearch = () => {
    setActivated(true);
    setFocused(true);
  };

  useEffect(() => {
    if (activated) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'KeyK' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        openSearch();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [activated]);

  return (
    <>
      <SearchButton setFocused={openSearch} />
      {activated ? (
        <NoSSR>
          <Suspense fallback={null}>
            <SearchPanel focused={focused} setFocused={setFocused} />
          </Suspense>
        </NoSSR>
      ) : null}
    </>
  );
}
