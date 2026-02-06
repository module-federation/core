(self['webpackChunkapp1'] = self['webpackChunkapp1'] || []).push([
  [
    '_client_shared_src_index_js-_6a6d-_6382-_b01c-_e707-_2752-_715a0',
    'client9',
    'client10',
    'client11',
    'client12',
    'client13',
    '_client_shared_src_index_js-_6a6d-_6382-_b01c-_e707-_2752-_715a1',
  ],
  {
    /***/ '?6a6d': /***/ () => {
      /* (ignored) */
      /***/
    },

    /***/ '?6382': /***/ () => {
      /* (ignored) */
      /***/
    },

    /***/ '?b01c': /***/ () => {
      /* (ignored) */
      /***/
    },

    /***/ '?e707': /***/ () => {
      /* (ignored) */
      /***/
    },

    /***/ '?2752': /***/ () => {
      /* (ignored) */
      /***/
    },

    /***/ '(client)/../framework/framework/router.js': /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__,
    ) => {
      'use strict';
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ Router: () => /* binding */ Router,
        /* harmony export */ callServer: () => /* binding */ callServer,
        /* harmony export */ initFromSSR: () => /* binding */ initFromSSR,
        /* harmony export */ useMutation: () => /* binding */ useMutation,
        /* harmony export */ useRouter: () => /* binding */ useRouter,
        /* harmony export */
      });
      /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(
          '(client)/webpack/sharing/consume/client/react/react',
        );
      /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default =
        /*#__PURE__*/ __webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
      /* harmony import */ var _module_federation_react_server_dom_webpack_client__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(
          '(client)/../../../packages/react-server-dom-webpack/client.browser.js',
        );
      /* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ =
        __webpack_require__(
          '(client)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.js',
        );
      /**
       * Shared router implementation for the RSC notes apps.
       *
       * This is imported directly by both app1 and app2 so that navigation,
       * callServer, and SSR integration stay in sync.
       */

      ('use client');

      // RSC Action header (must match server)

      const RSC_ACTION_HEADER = 'rsc-action';
      async function callServer(actionId, args) {
        const body = await (0,
        _module_federation_react_server_dom_webpack_client__WEBPACK_IMPORTED_MODULE_1__.encodeReply)(
          args,
        );
        const response = await fetch('/react', {
          method: 'POST',
          headers: {
            Accept: 'text/x-component',
            [RSC_ACTION_HEADER]: actionId,
          },
          body,
        });
        if (!response.ok) {
          throw new Error(`Server action failed: ${await response.text()}`);
        }
        const resultHeader = response.headers.get('X-Action-Result');
        const actionResult = resultHeader
          ? JSON.parse(resultHeader)
          : undefined;
        return actionResult;
      }
      const RouterContext = /*#__PURE__*/ (0,
      react__WEBPACK_IMPORTED_MODULE_0__.createContext)();
      const initialCache = new Map();
      function initFromSSR(rscData) {
        const initialLocation = {
          selectedId: null,
          isEditing: false,
          searchText: '',
        };
        const locationKey = JSON.stringify(initialLocation);
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(rscData));
            controller.close();
          },
        });
        const content = (0,
        _module_federation_react_server_dom_webpack_client__WEBPACK_IMPORTED_MODULE_1__.createFromReadableStream)(
          stream,
        );
        initialCache.set(locationKey, content);
      }
      function Router() {
        const [cache, setCache] = (0,
        react__WEBPACK_IMPORTED_MODULE_0__.useState)(initialCache);
        const [location, setLocation] = (0,
        react__WEBPACK_IMPORTED_MODULE_0__.useState)({
          selectedId: null,
          isEditing: false,
          searchText: '',
        });
        const locationKey = JSON.stringify(location);
        let content = cache.get(locationKey);
        if (!content) {
          content = (0,
          _module_federation_react_server_dom_webpack_client__WEBPACK_IMPORTED_MODULE_1__.createFromFetch)(
            fetch('/react?location=' + encodeURIComponent(locationKey)),
          );
          cache.set(locationKey, content);
        }
        function refresh(response) {
          (0, react__WEBPACK_IMPORTED_MODULE_0__.startTransition)(() => {
            const nextCache = new Map();
            if (response != null) {
              const locationKey = response.headers.get('X-Location');
              const nextLocation = JSON.parse(locationKey);
              const nextContent = (0,
              _module_federation_react_server_dom_webpack_client__WEBPACK_IMPORTED_MODULE_1__.createFromReadableStream)(
                response.body,
              );
              nextCache.set(locationKey, nextContent);
              navigate(nextLocation);
            }
            setCache(nextCache);
          });
        }
        function navigate(nextLocation) {
          (0, react__WEBPACK_IMPORTED_MODULE_0__.startTransition)(() => {
            setLocation((loc) => ({
              ...loc,
              ...nextLocation,
            }));
          });
        }
        return /*#__PURE__*/ (0,
        react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(
          RouterContext.Provider,
          {
            value: {
              location,
              navigate,
              refresh,
            },
            children: (0, react__WEBPACK_IMPORTED_MODULE_0__.use)(content),
          },
        );
      }
      function useRouter() {
        const context = (0, react__WEBPACK_IMPORTED_MODULE_0__.useContext)(
          RouterContext,
        );
        if (!context) {
          return {
            location: {
              selectedId: null,
              isEditing: false,
              searchText: '',
            },
            navigate: () => {},
            refresh: () => {},
          };
        }
        return context;
      }
      function useMutation({ endpoint, method }) {
        const { refresh } = useRouter();
        const [isSaving, setIsSaving] = (0,
        react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
        const [didError, setDidError] = (0,
        react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
        const [error, setError] = (0,
        react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
        if (didError) {
          throw error;
        }
        async function performMutation(payload, requestedLocation) {
          setIsSaving(true);
          try {
            const response = await fetch(
              `${endpoint}?location=${encodeURIComponent(JSON.stringify(requestedLocation))}`,
              {
                method,
                body: JSON.stringify(payload),
                headers: {
                  'Content-Type': 'application/json',
                },
              },
            );
            if (!response.ok) {
              throw new Error(await response.text());
            }
            refresh(response);
          } catch (e) {
            setDidError(true);
            setError(e);
          } finally {
            setIsSaving(false);
          }
        }
        return [isSaving, performMutation];
      }

      /***/
    },

    /***/ '(client)/../shared/src/EditButton.js': /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__,
    ) => {
      'use strict';
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ default: () => /* binding */ EditButton,
        /* harmony export */
      });
      /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(
          '(client)/webpack/sharing/consume/client/react/react',
        );
      /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default =
        /*#__PURE__*/ __webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
      /* harmony import */ var _rsc_demo_framework_router__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__('(client)/../framework/framework/router.js');
      /* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ =
        __webpack_require__(
          '(client)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.js',
        );
      /**
       * Copyright (c) Facebook, Inc. and its affiliates.
       *
       * This source code is licensed under the MIT license found in the
       * LICENSE file in the root directory of this source tree.
       *
       */

      ('use client');

      function EditButton({ noteId, children }) {
        const [isPending, startTransition] = (0,
        react__WEBPACK_IMPORTED_MODULE_0__.useTransition)();
        const { navigate } = (0,
        _rsc_demo_framework_router__WEBPACK_IMPORTED_MODULE_1__.useRouter)();
        const isDraft = noteId == null;
        return /*#__PURE__*/ (0,
        react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)('button', {
          className: [
            'edit-button',
            isDraft ? 'edit-button--solid' : 'edit-button--outline',
          ].join(' '),
          disabled: isPending,
          onClick: () => {
            startTransition(() => {
              navigate({
                selectedId: noteId,
                isEditing: true,
              });
            });
          },
          role: 'menuitem',
          children: children,
        });
      }

      /***/
    },

    /***/ '(client)/../shared/src/NoteEditor.js': /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__,
    ) => {
      'use strict';
      // ESM COMPAT FLAG
      __webpack_require__.r(__webpack_exports__);

      // EXPORTS
      __webpack_require__.d(__webpack_exports__, {
        default: () => /* binding */ NoteEditor,
      });

      // EXTERNAL MODULE: consume shared module (client) react@* (singleton) (fallback: ../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/index.js) (client)
      var index_js_client_ = __webpack_require__(
        '(client)/webpack/sharing/consume/client/react/react',
      );
      // EXTERNAL MODULE: ../framework/framework/router.js
      var router = __webpack_require__(
        '(client)/../framework/framework/router.js',
      );
      // EXTERNAL MODULE: ../../../../../Library/pnpm/store/v10/links/@/marked/4.3.0/d05a65ade745f15cb52449bc09a621432570fd4b2e15e6ea49727c1f3e0a33fa/node_modules/marked/lib/marked.esm.js
      var marked_esm = __webpack_require__(
        '(client)/../../../../../Library/pnpm/store/v10/links/@/marked/4.3.0/d05a65ade745f15cb52449bc09a621432570fd4b2e15e6ea49727c1f3e0a33fa/node_modules/marked/lib/marked.esm.js',
      );
      // EXTERNAL MODULE: ../../../../../Library/pnpm/store/v10/links/@/sanitize-html/2.17.0/018994dd36c3a5e5bb611fa2c85c2b4fcb2bbd3c3424c38d725fecc2646d8b09/node_modules/sanitize-html/index.js
      var sanitize_html = __webpack_require__(
        '(client)/../../../../../Library/pnpm/store/v10/links/@/sanitize-html/2.17.0/018994dd36c3a5e5bb611fa2c85c2b4fcb2bbd3c3424c38d725fecc2646d8b09/node_modules/sanitize-html/index.js',
      );
      var sanitize_html_default =
        /*#__PURE__*/ __webpack_require__.n(sanitize_html);
      // EXTERNAL MODULE: ../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.js
      var jsx_runtime = __webpack_require__(
        '(client)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.js',
      ); // CONCATENATED MODULE: ../shared/src/TextWithMarkdown.js
      /**
       * Copyright (c) Facebook, Inc. and its affiliates.
       *
       * This source code is licensed under the MIT license found in the
       * LICENSE file in the root directory of this source tree.
       *
       */

      const allowedTags = sanitize_html_default().defaults.allowedTags.concat([
        'img',
        'h1',
        'h2',
        'h3',
      ]);
      const allowedAttributes = Object.assign(
        {},
        sanitize_html_default().defaults.allowedAttributes,
        {
          img: ['alt', 'src'],
        },
      );
      function TextWithMarkdown({ text }) {
        return /*#__PURE__*/ (0, jsx_runtime.jsx)('div', {
          className: 'text-with-markdown',
          dangerouslySetInnerHTML: {
            __html: sanitize_html_default()((0, marked_esm.marked)(text), {
              allowedTags,
              allowedAttributes,
            }),
          },
        });
      } // CONCATENATED MODULE: ../shared/src/NotePreview.js
      /**
       * Copyright (c) Facebook, Inc. and its affiliates.
       *
       * This source code is licensed under the MIT license found in the
       * LICENSE file in the root directory of this source tree.
       *
       */

      function NotePreview({ body }) {
        return /*#__PURE__*/ (0, jsx_runtime.jsx)('div', {
          className: 'note-preview',
          children: /*#__PURE__*/ (0, jsx_runtime.jsx)(TextWithMarkdown, {
            text: body,
          }),
        });
      } // CONCATENATED MODULE: ../shared/src/NoteEditor.js
      /**
       * Copyright (c) Facebook, Inc. and its affiliates.
       *
       * This source code is licensed under the MIT license found in the
       * LICENSE file in the root directory of this source tree.
       *
       */

      ('use client');

      function NoteEditor({ noteId, initialTitle, initialBody }) {
        const [title, setTitle] = (0, index_js_client_.useState)(initialTitle);
        const [body, setBody] = (0, index_js_client_.useState)(initialBody);
        const { location } = (0, router.useRouter)();
        const [isNavigating, startNavigating] = (0,
        index_js_client_.useTransition)();
        const [isSaving, saveNote] = (0, router.useMutation)({
          endpoint: noteId !== null ? `/notes/${noteId}` : `/notes`,
          method: noteId !== null ? 'PUT' : 'POST',
        });
        const [isDeleting, deleteNote] = (0, router.useMutation)({
          endpoint: `/notes/${noteId}`,
          method: 'DELETE',
        });
        async function handleSave() {
          const payload = {
            title,
            body,
          };
          const requestedLocation = {
            selectedId: noteId,
            isEditing: false,
            searchText: location.searchText,
          };
          await saveNote(payload, requestedLocation);
        }
        async function handleDelete() {
          const payload = {};
          const requestedLocation = {
            selectedId: null,
            isEditing: false,
            searchText: location.searchText,
          };
          await deleteNote(payload, requestedLocation);
        }
        const isDraft = noteId === null;
        return /*#__PURE__*/ (0, jsx_runtime.jsxs)('div', {
          className: 'note-editor',
          children: [
            /*#__PURE__*/ (0, jsx_runtime.jsxs)('form', {
              className: 'note-editor-form',
              autoComplete: 'off',
              onSubmit: (e) => e.preventDefault(),
              children: [
                /*#__PURE__*/ (0, jsx_runtime.jsx)('label', {
                  className: 'offscreen',
                  htmlFor: 'note-title-input',
                  children: 'Enter a title for your note',
                }),
                /*#__PURE__*/ (0, jsx_runtime.jsx)('input', {
                  id: 'note-title-input',
                  type: 'text',
                  value: title,
                  onChange: (e) => {
                    setTitle(e.target.value);
                  },
                }),
                /*#__PURE__*/ (0, jsx_runtime.jsx)('label', {
                  className: 'offscreen',
                  htmlFor: 'note-body-input',
                  children: 'Enter the body for your note',
                }),
                /*#__PURE__*/ (0, jsx_runtime.jsx)('textarea', {
                  id: 'note-body-input',
                  value: body,
                  onChange: (e) => {
                    setBody(e.target.value);
                  },
                }),
              ],
            }),
            /*#__PURE__*/ (0, jsx_runtime.jsxs)('div', {
              className: 'note-editor-preview',
              children: [
                /*#__PURE__*/ (0, jsx_runtime.jsxs)('div', {
                  className: 'note-editor-menu',
                  role: 'menubar',
                  children: [
                    /*#__PURE__*/ (0, jsx_runtime.jsxs)('button', {
                      className: 'note-editor-done',
                      disabled: isSaving || isNavigating,
                      onClick: () => handleSave(),
                      role: 'menuitem',
                      children: [
                        /*#__PURE__*/ (0, jsx_runtime.jsx)('img', {
                          src: 'checkmark.svg',
                          width: '14px',
                          height: '10px',
                          alt: '',
                          role: 'presentation',
                        }),
                        'Done',
                      ],
                    }),
                    !isDraft &&
                      /*#__PURE__*/ (0, jsx_runtime.jsxs)('button', {
                        className: 'note-editor-delete',
                        disabled: isDeleting || isNavigating,
                        onClick: () => handleDelete(),
                        role: 'menuitem',
                        children: [
                          /*#__PURE__*/ (0, jsx_runtime.jsx)('img', {
                            src: 'cross.svg',
                            width: '10px',
                            height: '10px',
                            alt: '',
                            role: 'presentation',
                          }),
                          'Delete',
                        ],
                      }),
                  ],
                }),
                /*#__PURE__*/ (0, jsx_runtime.jsx)('div', {
                  className: 'label label--preview',
                  role: 'status',
                  children: 'Preview',
                }),
                /*#__PURE__*/ (0, jsx_runtime.jsx)('h1', {
                  className: 'note-title',
                  children: title,
                }),
                /*#__PURE__*/ (0, jsx_runtime.jsx)(NotePreview, {
                  title: title,
                  body: body,
                }),
              ],
            }),
          ],
        });
      }

      /***/
    },

    /***/ '(client)/../shared/src/SearchField.js': /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__,
    ) => {
      'use strict';
      // ESM COMPAT FLAG
      __webpack_require__.r(__webpack_exports__);

      // EXPORTS
      __webpack_require__.d(__webpack_exports__, {
        default: () => /* binding */ SearchField,
      });

      // EXTERNAL MODULE: consume shared module (client) react@* (singleton) (fallback: ../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/index.js) (client)
      var index_js_client_ = __webpack_require__(
        '(client)/webpack/sharing/consume/client/react/react',
      );
      // EXTERNAL MODULE: ../framework/framework/router.js
      var router = __webpack_require__(
        '(client)/../framework/framework/router.js',
      );
      // EXTERNAL MODULE: ../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.js
      var jsx_runtime = __webpack_require__(
        '(client)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.js',
      ); // CONCATENATED MODULE: ../shared/src/Spinner.js
      /**
       * Copyright (c) Facebook, Inc. and its affiliates.
       *
       * This source code is licensed under the MIT license found in the
       * LICENSE file in the root directory of this source tree.
       *
       */

      function Spinner({ active = true }) {
        return /*#__PURE__*/ (0, jsx_runtime.jsx)('div', {
          className: ['spinner', active && 'spinner--active'].join(' '),
          role: 'progressbar',
          'aria-busy': active ? 'true' : 'false',
        });
      } // CONCATENATED MODULE: ../shared/src/SearchField.js
      /**
       * Copyright (c) Facebook, Inc. and its affiliates.
       *
       * This source code is licensed under the MIT license found in the
       * LICENSE file in the root directory of this source tree.
       *
       */

      ('use client');

      function SearchField() {
        const [text, setText] = (0, index_js_client_.useState)('');
        const [isSearching, startSearching] = (0,
        index_js_client_.useTransition)();
        const { navigate } = (0, router.useRouter)();
        return /*#__PURE__*/ (0, jsx_runtime.jsxs)('form', {
          className: 'search',
          role: 'search',
          onSubmit: (e) => e.preventDefault(),
          children: [
            /*#__PURE__*/ (0, jsx_runtime.jsx)('label', {
              className: 'offscreen',
              htmlFor: 'sidebar-search-input',
              children: 'Search for a note by title',
            }),
            /*#__PURE__*/ (0, jsx_runtime.jsx)('input', {
              id: 'sidebar-search-input',
              placeholder: 'Search',
              value: text,
              onChange: (e) => {
                const newText = e.target.value;
                setText(newText);
                startSearching(() => {
                  navigate({
                    searchText: newText,
                  });
                });
              },
            }),
            /*#__PURE__*/ (0, jsx_runtime.jsx)(Spinner, {
              active: isSearching,
            }),
          ],
        });
      }

      /***/
    },

    /***/ '(client)/../shared/src/SharedClientWidget.js': /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__,
    ) => {
      'use strict';
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ default: () => /* binding */ SharedClientWidget,
        /* harmony export */
      });
      /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(
          '(client)/webpack/sharing/consume/client/react/react',
        );
      /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default =
        /*#__PURE__*/ __webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
      /* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(
          '(client)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.js',
        );
      ('use client');

      function SharedClientWidget({ label = 'shared' }) {
        return /*#__PURE__*/ (0,
        react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)('span', {
          'data-testid': 'shared-client-widget',
          children: ['Shared: ', label],
        });
      }

      /***/
    },

    /***/ '(client)/../shared/src/SidebarNoteContent.js': /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__,
    ) => {
      'use strict';
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ default: () => /* binding */ SidebarNoteContent,
        /* harmony export */
      });
      /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(
          '(client)/webpack/sharing/consume/client/react/react',
        );
      /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default =
        /*#__PURE__*/ __webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
      /* harmony import */ var _rsc_demo_framework_router__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__('(client)/../framework/framework/router.js');
      /* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ =
        __webpack_require__(
          '(client)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.js',
        );
      /**
       * Copyright (c) Facebook, Inc. and its affiliates.
       *
       * This source code is licensed under the MIT license found in the
       * LICENSE file in the root directory of this source tree.
       *
       */

      ('use client');

      function SidebarNoteContent({ id, title, children, expandedChildren }) {
        const { location, navigate } = (0,
        _rsc_demo_framework_router__WEBPACK_IMPORTED_MODULE_1__.useRouter)();
        const [isPending, startTransition] = (0,
        react__WEBPACK_IMPORTED_MODULE_0__.useTransition)();
        const [isExpanded, setIsExpanded] = (0,
        react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
        const isActive = id === location.selectedId;

        // Animate after title is edited.
        const itemRef = (0, react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
        const prevTitleRef = (0, react__WEBPACK_IMPORTED_MODULE_0__.useRef)(
          title,
        );
        (0, react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
          if (title !== prevTitleRef.current) {
            prevTitleRef.current = title;
            itemRef.current.classList.add('flash');
          }
        }, [title]);
        return /*#__PURE__*/ (0,
        react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)('div', {
          ref: itemRef,
          onAnimationEnd: () => {
            itemRef.current.classList.remove('flash');
          },
          className: [
            'sidebar-note-list-item',
            isExpanded ? 'note-expanded' : '',
          ].join(' '),
          children: [
            children,
            /*#__PURE__*/ (0,
            react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)('button', {
              className: 'sidebar-note-open',
              style: {
                backgroundColor: isPending
                  ? 'var(--gray-80)'
                  : isActive
                    ? 'var(--tertiary-blue)'
                    : '',
                border: isActive
                  ? '1px solid var(--primary-border)'
                  : '1px solid transparent',
              },
              onClick: () => {
                startTransition(() => {
                  navigate({
                    selectedId: id,
                    isEditing: false,
                  });
                });
              },
              children: 'Open note for preview',
            }),
            /*#__PURE__*/ (0,
            react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)('button', {
              className: 'sidebar-note-toggle-expand',
              onClick: (e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              },
              children: isExpanded
                ? /*#__PURE__*/ (0,
                  react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)('img', {
                    src: 'chevron-down.svg',
                    width: '10px',
                    height: '10px',
                    alt: 'Collapse',
                  })
                : /*#__PURE__*/ (0,
                  react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)('img', {
                    src: 'chevron-up.svg',
                    width: '10px',
                    height: '10px',
                    alt: 'Expand',
                  }),
            }),
            isExpanded && expandedChildren,
          ],
        });
      }

      /***/
    },

    /***/ '(client)/../shared/src/index.js': /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__,
    ) => {
      'use strict';
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ EditButton: () =>
          /* reexport safe */ _EditButton_js__WEBPACK_IMPORTED_MODULE_2__[
            'default'
          ],
        /* harmony export */ NoteEditor: () =>
          /* reexport safe */ _NoteEditor_js__WEBPACK_IMPORTED_MODULE_3__[
            'default'
          ],
        /* harmony export */ SearchField: () =>
          /* reexport safe */ _SearchField_js__WEBPACK_IMPORTED_MODULE_4__[
            'default'
          ],
        /* harmony export */ SharedClientWidget: () =>
          /* reexport safe */ _SharedClientWidget_js__WEBPACK_IMPORTED_MODULE_0__[
            'default'
          ],
        /* harmony export */ SidebarNoteContent: () =>
          /* reexport safe */ _SidebarNoteContent_js__WEBPACK_IMPORTED_MODULE_5__[
            'default'
          ],
        /* harmony export */ sharedServerActions: () =>
          /* reexport module object */ _shared_server_actions_js__WEBPACK_IMPORTED_MODULE_1__,
        /* harmony export */
      });
      /* harmony import */ var _SharedClientWidget_js__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__('(client)/../shared/src/SharedClientWidget.js');
      /* harmony import */ var _shared_server_actions_js__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__('(client)/../shared/src/shared-server-actions.js');
      /* harmony import */ var _EditButton_js__WEBPACK_IMPORTED_MODULE_2__ =
        __webpack_require__('(client)/../shared/src/EditButton.js');
      /* harmony import */ var _NoteEditor_js__WEBPACK_IMPORTED_MODULE_3__ =
        __webpack_require__('(client)/../shared/src/NoteEditor.js');
      /* harmony import */ var _SearchField_js__WEBPACK_IMPORTED_MODULE_4__ =
        __webpack_require__('(client)/../shared/src/SearchField.js');
      /* harmony import */ var _SidebarNoteContent_js__WEBPACK_IMPORTED_MODULE_5__ =
        __webpack_require__('(client)/../shared/src/SidebarNoteContent.js');

      /***/
    },

    /***/ '(client)/../shared/src/shared-server-actions.js': /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__,
    ) => {
      'use strict';
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ getSharedCounter: () =>
          /* binding */ getSharedCounter,
        /* harmony export */ incrementSharedCounter: () =>
          /* binding */ incrementSharedCounter,
        /* harmony export */
      });
      /* harmony import */ var _module_federation_react_server_dom_webpack_client__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(
          '(client)/../../../packages/react-server-dom-webpack/client.browser.js',
        );
      // RSC Client Loader: 'use server' module transformed to server references

      const callServer =
        globalThis.__RSC_CALL_SERVER__ ||
        ((id, args) => {
          throw new Error(
            'callServer not initialized. Set globalThis.__RSC_CALL_SERVER__',
          );
        });
      const incrementSharedCounter = (0,
      _module_federation_react_server_dom_webpack_client__WEBPACK_IMPORTED_MODULE_0__.createServerReference)(
        'file:///Users/bytedance/dev/core/apps/rsc-demo/shared/src/shared-server-actions.js#incrementSharedCounter',
        callServer,
      );
      const getSharedCounter = (0,
      _module_federation_react_server_dom_webpack_client__WEBPACK_IMPORTED_MODULE_0__.createServerReference)(
        'file:///Users/bytedance/dev/core/apps/rsc-demo/shared/src/shared-server-actions.js#getSharedCounter',
        callServer,
      );

      /***/
    },

    /***/ '(client)/../../../packages/react-server-dom-webpack/cjs/react-server-dom-webpack-client.browser.production.js':
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        'use strict';
        /**
         * @license React
         * react-server-dom-webpack-client.browser.production.js
         *
         * Copyright (c) Meta Platforms, Inc. and affiliates.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */

        var ReactDOM = __webpack_require__(
            '(client)/webpack/sharing/consume/client/react-dom/react-dom',
          ),
          decoderOptions = {
            stream: !0,
          };
        function resolveClientReference(bundlerConfig, metadata) {
          if (bundlerConfig) {
            var moduleExports = bundlerConfig[metadata[0]];
            if ((bundlerConfig = moduleExports && moduleExports[metadata[2]]))
              moduleExports = bundlerConfig.name;
            else {
              bundlerConfig = moduleExports && moduleExports['*'];
              if (!bundlerConfig)
                throw Error(
                  'Could not find the module "' +
                    metadata[0] +
                    '" in the React Server Consumer Manifest. This is probably a bug in the React Server Components bundler.',
                );
              moduleExports = metadata[2];
            }
            return 4 === metadata.length
              ? [bundlerConfig.id, bundlerConfig.chunks, moduleExports, 1]
              : [bundlerConfig.id, bundlerConfig.chunks, moduleExports];
          }
          return metadata;
        }
        function resolveServerReference(bundlerConfig, id) {
          var name = '',
            resolvedModuleData = bundlerConfig[id];
          if (resolvedModuleData) name = resolvedModuleData.name;
          else {
            var idx = id.lastIndexOf('#');
            -1 !== idx &&
              ((name = id.slice(idx + 1)),
              (resolvedModuleData = bundlerConfig[id.slice(0, idx)]));
            if (!resolvedModuleData)
              throw Error(
                'Could not find the module "' +
                  id +
                  '" in the React Server Manifest. This is probably a bug in the React Server Components bundler.',
              );
          }
          return resolvedModuleData.async
            ? [resolvedModuleData.id, resolvedModuleData.chunks, name, 1]
            : [resolvedModuleData.id, resolvedModuleData.chunks, name];
        }
        var chunkCache = new Map();
        function requireAsyncModule(id) {
          var promise = __webpack_require__(id);
          if (
            'function' !== typeof promise.then ||
            'fulfilled' === promise.status
          )
            return null;
          promise.then(
            function (value) {
              promise.status = 'fulfilled';
              promise.value = value;
            },
            function (reason) {
              promise.status = 'rejected';
              promise.reason = reason;
            },
          );
          return promise;
        }
        function ignoreReject() {}
        function preloadModule(metadata) {
          for (
            var chunks = metadata[1], promises = [], i = 0;
            i < chunks.length;

          ) {
            var chunkId = chunks[i++],
              chunkFilename = chunks[i++],
              entry = chunkCache.get(chunkId);
            void 0 === entry
              ? (chunkMap.set(chunkId, chunkFilename),
                (chunkFilename = __webpack_require__.e(chunkId)),
                promises.push(chunkFilename),
                (entry = chunkCache.set.bind(chunkCache, chunkId, null)),
                chunkFilename.then(entry, ignoreReject),
                chunkCache.set(chunkId, chunkFilename))
              : null !== entry && promises.push(entry);
          }
          return 4 === metadata.length
            ? 0 === promises.length
              ? requireAsyncModule(metadata[0])
              : Promise.all(promises).then(function () {
                  return requireAsyncModule(metadata[0]);
                })
            : 0 < promises.length
              ? Promise.all(promises)
              : null;
        }
        function requireModule(metadata) {
          var moduleExports = __webpack_require__(metadata[0]);
          if (4 === metadata.length && 'function' === typeof moduleExports.then)
            if ('fulfilled' === moduleExports.status)
              moduleExports = moduleExports.value;
            else throw moduleExports.reason;
          return '*' === metadata[2]
            ? moduleExports
            : '' === metadata[2]
              ? moduleExports.__esModule
                ? moduleExports.default
                : moduleExports
              : moduleExports[metadata[2]];
        }
        var chunkMap = new Map(),
          webpackGetChunkFilename = __webpack_require__.u;
        __webpack_require__.u = function (chunkId) {
          var flightChunk = chunkMap.get(chunkId);
          return void 0 !== flightChunk
            ? flightChunk
            : webpackGetChunkFilename(chunkId);
        };
        var ReactDOMSharedInternals =
            ReactDOM.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
          REACT_ELEMENT_TYPE = Symbol.for('react.transitional.element'),
          REACT_LAZY_TYPE = Symbol.for('react.lazy'),
          MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
        function getIteratorFn(maybeIterable) {
          if (null === maybeIterable || 'object' !== typeof maybeIterable)
            return null;
          maybeIterable =
            (MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL]) ||
            maybeIterable['@@iterator'];
          return 'function' === typeof maybeIterable ? maybeIterable : null;
        }
        var ASYNC_ITERATOR = Symbol.asyncIterator,
          isArrayImpl = Array.isArray,
          getPrototypeOf = Object.getPrototypeOf,
          ObjectPrototype = Object.prototype,
          knownServerReferences = new WeakMap();
        function serializeNumber(number) {
          return Number.isFinite(number)
            ? 0 === number && -Infinity === 1 / number
              ? '$-0'
              : number
            : Infinity === number
              ? '$Infinity'
              : -Infinity === number
                ? '$-Infinity'
                : '$NaN';
        }
        function processReply(
          root,
          formFieldPrefix,
          temporaryReferences,
          resolve,
          reject,
        ) {
          function serializeTypedArray(tag, typedArray) {
            typedArray = new Blob([
              new Uint8Array(
                typedArray.buffer,
                typedArray.byteOffset,
                typedArray.byteLength,
              ),
            ]);
            var blobId = nextPartId++;
            null === formData && (formData = new FormData());
            formData.append(formFieldPrefix + blobId, typedArray);
            return '$' + tag + blobId.toString(16);
          }
          function serializeBinaryReader(reader) {
            function progress(entry) {
              entry.done
                ? ((entry = nextPartId++),
                  data.append(formFieldPrefix + entry, new Blob(buffer)),
                  data.append(
                    formFieldPrefix + streamId,
                    '"$o' + entry.toString(16) + '"',
                  ),
                  data.append(formFieldPrefix + streamId, 'C'),
                  pendingParts--,
                  0 === pendingParts && resolve(data))
                : (buffer.push(entry.value),
                  reader.read(new Uint8Array(1024)).then(progress, reject));
            }
            null === formData && (formData = new FormData());
            var data = formData;
            pendingParts++;
            var streamId = nextPartId++,
              buffer = [];
            reader.read(new Uint8Array(1024)).then(progress, reject);
            return '$r' + streamId.toString(16);
          }
          function serializeReader(reader) {
            function progress(entry) {
              if (entry.done)
                data.append(formFieldPrefix + streamId, 'C'),
                  pendingParts--,
                  0 === pendingParts && resolve(data);
              else
                try {
                  var partJSON = JSON.stringify(entry.value, resolveToJSON);
                  data.append(formFieldPrefix + streamId, partJSON);
                  reader.read().then(progress, reject);
                } catch (x) {
                  reject(x);
                }
            }
            null === formData && (formData = new FormData());
            var data = formData;
            pendingParts++;
            var streamId = nextPartId++;
            reader.read().then(progress, reject);
            return '$R' + streamId.toString(16);
          }
          function serializeReadableStream(stream) {
            try {
              var binaryReader = stream.getReader({
                mode: 'byob',
              });
            } catch (x) {
              return serializeReader(stream.getReader());
            }
            return serializeBinaryReader(binaryReader);
          }
          function serializeAsyncIterable(iterable, iterator) {
            function progress(entry) {
              if (entry.done) {
                if (void 0 === entry.value)
                  data.append(formFieldPrefix + streamId, 'C');
                else
                  try {
                    var partJSON = JSON.stringify(entry.value, resolveToJSON);
                    data.append(formFieldPrefix + streamId, 'C' + partJSON);
                  } catch (x) {
                    reject(x);
                    return;
                  }
                pendingParts--;
                0 === pendingParts && resolve(data);
              } else
                try {
                  var partJSON$21 = JSON.stringify(entry.value, resolveToJSON);
                  data.append(formFieldPrefix + streamId, partJSON$21);
                  iterator.next().then(progress, reject);
                } catch (x$22) {
                  reject(x$22);
                }
            }
            null === formData && (formData = new FormData());
            var data = formData;
            pendingParts++;
            var streamId = nextPartId++;
            iterable = iterable === iterator;
            iterator.next().then(progress, reject);
            return '$' + (iterable ? 'x' : 'X') + streamId.toString(16);
          }
          function resolveToJSON(key, value) {
            if (null === value) return null;
            if ('object' === typeof value) {
              switch (value.$$typeof) {
                case REACT_ELEMENT_TYPE:
                  if (
                    void 0 !== temporaryReferences &&
                    -1 === key.indexOf(':')
                  ) {
                    var parentReference = writtenObjects.get(this);
                    if (void 0 !== parentReference)
                      return (
                        temporaryReferences.set(
                          parentReference + ':' + key,
                          value,
                        ),
                        '$T'
                      );
                  }
                  throw Error(
                    'React Element cannot be passed to Server Functions from the Client without a temporary reference set. Pass a TemporaryReferenceSet to the options.',
                  );
                case REACT_LAZY_TYPE:
                  parentReference = value._payload;
                  var init = value._init;
                  null === formData && (formData = new FormData());
                  pendingParts++;
                  try {
                    var resolvedModel = init(parentReference),
                      lazyId = nextPartId++,
                      partJSON = serializeModel(resolvedModel, lazyId);
                    formData.append(formFieldPrefix + lazyId, partJSON);
                    return '$' + lazyId.toString(16);
                  } catch (x) {
                    if (
                      'object' === typeof x &&
                      null !== x &&
                      'function' === typeof x.then
                    ) {
                      pendingParts++;
                      var lazyId$23 = nextPartId++;
                      parentReference = function () {
                        try {
                          var partJSON$24 = serializeModel(value, lazyId$23),
                            data$25 = formData;
                          data$25.append(
                            formFieldPrefix + lazyId$23,
                            partJSON$24,
                          );
                          pendingParts--;
                          0 === pendingParts && resolve(data$25);
                        } catch (reason) {
                          reject(reason);
                        }
                      };
                      x.then(parentReference, parentReference);
                      return '$' + lazyId$23.toString(16);
                    }
                    reject(x);
                    return null;
                  } finally {
                    pendingParts--;
                  }
              }
              if ('function' === typeof value.then) {
                null === formData && (formData = new FormData());
                pendingParts++;
                var promiseId = nextPartId++;
                value.then(function (partValue) {
                  try {
                    var partJSON$27 = serializeModel(partValue, promiseId);
                    partValue = formData;
                    partValue.append(formFieldPrefix + promiseId, partJSON$27);
                    pendingParts--;
                    0 === pendingParts && resolve(partValue);
                  } catch (reason) {
                    reject(reason);
                  }
                }, reject);
                return '$@' + promiseId.toString(16);
              }
              parentReference = writtenObjects.get(value);
              if (void 0 !== parentReference) {
                if (modelRoot === value) modelRoot = null;
                else return parentReference;
              } else
                -1 === key.indexOf(':') &&
                  ((parentReference = writtenObjects.get(this)),
                  void 0 !== parentReference &&
                    ((key = parentReference + ':' + key),
                    writtenObjects.set(value, key),
                    void 0 !== temporaryReferences &&
                      temporaryReferences.set(key, value)));
              if (isArrayImpl(value)) return value;
              if (value instanceof FormData) {
                null === formData && (formData = new FormData());
                var data$31 = formData;
                key = nextPartId++;
                var prefix = formFieldPrefix + key + '_';
                value.forEach(function (originalValue, originalKey) {
                  data$31.append(prefix + originalKey, originalValue);
                });
                return '$K' + key.toString(16);
              }
              if (value instanceof Map)
                return (
                  (key = nextPartId++),
                  (parentReference = serializeModel(Array.from(value), key)),
                  null === formData && (formData = new FormData()),
                  formData.append(formFieldPrefix + key, parentReference),
                  '$Q' + key.toString(16)
                );
              if (value instanceof Set)
                return (
                  (key = nextPartId++),
                  (parentReference = serializeModel(Array.from(value), key)),
                  null === formData && (formData = new FormData()),
                  formData.append(formFieldPrefix + key, parentReference),
                  '$W' + key.toString(16)
                );
              if (value instanceof ArrayBuffer)
                return (
                  (key = new Blob([value])),
                  (parentReference = nextPartId++),
                  null === formData && (formData = new FormData()),
                  formData.append(formFieldPrefix + parentReference, key),
                  '$A' + parentReference.toString(16)
                );
              if (value instanceof Int8Array)
                return serializeTypedArray('O', value);
              if (value instanceof Uint8Array)
                return serializeTypedArray('o', value);
              if (value instanceof Uint8ClampedArray)
                return serializeTypedArray('U', value);
              if (value instanceof Int16Array)
                return serializeTypedArray('S', value);
              if (value instanceof Uint16Array)
                return serializeTypedArray('s', value);
              if (value instanceof Int32Array)
                return serializeTypedArray('L', value);
              if (value instanceof Uint32Array)
                return serializeTypedArray('l', value);
              if (value instanceof Float32Array)
                return serializeTypedArray('G', value);
              if (value instanceof Float64Array)
                return serializeTypedArray('g', value);
              if (value instanceof BigInt64Array)
                return serializeTypedArray('M', value);
              if (value instanceof BigUint64Array)
                return serializeTypedArray('m', value);
              if (value instanceof DataView)
                return serializeTypedArray('V', value);
              if ('function' === typeof Blob && value instanceof Blob)
                return (
                  null === formData && (formData = new FormData()),
                  (key = nextPartId++),
                  formData.append(formFieldPrefix + key, value),
                  '$B' + key.toString(16)
                );
              if ((key = getIteratorFn(value)))
                return (
                  (parentReference = key.call(value)),
                  parentReference === value
                    ? ((key = nextPartId++),
                      (parentReference = serializeModel(
                        Array.from(parentReference),
                        key,
                      )),
                      null === formData && (formData = new FormData()),
                      formData.append(formFieldPrefix + key, parentReference),
                      '$i' + key.toString(16))
                    : Array.from(parentReference)
                );
              if (
                'function' === typeof ReadableStream &&
                value instanceof ReadableStream
              )
                return serializeReadableStream(value);
              key = value[ASYNC_ITERATOR];
              if ('function' === typeof key)
                return serializeAsyncIterable(value, key.call(value));
              key = getPrototypeOf(value);
              if (
                key !== ObjectPrototype &&
                (null === key || null !== getPrototypeOf(key))
              ) {
                if (void 0 === temporaryReferences)
                  throw Error(
                    'Only plain objects, and a few built-ins, can be passed to Server Functions. Classes or null prototypes are not supported.',
                  );
                return '$T';
              }
              return value;
            }
            if ('string' === typeof value) {
              if ('Z' === value[value.length - 1] && this[key] instanceof Date)
                return '$D' + value;
              key = '$' === value[0] ? '$' + value : value;
              return key;
            }
            if ('boolean' === typeof value) return value;
            if ('number' === typeof value) return serializeNumber(value);
            if ('undefined' === typeof value) return '$undefined';
            if ('function' === typeof value) {
              parentReference = knownServerReferences.get(value);
              if (void 0 !== parentReference)
                return (
                  (key = JSON.stringify(
                    {
                      id: parentReference.id,
                      bound: parentReference.bound,
                    },
                    resolveToJSON,
                  )),
                  null === formData && (formData = new FormData()),
                  (parentReference = nextPartId++),
                  formData.set(formFieldPrefix + parentReference, key),
                  '$F' + parentReference.toString(16)
                );
              if (
                void 0 !== temporaryReferences &&
                -1 === key.indexOf(':') &&
                ((parentReference = writtenObjects.get(this)),
                void 0 !== parentReference)
              )
                return (
                  temporaryReferences.set(parentReference + ':' + key, value),
                  '$T'
                );
              throw Error(
                'Client Functions cannot be passed directly to Server Functions. Only Functions passed from the Server can be passed back again.',
              );
            }
            if ('symbol' === typeof value) {
              if (
                void 0 !== temporaryReferences &&
                -1 === key.indexOf(':') &&
                ((parentReference = writtenObjects.get(this)),
                void 0 !== parentReference)
              )
                return (
                  temporaryReferences.set(parentReference + ':' + key, value),
                  '$T'
                );
              throw Error(
                'Symbols cannot be passed to a Server Function without a temporary reference set. Pass a TemporaryReferenceSet to the options.',
              );
            }
            if ('bigint' === typeof value) return '$n' + value.toString(10);
            throw Error(
              'Type ' +
                typeof value +
                ' is not supported as an argument to a Server Function.',
            );
          }
          function serializeModel(model, id) {
            'object' === typeof model &&
              null !== model &&
              ((id = '$' + id.toString(16)),
              writtenObjects.set(model, id),
              void 0 !== temporaryReferences &&
                temporaryReferences.set(id, model));
            modelRoot = model;
            return JSON.stringify(model, resolveToJSON);
          }
          var nextPartId = 1,
            pendingParts = 0,
            formData = null,
            writtenObjects = new WeakMap(),
            modelRoot = root,
            json = serializeModel(root, 0);
          null === formData
            ? resolve(json)
            : (formData.set(formFieldPrefix + '0', json),
              0 === pendingParts && resolve(formData));
          return function () {
            0 < pendingParts &&
              ((pendingParts = 0),
              null === formData ? resolve(json) : resolve(formData));
          };
        }
        function registerBoundServerReference(reference, id, bound) {
          knownServerReferences.has(reference) ||
            knownServerReferences.set(reference, {
              id: id,
              originalBind: reference.bind,
              bound: bound,
            });
        }
        function createBoundServerReference(metaData, callServer) {
          function action() {
            var args = Array.prototype.slice.call(arguments);
            return bound
              ? 'fulfilled' === bound.status
                ? callServer(id, bound.value.concat(args))
                : Promise.resolve(bound).then(function (boundArgs) {
                    return callServer(id, boundArgs.concat(args));
                  })
              : callServer(id, args);
          }
          var id = metaData.id,
            bound = metaData.bound;
          registerBoundServerReference(action, id, bound);
          return action;
        }
        function ReactPromise(status, value, reason) {
          this.status = status;
          this.value = value;
          this.reason = reason;
        }
        ReactPromise.prototype = Object.create(Promise.prototype);
        ReactPromise.prototype.then = function (resolve, reject) {
          switch (this.status) {
            case 'resolved_model':
              initializeModelChunk(this);
              break;
            case 'resolved_module':
              initializeModuleChunk(this);
          }
          switch (this.status) {
            case 'fulfilled':
              'function' === typeof resolve && resolve(this.value);
              break;
            case 'pending':
            case 'blocked':
              'function' === typeof resolve &&
                (null === this.value && (this.value = []),
                this.value.push(resolve));
              'function' === typeof reject &&
                (null === this.reason && (this.reason = []),
                this.reason.push(reject));
              break;
            case 'halted':
              break;
            default:
              'function' === typeof reject && reject(this.reason);
          }
        };
        function readChunk(chunk) {
          switch (chunk.status) {
            case 'resolved_model':
              initializeModelChunk(chunk);
              break;
            case 'resolved_module':
              initializeModuleChunk(chunk);
          }
          switch (chunk.status) {
            case 'fulfilled':
              return chunk.value;
            case 'pending':
            case 'blocked':
            case 'halted':
              throw chunk;
            default:
              throw chunk.reason;
          }
        }
        function wakeChunk(listeners, value) {
          for (var i = 0; i < listeners.length; i++) {
            var listener = listeners[i];
            'function' === typeof listener
              ? listener(value)
              : fulfillReference(listener, value);
          }
        }
        function rejectChunk(listeners, error) {
          for (var i = 0; i < listeners.length; i++) {
            var listener = listeners[i];
            'function' === typeof listener
              ? listener(error)
              : rejectReference(listener, error);
          }
        }
        function resolveBlockedCycle(resolvedChunk, reference) {
          var referencedChunk = reference.handler.chunk;
          if (null === referencedChunk) return null;
          if (referencedChunk === resolvedChunk) return reference.handler;
          reference = referencedChunk.value;
          if (null !== reference)
            for (
              referencedChunk = 0;
              referencedChunk < reference.length;
              referencedChunk++
            ) {
              var listener = reference[referencedChunk];
              if (
                'function' !== typeof listener &&
                ((listener = resolveBlockedCycle(resolvedChunk, listener)),
                null !== listener)
              )
                return listener;
            }
          return null;
        }
        function wakeChunkIfInitialized(
          chunk,
          resolveListeners,
          rejectListeners,
        ) {
          switch (chunk.status) {
            case 'fulfilled':
              wakeChunk(resolveListeners, chunk.value);
              break;
            case 'blocked':
              for (var i = 0; i < resolveListeners.length; i++) {
                var listener = resolveListeners[i];
                if ('function' !== typeof listener) {
                  var cyclicHandler = resolveBlockedCycle(chunk, listener);
                  null !== cyclicHandler &&
                    (fulfillReference(listener, cyclicHandler.value),
                    resolveListeners.splice(i, 1),
                    i--,
                    null !== rejectListeners &&
                      ((listener = rejectListeners.indexOf(listener)),
                      -1 !== listener && rejectListeners.splice(listener, 1)));
                }
              }
            case 'pending':
              if (chunk.value)
                for (i = 0; i < resolveListeners.length; i++)
                  chunk.value.push(resolveListeners[i]);
              else chunk.value = resolveListeners;
              if (chunk.reason) {
                if (rejectListeners)
                  for (
                    resolveListeners = 0;
                    resolveListeners < rejectListeners.length;
                    resolveListeners++
                  )
                    chunk.reason.push(rejectListeners[resolveListeners]);
              } else chunk.reason = rejectListeners;
              break;
            case 'rejected':
              rejectListeners && rejectChunk(rejectListeners, chunk.reason);
          }
        }
        function triggerErrorOnChunk(response, chunk, error) {
          'pending' !== chunk.status && 'blocked' !== chunk.status
            ? chunk.reason.error(error)
            : ((response = chunk.reason),
              (chunk.status = 'rejected'),
              (chunk.reason = error),
              null !== response && rejectChunk(response, error));
        }
        function createResolvedIteratorResultChunk(response, value, done) {
          return new ReactPromise(
            'resolved_model',
            (done ? '{"done":true,"value":' : '{"done":false,"value":') +
              value +
              '}',
            response,
          );
        }
        function resolveIteratorResultChunk(response, chunk, value, done) {
          resolveModelChunk(
            response,
            chunk,
            (done ? '{"done":true,"value":' : '{"done":false,"value":') +
              value +
              '}',
          );
        }
        function resolveModelChunk(response, chunk, value) {
          if ('pending' !== chunk.status) chunk.reason.enqueueModel(value);
          else {
            var resolveListeners = chunk.value,
              rejectListeners = chunk.reason;
            chunk.status = 'resolved_model';
            chunk.value = value;
            chunk.reason = response;
            null !== resolveListeners &&
              (initializeModelChunk(chunk),
              wakeChunkIfInitialized(chunk, resolveListeners, rejectListeners));
          }
        }
        function resolveModuleChunk(response, chunk, value) {
          if ('pending' === chunk.status || 'blocked' === chunk.status) {
            response = chunk.value;
            var rejectListeners = chunk.reason;
            chunk.status = 'resolved_module';
            chunk.value = value;
            null !== response &&
              (initializeModuleChunk(chunk),
              wakeChunkIfInitialized(chunk, response, rejectListeners));
          }
        }
        var initializingHandler = null;
        function initializeModelChunk(chunk) {
          var prevHandler = initializingHandler;
          initializingHandler = null;
          var resolvedModel = chunk.value,
            response = chunk.reason;
          chunk.status = 'blocked';
          chunk.value = null;
          chunk.reason = null;
          try {
            var value = JSON.parse(resolvedModel, response._fromJSON),
              resolveListeners = chunk.value;
            if (null !== resolveListeners)
              for (
                chunk.value = null, chunk.reason = null, resolvedModel = 0;
                resolvedModel < resolveListeners.length;
                resolvedModel++
              ) {
                var listener = resolveListeners[resolvedModel];
                'function' === typeof listener
                  ? listener(value)
                  : fulfillReference(listener, value, chunk);
              }
            if (null !== initializingHandler) {
              if (initializingHandler.errored) throw initializingHandler.reason;
              if (0 < initializingHandler.deps) {
                initializingHandler.value = value;
                initializingHandler.chunk = chunk;
                return;
              }
            }
            chunk.status = 'fulfilled';
            chunk.value = value;
          } catch (error) {
            (chunk.status = 'rejected'), (chunk.reason = error);
          } finally {
            initializingHandler = prevHandler;
          }
        }
        function initializeModuleChunk(chunk) {
          try {
            var value = requireModule(chunk.value);
            chunk.status = 'fulfilled';
            chunk.value = value;
          } catch (error) {
            (chunk.status = 'rejected'), (chunk.reason = error);
          }
        }
        function reportGlobalError(weakResponse, error) {
          weakResponse._closed = !0;
          weakResponse._closedReason = error;
          weakResponse._chunks.forEach(function (chunk) {
            'pending' === chunk.status &&
              triggerErrorOnChunk(weakResponse, chunk, error);
          });
        }
        function createLazyChunkWrapper(chunk) {
          return {
            $$typeof: REACT_LAZY_TYPE,
            _payload: chunk,
            _init: readChunk,
          };
        }
        function getChunk(response, id) {
          var chunks = response._chunks,
            chunk = chunks.get(id);
          chunk ||
            ((chunk = response._closed
              ? new ReactPromise('rejected', null, response._closedReason)
              : new ReactPromise('pending', null, null)),
            chunks.set(id, chunk));
          return chunk;
        }
        function fulfillReference(reference, value) {
          for (
            var response = reference.response,
              handler = reference.handler,
              parentObject = reference.parentObject,
              key = reference.key,
              map = reference.map,
              path = reference.path,
              i = 1;
            i < path.length;
            i++
          ) {
            for (
              ;
              'object' === typeof value &&
              null !== value &&
              value.$$typeof === REACT_LAZY_TYPE;

            )
              if (((value = value._payload), value === handler.chunk))
                value = handler.value;
              else {
                switch (value.status) {
                  case 'resolved_model':
                    initializeModelChunk(value);
                    break;
                  case 'resolved_module':
                    initializeModuleChunk(value);
                }
                switch (value.status) {
                  case 'fulfilled':
                    value = value.value;
                    continue;
                  case 'blocked':
                    var cyclicHandler = resolveBlockedCycle(value, reference);
                    if (null !== cyclicHandler) {
                      value = cyclicHandler.value;
                      continue;
                    }
                  case 'pending':
                    path.splice(0, i - 1);
                    null === value.value
                      ? (value.value = [reference])
                      : value.value.push(reference);
                    null === value.reason
                      ? (value.reason = [reference])
                      : value.reason.push(reference);
                    return;
                  case 'halted':
                    return;
                  default:
                    rejectReference(reference, value.reason);
                    return;
                }
              }
            value = value[path[i]];
          }
          for (
            ;
            'object' === typeof value &&
            null !== value &&
            value.$$typeof === REACT_LAZY_TYPE;

          )
            if (((reference = value._payload), reference === handler.chunk))
              value = handler.value;
            else {
              switch (reference.status) {
                case 'resolved_model':
                  initializeModelChunk(reference);
                  break;
                case 'resolved_module':
                  initializeModuleChunk(reference);
              }
              switch (reference.status) {
                case 'fulfilled':
                  value = reference.value;
                  continue;
              }
              break;
            }
          response = map(response, value, parentObject, key);
          parentObject[key] = response;
          '' === key && null === handler.value && (handler.value = response);
          if (
            parentObject[0] === REACT_ELEMENT_TYPE &&
            'object' === typeof handler.value &&
            null !== handler.value &&
            handler.value.$$typeof === REACT_ELEMENT_TYPE
          )
            switch (((parentObject = handler.value), key)) {
              case '3':
                parentObject.props = response;
            }
          handler.deps--;
          0 === handler.deps &&
            ((key = handler.chunk),
            null !== key &&
              'blocked' === key.status &&
              ((parentObject = key.value),
              (key.status = 'fulfilled'),
              (key.value = handler.value),
              (key.reason = handler.reason),
              null !== parentObject && wakeChunk(parentObject, handler.value)));
        }
        function rejectReference(reference, error) {
          var handler = reference.handler;
          reference = reference.response;
          handler.errored ||
            ((handler.errored = !0),
            (handler.value = null),
            (handler.reason = error),
            (handler = handler.chunk),
            null !== handler &&
              'blocked' === handler.status &&
              triggerErrorOnChunk(reference, handler, error));
        }
        function waitForReference(
          referencedChunk,
          parentObject,
          key,
          response,
          map,
          path,
        ) {
          if (initializingHandler) {
            var handler = initializingHandler;
            handler.deps++;
          } else
            handler = initializingHandler = {
              parent: null,
              chunk: null,
              value: null,
              reason: null,
              deps: 1,
              errored: !1,
            };
          parentObject = {
            response: response,
            handler: handler,
            parentObject: parentObject,
            key: key,
            map: map,
            path: path,
          };
          null === referencedChunk.value
            ? (referencedChunk.value = [parentObject])
            : referencedChunk.value.push(parentObject);
          null === referencedChunk.reason
            ? (referencedChunk.reason = [parentObject])
            : referencedChunk.reason.push(parentObject);
          return null;
        }
        function loadServerReference(response, metaData, parentObject, key) {
          if (!response._serverReferenceConfig)
            return createBoundServerReference(metaData, response._callServer);
          var serverReference = resolveServerReference(
              response._serverReferenceConfig,
              metaData.id,
            ),
            promise = preloadModule(serverReference);
          if (promise)
            metaData.bound &&
              (promise = Promise.all([promise, metaData.bound]));
          else if (metaData.bound) promise = Promise.resolve(metaData.bound);
          else
            return (
              (promise = requireModule(serverReference)),
              registerBoundServerReference(
                promise,
                metaData.id,
                metaData.bound,
              ),
              promise
            );
          if (initializingHandler) {
            var handler = initializingHandler;
            handler.deps++;
          } else
            handler = initializingHandler = {
              parent: null,
              chunk: null,
              value: null,
              reason: null,
              deps: 1,
              errored: !1,
            };
          promise.then(
            function () {
              var resolvedValue = requireModule(serverReference);
              if (metaData.bound) {
                var boundArgs = metaData.bound.value.slice(0);
                boundArgs.unshift(null);
                resolvedValue = resolvedValue.bind.apply(
                  resolvedValue,
                  boundArgs,
                );
              }
              registerBoundServerReference(
                resolvedValue,
                metaData.id,
                metaData.bound,
              );
              parentObject[key] = resolvedValue;
              '' === key &&
                null === handler.value &&
                (handler.value = resolvedValue);
              if (
                parentObject[0] === REACT_ELEMENT_TYPE &&
                'object' === typeof handler.value &&
                null !== handler.value &&
                handler.value.$$typeof === REACT_ELEMENT_TYPE
              )
                switch (((boundArgs = handler.value), key)) {
                  case '3':
                    boundArgs.props = resolvedValue;
                }
              handler.deps--;
              0 === handler.deps &&
                ((resolvedValue = handler.chunk),
                null !== resolvedValue &&
                  'blocked' === resolvedValue.status &&
                  ((boundArgs = resolvedValue.value),
                  (resolvedValue.status = 'fulfilled'),
                  (resolvedValue.value = handler.value),
                  null !== boundArgs && wakeChunk(boundArgs, handler.value)));
            },
            function (error) {
              if (!handler.errored) {
                handler.errored = !0;
                handler.value = null;
                handler.reason = error;
                var chunk = handler.chunk;
                null !== chunk &&
                  'blocked' === chunk.status &&
                  triggerErrorOnChunk(response, chunk, error);
              }
            },
          );
          return null;
        }
        function getOutlinedModel(response, reference, parentObject, key, map) {
          reference = reference.split(':');
          var id = parseInt(reference[0], 16);
          id = getChunk(response, id);
          switch (id.status) {
            case 'resolved_model':
              initializeModelChunk(id);
              break;
            case 'resolved_module':
              initializeModuleChunk(id);
          }
          switch (id.status) {
            case 'fulfilled':
              id = id.value;
              for (var i = 1; i < reference.length; i++) {
                for (
                  ;
                  'object' === typeof id &&
                  null !== id &&
                  id.$$typeof === REACT_LAZY_TYPE;

                ) {
                  id = id._payload;
                  switch (id.status) {
                    case 'resolved_model':
                      initializeModelChunk(id);
                      break;
                    case 'resolved_module':
                      initializeModuleChunk(id);
                  }
                  switch (id.status) {
                    case 'fulfilled':
                      id = id.value;
                      break;
                    case 'blocked':
                    case 'pending':
                      return waitForReference(
                        id,
                        parentObject,
                        key,
                        response,
                        map,
                        reference.slice(i - 1),
                      );
                    case 'halted':
                      return (
                        initializingHandler
                          ? ((response = initializingHandler), response.deps++)
                          : (initializingHandler = {
                              parent: null,
                              chunk: null,
                              value: null,
                              reason: null,
                              deps: 1,
                              errored: !1,
                            }),
                        null
                      );
                    default:
                      return (
                        initializingHandler
                          ? ((initializingHandler.errored = !0),
                            (initializingHandler.value = null),
                            (initializingHandler.reason = id.reason))
                          : (initializingHandler = {
                              parent: null,
                              chunk: null,
                              value: null,
                              reason: id.reason,
                              deps: 0,
                              errored: !0,
                            }),
                        null
                      );
                  }
                }
                id = id[reference[i]];
              }
              for (
                ;
                'object' === typeof id &&
                null !== id &&
                id.$$typeof === REACT_LAZY_TYPE;

              ) {
                reference = id._payload;
                switch (reference.status) {
                  case 'resolved_model':
                    initializeModelChunk(reference);
                    break;
                  case 'resolved_module':
                    initializeModuleChunk(reference);
                }
                switch (reference.status) {
                  case 'fulfilled':
                    id = reference.value;
                    continue;
                }
                break;
              }
              return map(response, id, parentObject, key);
            case 'pending':
            case 'blocked':
              return waitForReference(
                id,
                parentObject,
                key,
                response,
                map,
                reference,
              );
            case 'halted':
              return (
                initializingHandler
                  ? ((response = initializingHandler), response.deps++)
                  : (initializingHandler = {
                      parent: null,
                      chunk: null,
                      value: null,
                      reason: null,
                      deps: 1,
                      errored: !1,
                    }),
                null
              );
            default:
              return (
                initializingHandler
                  ? ((initializingHandler.errored = !0),
                    (initializingHandler.value = null),
                    (initializingHandler.reason = id.reason))
                  : (initializingHandler = {
                      parent: null,
                      chunk: null,
                      value: null,
                      reason: id.reason,
                      deps: 0,
                      errored: !0,
                    }),
                null
              );
          }
        }
        function createMap(response, model) {
          return new Map(model);
        }
        function createSet(response, model) {
          return new Set(model);
        }
        function createBlob(response, model) {
          return new Blob(model.slice(1), {
            type: model[0],
          });
        }
        function createFormData(response, model) {
          response = new FormData();
          for (var i = 0; i < model.length; i++)
            response.append(model[i][0], model[i][1]);
          return response;
        }
        function extractIterator(response, model) {
          return model[Symbol.iterator]();
        }
        function createModel(response, model) {
          return model;
        }
        function parseModelString(response, parentObject, key, value) {
          if ('$' === value[0]) {
            if ('$' === value)
              return (
                null !== initializingHandler &&
                  '0' === key &&
                  (initializingHandler = {
                    parent: initializingHandler,
                    chunk: null,
                    value: null,
                    reason: null,
                    deps: 0,
                    errored: !1,
                  }),
                REACT_ELEMENT_TYPE
              );
            switch (value[1]) {
              case '$':
                return value.slice(1);
              case 'L':
                return (
                  (parentObject = parseInt(value.slice(2), 16)),
                  (response = getChunk(response, parentObject)),
                  createLazyChunkWrapper(response)
                );
              case '@':
                return (
                  (parentObject = parseInt(value.slice(2), 16)),
                  getChunk(response, parentObject)
                );
              case 'S':
                return Symbol.for(value.slice(2));
              case 'F':
                return (
                  (value = value.slice(2)),
                  getOutlinedModel(
                    response,
                    value,
                    parentObject,
                    key,
                    loadServerReference,
                  )
                );
              case 'T':
                parentObject = '$' + value.slice(2);
                response = response._tempRefs;
                if (null == response)
                  throw Error(
                    'Missing a temporary reference set but the RSC response returned a temporary reference. Pass a temporaryReference option with the set that was used with the reply.',
                  );
                return response.get(parentObject);
              case 'Q':
                return (
                  (value = value.slice(2)),
                  getOutlinedModel(
                    response,
                    value,
                    parentObject,
                    key,
                    createMap,
                  )
                );
              case 'W':
                return (
                  (value = value.slice(2)),
                  getOutlinedModel(
                    response,
                    value,
                    parentObject,
                    key,
                    createSet,
                  )
                );
              case 'B':
                return (
                  (value = value.slice(2)),
                  getOutlinedModel(
                    response,
                    value,
                    parentObject,
                    key,
                    createBlob,
                  )
                );
              case 'K':
                return (
                  (value = value.slice(2)),
                  getOutlinedModel(
                    response,
                    value,
                    parentObject,
                    key,
                    createFormData,
                  )
                );
              case 'Z':
                return resolveErrorProd();
              case 'i':
                return (
                  (value = value.slice(2)),
                  getOutlinedModel(
                    response,
                    value,
                    parentObject,
                    key,
                    extractIterator,
                  )
                );
              case 'I':
                return Infinity;
              case '-':
                return '$-0' === value ? -0 : -Infinity;
              case 'N':
                return NaN;
              case 'u':
                return;
              case 'D':
                return new Date(Date.parse(value.slice(2)));
              case 'n':
                return BigInt(value.slice(2));
              default:
                return (
                  (value = value.slice(1)),
                  getOutlinedModel(
                    response,
                    value,
                    parentObject,
                    key,
                    createModel,
                  )
                );
            }
          }
          return value;
        }
        function missingCall() {
          throw Error(
            'Trying to call a function from "use server" but the callServer option was not implemented in your router runtime.',
          );
        }
        function ResponseInstance(
          bundlerConfig,
          serverReferenceConfig,
          moduleLoading,
          callServer,
          encodeFormAction,
          nonce,
          temporaryReferences,
        ) {
          var chunks = new Map();
          this._bundlerConfig = bundlerConfig;
          this._serverReferenceConfig = serverReferenceConfig;
          this._moduleLoading = moduleLoading;
          this._callServer = void 0 !== callServer ? callServer : missingCall;
          this._encodeFormAction = encodeFormAction;
          this._nonce = nonce;
          this._chunks = chunks;
          this._stringDecoder = new TextDecoder();
          this._fromJSON = null;
          this._closed = !1;
          this._closedReason = null;
          this._tempRefs = temporaryReferences;
          this._fromJSON = createFromJSONCallback(this);
        }
        function resolveBuffer(response, id, buffer) {
          response = response._chunks;
          var chunk = response.get(id);
          chunk && 'pending' !== chunk.status
            ? chunk.reason.enqueueValue(buffer)
            : ((buffer = new ReactPromise('fulfilled', buffer, null)),
              response.set(id, buffer));
        }
        function resolveModule(response, id, model) {
          var chunks = response._chunks,
            chunk = chunks.get(id);
          model = JSON.parse(model, response._fromJSON);
          var clientReference = resolveClientReference(
            response._bundlerConfig,
            model,
          );
          if ((model = preloadModule(clientReference))) {
            if (chunk) {
              var blockedChunk = chunk;
              blockedChunk.status = 'blocked';
            } else
              (blockedChunk = new ReactPromise('blocked', null, null)),
                chunks.set(id, blockedChunk);
            model.then(
              function () {
                return resolveModuleChunk(
                  response,
                  blockedChunk,
                  clientReference,
                );
              },
              function (error) {
                return triggerErrorOnChunk(response, blockedChunk, error);
              },
            );
          } else
            chunk
              ? resolveModuleChunk(response, chunk, clientReference)
              : ((chunk = new ReactPromise(
                  'resolved_module',
                  clientReference,
                  null,
                )),
                chunks.set(id, chunk));
        }
        function resolveStream(response, id, stream, controller) {
          response = response._chunks;
          var chunk = response.get(id);
          chunk
            ? 'pending' === chunk.status &&
              ((id = chunk.value),
              (chunk.status = 'fulfilled'),
              (chunk.value = stream),
              (chunk.reason = controller),
              null !== id && wakeChunk(id, chunk.value))
            : ((stream = new ReactPromise('fulfilled', stream, controller)),
              response.set(id, stream));
        }
        function startReadableStream(response, id, type) {
          var controller = null;
          type = new ReadableStream({
            type: type,
            start: function (c) {
              controller = c;
            },
          });
          var previousBlockedChunk = null;
          resolveStream(response, id, type, {
            enqueueValue: function (value) {
              null === previousBlockedChunk
                ? controller.enqueue(value)
                : previousBlockedChunk.then(function () {
                    controller.enqueue(value);
                  });
            },
            enqueueModel: function (json) {
              if (null === previousBlockedChunk) {
                var chunk = new ReactPromise('resolved_model', json, response);
                initializeModelChunk(chunk);
                'fulfilled' === chunk.status
                  ? controller.enqueue(chunk.value)
                  : (chunk.then(
                      function (v) {
                        return controller.enqueue(v);
                      },
                      function (e) {
                        return controller.error(e);
                      },
                    ),
                    (previousBlockedChunk = chunk));
              } else {
                chunk = previousBlockedChunk;
                var chunk$54 = new ReactPromise('pending', null, null);
                chunk$54.then(
                  function (v) {
                    return controller.enqueue(v);
                  },
                  function (e) {
                    return controller.error(e);
                  },
                );
                previousBlockedChunk = chunk$54;
                chunk.then(function () {
                  previousBlockedChunk === chunk$54 &&
                    (previousBlockedChunk = null);
                  resolveModelChunk(response, chunk$54, json);
                });
              }
            },
            close: function () {
              if (null === previousBlockedChunk) controller.close();
              else {
                var blockedChunk = previousBlockedChunk;
                previousBlockedChunk = null;
                blockedChunk.then(function () {
                  return controller.close();
                });
              }
            },
            error: function (error) {
              if (null === previousBlockedChunk) controller.error(error);
              else {
                var blockedChunk = previousBlockedChunk;
                previousBlockedChunk = null;
                blockedChunk.then(function () {
                  return controller.error(error);
                });
              }
            },
          });
        }
        function asyncIterator() {
          return this;
        }
        function createIterator(next) {
          next = {
            next: next,
          };
          next[ASYNC_ITERATOR] = asyncIterator;
          return next;
        }
        function startAsyncIterable(response, id, iterator) {
          var buffer = [],
            closed = !1,
            nextWriteIndex = 0,
            iterable = {};
          iterable[ASYNC_ITERATOR] = function () {
            var nextReadIndex = 0;
            return createIterator(function (arg) {
              if (void 0 !== arg)
                throw Error(
                  'Values cannot be passed to next() of AsyncIterables passed to Client Components.',
                );
              if (nextReadIndex === buffer.length) {
                if (closed)
                  return new ReactPromise(
                    'fulfilled',
                    {
                      done: !0,
                      value: void 0,
                    },
                    null,
                  );
                buffer[nextReadIndex] = new ReactPromise('pending', null, null);
              }
              return buffer[nextReadIndex++];
            });
          };
          resolveStream(
            response,
            id,
            iterator ? iterable[ASYNC_ITERATOR]() : iterable,
            {
              enqueueValue: function (value) {
                if (nextWriteIndex === buffer.length)
                  buffer[nextWriteIndex] = new ReactPromise(
                    'fulfilled',
                    {
                      done: !1,
                      value: value,
                    },
                    null,
                  );
                else {
                  var chunk = buffer[nextWriteIndex],
                    resolveListeners = chunk.value,
                    rejectListeners = chunk.reason;
                  chunk.status = 'fulfilled';
                  chunk.value = {
                    done: !1,
                    value: value,
                  };
                  null !== resolveListeners &&
                    wakeChunkIfInitialized(
                      chunk,
                      resolveListeners,
                      rejectListeners,
                    );
                }
                nextWriteIndex++;
              },
              enqueueModel: function (value) {
                nextWriteIndex === buffer.length
                  ? (buffer[nextWriteIndex] = createResolvedIteratorResultChunk(
                      response,
                      value,
                      !1,
                    ))
                  : resolveIteratorResultChunk(
                      response,
                      buffer[nextWriteIndex],
                      value,
                      !1,
                    );
                nextWriteIndex++;
              },
              close: function (value) {
                closed = !0;
                nextWriteIndex === buffer.length
                  ? (buffer[nextWriteIndex] = createResolvedIteratorResultChunk(
                      response,
                      value,
                      !0,
                    ))
                  : resolveIteratorResultChunk(
                      response,
                      buffer[nextWriteIndex],
                      value,
                      !0,
                    );
                for (nextWriteIndex++; nextWriteIndex < buffer.length; )
                  resolveIteratorResultChunk(
                    response,
                    buffer[nextWriteIndex++],
                    '"$undefined"',
                    !0,
                  );
              },
              error: function (error) {
                closed = !0;
                for (
                  nextWriteIndex === buffer.length &&
                  (buffer[nextWriteIndex] = new ReactPromise(
                    'pending',
                    null,
                    null,
                  ));
                  nextWriteIndex < buffer.length;

                )
                  triggerErrorOnChunk(
                    response,
                    buffer[nextWriteIndex++],
                    error,
                  );
              },
            },
          );
        }
        function resolveErrorProd() {
          var error = Error(
            'An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive details. A digest property is included on this error instance which may provide additional details about the nature of the error.',
          );
          error.stack = 'Error: ' + error.message;
          return error;
        }
        function mergeBuffer(buffer, lastChunk) {
          for (
            var l = buffer.length, byteLength = lastChunk.length, i = 0;
            i < l;
            i++
          )
            byteLength += buffer[i].byteLength;
          byteLength = new Uint8Array(byteLength);
          for (var i$55 = (i = 0); i$55 < l; i$55++) {
            var chunk = buffer[i$55];
            byteLength.set(chunk, i);
            i += chunk.byteLength;
          }
          byteLength.set(lastChunk, i);
          return byteLength;
        }
        function resolveTypedArray(
          response,
          id,
          buffer,
          lastChunk,
          constructor,
          bytesPerElement,
        ) {
          buffer =
            0 === buffer.length && 0 === lastChunk.byteOffset % bytesPerElement
              ? lastChunk
              : mergeBuffer(buffer, lastChunk);
          constructor = new constructor(
            buffer.buffer,
            buffer.byteOffset,
            buffer.byteLength / bytesPerElement,
          );
          resolveBuffer(response, id, constructor);
        }
        function processFullBinaryRow(
          response,
          streamState,
          id,
          tag,
          buffer,
          chunk,
        ) {
          switch (tag) {
            case 65:
              resolveBuffer(response, id, mergeBuffer(buffer, chunk).buffer);
              return;
            case 79:
              resolveTypedArray(response, id, buffer, chunk, Int8Array, 1);
              return;
            case 111:
              resolveBuffer(
                response,
                id,
                0 === buffer.length ? chunk : mergeBuffer(buffer, chunk),
              );
              return;
            case 85:
              resolveTypedArray(
                response,
                id,
                buffer,
                chunk,
                Uint8ClampedArray,
                1,
              );
              return;
            case 83:
              resolveTypedArray(response, id, buffer, chunk, Int16Array, 2);
              return;
            case 115:
              resolveTypedArray(response, id, buffer, chunk, Uint16Array, 2);
              return;
            case 76:
              resolveTypedArray(response, id, buffer, chunk, Int32Array, 4);
              return;
            case 108:
              resolveTypedArray(response, id, buffer, chunk, Uint32Array, 4);
              return;
            case 71:
              resolveTypedArray(response, id, buffer, chunk, Float32Array, 4);
              return;
            case 103:
              resolveTypedArray(response, id, buffer, chunk, Float64Array, 8);
              return;
            case 77:
              resolveTypedArray(response, id, buffer, chunk, BigInt64Array, 8);
              return;
            case 109:
              resolveTypedArray(response, id, buffer, chunk, BigUint64Array, 8);
              return;
            case 86:
              resolveTypedArray(response, id, buffer, chunk, DataView, 1);
              return;
          }
          streamState = response._stringDecoder;
          for (var row = '', i = 0; i < buffer.length; i++)
            row += streamState.decode(buffer[i], decoderOptions);
          buffer = row += streamState.decode(chunk);
          switch (tag) {
            case 73:
              resolveModule(response, id, buffer);
              break;
            case 72:
              id = buffer[0];
              buffer = buffer.slice(1);
              response = JSON.parse(buffer, response._fromJSON);
              buffer = ReactDOMSharedInternals.d;
              switch (id) {
                case 'D':
                  buffer.D(response);
                  break;
                case 'C':
                  'string' === typeof response
                    ? buffer.C(response)
                    : buffer.C(response[0], response[1]);
                  break;
                case 'L':
                  id = response[0];
                  tag = response[1];
                  3 === response.length
                    ? buffer.L(id, tag, response[2])
                    : buffer.L(id, tag);
                  break;
                case 'm':
                  'string' === typeof response
                    ? buffer.m(response)
                    : buffer.m(response[0], response[1]);
                  break;
                case 'X':
                  'string' === typeof response
                    ? buffer.X(response)
                    : buffer.X(response[0], response[1]);
                  break;
                case 'S':
                  'string' === typeof response
                    ? buffer.S(response)
                    : buffer.S(
                        response[0],
                        0 === response[1] ? void 0 : response[1],
                        3 === response.length ? response[2] : void 0,
                      );
                  break;
                case 'M':
                  'string' === typeof response
                    ? buffer.M(response)
                    : buffer.M(response[0], response[1]);
              }
              break;
            case 69:
              tag = response._chunks;
              chunk = tag.get(id);
              buffer = JSON.parse(buffer);
              streamState = resolveErrorProd();
              streamState.digest = buffer.digest;
              chunk
                ? triggerErrorOnChunk(response, chunk, streamState)
                : ((response = new ReactPromise('rejected', null, streamState)),
                  tag.set(id, response));
              break;
            case 84:
              response = response._chunks;
              (tag = response.get(id)) && 'pending' !== tag.status
                ? tag.reason.enqueueValue(buffer)
                : ((buffer = new ReactPromise('fulfilled', buffer, null)),
                  response.set(id, buffer));
              break;
            case 78:
            case 68:
            case 74:
            case 87:
              throw Error(
                'Failed to read a RSC payload created by a development version of React on the server while using a production version on the client. Always use matching versions on the server and the client.',
              );
            case 82:
              startReadableStream(response, id, void 0);
              break;
            case 114:
              startReadableStream(response, id, 'bytes');
              break;
            case 88:
              startAsyncIterable(response, id, !1);
              break;
            case 120:
              startAsyncIterable(response, id, !0);
              break;
            case 67:
              (id = response._chunks.get(id)) &&
                'fulfilled' === id.status &&
                id.reason.close('' === buffer ? '"$undefined"' : buffer);
              break;
            default:
              (tag = response._chunks),
                (chunk = tag.get(id))
                  ? resolveModelChunk(response, chunk, buffer)
                  : ((response = new ReactPromise(
                      'resolved_model',
                      buffer,
                      response,
                    )),
                    tag.set(id, response));
          }
        }
        function createFromJSONCallback(response) {
          return function (key, value) {
            if ('string' === typeof value)
              return parseModelString(response, this, key, value);
            if ('object' === typeof value && null !== value) {
              if (value[0] === REACT_ELEMENT_TYPE) {
                if (
                  ((key = {
                    $$typeof: REACT_ELEMENT_TYPE,
                    type: value[1],
                    key: value[2],
                    ref: null,
                    props: value[3],
                  }),
                  null !== initializingHandler)
                )
                  if (
                    ((value = initializingHandler),
                    (initializingHandler = value.parent),
                    value.errored)
                  )
                    (key = new ReactPromise('rejected', null, value.reason)),
                      (key = createLazyChunkWrapper(key));
                  else if (0 < value.deps) {
                    var blockedChunk = new ReactPromise('blocked', null, null);
                    value.value = key;
                    value.chunk = blockedChunk;
                    key = createLazyChunkWrapper(blockedChunk);
                  }
              } else key = value;
              return key;
            }
            return value;
          };
        }
        function close(weakResponse) {
          reportGlobalError(weakResponse, Error('Connection closed.'));
        }
        function createResponseFromOptions(options) {
          return new ResponseInstance(
            null,
            null,
            null,
            options && options.callServer ? options.callServer : void 0,
            void 0,
            void 0,
            options && options.temporaryReferences
              ? options.temporaryReferences
              : void 0,
          );
        }
        function startReadingFromStream(response, stream, onDone) {
          function progress(_ref2) {
            var value = _ref2.value;
            if (_ref2.done) return onDone();
            var i = 0,
              rowState = streamState._rowState;
            _ref2 = streamState._rowID;
            for (
              var rowTag = streamState._rowTag,
                rowLength = streamState._rowLength,
                buffer = streamState._buffer,
                chunkLength = value.length;
              i < chunkLength;

            ) {
              var lastIdx = -1;
              switch (rowState) {
                case 0:
                  lastIdx = value[i++];
                  58 === lastIdx
                    ? (rowState = 1)
                    : (_ref2 =
                        (_ref2 << 4) |
                        (96 < lastIdx ? lastIdx - 87 : lastIdx - 48));
                  continue;
                case 1:
                  rowState = value[i];
                  84 === rowState ||
                  65 === rowState ||
                  79 === rowState ||
                  111 === rowState ||
                  85 === rowState ||
                  83 === rowState ||
                  115 === rowState ||
                  76 === rowState ||
                  108 === rowState ||
                  71 === rowState ||
                  103 === rowState ||
                  77 === rowState ||
                  109 === rowState ||
                  86 === rowState
                    ? ((rowTag = rowState), (rowState = 2), i++)
                    : (64 < rowState && 91 > rowState) ||
                        35 === rowState ||
                        114 === rowState ||
                        120 === rowState
                      ? ((rowTag = rowState), (rowState = 3), i++)
                      : ((rowTag = 0), (rowState = 3));
                  continue;
                case 2:
                  lastIdx = value[i++];
                  44 === lastIdx
                    ? (rowState = 4)
                    : (rowLength =
                        (rowLength << 4) |
                        (96 < lastIdx ? lastIdx - 87 : lastIdx - 48));
                  continue;
                case 3:
                  lastIdx = value.indexOf(10, i);
                  break;
                case 4:
                  (lastIdx = i + rowLength),
                    lastIdx > value.length && (lastIdx = -1);
              }
              var offset = value.byteOffset + i;
              if (-1 < lastIdx)
                (rowLength = new Uint8Array(value.buffer, offset, lastIdx - i)),
                  processFullBinaryRow(
                    response,
                    streamState,
                    _ref2,
                    rowTag,
                    buffer,
                    rowLength,
                  ),
                  (i = lastIdx),
                  3 === rowState && i++,
                  (rowLength = _ref2 = rowTag = rowState = 0),
                  (buffer.length = 0);
              else {
                value = new Uint8Array(
                  value.buffer,
                  offset,
                  value.byteLength - i,
                );
                buffer.push(value);
                rowLength -= value.byteLength;
                break;
              }
            }
            streamState._rowState = rowState;
            streamState._rowID = _ref2;
            streamState._rowTag = rowTag;
            streamState._rowLength = rowLength;
            return reader.read().then(progress).catch(error);
          }
          function error(e) {
            reportGlobalError(response, e);
          }
          var streamState = {
              _rowState: 0,
              _rowID: 0,
              _rowTag: 0,
              _rowLength: 0,
              _buffer: [],
            },
            reader = stream.getReader();
          reader.read().then(progress).catch(error);
        }
        exports.createFromFetch = function (promiseForResponse, options) {
          var response = createResponseFromOptions(options);
          promiseForResponse.then(
            function (r) {
              startReadingFromStream(
                response,
                r.body,
                close.bind(null, response),
              );
            },
            function (e) {
              reportGlobalError(response, e);
            },
          );
          return getChunk(response, 0);
        };
        exports.createFromReadableStream = function (stream, options) {
          options = createResponseFromOptions(options);
          startReadingFromStream(options, stream, close.bind(null, options));
          return getChunk(options, 0);
        };
        exports.createServerReference = function (id, callServer) {
          function action() {
            var args = Array.prototype.slice.call(arguments);
            return callServer(id, args);
          }
          registerBoundServerReference(action, id, null);
          return action;
        };
        exports.createTemporaryReferenceSet = function () {
          return new Map();
        };
        exports.encodeReply = function (value, options) {
          return new Promise(function (resolve, reject) {
            var abort = processReply(
              value,
              '',
              options && options.temporaryReferences
                ? options.temporaryReferences
                : void 0,
              resolve,
              reject,
            );
            if (options && options.signal) {
              var signal = options.signal;
              if (signal.aborted) abort(signal.reason);
              else {
                var listener = function () {
                  abort(signal.reason);
                  signal.removeEventListener('abort', listener);
                };
                signal.addEventListener('abort', listener);
              }
            }
          });
        };
        exports.registerServerReference = function (reference, id) {
          registerBoundServerReference(reference, id, null);
          return reference;
        };

        /***/
      },

    /***/ '(client)/../../../packages/react-server-dom-webpack/client.browser.js':
      /***/ (module, __unused_webpack_exports, __webpack_require__) => {
        'use strict';

        if (true) {
          module.exports = __webpack_require__(
            '(client)/../../../packages/react-server-dom-webpack/cjs/react-server-dom-webpack-client.browser.production.js',
          );
        } else {
        }

        /***/
      },

    /***/ '(client)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/cjs/react-jsx-runtime.production.js':
      /***/ (__unused_webpack_module, exports) => {
        'use strict';
        /**
         * @license React
         * react-jsx-runtime.production.js
         *
         * Copyright (c) Meta Platforms, Inc. and affiliates.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */

        var REACT_ELEMENT_TYPE = Symbol.for('react.transitional.element'),
          REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
        function jsxProd(type, config, maybeKey) {
          var key = null;
          void 0 !== maybeKey && (key = '' + maybeKey);
          void 0 !== config.key && (key = '' + config.key);
          if ('key' in config) {
            maybeKey = {};
            for (var propName in config)
              'key' !== propName && (maybeKey[propName] = config[propName]);
          } else maybeKey = config;
          config = maybeKey.ref;
          return {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            ref: void 0 !== config ? config : null,
            props: maybeKey,
          };
        }
        exports.Fragment = REACT_FRAGMENT_TYPE;
        exports.jsx = jsxProd;
        exports.jsxs = jsxProd;

        /***/
      },

    /***/ '(client)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.js':
      /***/ (module, __unused_webpack_exports, __webpack_require__) => {
        'use strict';

        if (true) {
          module.exports = __webpack_require__(
            '(client)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/cjs/react-jsx-runtime.production.js',
          );
        } else {
        }

        /***/
      },
  },
]);
//# sourceMappingURL=_client_shared_src_index_js-_6a6d-_6382-_b01c-_e707-_2752-_715a0.js.map
