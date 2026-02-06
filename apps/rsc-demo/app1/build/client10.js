(self['webpackChunkapp1'] = self['webpackChunkapp1'] || []).push([
  ['client10'],
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
  },
]);
//# sourceMappingURL=client10.js.map
