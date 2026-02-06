(self['webpackChunkapp1'] = self['webpackChunkapp1'] || []).push([
  ['client3'],
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

    /***/ '(client)/../shared/dist/NoteEditor.js': /***/ (
      __unused_webpack_module,
      exports,
      __webpack_require__,
    ) => {
      'use client';
      'use strict';

      var __nested_webpack_require_33__ = {};
      (() => {
        __nested_webpack_require_33__.n = (module) => {
          var getter =
            module && module.__esModule
              ? () => module['default']
              : () => module;
          __nested_webpack_require_33__.d(getter, {
            a: getter,
          });
          return getter;
        };
      })();
      (() => {
        __nested_webpack_require_33__.d = (exports1, definition) => {
          for (var key in definition)
            if (
              __nested_webpack_require_33__.o(definition, key) &&
              !__nested_webpack_require_33__.o(exports1, key)
            )
              Object.defineProperty(exports1, key, {
                enumerable: true,
                get: definition[key],
              });
        };
      })();
      (() => {
        __nested_webpack_require_33__.o = (obj, prop) =>
          Object.prototype.hasOwnProperty.call(obj, prop);
      })();
      (() => {
        __nested_webpack_require_33__.r = (exports1) => {
          if ('undefined' != typeof Symbol && Symbol.toStringTag)
            Object.defineProperty(exports1, Symbol.toStringTag, {
              value: 'Module',
            });
          Object.defineProperty(exports1, '__esModule', {
            value: true,
          });
        };
      })();
      var __webpack_exports__ = {};
      __nested_webpack_require_33__.r(__webpack_exports__);
      __nested_webpack_require_33__.d(__webpack_exports__, {
        default: () => NoteEditor,
      });
      const jsx_runtime_namespaceObject = __webpack_require__(
        '(client)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.js',
      );
      const external_react_namespaceObject = __webpack_require__(
        '(client)/webpack/sharing/consume/client/react/react',
      );
      const router_namespaceObject = __webpack_require__(
        '(client)/../framework/framework/router.js',
      );
      const external_NotePreview_js_namespaceObject = __webpack_require__(
        '(client)/../shared/dist/NotePreview.js',
      );
      var external_NotePreview_js_default =
        /*#__PURE__*/ __nested_webpack_require_33__.n(
          external_NotePreview_js_namespaceObject,
        );
      ('use client');
      function NoteEditor({ noteId, initialTitle, initialBody }) {
        const [title, setTitle] = (0, external_react_namespaceObject.useState)(
          initialTitle,
        );
        const [body, setBody] = (0, external_react_namespaceObject.useState)(
          initialBody,
        );
        const { location } = (0, router_namespaceObject.useRouter)();
        const [isNavigating, startNavigating] = (0,
        external_react_namespaceObject.useTransition)();
        const [isSaving, saveNote] = (0, router_namespaceObject.useMutation)({
          endpoint: null !== noteId ? `/notes/${noteId}` : '/notes',
          method: null !== noteId ? 'PUT' : 'POST',
        });
        const [isDeleting, deleteNote] = (0,
        router_namespaceObject.useMutation)({
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
        const isDraft = null === noteId;
        return /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsxs)('div', {
          className: 'note-editor',
          children: [
            /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsxs)('form', {
              className: 'note-editor-form',
              autoComplete: 'off',
              onSubmit: (e) => e.preventDefault(),
              children: [
                /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsx)('label', {
                  className: 'offscreen',
                  htmlFor: 'note-title-input',
                  children: 'Enter a title for your note',
                }),
                /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsx)('input', {
                  id: 'note-title-input',
                  type: 'text',
                  value: title,
                  onChange: (e) => {
                    setTitle(e.target.value);
                  },
                }),
                /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsx)('label', {
                  className: 'offscreen',
                  htmlFor: 'note-body-input',
                  children: 'Enter the body for your note',
                }),
                /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsx)('textarea', {
                  id: 'note-body-input',
                  value: body,
                  onChange: (e) => {
                    setBody(e.target.value);
                  },
                }),
              ],
            }),
            /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsxs)('div', {
              className: 'note-editor-preview',
              children: [
                /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsxs)('div', {
                  className: 'note-editor-menu',
                  role: 'menubar',
                  children: [
                    /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsxs)(
                      'button',
                      {
                        className: 'note-editor-done',
                        disabled: isSaving || isNavigating,
                        onClick: () => handleSave(),
                        role: 'menuitem',
                        children: [
                          /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsx)(
                            'img',
                            {
                              src: 'checkmark.svg',
                              width: '14px',
                              height: '10px',
                              alt: '',
                              role: 'presentation',
                            },
                          ),
                          'Done',
                        ],
                      },
                    ),
                    !isDraft &&
                      /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsxs)(
                        'button',
                        {
                          className: 'note-editor-delete',
                          disabled: isDeleting || isNavigating,
                          onClick: () => handleDelete(),
                          role: 'menuitem',
                          children: [
                            /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsx)(
                              'img',
                              {
                                src: 'cross.svg',
                                width: '10px',
                                height: '10px',
                                alt: '',
                                role: 'presentation',
                              },
                            ),
                            'Delete',
                          ],
                        },
                      ),
                  ],
                }),
                /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsx)('div', {
                  className: 'label label--preview',
                  role: 'status',
                  children: 'Preview',
                }),
                /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsx)('h1', {
                  className: 'note-title',
                  children: title,
                }),
                /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsx)(
                  external_NotePreview_js_default(),
                  {
                    title: title,
                    body: body,
                  },
                ),
              ],
            }),
          ],
        });
      }
      exports['default'] = __webpack_exports__['default'];
      for (var __webpack_i__ in __webpack_exports__)
        if (-1 === ['default'].indexOf(__webpack_i__))
          exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
      Object.defineProperty(exports, '__esModule', {
        value: true,
      });

      /***/
    },

    /***/ '(client)/../shared/dist/NotePreview.js': /***/ (
      __unused_webpack_module,
      exports,
      __webpack_require__,
    ) => {
      'use strict';

      var __nested_webpack_require_19__ = {};
      (() => {
        __nested_webpack_require_19__.n = (module) => {
          var getter =
            module && module.__esModule
              ? () => module['default']
              : () => module;
          __nested_webpack_require_19__.d(getter, {
            a: getter,
          });
          return getter;
        };
      })();
      (() => {
        __nested_webpack_require_19__.d = (exports1, definition) => {
          for (var key in definition)
            if (
              __nested_webpack_require_19__.o(definition, key) &&
              !__nested_webpack_require_19__.o(exports1, key)
            )
              Object.defineProperty(exports1, key, {
                enumerable: true,
                get: definition[key],
              });
        };
      })();
      (() => {
        __nested_webpack_require_19__.o = (obj, prop) =>
          Object.prototype.hasOwnProperty.call(obj, prop);
      })();
      (() => {
        __nested_webpack_require_19__.r = (exports1) => {
          if ('undefined' != typeof Symbol && Symbol.toStringTag)
            Object.defineProperty(exports1, Symbol.toStringTag, {
              value: 'Module',
            });
          Object.defineProperty(exports1, '__esModule', {
            value: true,
          });
        };
      })();
      var __webpack_exports__ = {};
      __nested_webpack_require_19__.r(__webpack_exports__);
      __nested_webpack_require_19__.d(__webpack_exports__, {
        default: () => NotePreview,
      });
      const jsx_runtime_namespaceObject = __webpack_require__(
        '(client)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.js',
      );
      const external_TextWithMarkdown_js_namespaceObject = __webpack_require__(
        '(client)/../shared/dist/TextWithMarkdown.js',
      );
      var external_TextWithMarkdown_js_default =
        /*#__PURE__*/ __nested_webpack_require_19__.n(
          external_TextWithMarkdown_js_namespaceObject,
        );
      function NotePreview({ body }) {
        return /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsx)('div', {
          className: 'note-preview',
          children: /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsx)(
            external_TextWithMarkdown_js_default(),
            {
              text: body,
            },
          ),
        });
      }
      exports['default'] = __webpack_exports__['default'];
      for (var __webpack_i__ in __webpack_exports__)
        if (-1 === ['default'].indexOf(__webpack_i__))
          exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
      Object.defineProperty(exports, '__esModule', {
        value: true,
      });

      /***/
    },

    /***/ '(client)/../shared/dist/TextWithMarkdown.js': /***/ (
      __unused_webpack_module,
      exports,
      __webpack_require__,
    ) => {
      'use strict';

      var __nested_webpack_require_19__ = {};
      (() => {
        __nested_webpack_require_19__.n = (module) => {
          var getter =
            module && module.__esModule
              ? () => module['default']
              : () => module;
          __nested_webpack_require_19__.d(getter, {
            a: getter,
          });
          return getter;
        };
      })();
      (() => {
        __nested_webpack_require_19__.d = (exports1, definition) => {
          for (var key in definition)
            if (
              __nested_webpack_require_19__.o(definition, key) &&
              !__nested_webpack_require_19__.o(exports1, key)
            )
              Object.defineProperty(exports1, key, {
                enumerable: true,
                get: definition[key],
              });
        };
      })();
      (() => {
        __nested_webpack_require_19__.o = (obj, prop) =>
          Object.prototype.hasOwnProperty.call(obj, prop);
      })();
      (() => {
        __nested_webpack_require_19__.r = (exports1) => {
          if ('undefined' != typeof Symbol && Symbol.toStringTag)
            Object.defineProperty(exports1, Symbol.toStringTag, {
              value: 'Module',
            });
          Object.defineProperty(exports1, '__esModule', {
            value: true,
          });
        };
      })();
      var __webpack_exports__ = {};
      __nested_webpack_require_19__.r(__webpack_exports__);
      __nested_webpack_require_19__.d(__webpack_exports__, {
        default: () => TextWithMarkdown,
      });
      const jsx_runtime_namespaceObject = __webpack_require__(
        '(client)/../../../../../Library/pnpm/store/v10/links/@/react/19.2.0/a910955293fe48a2a8c542eb50a81385a2511b7ebc74d2fcc17e522c4b3a2f32/node_modules/react/jsx-runtime.js',
      );
      const external_marked_namespaceObject = __webpack_require__(
        '(client)/../../../../../Library/pnpm/store/v10/links/@/marked/4.3.0/d05a65ade745f15cb52449bc09a621432570fd4b2e15e6ea49727c1f3e0a33fa/node_modules/marked/lib/marked.esm.js',
      );
      const external_sanitize_html_namespaceObject = __webpack_require__(
        '(client)/../../../../../Library/pnpm/store/v10/links/@/sanitize-html/2.17.0/018994dd36c3a5e5bb611fa2c85c2b4fcb2bbd3c3424c38d725fecc2646d8b09/node_modules/sanitize-html/index.js',
      );
      var external_sanitize_html_default =
        /*#__PURE__*/ __nested_webpack_require_19__.n(
          external_sanitize_html_namespaceObject,
        );
      const allowedTags =
        external_sanitize_html_default().defaults.allowedTags.concat([
          'img',
          'h1',
          'h2',
          'h3',
        ]);
      const allowedAttributes = Object.assign(
        {},
        external_sanitize_html_default().defaults.allowedAttributes,
        {
          img: ['alt', 'src'],
        },
      );
      function TextWithMarkdown({ text }) {
        return /*#__PURE__*/ (0, jsx_runtime_namespaceObject.jsx)('div', {
          className: 'text-with-markdown',
          dangerouslySetInnerHTML: {
            __html: external_sanitize_html_default()(
              (0, external_marked_namespaceObject.marked)(text),
              {
                allowedTags,
                allowedAttributes,
              },
            ),
          },
        });
      }
      exports['default'] = __webpack_exports__['default'];
      for (var __webpack_i__ in __webpack_exports__)
        if (-1 === ['default'].indexOf(__webpack_i__))
          exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
      Object.defineProperty(exports, '__esModule', {
        value: true,
      });

      /***/
    },
  },
]);
//# sourceMappingURL=client3.js.map
