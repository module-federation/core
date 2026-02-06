(self['webpackChunkapp1'] = self['webpackChunkapp1'] || []).push([
  [
    '_client_shared_src_index_js-_6a6d-_6382-_b01c-_e707-_2752-_715a1',
    'client9',
    'client10',
    'client11',
    'client12',
    'client13',
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
  },
]);
//# sourceMappingURL=_client_shared_src_index_js-_6a6d-_6382-_b01c-_e707-_2752-_715a1.js.map
