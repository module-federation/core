import{j as p,b as me,c as pe,F as I,s as G,d as V,i as x,u as ue,e as be,f as h,g as b,h as X,k as we,l as q,m as fe,n as ge,o as he,p as ye,Q as _e,R as ve,S as xe,r as W,t as S,w as je}from"./@qwik-city-plan-eb4f6187.js";/**
 * @license
 * @builder.io/qwik/server 1.2.12
 * Copyright Builder.io, Inc. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/BuilderIO/qwik/blob/main/LICENSE
 */var ke=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(t,n)=>(typeof require<"u"?require:t)[n]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')});function ee(e,t){const n=t==null?void 0:t.mapper,s=e.symbolMapper?e.symbolMapper:o=>{var i;if(n){const r=z(o),c=n[r];if(!c){if((i=globalThis.__qwik_reg_symbols)==null?void 0:i.has(r))return[o,"_"];console.error("Cannot resolve symbol",o,"in",n)}return c}};return{isServer:!0,async importSymbol(o,i,r){var _;const c=z(r),l=(_=globalThis.__qwik_reg_symbols)==null?void 0:_.get(c);if(l)return l;let m=String(i);m.endsWith(".js")||(m+=".js");const v=ke(m);if(!(r in v))throw new Error(`Q-ERROR: missing symbol '${r}' in module '${m}'.`);return v[r]},raf:()=>(console.error("server can not rerender"),Promise.resolve()),nextTick:o=>new Promise(i=>{setTimeout(()=>{i(o())})}),chunkForSymbol(o){return s(o,n)}}}async function qe(e,t){const n=ee(e,t);G(n)}var z=e=>{const t=e.lastIndexOf("_");return t>-1?e.slice(t+1):e};function N(){if(typeof performance>"u")return()=>0;const e=performance.now();return()=>(performance.now()-e)/1e6}function te(e){let t=e.base;return typeof e.base=="function"&&(t=e.base(e)),typeof t=="string"?(t.endsWith("/")||(t+="/"),t):"/build/"}var Se=`((e,t)=>{const n="__q_context__",o=window,s=new Set,i=t=>e.querySelectorAll(t),a=(e,t,n=t.type)=>{i("[on"+e+"\\\\:"+n+"]").forEach((o=>f(o,e,t,n)))},r=(e,t)=>e.getAttribute(t),l=t=>{if(void 0===t._qwikjson_){let n=(t===e.documentElement?e.body:t).lastElementChild;for(;n;){if("SCRIPT"===n.tagName&&"qwik/json"===r(n,"type")){t._qwikjson_=JSON.parse(n.textContent.replace(/\\\\x3C(\\/?script)/g,"<$1"));break}n=n.previousElementSibling}}},c=(e,t)=>new CustomEvent(e,{detail:t}),f=async(t,o,s,i=s.type)=>{const a="on"+o+":"+i;t.hasAttribute("preventdefault:"+i)&&s.preventDefault();const c=t._qc_,f=null==c?void 0:c.li.filter((e=>e[0]===a));if(f&&f.length>0){for(const e of f)await e[1].getFn([t,s],(()=>t.isConnected))(s,t);return}const b=r(t,a);if(b){const o=t.closest("[q\\\\:container]"),i=new URL(r(o,"q:base"),e.baseURI);for(const a of b.split("\\n")){const r=new URL(a,i),c=r.hash.replace(/^#?([^?[|]*).*$/,"$1")||"default",f=performance.now(),b=import(
/* @vite-ignore */
r.href.split("#")[0]);l(o);const p=(await b)[c],u=e[n];if(t.isConnected)try{e[n]=[t,s,r],d("qsymbol",{symbol:c,element:t,reqTime:f}),await p(s,t)}finally{e[n]=u}}}},d=(t,n)=>{e.dispatchEvent(c(t,n))},b=e=>e.replace(/([A-Z])/g,(e=>"-"+e.toLowerCase())),p=async e=>{let t=b(e.type),n=e.target;for(a("-document",e,t);n&&n.getAttribute;)await f(n,"",e,t),n=e.bubbles&&!0!==e.cancelBubble?n.parentElement:null},u=e=>{a("-window",e,b(e.type))},w=()=>{var n;const a=e.readyState;if(!t&&("interactive"==a||"complete"==a)&&(t=1,d("qinit"),(null!=(n=o.requestIdleCallback)?n:o.setTimeout).bind(o)((()=>d("qidle"))),s.has("qvisible"))){const e=i("[on\\\\:qvisible]"),t=new IntersectionObserver((e=>{for(const n of e)n.isIntersecting&&(t.unobserve(n.target),f(n.target,"",c("qvisible",n)))}));e.forEach((e=>t.observe(e)))}},q=(e,t,n,o=!1)=>e.addEventListener(t,n,{capture:o,passive:!1}),v=t=>{for(const n of t)s.has(n)||(q(e,n,p,!0),q(o,n,u),s.add(n))};if(!e.qR){const t=o.qwikevents;Array.isArray(t)&&v(t),o.qwikevents={push:(...e)=>v(e)},q(e,"readystatechange",w),w()}})(document);`,Ne=`(() => {
    ((doc, hasInitialized) => {
        const win = window;
        const events =  new Set;
        const querySelectorAll = query => doc.querySelectorAll(query);
        const broadcast = (infix, ev, type = ev.type) => {
            querySelectorAll("[on" + infix + "\\\\:" + type + "]").forEach((target => dispatch(target, infix, ev, type)));
        };
        const getAttribute = (el, name) => el.getAttribute(name);
        const resolveContainer = containerEl => {
            if (void 0 === containerEl._qwikjson_) {
                let script = (containerEl === doc.documentElement ? doc.body : containerEl).lastElementChild;
                while (script) {
                    if ("SCRIPT" === script.tagName && "qwik/json" === getAttribute(script, "type")) {
                        containerEl._qwikjson_ = JSON.parse(script.textContent.replace(/\\\\x3C(\\/?script)/g, "<$1"));
                        break;
                    }
                    script = script.previousElementSibling;
                }
            }
        };
        const createEvent = (eventName, detail) => new CustomEvent(eventName, {
            detail: detail
        });
        const dispatch = async (element, onPrefix, ev, eventName = ev.type) => {
            const attrName = "on" + onPrefix + ":" + eventName;
            element.hasAttribute("preventdefault:" + eventName) && ev.preventDefault();
            const ctx = element._qc_;
            const qrls = null == ctx ? void 0 : ctx.li.filter((li => li[0] === attrName));
            if (qrls && qrls.length > 0) {
                for (const q of qrls) {
                    await q[1].getFn([ element, ev ], (() => element.isConnected))(ev, element);
                }
                return;
            }
            const attrValue = getAttribute(element, attrName);
            if (attrValue) {
                const container = element.closest("[q\\\\:container]");
                const base = new URL(getAttribute(container, "q:base"), doc.baseURI);
                for (const qrl of attrValue.split("\\n")) {
                    const url = new URL(qrl, base);
                    const symbolName = url.hash.replace(/^#?([^?[|]*).*$/, "$1") || "default";
                    const reqTime = performance.now();
                    const module = import(
                    /* @vite-ignore */
                    url.href.split("#")[0]);
                    resolveContainer(container);
                    const handler = (await module)[symbolName];
                    const previousCtx = doc.__q_context__;
                    if (element.isConnected) {
                        try {
                            doc.__q_context__ = [ element, ev, url ];
                            emitEvent("qsymbol", {
                                symbol: symbolName,
                                element: element,
                                reqTime: reqTime
                            });
                            await handler(ev, element);
                        } finally {
                            doc.__q_context__ = previousCtx;
                        }
                    }
                }
            }
        };
        const emitEvent = (eventName, detail) => {
            doc.dispatchEvent(createEvent(eventName, detail));
        };
        const camelToKebab = str => str.replace(/([A-Z])/g, (a => "-" + a.toLowerCase()));
        const processDocumentEvent = async ev => {
            let type = camelToKebab(ev.type);
            let element = ev.target;
            broadcast("-document", ev, type);
            while (element && element.getAttribute) {
                await dispatch(element, "", ev, type);
                element = ev.bubbles && !0 !== ev.cancelBubble ? element.parentElement : null;
            }
        };
        const processWindowEvent = ev => {
            broadcast("-window", ev, camelToKebab(ev.type));
        };
        const processReadyStateChange = () => {
            var _a;
            const readyState = doc.readyState;
            if (!hasInitialized && ("interactive" == readyState || "complete" == readyState)) {
                hasInitialized = 1;
                emitEvent("qinit");
                (null != (_a = win.requestIdleCallback) ? _a : win.setTimeout).bind(win)((() => emitEvent("qidle")));
                if (events.has("qvisible")) {
                    const results = querySelectorAll("[on\\\\:qvisible]");
                    const observer = new IntersectionObserver((entries => {
                        for (const entry of entries) {
                            if (entry.isIntersecting) {
                                observer.unobserve(entry.target);
                                dispatch(entry.target, "", createEvent("qvisible", entry));
                            }
                        }
                    }));
                    results.forEach((el => observer.observe(el)));
                }
            }
        };
        const addEventListener = (el, eventName, handler, capture = !1) => el.addEventListener(eventName, handler, {
            capture: capture,
            passive: !1
        });
        const push = eventNames => {
            for (const eventName of eventNames) {
                if (!events.has(eventName)) {
                    addEventListener(doc, eventName, processDocumentEvent, !0);
                    addEventListener(win, eventName, processWindowEvent);
                    events.add(eventName);
                }
            }
        };
        if (!doc.qR) {
            const qwikevents = win.qwikevents;
            Array.isArray(qwikevents) && push(qwikevents);
            win.qwikevents = {
                push: (...e) => push(e)
            };
            addEventListener(doc, "readystatechange", processReadyStateChange);
            processReadyStateChange();
        }
    })(document);
})();`,ze=`((e,t)=>{const n="__q_context__",o=window,s=new Set,i=t=>e.querySelectorAll(t),a=(e,t,n=t.type)=>{i("[on"+e+"\\\\:"+n+"]").forEach((o=>f(o,e,t,n)))},r=(e,t)=>e.getAttribute(t),l=t=>{if(void 0===t._qwikjson_){let n=(t===e.documentElement?e.body:t).lastElementChild;for(;n;){if("SCRIPT"===n.tagName&&"qwik/json"===r(n,"type")){t._qwikjson_=JSON.parse(n.textContent.replace(/\\\\x3C(\\/?script)/g,"<$1"));break}n=n.previousElementSibling}}},c=(e,t)=>new CustomEvent(e,{detail:t}),f=async(t,o,s,i=s.type)=>{const a="on"+o+":"+i;t.hasAttribute("preventdefault:"+i)&&s.preventDefault();const c=t._qc_,f=null==c?void 0:c.li.filter((e=>e[0]===a));if(f&&f.length>0){for(const e of f)await e[1].getFn([t,s],(()=>t.isConnected))(s,t);return}const b=r(t,a);if(b){const o=t.closest("[q\\\\:container]"),i=new URL(r(o,"q:base"),e.baseURI);for(const a of b.split("\\n")){const r=new URL(a,i),c=r.hash.replace(/^#?([^?[|]*).*$/,"$1")||"default",f=performance.now(),b=import(
/* @vite-ignore */
r.href.split("#")[0]);l(o);const p=(await b)[c],u=e[n];if(t.isConnected)try{e[n]=[t,s,r],d("qsymbol",{symbol:c,element:t,reqTime:f}),await p(s,t)}finally{e[n]=u}}}},d=(t,n)=>{e.dispatchEvent(c(t,n))},b=e=>e.replace(/([A-Z])/g,(e=>"-"+e.toLowerCase())),p=async e=>{let t=b(e.type),n=e.target;for(a("-document",e,t);n&&n.getAttribute;)await f(n,"",e,t),n=e.bubbles&&!0!==e.cancelBubble?n.parentElement:null},u=e=>{a("-window",e,b(e.type))},w=()=>{var n;const a=e.readyState;if(!t&&("interactive"==a||"complete"==a)&&(t=1,d("qinit"),(null!=(n=o.requestIdleCallback)?n:o.setTimeout).bind(o)((()=>d("qidle"))),s.has("qvisible"))){const e=i("[on\\\\:qvisible]"),t=new IntersectionObserver((e=>{for(const n of e)n.isIntersecting&&(t.unobserve(n.target),f(n.target,"",c("qvisible",n)))}));e.forEach((e=>t.observe(e)))}},q=(e,t,n,o=!1)=>e.addEventListener(t,n,{capture:o,passive:!1}),v=t=>{for(const n of t)s.has(n)||(q(e,n,p,!0),q(o,n,u),s.add(n))};if(!e.qR){const t=o.qwikevents;Array.isArray(t)&&v(t),o.qwikevents={push:(...e)=>v(e)},q(e,"readystatechange",w),w()}})(document);`,Fe=`(() => {
    ((doc, hasInitialized) => {
        const win = window;
        const events = new Set;
        const querySelectorAll = query => doc.querySelectorAll(query);
        const broadcast = (infix, ev, type = ev.type) => {
            querySelectorAll("[on" + infix + "\\\\:" + type + "]").forEach((target => dispatch(target, infix, ev, type)));
        };
        const getAttribute = (el, name) => el.getAttribute(name);
        const resolveContainer = containerEl => {
            if (void 0 === containerEl._qwikjson_) {
                let script = (containerEl === doc.documentElement ? doc.body : containerEl).lastElementChild;
                while (script) {
                    if ("SCRIPT" === script.tagName && "qwik/json" === getAttribute(script, "type")) {
                        containerEl._qwikjson_ = JSON.parse(script.textContent.replace(/\\\\x3C(\\/?script)/g, "<$1"));
                        break;
                    }
                    script = script.previousElementSibling;
                }
            }
        };
        const createEvent = (eventName, detail) => new CustomEvent(eventName, {
            detail: detail
        });
        const dispatch = async (element, onPrefix, ev, eventName = ev.type) => {
            const attrName = "on" + onPrefix + ":" + eventName;
            element.hasAttribute("preventdefault:" + eventName) && ev.preventDefault();
            const ctx = element._qc_;
            const qrls = null == ctx ? void 0 : ctx.li.filter((li => li[0] === attrName));
            if (qrls && qrls.length > 0) {
                for (const q of qrls) {
                    await q[1].getFn([ element, ev ], (() => element.isConnected))(ev, element);
                }
                return;
            }
            const attrValue = getAttribute(element, attrName);
            if (attrValue) {
                const container = element.closest("[q\\\\:container]");
                const base = new URL(getAttribute(container, "q:base"), doc.baseURI);
                for (const qrl of attrValue.split("\\n")) {
                    const url = new URL(qrl, base);
                    const symbolName = url.hash.replace(/^#?([^?[|]*).*$/, "$1") || "default";
                    const reqTime = performance.now();
                    const module = import(
                    /* @vite-ignore */
                    url.href.split("#")[0]);
                    resolveContainer(container);
                    const handler = (await module)[symbolName];
                    const previousCtx = doc.__q_context__;
                    if (element.isConnected) {
                        try {
                            doc.__q_context__ = [ element, ev, url ];
                            emitEvent("qsymbol", {
                                symbol: symbolName,
                                element: element,
                                reqTime: reqTime
                            });
                            await handler(ev, element);
                        } finally {
                            doc.__q_context__ = previousCtx;
                        }
                    }
                }
            }
        };
        const emitEvent = (eventName, detail) => {
            doc.dispatchEvent(createEvent(eventName, detail));
        };
        const camelToKebab = str => str.replace(/([A-Z])/g, (a => "-" + a.toLowerCase()));
        const processDocumentEvent = async ev => {
            let type = camelToKebab(ev.type);
            let element = ev.target;
            broadcast("-document", ev, type);
            while (element && element.getAttribute) {
                await dispatch(element, "", ev, type);
                element = ev.bubbles && !0 !== ev.cancelBubble ? element.parentElement : null;
            }
        };
        const processWindowEvent = ev => {
            broadcast("-window", ev, camelToKebab(ev.type));
        };
        const processReadyStateChange = () => {
            var _a;
            const readyState = doc.readyState;
            if (!hasInitialized && ("interactive" == readyState || "complete" == readyState)) {
                hasInitialized = 1;
                emitEvent("qinit");
                (null != (_a = win.requestIdleCallback) ? _a : win.setTimeout).bind(win)((() => emitEvent("qidle")));
                if (events.has("qvisible")) {
                    const results = querySelectorAll("[on\\\\:qvisible]");
                    const observer = new IntersectionObserver((entries => {
                        for (const entry of entries) {
                            if (entry.isIntersecting) {
                                observer.unobserve(entry.target);
                                dispatch(entry.target, "", createEvent("qvisible", entry));
                            }
                        }
                    }));
                    results.forEach((el => observer.observe(el)));
                }
            }
        };
        const addEventListener = (el, eventName, handler, capture = !1) => el.addEventListener(eventName, handler, {
            capture: capture,
            passive: !1
        });
        const push = eventNames => {
            for (const eventName of eventNames) {
                if (!events.has(eventName)) {
                    addEventListener(doc, eventName, processDocumentEvent, !0);
                    addEventListener(win, eventName, processWindowEvent);
                    events.add(eventName);
                }
            }
        };
        if (!doc.qR) {
            const qwikevents = win.qwikevents;
            Array.isArray(qwikevents) && push(qwikevents);
            win.qwikevents = {
                push: (...e) => push(e)
            };
            addEventListener(doc, "readystatechange", processReadyStateChange);
            processReadyStateChange();
        }
    })(document);
})();`;function Ie(e={}){return Array.isArray(e.events)&&e.events.length>0?(e.debug?Fe:ze).replace("window.qEvents",JSON.stringify(e.events)):e.debug?Ne:Se}function Ee(e,t,n){if(!n)return[];const s=t.prefetchStrategy,a=te(t);if(s!==null){if(!s||!s.symbolsToPrefetch||s.symbolsToPrefetch==="auto")return Ae(e,n,a);if(typeof s.symbolsToPrefetch=="function")try{return s.symbolsToPrefetch({manifest:n.manifest})}catch(o){console.error("getPrefetchUrls, symbolsToPrefetch()",o)}}return[]}function Ae(e,t,n){const s=[],a=e==null?void 0:e.qrls,{mapper:o,manifest:i}=t,r=new Map;if(Array.isArray(a))for(const c of a){const l=c.getHash(),m=o[l];m&&ne(i,r,s,n,m[1])}return s}function ne(e,t,n,s,a){const o=s+a;let i=t.get(o);if(!i){i={url:o,imports:[]},t.set(o,i);const r=e.bundles[a];if(r&&Array.isArray(r.imports))for(const c of r.imports)ne(e,t,i.imports,s,c)}n.push(i)}function Ce(e){if(e!=null&&e.mapping!=null&&typeof e.mapping=="object"&&e.symbols!=null&&typeof e.symbols=="object"&&e.bundles!=null&&typeof e.bundles=="object")return e}function F(){let a=`const w=new Worker(URL.createObjectURL(new Blob(['onmessage=(e)=>{Promise.all(e.data.map(u=>fetch(u))).finally(()=>{setTimeout(postMessage({}),9999)})}'],{type:"text/javascript"})));`;return a+="w.postMessage(u.map(u=>new URL(u,origin)+''));",a+="w.onmessage=()=>{w.terminate()};",a}function Me(e){const t={bundles:j(e).map(n=>n.split("/").pop())};return`document.dispatchEvent(new CustomEvent("qprefetch",{detail:${JSON.stringify(t)}}))`}function j(e){const t=[],n=s=>{if(Array.isArray(s))for(const a of s)t.includes(a.url)||(t.push(a.url),n(a.imports))};return n(e),t}function Te(e){const t=new Map;let n=0;const s=(r,c)=>{if(Array.isArray(r))for(const l of r){const m=t.get(l.url)||0;t.set(l.url,m+1),n++,c.has(l.url)||(c.add(l.url),s(l.imports,c))}},a=new Set;for(const r of e)a.clear(),s(r.imports,a);const o=n/t.size*2,i=Array.from(t.entries());return i.sort((r,c)=>c[1]-r[1]),i.slice(0,5).filter(r=>r[1]>o).map(r=>r[0])}function Re(e,t,n){const s=Ye(e==null?void 0:e.implementation),a=[];return s.prefetchEvent==="always"&&Ke(a,t,n),s.linkInsert==="html-append"&&Le(a,t,s),s.linkInsert==="js-append"?Pe(a,t,s,n):s.workerFetchInsert==="always"&&De(a,t,n),a.length>0?p(I,{children:a}):null}function Ke(e,t,n){const s=Te(t);for(const a of s)e.push(p("link",{rel:"modulepreload",href:a,nonce:n}));e.push(p("script",{dangerouslySetInnerHTML:Me(t),nonce:n}))}function Le(e,t,n){const s=j(t),a=n.linkRel||"prefetch";for(const o of s){const i={};i.href=o,i.rel=a,(a==="prefetch"||a==="preload")&&o.endsWith(".js")&&(i.as="script"),e.push(p("link",i,void 0))}}function Pe(e,t,n,s){const a=n.linkRel||"prefetch";let o="";n.workerFetchInsert==="no-link-support"&&(o+="let supportsLinkRel = true;"),o+=`const u=${JSON.stringify(j(t))};`,o+="u.map((u,i)=>{",o+="const l=document.createElement('link');",o+='l.setAttribute("href",u);',o+=`l.setAttribute("rel","${a}");`,n.workerFetchInsert==="no-link-support"&&(o+="if(i===0){",o+="try{",o+=`supportsLinkRel=l.relList.supports("${a}");`,o+="}catch(e){}",o+="}"),o+="document.body.appendChild(l);",o+="});",n.workerFetchInsert==="no-link-support"&&(o+="if(!supportsLinkRel){",o+=F(),o+="}"),n.workerFetchInsert==="always"&&(o+=F()),e.push(p("script",{type:"module",dangerouslySetInnerHTML:o,nonce:s}))}function De(e,t,n){let s=`const u=${JSON.stringify(j(t))};`;s+=F(),e.push(p("script",{type:"module",dangerouslySetInnerHTML:s,nonce:n}))}function Ye(e){return e&&typeof e=="object"?e:Ue}var Ue={linkInsert:null,linkRel:null,workerFetchInsert:null,prefetchEvent:"always"},He="<!DOCTYPE html>";async function $e(e,t){var K;let n=t.stream,s=0,a=0,o=0,i=0,r="",c;const l=((K=t.streaming)==null?void 0:K.inOrder)??{strategy:"auto",maximunInitialChunk:5e4,maximunChunk:3e4},m=t.containerTagName??"html",v=t.containerAttributes??{},_=n,oe=N(),ae=te(t),u=se(t.manifest);function E(){r&&(_.write(r),r="",s=0,o++,o===1&&(i=oe()))}function A(d){const w=d.length;s+=w,a+=w,r+=d}switch(l.strategy){case"disabled":n={write:A};break;case"direct":n=_;break;case"auto":let d=0,w=!1;const L=l.maximunChunk??0,k=l.maximunInitialChunk??0;n={write(y){y==="<!--qkssr-f-->"?w||(w=!0):y==="<!--qkssr-pu-->"?d++:y==="<!--qkssr-po-->"?d--:A(y),d===0&&(w||s>=(o===0?k:L))&&(w=!1,E())}};break}m==="html"?n.write(He):(n.write("<!--cq-->"),t.qwikLoader?(t.qwikLoader.include===void 0&&(t.qwikLoader.include="never"),t.qwikLoader.position===void 0&&(t.qwikLoader.position="bottom")):t.qwikLoader={include:"never"}),t.manifest||console.warn("Missing client manifest, loading symbols in the client might 404. Please ensure the client build has run and generated the manifest for the server build."),await qe(t,u);const C=u==null?void 0:u.manifest.injections,re=C?C.map(d=>p(d.tag,d.attributes??{})):void 0,ie=N(),M=[];let T=0,R=0;await me(e,{stream:n,containerTagName:m,containerAttributes:v,serverData:t.serverData,base:ae,beforeContent:re,beforeClose:async(d,w,L,k)=>{var U,H,$,Q,O,B,J;T=ie();const y=N();c=await pe(d,w,void 0,k);const g=[];if(t.prefetchStrategy!==null){const f=Ee(c,t,u);if(f.length>0){const Z=Re(t.prefetchStrategy,f,(U=t.serverData)==null?void 0:U.nonce);Z&&g.push(Z)}}const le=JSON.stringify(c.state,void 0,void 0);g.push(p("script",{type:"qwik/json",dangerouslySetInnerHTML:Qe(le),nonce:(H=t.serverData)==null?void 0:H.nonce})),c.funcs.length>0&&g.push(p("script",{"q:func":"qwik/json",dangerouslySetInnerHTML:Be(c.funcs),nonce:($=t.serverData)==null?void 0:$.nonce}));const de=!c||c.mode!=="static",P=((Q=t.qwikLoader)==null?void 0:Q.include)??"auto",D=P==="always"||P==="auto"&&de;if(D){const f=Ie({events:(O=t.qwikLoader)==null?void 0:O.events,debug:t.debug});g.push(p("script",{id:"qwikloader",dangerouslySetInnerHTML:f,nonce:(B=t.serverData)==null?void 0:B.nonce}))}const Y=Array.from(w.$events$,f=>JSON.stringify(f));if(Y.length>0){let f=`window.qwikevents.push(${Y.join(", ")})`;D||(f=`window.qwikevents||=[];${f}`),g.push(p("script",{dangerouslySetInnerHTML:f,nonce:(J=t.serverData)==null?void 0:J.nonce}))}return Oe(M,d),R=y(),p(I,{children:g})},manifestHash:(u==null?void 0:u.manifest.manifestHash)||"dev"}),m!=="html"&&n.write("<!--/cq-->"),E();const ce=c.resources.some(d=>d._cache!==1/0);return{prefetchResources:void 0,snapshotResult:c,flushes:o,manifest:u==null?void 0:u.manifest,size:a,isStatic:!ce,timing:{render:T,snapshot:R,firstFlush:i},_symbols:M}}function se(e){if(e){if("mapper"in e)return e;if(e=Ce(e),e){const t={};return Object.entries(e.mapping).forEach(([n,s])=>{t[z(n)]=[n,s]}),{mapper:t,manifest:e}}}}var Qe=e=>e.replace(/<(\/?script)/g,"\\x3C$1");function Oe(e,t){var n;for(const s of t){const a=(n=s.$componentQrl$)==null?void 0:n.getSymbol();a&&!e.includes(a)&&e.push(a)}}function Be(e){return`document.currentScript.qFuncs=[${e.join(`,
`)}]`}async function Rt(e){const t=ee({manifest:e},se(e));G(t)}const Je={manifestHash:"fhgjyj",symbols:{s_02wMImzEAbk:{origin:"../../../node_modules/@builder.io/qwik-city/index.qwik.mjs",displayName:"QwikCityProvider_component_useTask",canonicalFilename:"s_02wmimzeabk",hash:"02wMImzEAbk",ctxKind:"function",ctxName:"useTask$",captures:!0,parent:"s_TxCFOy819ag",loc:[26295,35258]},s_b8fpOLpx7NA:{origin:"../../../node_modules/qwik-speak/lib/index.qwik.mjs",displayName:"Speak_component_useTask",canonicalFilename:"s_b8fpolpx7na",hash:"b8fpOLpx7NA",ctxKind:"function",ctxName:"useTask$",captures:!0,parent:"s_AkJ7NeLjpWM",loc:[5773,6053]},s_sfbNflx0Y2A:{origin:"../../../node_modules/qwik-speak/lib/index.qwik.mjs",displayName:"QwikSpeakProvider_component_useTask",canonicalFilename:"s_sfbnflx0y2a",hash:"sfbNflx0Y2A",ctxKind:"function",ctxName:"useTask$",captures:!0,parent:"s_yigdOibvcXE",loc:[4949,5132]},s_dBzp75i0JUA:{origin:"components/navbar/navbar.tsx",displayName:"navbar_component_useVisibleTask",canonicalFilename:"s_dbzp75i0jua",hash:"dBzp75i0JUA",ctxKind:"function",ctxName:"useVisibleTask$",captures:!0,parent:"s_e0RDNPJNIGY",loc:[1355,2368]},s_07tGklv0JFU:{origin:"components/container/container.tsx",displayName:"container_component",canonicalFilename:"s_07tgklv0jfu",hash:"07tGklv0JFU",ctxKind:"function",ctxName:"component$",captures:!1,loc:[355,2064]},s_2Fq8wIUpq5I:{origin:"components/router-head/router-head.tsx",displayName:"RouterHead_component",canonicalFilename:"s_2fq8wiupq5i",hash:"2Fq8wIUpq5I",ctxKind:"function",ctxName:"component$",captures:!1,loc:[289,922]},s_2fkm5zc0rek:{origin:"components/footer/footer.tsx",displayName:"footer_component",canonicalFilename:"s_2fkm5zc0rek",hash:"2fkm5zc0rek",ctxKind:"function",ctxName:"component$",captures:!1,loc:[463,2494]},s_5qyIIEjMPSA:{origin:"components/sections/brands/brands.tsx",displayName:"brands_component",canonicalFilename:"s_5qyiiejmpsa",hash:"5qyIIEjMPSA",ctxKind:"function",ctxName:"component$",captures:!1,loc:[1294,2156]},s_8gdLBszqbaM:{origin:"../../../node_modules/@builder.io/qwik-city/index.qwik.mjs",displayName:"Link_component",canonicalFilename:"s_8gdlbszqbam",hash:"8gdLBszqbaM",ctxKind:"function",ctxName:"component$",captures:!1,loc:[37211,38862]},s_AkJ7NeLjpWM:{origin:"../../../node_modules/qwik-speak/lib/index.qwik.mjs",displayName:"Speak_component",canonicalFilename:"s_akj7neljpwm",hash:"AkJ7NeLjpWM",ctxKind:"function",ctxName:"component$",captures:!1,loc:[5589,6187]},s_CQ1t0RXar34:{origin:"routes/[...lang]/privacy-policy/index.tsx",displayName:"privacy_policy_component",canonicalFilename:"s_cq1t0rxar34",hash:"CQ1t0RXar34",ctxKind:"function",ctxName:"component$",captures:!1,loc:[2086,24954]},s_D0iY34otgb0:{origin:"components/sections/sponsor/sponsor.tsx",displayName:"sponsor_component",canonicalFilename:"s_d0iy34otgb0",hash:"D0iY34otgb0",ctxKind:"function",ctxName:"component$",captures:!1,loc:[386,2120]},s_DRT9K1jPHw0:{origin:"components/sections/hero/hero.tsx",displayName:"hero_component",canonicalFilename:"s_drt9k1jphw0",hash:"DRT9K1jPHw0",ctxKind:"function",ctxName:"component$",captures:!1,loc:[490,3228]},s_E6HOLccZhOI:{origin:"components/card/card.tsx",displayName:"card_component",canonicalFilename:"s_e6holcczhoi",hash:"E6HOLccZhOI",ctxKind:"function",ctxName:"component$",captures:!1,loc:[189,448]},s_FQPutlW041U:{origin:"routes/[...lang]/layout.tsx",displayName:"layout_component",canonicalFilename:"s_fqputlw041u",hash:"FQPutlW041U",ctxKind:"function",ctxName:"component$",captures:!1,loc:[183,211]},s_HdsYayhDkLg:{origin:"components/sections/banner/banner.tsx",displayName:"banner_component",canonicalFilename:"s_hdsyayhdklg",hash:"HdsYayhDkLg",ctxKind:"function",ctxName:"component$",captures:!1,loc:[305,1663]},s_JGcGwM6uqSo:{origin:"routes/[...lang]/showcase/index.tsx",displayName:"showcase_component",canonicalFilename:"s_jgcgwm6uqso",hash:"JGcGwM6uqSo",ctxKind:"function",ctxName:"component$",captures:!1,loc:[1720,4421]},s_KHl60H7GIzk:{origin:"components/sections/discord/discord.tsx",displayName:"discord_component",canonicalFilename:"s_khl60h7gizk",hash:"KHl60H7GIzk",ctxKind:"function",ctxName:"component$",captures:!1,loc:[327,1964]},s_KnttE033sL4:{origin:"components/sections/subscribe/subscribe.tsx",displayName:"subscribe_component",canonicalFilename:"s_kntte033sl4",hash:"KnttE033sL4",ctxKind:"function",ctxName:"component$",captures:!1,loc:[430,3580]},s_M2E9iDaUBT4:{origin:"components/loader/loader.tsx",displayName:"loader_component",canonicalFilename:"s_m2e9idaubt4",hash:"M2E9iDaUBT4",ctxKind:"function",ctxName:"component$",captures:!1,loc:[135,633]},s_MBnCRhRrMNs:{origin:"components/section/section.tsx",displayName:"section_component",canonicalFilename:"s_mbncrhrrmns",hash:"MBnCRhRrMNs",ctxKind:"function",ctxName:"component$",captures:!1,loc:[457,1356]},s_Nk9PlpjQm9Y:{origin:"../../../node_modules/@builder.io/qwik-city/index.qwik.mjs",displayName:"GetForm_component",canonicalFilename:"s_nk9plpjqm9y",hash:"Nk9PlpjQm9Y",ctxKind:"function",ctxName:"component$",captures:!1,loc:[48816,50167]},s_Pl7vAlduOuo:{origin:"components/forms/select/select.tsx",displayName:"select_component",canonicalFilename:"s_pl7valduouo",hash:"Pl7vAlduOuo",ctxKind:"function",ctxName:"component$",captures:!1,loc:[444,1922]},s_RZ4kRsPh3h0:{origin:"components/sections/explore/explore.tsx",displayName:"explore_component",canonicalFilename:"s_rz4krsph3h0",hash:"RZ4kRsPh3h0",ctxKind:"function",ctxName:"component$",captures:!1,loc:[502,6809]},s_TCwB4TUhbFA:{origin:"components/sections/doc-summary/doc-summary.tsx",displayName:"doc_summary_component",canonicalFilename:"s_tcwb4tuhbfa",hash:"TCwB4TUhbFA",ctxKind:"function",ctxName:"component$",captures:!1,loc:[546,5284]},s_TxCFOy819ag:{origin:"../../../node_modules/@builder.io/qwik-city/index.qwik.mjs",displayName:"QwikCityProvider_component",canonicalFilename:"s_txcfoy819ag",hash:"TxCFOy819ag",ctxKind:"function",ctxName:"component$",captures:!1,loc:[23025,35545]},s_VoSI6o07IFI:{origin:"components/sections/showcase/showcase.tsx",displayName:"showcase_component",canonicalFilename:"s_vosi6o07ifi",hash:"VoSI6o07IFI",ctxKind:"function",ctxName:"component$",captures:!1,loc:[1444,3088]},s_WmYC5H00wtI:{origin:"../../../node_modules/@builder.io/qwik-city/index.qwik.mjs",displayName:"QwikCityMockProvider_component",canonicalFilename:"s_wmyc5h00wti",hash:"WmYC5H00wtI",ctxKind:"function",ctxName:"component$",captures:!1,loc:[35829,37092]},s_bOB0JnUCSKY:{origin:"routes/[...lang]/index.tsx",displayName:"____lang__component",canonicalFilename:"s_bob0jnucsky",hash:"bOB0JnUCSKY",ctxKind:"function",ctxName:"component$",captures:!1,loc:[1110,1485]},s_e0RDNPJNIGY:{origin:"components/navbar/navbar.tsx",displayName:"navbar_component",canonicalFilename:"s_e0rdnpjnigy",hash:"e0RDNPJNIGY",ctxKind:"function",ctxName:"component$",captures:!1,loc:[883,9882]},s_e0ssiDXoeAM:{origin:"../../../node_modules/@builder.io/qwik-city/index.qwik.mjs",displayName:"RouterOutlet_component",canonicalFilename:"s_e0ssidxoeam",hash:"e0ssiDXoeAM",ctxKind:"function",ctxName:"component$",captures:!1,loc:[7931,8645]},s_eXD0K9bzzlo:{origin:"root.tsx",displayName:"root_component",canonicalFilename:"s_exd0k9bzzlo",hash:"eXD0K9bzzlo",ctxKind:"function",ctxName:"component$",captures:!1,loc:[453,1649]},s_eh3Zleb9svU:{origin:"components/sections/medusa/medusa.tsx",displayName:"medusa_component",canonicalFilename:"s_eh3zleb9svu",hash:"eh3Zleb9svU",ctxKind:"function",ctxName:"component$",captures:!1,loc:[385,16366]},s_gft6e4M8el4:{origin:"components/line/line.tsx",displayName:"line_component",canonicalFilename:"s_gft6e4m8el4",hash:"gft6e4M8el4",ctxKind:"function",ctxName:"component$",captures:!1,loc:[234,679]},s_lHJ6l0hcvRg:{origin:"components/forms/select/select.tsx",displayName:"SelectOption_component",canonicalFilename:"s_lhj6l0hcvrg",hash:"lHJ6l0hcvRg",ctxKind:"function",ctxName:"component$",captures:!1,loc:[2058,2326]},s_mekDswQeFyQ:{origin:"components/section/section.tsx",displayName:"SectionHeader_component",canonicalFilename:"s_mekdswqefyq",hash:"mekDswQeFyQ",ctxKind:"function",ctxName:"component$",captures:!1,loc:[1479,1879]},s_outyRSHf0Tw:{origin:"components/icon/icon.tsx",displayName:"icon_component",canonicalFilename:"s_outyrshf0tw",hash:"outyRSHf0Tw",ctxKind:"function",ctxName:"component$",captures:!1,loc:[268,499]},s_pbG9H8ze2g4:{origin:"components/sections/evolving/evolving.tsx",displayName:"evolving_component",canonicalFilename:"s_pbg9h8ze2g4",hash:"pbG9H8ze2g4",ctxKind:"function",ctxName:"component$",captures:!1,loc:[1348,5778]},s_rIehxbCtAqU:{origin:"components/button/button.tsx",displayName:"button_component",canonicalFilename:"s_riehxbctaqu",hash:"rIehxbCtAqU",ctxKind:"function",ctxName:"component$",captures:!1,loc:[918,5035]},s_tVi0Ug0Y1rA:{origin:"components/sections/contact/contact.tsx",displayName:"contact_component",canonicalFilename:"s_tvi0ug0y1ra",hash:"tVi0Ug0Y1rA",ctxKind:"function",ctxName:"component$",captures:!1,loc:[488,6699]},s_yigdOibvcXE:{origin:"../../../node_modules/qwik-speak/lib/index.qwik.mjs",displayName:"QwikSpeakProvider_component",canonicalFilename:"s_yigdoibvcxe",hash:"yigdOibvcXE",ctxKind:"function",ctxName:"component$",captures:!1,loc:[3549,5292]},s_RPDJAz33WLA:{origin:"../../../node_modules/@builder.io/qwik-city/index.qwik.mjs",displayName:"QwikCityProvider_component_useStyles",canonicalFilename:"s_rpdjaz33wla",hash:"RPDJAz33WLA",ctxKind:"function",ctxName:"useStyles$",captures:!1,parent:"s_TxCFOy819ag",loc:[23080,23114]},s_14NE37yaMfA:{origin:"components/sections/doc-summary/doc-summary.tsx",displayName:"doc_summary_component_useStylesScoped",canonicalFilename:"s_14ne37yamfa",hash:"14NE37yaMfA",ctxKind:"function",ctxName:"useStylesScoped$",captures:!1,parent:"s_TCwB4TUhbFA",loc:[573,579]},s_2HCPp1ydyqs:{origin:"components/forms/select/select.tsx",displayName:"select_component__Fragment_div_onClick",canonicalFilename:"s_2hcpp1ydyqs",hash:"2HCPp1ydyqs",ctxKind:"eventHandler",ctxName:"onClick$",captures:!0,parent:"s_Pl7vAlduOuo",loc:[580,606]},s_3SsPTS5utQk:{origin:"components/line/line.tsx",displayName:"line_component_useStylesScoped",canonicalFilename:"s_3sspts5utqk",hash:"3SsPTS5utQk",ctxKind:"function",ctxName:"useStylesScoped$",captures:!1,parent:"s_gft6e4M8el4",loc:[277,283]},s_5Bmm03gq0i0:{origin:"components/loader/loader.tsx",displayName:"loader_component_useStylesScoped",canonicalFilename:"s_5bmm03gq0i0",hash:"5Bmm03gq0i0",ctxKind:"function",ctxName:"useStylesScoped$",captures:!1,parent:"s_M2E9iDaUBT4",loc:[162,168]},s_6VMpNf7ZCJ0:{origin:"components/sections/contact/contact.tsx",displayName:"contact_component_Section_div_div_form_onSubmit",canonicalFilename:"s_6vmpnf7zcj0",hash:"6VMpNf7ZCJ0",ctxKind:"eventHandler",ctxName:"onSubmit$",captures:!0,parent:"s_tVi0Ug0Y1rA",loc:[1930,1965]},s_LQcmHAxuFaU:{origin:"components/navbar/navbar.tsx",displayName:"navbar_component_div_div_div_onClick",canonicalFilename:"s_lqcmhaxufau",hash:"LQcmHAxuFaU",ctxKind:"eventHandler",ctxName:"onClick$",captures:!0,parent:"s_e0RDNPJNIGY",loc:[7453,7485]},s_kJTkeEh1U5c:{origin:"root.tsx",displayName:"root_component_useStyles",canonicalFilename:"s_kjtkeeh1u5c",hash:"kJTkeEh1U5c",ctxKind:"function",ctxName:"useStyles$",captures:!1,parent:"s_eXD0K9bzzlo",loc:[693,705]},s_00VE9E0kYIc:{origin:"components/sections/evolving/evolving.tsx",displayName:"evolving_component_useStylesScoped",canonicalFilename:"s_00ve9e0kyic",hash:"00VE9E0kYIc",ctxKind:"function",ctxName:"useStylesScoped$",captures:!1,parent:"s_pbG9H8ze2g4",loc:[1375,1381]},s_0CLaYnIloJk:{origin:"components/sections/hero/hero.tsx",displayName:"hero_component_useStylesScoped",canonicalFilename:"s_0claynilojk",hash:"0CLaYnIloJk",ctxKind:"function",ctxName:"useStylesScoped$",captures:!1,parent:"s_DRT9K1jPHw0",loc:[517,523]},s_0kXSZC4QkmM:{origin:"components/sections/discord/discord.tsx",displayName:"discord_component_useStylesScoped",canonicalFilename:"s_0kxszc4qkmm",hash:"0kXSZC4QkmM",ctxKind:"function",ctxName:"useStylesScoped$",captures:!1,parent:"s_KHl60H7GIzk",loc:[354,360]},s_DkNHR022s5k:{origin:"components/sections/explore/explore.tsx",displayName:"explore_component_useStylesScoped",canonicalFilename:"s_dknhr022s5k",hash:"DkNHR022s5k",ctxKind:"function",ctxName:"useStylesScoped$",captures:!1,parent:"s_RZ4kRsPh3h0",loc:[529,535]},s_HSLHKDE0Tc8:{origin:"components/navbar/navbar.tsx",displayName:"navbar_component_div_div_Container_nav_ul_li_Select_SelectOption_onClick",canonicalFilename:"s_hslhkde0tc8",hash:"HSLHKDE0Tc8",ctxKind:"jSXProp",ctxName:"onClick$",captures:!0,parent:"s_e0RDNPJNIGY",loc:[6233,6277]},s_IMLVEX3dgUw:{origin:"components/sections/showcase/showcase.tsx",displayName:"showcase_component_useStylesScoped",canonicalFilename:"s_imlvex3dguw",hash:"IMLVEX3dgUw",ctxKind:"function",ctxName:"useStylesScoped$",captures:!1,parent:"s_VoSI6o07IFI",loc:[1471,1477]},s_K8TT2dajw7I:{origin:"components/navbar/navbar.tsx",displayName:"navbar_component_useStylesScoped",canonicalFilename:"s_k8tt2dajw7i",hash:"K8TT2dajw7I",ctxKind:"function",ctxName:"useStylesScoped$",captures:!1,parent:"s_e0RDNPJNIGY",loc:[928,934]},s_MOjpn7epc74:{origin:"components/forms/select/select.tsx",displayName:"select_component__Fragment_button_onClick",canonicalFilename:"s_mojpn7epc74",hash:"MOjpn7epc74",ctxKind:"eventHandler",ctxName:"onClick$",captures:!0,parent:"s_Pl7vAlduOuo",loc:[866,898]},s_MR5rBPxRKDs:{origin:"components/section/section.tsx",displayName:"section_component_useStylesScoped",canonicalFilename:"s_mr5rbpxrkds",hash:"MR5rBPxRKDs",ctxKind:"function",ctxName:"useStylesScoped$",captures:!1,parent:"s_MBnCRhRrMNs",loc:[503,509]},s_Z790sFa7bTY:{origin:"components/sections/contact/contact.tsx",displayName:"contact_component_useStylesScoped",canonicalFilename:"s_z790sfa7bty",hash:"Z790sFa7bTY",ctxKind:"function",ctxName:"useStylesScoped$",captures:!1,parent:"s_tVi0Ug0Y1rA",loc:[515,521]},s_ZwZ0qjzCTZQ:{origin:"components/sections/brands/brands.tsx",displayName:"brands_component_useStylesScoped",canonicalFilename:"s_zwz0qjzctzq",hash:"ZwZ0qjzCTZQ",ctxKind:"function",ctxName:"useStylesScoped$",captures:!1,parent:"s_5qyIIEjMPSA",loc:[1321,1327]},s_dVIPHMdh004:{origin:"components/sections/banner/banner.tsx",displayName:"banner_component_useStylesScoped",canonicalFilename:"s_dviphmdh004",hash:"dVIPHMdh004",ctxKind:"function",ctxName:"useStylesScoped$",captures:!1,parent:"s_HdsYayhDkLg",loc:[332,338]},s_g0E4nZcqTc8:{origin:"components/footer/footer.tsx",displayName:"footer_component_useStylesScoped",canonicalFilename:"s_g0e4nzcqtc8",hash:"g0E4nZcqTc8",ctxKind:"function",ctxName:"useStylesScoped$",captures:!1,parent:"s_2fkm5zc0rek",loc:[508,514]},s_i9FQ1vZJ8l0:{origin:"components/sections/subscribe/subscribe.tsx",displayName:"subscribe_component_useStylesScoped",canonicalFilename:"s_i9fq1vzj8l0",hash:"i9FQ1vZJ8l0",ctxKind:"function",ctxName:"useStylesScoped$",captures:!1,parent:"s_KnttE033sL4",loc:[457,463]},s_oIzTMtTO2NI:{origin:"components/sections/medusa/medusa.tsx",displayName:"medusa_component_useStylesScoped",canonicalFilename:"s_oiztmtto2ni",hash:"oIzTMtTO2NI",ctxKind:"function",ctxName:"useStylesScoped$",captures:!1,parent:"s_eh3Zleb9svU",loc:[412,418]},s_onhenAasZyM:{origin:"components/container/container.tsx",displayName:"container_component_useStylesScoped",canonicalFilename:"s_onhenaaszym",hash:"onhenAasZyM",ctxKind:"function",ctxName:"useStylesScoped$",captures:!1,parent:"s_07tGklv0JFU",loc:[403,409]},s_prGAgB6H1F4:{origin:"components/sections/sponsor/sponsor.tsx",displayName:"sponsor_component_useStylesScoped",canonicalFilename:"s_prgagb6h1f4",hash:"prGAgB6H1F4",ctxKind:"function",ctxName:"useStylesScoped$",captures:!1,parent:"s_D0iY34otgb0",loc:[413,419]},s_rk5oELlKahs:{origin:"components/button/button.tsx",displayName:"button_component_useStylesScoped",canonicalFilename:"s_rk5oellkahs",hash:"rk5oELlKahs",ctxKind:"function",ctxName:"useStylesScoped$",captures:!1,parent:"s_rIehxbCtAqU",loc:[963,969]},s_sOgQv7sgR00:{origin:"components/icon/icon.tsx",displayName:"icon_component_useStylesScoped",canonicalFilename:"s_sogqv7sgr00",hash:"sOgQv7sgR00",ctxKind:"function",ctxName:"useStylesScoped$",captures:!1,parent:"s_outyRSHf0Tw",loc:[311,317]},s_tNYOaCIm0Qc:{origin:"components/forms/select/select.tsx",displayName:"select_component_useStylesScoped",canonicalFilename:"s_tnyoacim0qc",hash:"tNYOaCIm0Qc",ctxKind:"function",ctxName:"useStylesScoped$",captures:!1,parent:"s_Pl7vAlduOuo",loc:[489,495]},s_wM7DasAxykk:{origin:"components/card/card.tsx",displayName:"card_component_useStylesScoped",canonicalFilename:"s_wm7dasaxykk",hash:"wM7DasAxykk",ctxKind:"function",ctxName:"useStylesScoped$",captures:!1,parent:"s_E6HOLccZhOI",loc:[232,238]},s_A5bZC7WO00A:{origin:"../../../node_modules/@builder.io/qwik-city/index.qwik.mjs",displayName:"routeActionQrl_action_submit",canonicalFilename:"s_a5bzc7wo00a",hash:"A5bZC7WO00A",ctxKind:"function",ctxName:"submit",captures:!0,loc:[40230,41864]},s_DyVc0YBIqQU:{origin:"../../../node_modules/@builder.io/qwik-city/index.qwik.mjs",displayName:"spa_init",canonicalFilename:"s_dyvc0ybiqqu",hash:"DyVc0YBIqQU",ctxKind:"function",ctxName:"spaInit",captures:!1,loc:[1391,6872]},s_t8pAmchwKZE:{origin:"../../../node_modules/qwik-speak/lib/index.qwik.mjs",displayName:"useTranslateQrl_translate",canonicalFilename:"s_t8pamchwkze",hash:"t8pAmchwKZE",ctxKind:"function",ctxName:"translate$",captures:!0,loc:[6644,6877]},s_wOIPfiQ04l4:{origin:"../../../node_modules/@builder.io/qwik-city/index.qwik.mjs",displayName:"serverQrl_stuff",canonicalFilename:"s_woipfiq04l4",hash:"wOIPfiQ04l4",ctxKind:"function",ctxName:"stuff",captures:!0,loc:[44878,46702]},s_BUbtvTyvVRE:{origin:"../../../node_modules/@builder.io/qwik-city/index.qwik.mjs",displayName:"QwikCityMockProvider_component_goto",canonicalFilename:"s_bubtvtyvvre",hash:"BUbtvTyvVRE",ctxKind:"function",ctxName:"goto",captures:!1,parent:"s_WmYC5H00wtI",loc:[36230,36291]},s_EQll1XU2k6A:{origin:"components/navbar/navbar.tsx",displayName:"navbar_component_changeLocale",canonicalFilename:"s_eqll1xu2k6a",hash:"EQll1XU2k6A",ctxKind:"function",ctxName:"$",captures:!0,parent:"s_e0RDNPJNIGY",loc:[2437,3032]},s_KPHXz30Lh3M:{origin:"components/sections/subscribe/subscribe.tsx",displayName:"subscribe_component_handleSubmit",canonicalFilename:"s_kphxz30lh3m",hash:"KPHXz30Lh3M",ctxKind:"function",ctxName:"$",captures:!0,parent:"s_KnttE033sL4",loc:[565,1161]},s_MIDC22ueZrk:{origin:"../../../node_modules/qwik-speak/lib/index.qwik.mjs",displayName:"QwikSpeakProvider_component_resolvedTranslationFn",canonicalFilename:"s_midc22uezrk",hash:"MIDC22ueZrk",ctxKind:"function",ctxName:"resolvedTranslationFn",captures:!1,parent:"s_yigdOibvcXE",loc:[3824,3834]},s_Qj09dIbebQs:{origin:"components/navbar/navbar.tsx",displayName:"navbar_component_div_div_Container_nav_div_button_onClick",canonicalFilename:"s_qj09dibebqs",hash:"Qj09dIbebQs",ctxKind:"eventHandler",ctxName:"onClick$",captures:!0,parent:"s_e0RDNPJNIGY",loc:[6571,6615]},s_YWAZ5f0lJEw:{origin:"components/navbar/navbar.tsx",displayName:"navbar_component_div_div_div_ul_li_select_onChange",canonicalFilename:"s_ywaz5f0ljew",hash:"YWAZ5f0lJEw",ctxKind:"eventHandler",ctxName:"onChange$",captures:!0,parent:"s_e0RDNPJNIGY",loc:[9274,9380]},s_eBQ0vFsFKsk:{origin:"../../../node_modules/@builder.io/qwik-city/index.qwik.mjs",displayName:"Link_component_onPrefetch_event",canonicalFilename:"s_ebq0vfsfksk",hash:"eBQ0vFsFKsk",ctxKind:"function",ctxName:"event$",captures:!1,parent:"s_8gdLBszqbaM",loc:[37738,37801]},s_fX0bDjeJa0E:{origin:"../../../node_modules/@builder.io/qwik-city/index.qwik.mjs",displayName:"QwikCityProvider_component_goto",canonicalFilename:"s_fx0bdjeja0e",hash:"fX0bDjeJa0E",ctxKind:"function",ctxName:"goto",captures:!0,parent:"s_TxCFOy819ag",loc:[24364,25683]},s_i1Cv0pYJNR0:{origin:"../../../node_modules/@builder.io/qwik-city/index.qwik.mjs",displayName:"Link_component_handleClick_event",canonicalFilename:"s_i1cv0pyjnr0",hash:"i1Cv0pYJNR0",ctxKind:"function",ctxName:"event$",captures:!0,parent:"s_8gdLBszqbaM",loc:[37919,38434]},s_kK15dHxr40k:{origin:"components/sections/contact/contact.tsx",displayName:"contact_component_handleSubmit",canonicalFilename:"s_kk15dhxr40k",hash:"kK15dHxr40k",ctxKind:"function",ctxName:"$",captures:!0,parent:"s_tVi0Ug0Y1rA",loc:[747,1466]},s_n1zdSBKIeTw:{origin:"components/sections/subscribe/subscribe.tsx",displayName:"subscribe_component_Section_div_div_form_onSubmit",canonicalFilename:"s_n1zdsbkietw",hash:"n1zdSBKIeTw",ctxKind:"eventHandler",ctxName:"onSubmit$",captures:!0,parent:"s_KnttE033sL4",loc:[1748,1783]},s_p9MSze0ojs4:{origin:"../../../node_modules/@builder.io/qwik-city/index.qwik.mjs",displayName:"GetForm_component_form_onSubmit",canonicalFilename:"s_p9msze0ojs4",hash:"p9MSze0ojs4",ctxKind:"function",ctxName:"_jsxS",captures:!0,parent:"s_Nk9PlpjQm9Y",loc:[49123,49820]}},mapping:{s_02wMImzEAbk:"q-79edfbeb.js",s_b8fpOLpx7NA:"q-07e7f6a0.js",s_sfbNflx0Y2A:"q-25caf568.js",s_dBzp75i0JUA:"q-821afda9.js",s_07tGklv0JFU:"q-7159aa88.js",s_2Fq8wIUpq5I:"q-85f474ec.js",s_2fkm5zc0rek:"q-102544b5.js",s_5qyIIEjMPSA:"q-fb9737d5.js",s_8gdLBszqbaM:"q-1dff0883.js",s_AkJ7NeLjpWM:"q-07e7f6a0.js",s_CQ1t0RXar34:"q-c7ae20ca.js",s_D0iY34otgb0:"q-01e0113d.js",s_DRT9K1jPHw0:"q-9bac2d4e.js",s_E6HOLccZhOI:"q-6673dcf5.js",s_FQPutlW041U:"q-07b9e137.js",s_HdsYayhDkLg:"q-7686f179.js",s_JGcGwM6uqSo:"q-0c20792d.js",s_KHl60H7GIzk:"q-7a154197.js",s_KnttE033sL4:"q-3ff9a77f.js",s_M2E9iDaUBT4:"q-2aec73f9.js",s_MBnCRhRrMNs:"q-8a6a2055.js",s_Nk9PlpjQm9Y:"q-c4254027.js",s_Pl7vAlduOuo:"q-ee164527.js",s_RZ4kRsPh3h0:"q-ec7e5ba3.js",s_TCwB4TUhbFA:"q-c6f3a2cb.js",s_TxCFOy819ag:"q-79edfbeb.js",s_VoSI6o07IFI:"q-0c20792d.js",s_WmYC5H00wtI:"q-f50d89b3.js",s_bOB0JnUCSKY:"q-b2bf428c.js",s_e0RDNPJNIGY:"q-821afda9.js",s_e0ssiDXoeAM:"q-79c7160f.js",s_eXD0K9bzzlo:"q-70047b8b.js",s_eh3Zleb9svU:"q-d5a1012b.js",s_gft6e4M8el4:"q-2f8c339d.js",s_lHJ6l0hcvRg:"q-0d167c3e.js",s_mekDswQeFyQ:"q-542487ff.js",s_outyRSHf0Tw:"q-95d7066d.js",s_pbG9H8ze2g4:"q-6b808a4b.js",s_rIehxbCtAqU:"q-3aa3b5ac.js",s_tVi0Ug0Y1rA:"q-76d4e7f6.js",s_yigdOibvcXE:"q-25caf568.js",s_RPDJAz33WLA:"q-79edfbeb.js",s_14NE37yaMfA:"q-c6f3a2cb.js",s_2HCPp1ydyqs:"q-ee164527.js",s_3SsPTS5utQk:"q-2f8c339d.js",s_5Bmm03gq0i0:"q-2aec73f9.js",s_6VMpNf7ZCJ0:"q-76d4e7f6.js",s_LQcmHAxuFaU:"q-821afda9.js",s_kJTkeEh1U5c:"q-70047b8b.js",s_00VE9E0kYIc:"q-6b808a4b.js",s_0CLaYnIloJk:"q-9bac2d4e.js",s_0kXSZC4QkmM:"q-7a154197.js",s_DkNHR022s5k:"q-ec7e5ba3.js",s_HSLHKDE0Tc8:"q-821afda9.js",s_IMLVEX3dgUw:"q-0c20792d.js",s_K8TT2dajw7I:"q-821afda9.js",s_MOjpn7epc74:"q-ee164527.js",s_MR5rBPxRKDs:"q-8a6a2055.js",s_Z790sFa7bTY:"q-76d4e7f6.js",s_ZwZ0qjzCTZQ:"q-fb9737d5.js",s_dVIPHMdh004:"q-7686f179.js",s_g0E4nZcqTc8:"q-102544b5.js",s_i9FQ1vZJ8l0:"q-3ff9a77f.js",s_oIzTMtTO2NI:"q-d5a1012b.js",s_onhenAasZyM:"q-7159aa88.js",s_prGAgB6H1F4:"q-01e0113d.js",s_rk5oELlKahs:"q-3aa3b5ac.js",s_sOgQv7sgR00:"q-95d7066d.js",s_tNYOaCIm0Qc:"q-ee164527.js",s_wM7DasAxykk:"q-6673dcf5.js",s_A5bZC7WO00A:"q-2224fe95.js",s_DyVc0YBIqQU:"q-663033b0.js",s_t8pAmchwKZE:"q-0713b427.js",s_wOIPfiQ04l4:"q-72eabc46.js",s_BUbtvTyvVRE:"q-f50d89b3.js",s_EQll1XU2k6A:"q-821afda9.js",s_KPHXz30Lh3M:"q-3ff9a77f.js",s_MIDC22ueZrk:"q-25caf568.js",s_Qj09dIbebQs:"q-821afda9.js",s_YWAZ5f0lJEw:"q-821afda9.js",s_eBQ0vFsFKsk:"q-0495a917.js",s_fX0bDjeJa0E:"q-79edfbeb.js",s_i1Cv0pYJNR0:"q-1dff0883.js",s_kK15dHxr40k:"q-76d4e7f6.js",s_n1zdSBKIeTw:"q-3ff9a77f.js",s_p9MSze0ojs4:"q-c4254027.js"},bundles:{"q-01e0113d.js":{size:3966,imports:["q-0ec4f38b.js","q-1b3bace9.js","q-93a2ab94.js","q-c1dab7a1.js","q-fc68bb4c.js"],origins:["src/components/sections/sponsor/shapes.tsx","src/components/sections/sponsor/sponsor.css?used&inline","src/entry_sponsor.js","src/s_d0iy34otgb0.js","src/s_prgagb6h1f4.js"],symbols:["s_D0iY34otgb0","s_prGAgB6H1F4"]},"q-0495a917.js":{size:128,imports:["q-1b3bace9.js","q-e648ae0e.js"],origins:["src/s_ebq0vfsfksk.js"],symbols:["s_eBQ0vFsFKsk"]},"q-0713b427.js":{size:204,imports:["q-0ec4f38b.js","q-1b3bace9.js"],origins:["src/entry_useTranslateQrl.js","src/s_t8pamchwkze.js"],symbols:["s_t8pAmchwKZE"]},"q-07b9e137.js":{size:102,imports:["q-1b3bace9.js"],origins:["src/entry_layout.js","src/s_fqputlw041u.js"],symbols:["s_FQPutlW041U"]},"q-07e7f6a0.js":{size:554,imports:["q-0ec4f38b.js","q-1b3bace9.js"],origins:["src/entry_Speak.js","src/s_akj7neljpwm.js","src/s_b8fpolpx7na.js"],symbols:["s_AkJ7NeLjpWM","s_b8fpOLpx7NA"]},"q-0c20792d.js":{size:3649,imports:["q-0ec4f38b.js","q-1b3bace9.js","q-35fce610.js","q-3776fc6b.js","q-799f4c7b.js","q-93a2ab94.js","q-b235b133.js","q-bb2ed15a.js","q-c1dab7a1.js","q-c67faab2.js"],origins:["src/components/sections/showcase/showcase.css?used&inline","src/entry_showcase.js","src/s_imlvex3dguw.js","src/s_jgcgwm6uqso.js","src/s_vosi6o07ifi.js"],symbols:["s_IMLVEX3dgUw","s_JGcGwM6uqSo","s_VoSI6o07IFI"]},"q-0d167c3e.js":{size:288,imports:["q-1b3bace9.js","q-a95cc110.js"],origins:["src/entry_SelectOption.js","src/s_lhj6l0hcvrg.js"],symbols:["s_lHJ6l0hcvRg"]},"q-0ec4f38b.js":{size:1279,imports:["q-1b3bace9.js"],dynamicImports:["q-25caf568.js"],origins:["../../node_modules/qwik-speak/lib/index.qwik.mjs"]},"q-1006cf19.js":{size:6888,imports:["q-1b3bace9.js"],origins:["src/components/icon/data.tsx"]},"q-102544b5.js":{size:1857,imports:["q-0ec4f38b.js","q-1b3bace9.js","q-35fce610.js","q-bb2ed15a.js","q-c1dab7a1.js"],origins:["src/components/footer/footer.css?used&inline","src/entry_footer.js","src/s_2fkm5zc0rek.js","src/s_g0e4nzcqtc8.js"],symbols:["s_2fkm5zc0rek","s_g0E4nZcqTc8"]},"q-1b3bace9.js":{size:49287,origins:["../../node_modules/@builder.io/qwik/core.min.mjs"]},"q-1dff0883.js":{size:1144,imports:["q-1b3bace9.js","q-e648ae0e.js"],dynamicImports:["q-0495a917.js"],origins:["src/entry_Link.js","src/s_8gdlbszqbam.js","src/s_i1cv0pyjnr0.js"],symbols:["s_8gdLBszqbaM","s_i1Cv0pYJNR0"]},"q-2224fe95.js":{size:746,imports:["q-1b3bace9.js"],origins:["src/entry_routeActionQrl.js","src/s_a5bzc7wo00a.js"],symbols:["s_A5bZC7WO00A"]},"q-25caf568.js":{size:1255,imports:["q-0ec4f38b.js","q-1b3bace9.js"],origins:["src/entry_QwikSpeakProvider.js","src/s_midc22uezrk.js","src/s_sfbnflx0y2a.js","src/s_yigdoibvcxe.js"],symbols:["s_MIDC22ueZrk","s_sfbNflx0Y2A","s_yigdOibvcXE"]},"q-2aec73f9.js":{size:1337,imports:["q-1b3bace9.js"],origins:["src/components/loader/loader.css?used&inline","src/entry_loader.js","src/s_5bmm03gq0i0.js","src/s_m2e9idaubt4.js"],symbols:["s_5Bmm03gq0i0","s_M2E9iDaUBT4"]},"q-2f8c339d.js":{size:683,imports:["q-1b3bace9.js"],origins:["src/components/line/line.css?used&inline","src/entry_line.js","src/s_3sspts5utqk.js","src/s_gft6e4m8el4.js"],symbols:["s_3SsPTS5utQk","s_gft6e4M8el4"]},"q-33b8f567.js":{size:125,imports:["q-1b3bace9.js"],dynamicImports:["q-8ea06850.js"],origins:["@qwik-city-entries"]},"q-35fce610.js":{size:278,imports:["q-1b3bace9.js"],dynamicImports:["q-7159aa88.js"],origins:["src/components/container/container.tsx"]},"q-3776fc6b.js":{size:1253,imports:["q-1b3bace9.js"],dynamicImports:["q-0c20792d.js"],origins:["src/routes/[...lang]/showcase/index.tsx"]},"q-3aa3b5ac.js":{size:3512,imports:["q-1b3bace9.js","q-c1dab7a1.js"],dynamicImports:["q-2aec73f9.js"],origins:["src/components/button/button.css?used&inline","src/components/loader/loader.tsx","src/entry_button.js","src/s_riehxbctaqu.js","src/s_rk5oellkahs.js"],symbols:["s_rIehxbCtAqU","s_rk5oELlKahs"]},"q-3ff9a77f.js":{size:4844,imports:["q-0ec4f38b.js","q-1b3bace9.js","q-93a2ab94.js","q-c1dab7a1.js","q-fc68bb4c.js"],origins:["src/components/sections/subscribe/shapes.tsx","src/components/sections/subscribe/subscribe.css?used&inline","src/entry_subscribe.js","src/s_i9fq1vzj8l0.js","src/s_kntte033sl4.js","src/s_kphxz30lh3m.js","src/s_n1zdsbkietw.js"],symbols:["s_i9FQ1vZJ8l0","s_KnttE033sL4","s_KPHXz30Lh3M","s_n1zdSBKIeTw"]},"q-45c51e6a.js":{size:292,imports:["q-1b3bace9.js"],dynamicImports:["q-07b9e137.js"],origins:["src/routes/[...lang]/layout.tsx"]},"q-4b508910.js":{size:1621,imports:["q-1b3bace9.js"],dynamicImports:["q-c7ae20ca.js"],origins:["src/routes/[...lang]/privacy-policy/index.tsx"]},"q-530d3fb7.js":{size:429,imports:["q-1b3bace9.js"],dynamicImports:["q-b2bf428c.js"],origins:["src/routes/[...lang]/index.tsx"]},"q-542487ff.js":{size:401,imports:["q-1b3bace9.js"],origins:["src/entry_SectionHeader.js","src/s_mekdswqefyq.js"],symbols:["s_mekDswQeFyQ"]},"q-663033b0.js":{size:2286,origins:["src/entry_spaInit.js","src/s_dyvc0ybiqqu.js"],symbols:["s_DyVc0YBIqQU"]},"q-6673dcf5.js":{size:514,imports:["q-1b3bace9.js"],origins:["src/components/card/card.css?used&inline","src/entry_card.js","src/s_e6holcczhoi.js","src/s_wm7dasaxykk.js"],symbols:["s_E6HOLccZhOI","s_wM7DasAxykk"]},"q-6b808a4b.js":{size:3878,imports:["q-0ec4f38b.js","q-1006cf19.js","q-1b3bace9.js","q-35fce610.js","q-93a2ab94.js","q-9635ee55.js","q-96e577df.js","q-c1dab7a1.js","q-f9712c4d.js","q-fc68bb4c.js"],origins:["src/components/sections/evolving/evolving.css?used&inline","src/entry_evolving.js","src/s_00ve9e0kyic.js","src/s_pbg9h8ze2g4.js"],symbols:["s_00VE9E0kYIc","s_pbG9H8ze2g4"]},"q-70047b8b.js":{size:32418,imports:["q-0ec4f38b.js","q-1b3bace9.js","q-bb2ed15a.js","q-e648ae0e.js"],dynamicImports:["q-85f474ec.js"],origins:["src/components/router-head/router-head.tsx","src/entry_root.js","src/global.css?used&inline","src/s_exd0k9bzzlo.js","src/s_kjtkeeh1u5c.js","src/speak-config-functions.ts"],symbols:["s_eXD0K9bzzlo","s_kJTkeEh1U5c"]},"q-7159aa88.js":{size:1442,imports:["q-1b3bace9.js","q-35fce610.js"],origins:["src/components/container/container.css?used&inline","src/entry_container.js","src/s_07tgklv0jfu.js","src/s_onhenaaszym.js"],symbols:["s_07tGklv0JFU","s_onhenAasZyM"]},"q-72eabc46.js":{size:889,imports:["q-1b3bace9.js","q-e648ae0e.js"],origins:["src/entry_serverQrl.js","src/s_woipfiq04l4.js"],symbols:["s_wOIPfiQ04l4"]},"q-7686f179.js":{size:1606,imports:["q-0ec4f38b.js","q-1b3bace9.js","q-35fce610.js","q-93a2ab94.js"],origins:["src/components/sections/banner/banner.css?used&inline","src/entry_banner.js","src/s_dviphmdh004.js","src/s_hdsyayhdklg.js"],symbols:["s_dVIPHMdh004","s_HdsYayhDkLg"]},"q-76d4e7f6.js":{size:5216,imports:["q-0ec4f38b.js","q-1b3bace9.js","q-35fce610.js","q-93a2ab94.js","q-bb2ed15a.js","q-c1dab7a1.js"],origins:["src/components/sections/contact/contact.css?used&inline","src/entry_contact.js","src/s_6vmpnf7zcj0.js","src/s_kk15dhxr40k.js","src/s_tvi0ug0y1ra.js","src/s_z790sfa7bty.js"],symbols:["s_6VMpNf7ZCJ0","s_kK15dHxr40k","s_tVi0Ug0Y1rA","s_Z790sFa7bTY"]},"q-799f4c7b.js":{size:267,imports:["q-1b3bace9.js"],dynamicImports:["q-102544b5.js"],origins:["src/components/footer/footer.tsx"]},"q-79c7160f.js":{size:467,imports:["q-1b3bace9.js","q-e648ae0e.js"],origins:["src/entry_RouterOutlet.js","src/s_e0ssidxoeam.js"],symbols:["s_e0ssiDXoeAM"]},"q-79edfbeb.js":{size:5823,imports:["q-1b3bace9.js","q-e648ae0e.js"],dynamicImports:["q-33b8f567.js","q-3776fc6b.js","q-45c51e6a.js","q-4b508910.js","q-530d3fb7.js"],origins:["@qwik-city-plan","src/entry_QwikCityProvider.js","src/s_02wmimzeabk.js","src/s_fx0bdjeja0e.js","src/s_rpdjaz33wla.js","src/s_txcfoy819ag.js"],symbols:["s_02wMImzEAbk","s_fX0bDjeJa0E","s_RPDJAz33WLA","s_TxCFOy819ag"]},"q-7a154197.js":{size:3631,imports:["q-0ec4f38b.js","q-1b3bace9.js","q-93a2ab94.js","q-fc68bb4c.js"],origins:["src/components/sections/discord/discord.css?used&inline","src/components/sections/discord/shapes.tsx","src/entry_discord.js","src/s_0kxszc4qkmm.js","src/s_khl60h7gizk.js"],symbols:["s_0kXSZC4QkmM","s_KHl60H7GIzk"]},"q-821afda9.js":{size:6730,imports:["q-0ec4f38b.js","q-1006cf19.js","q-1b3bace9.js","q-35fce610.js","q-a95cc110.js","q-bb2ed15a.js","q-c1dab7a1.js","q-c67faab2.js","q-e648ae0e.js","q-f9712c4d.js"],origins:["src/components/navbar/navbar.css?used&inline","src/entry_navbar.js","src/s_dbzp75i0jua.js","src/s_e0rdnpjnigy.js","src/s_eqll1xu2k6a.js","src/s_hslhkde0tc8.js","src/s_k8tt2dajw7i.js","src/s_lqcmhaxufau.js","src/s_qj09dibebqs.js","src/s_ywaz5f0ljew.js"],symbols:["s_dBzp75i0JUA","s_e0RDNPJNIGY","s_EQll1XU2k6A","s_HSLHKDE0Tc8","s_K8TT2dajw7I","s_LQcmHAxuFaU","s_Qj09dIbebQs","s_YWAZ5f0lJEw"]},"q-85f474ec.js":{size:746,imports:["q-0ec4f38b.js","q-1b3bace9.js","q-e648ae0e.js"],origins:["src/entry_RouterHead.js","src/s_2fq8wiupq5i.js"],symbols:["s_2Fq8wIUpq5I"]},"q-8a6a2055.js":{size:1159,imports:["q-1b3bace9.js","q-35fce610.js","q-93a2ab94.js"],origins:["src/components/section/section.css?used&inline","src/entry_section.js","src/s_mbncrhrrmns.js","src/s_mr5rbpxrkds.js"],symbols:["s_MBnCRhRrMNs","s_MR5rBPxRKDs"]},"q-8ea06850.js":{size:2539,origins:["../../node_modules/@builder.io/qwik-city/service-worker.mjs","src/routes/service-worker.ts"]},"q-93a2ab94.js":{size:407,imports:["q-1b3bace9.js"],dynamicImports:["q-542487ff.js","q-8a6a2055.js"],origins:["src/components/section/section.tsx"]},"q-95d7066d.js":{size:492,imports:["q-1006cf19.js","q-1b3bace9.js"],origins:["src/components/icon/icon.css?used&inline","src/entry_icon.js","src/s_outyrshf0tw.js","src/s_sogqv7sgr00.js"],symbols:["s_outyRSHf0Tw","s_sOgQv7sgR00"]},"q-9635ee55.js":{size:870,imports:["q-1b3bace9.js"],dynamicImports:["q-6b808a4b.js"],origins:["src/components/sections/evolving/evolving.tsx"]},"q-96e577df.js":{size:179,imports:["q-1b3bace9.js"],dynamicImports:["q-6673dcf5.js"],origins:["src/components/card/card.tsx"]},"q-9bac2d4e.js":{size:4677,imports:["q-0ec4f38b.js","q-1b3bace9.js","q-35fce610.js","q-bb2ed15a.js","q-c1dab7a1.js","q-fc68bb4c.js"],origins:["src/components/sections/hero/hero.css?used&inline","src/components/sections/hero/shapes.tsx","src/entry_hero.js","src/s_0claynilojk.js","src/s_drt9k1jphw0.js"],symbols:["s_0CLaYnIloJk","s_DRT9K1jPHw0"]},"q-a95cc110.js":{size:407,imports:["q-1b3bace9.js"],dynamicImports:["q-0d167c3e.js","q-ee164527.js"],origins:["src/components/forms/select/select.tsx"]},"q-b235b133.js":{size:1095,imports:["q-1b3bace9.js"],dynamicImports:["q-0c20792d.js"],origins:["src/components/sections/showcase/showcase.tsx"]},"q-b2bf428c.js":{size:2469,imports:["q-1b3bace9.js","q-799f4c7b.js","q-9635ee55.js","q-b235b133.js","q-c67faab2.js","q-ff65caa7.js"],dynamicImports:["q-01e0113d.js","q-3ff9a77f.js","q-7686f179.js","q-76d4e7f6.js","q-7a154197.js","q-9bac2d4e.js","q-c6f3a2cb.js","q-d5a1012b.js","q-ec7e5ba3.js"],origins:["src/components/sections/banner/banner.tsx","src/components/sections/contact/contact.tsx","src/components/sections/discord/discord.tsx","src/components/sections/doc-summary/doc-summary.tsx","src/components/sections/explore/explore.tsx","src/components/sections/hero/hero.tsx","src/components/sections/medusa/medusa.tsx","src/components/sections/sponsor/sponsor.tsx","src/components/sections/subscribe/subscribe.tsx","src/entry_____lang_.js","src/s_bob0jnucsky.js"],symbols:["s_bOB0JnUCSKY"]},"q-bb2ed15a.js":{size:587,origins:["src/speak-config.ts"]},"q-c1dab7a1.js":{size:326,imports:["q-1b3bace9.js"],dynamicImports:["q-3aa3b5ac.js"],origins:["src/components/button/button.tsx"]},"q-c4254027.js":{size:1037,imports:["q-1b3bace9.js","q-e648ae0e.js"],origins:["src/entry_GetForm.js","src/s_nk9plpjqm9y.js","src/s_p9msze0ojs4.js"],symbols:["s_Nk9PlpjQm9Y","s_p9MSze0ojs4"]},"q-c67faab2.js":{size:419,imports:["q-1b3bace9.js"],dynamicImports:["q-821afda9.js"],origins:["src/components/navbar/navbar.tsx"]},"q-c6f3a2cb.js":{size:4852,imports:["q-0ec4f38b.js","q-1006cf19.js","q-1b3bace9.js","q-35fce610.js","q-93a2ab94.js","q-96e577df.js","q-c1dab7a1.js","q-f9712c4d.js"],origins:["src/components/sections/doc-summary/doc-summary.css?used&inline","src/components/sections/doc-summary/shapes.tsx","src/entry_doc_summary.js","src/s_14ne37yamfa.js","src/s_tcwb4tuhbfa.js"],symbols:["s_14NE37yaMfA","s_TCwB4TUhbFA"]},"q-c7ae20ca.js":{size:18710,imports:["q-1b3bace9.js","q-35fce610.js","q-4b508910.js","q-799f4c7b.js","q-93a2ab94.js","q-c1dab7a1.js","q-c67faab2.js"],origins:["src/entry_privacy_policy.js","src/s_cq1t0rxar34.js"],symbols:["s_CQ1t0RXar34"]},"q-d5a1012b.js":{size:17798,imports:["q-0ec4f38b.js","q-1b3bace9.js","q-93a2ab94.js","q-c1dab7a1.js","q-fc68bb4c.js"],origins:["src/components/sections/medusa/medusa.css?used&inline","src/components/sections/medusa/shapes.tsx","src/entry_medusa.js","src/s_eh3zleb9svu.js","src/s_oiztmtto2ni.js"],symbols:["s_eh3Zleb9svU","s_oIzTMtTO2NI"]},"q-dd937774.js":{size:251,imports:["q-1b3bace9.js"],dynamicImports:["q-70047b8b.js"],origins:["src/root.tsx"]},"q-e648ae0e.js":{size:7653,imports:["q-1b3bace9.js"],dynamicImports:["q-663033b0.js","q-72eabc46.js","q-79c7160f.js","q-79edfbeb.js"],origins:["../../node_modules/@builder.io/qwik-city/index.qwik.mjs","@qwik-city-sw-register"]},"q-ec7e5ba3.js":{size:4745,imports:["q-0ec4f38b.js","q-1006cf19.js","q-1b3bace9.js","q-35fce610.js","q-93a2ab94.js","q-96e577df.js","q-c1dab7a1.js","q-f9712c4d.js"],origins:["src/components/sections/explore/explore.css?used&inline","src/entry_explore.js","src/s_dknhr022s5k.js","src/s_rz4krsph3h0.js"],symbols:["s_DkNHR022s5k","s_RZ4kRsPh3h0"]},"q-ee164527.js":{size:1787,imports:["q-1b3bace9.js","q-a95cc110.js"],origins:["src/components/forms/select/select.css?used&inline","src/entry_select.js","src/s_2hcpp1ydyqs.js","src/s_mojpn7epc74.js","src/s_pl7valduouo.js","src/s_tnyoacim0qc.js"],symbols:["s_2HCPp1ydyqs","s_MOjpn7epc74","s_Pl7vAlduOuo","s_tNYOaCIm0Qc"]},"q-f50d89b3.js":{size:787,imports:["q-1b3bace9.js","q-e648ae0e.js"],origins:["src/entry_QwikCityMockProvider.js","src/s_bubtvtyvvre.js","src/s_wmyc5h00wti.js"],symbols:["s_BUbtvTyvVRE","s_WmYC5H00wtI"]},"q-f9712c4d.js":{size:201,imports:["q-1b3bace9.js"],dynamicImports:["q-95d7066d.js"],origins:["src/components/icon/icon.tsx"]},"q-fb9737d5.js":{size:1253,imports:["q-1b3bace9.js","q-35fce610.js","q-93a2ab94.js","q-ff65caa7.js"],origins:["src/components/sections/brands/brands.css?used&inline","src/entry_brands.js","src/s_5qyiiejmpsa.js","src/s_zwz0qjzctzq.js"],symbols:["s_5qyIIEjMPSA","s_ZwZ0qjzCTZQ"]},"q-fc68bb4c.js":{size:179,imports:["q-1b3bace9.js"],dynamicImports:["q-2f8c339d.js"],origins:["src/components/line/line.tsx"]},"q-ff65caa7.js":{size:886,imports:["q-1b3bace9.js"],dynamicImports:["q-fb9737d5.js"],origins:["src/components/sections/brands/brands.tsx"]}},injections:[],version:"1",options:{target:"client",buildMode:"production",entryStrategy:{type:"smart"}},platform:{qwik:"1.2.12",vite:"",rollup:"3.29.2",env:"node",os:"linux",node:"18.13.0"}},Ze=()=>{const e=ue(),t=be();return h(I,{children:[b("title",null,null,X(e.title),1,null),b("link",null,{href:we(n=>n.url.hash,[t],"p0.url.hash"),rel:"canonical"},null,3,null),b("meta",null,{content:"width=device-width, initial-scale=1.0",name:"viewport"},null,3,null),b("link",null,{href:"/favicon.svg",rel:"icon",type:"image/svg+xml"},null,3,null),e.meta.map(n=>q("meta",{...n,content:n.content?X(n.content):void 0},null,0,"0Z_0")),e.links.map(n=>q("link",{...n},null,0,"0Z_1")),e.styles.map(n=>q("style",{...n.props,dangerouslySetInnerHTML:fe(n,"style")},null,0,"0Z_2"))]},1,"0Z_3")},Xe=V(x(Ze,"s_2Fq8wIUpq5I")),Ge=`.container{width:100%}@media (min-width: 640px){.container{max-width:640px}}@media (min-width: 768px){.container{max-width:768px}}@media (min-width: 1024px){.container{max-width:1024px}}@media (min-width: 1280px){.container{max-width:1280px}}@media (min-width: 1536px){.container{max-width:1536px}}*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]{display:none}[type=text],input:where(:not([type])),[type=email],[type=url],[type=password],[type=number],[type=date],[type=datetime-local],[type=month],[type=search],[type=tel],[type=time],[type=week],[multiple],textarea,select{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:#fff;border-color:#6b7280;border-width:1px;border-radius:0;padding:.5rem .75rem;font-size:1rem;line-height:1.5rem;--tw-shadow: 0 0 #0000}[type=text]:focus,input:where(:not([type])):focus,[type=email]:focus,[type=url]:focus,[type=password]:focus,[type=number]:focus,[type=date]:focus,[type=datetime-local]:focus,[type=month]:focus,[type=search]:focus,[type=tel]:focus,[type=time]:focus,[type=week]:focus,[multiple]:focus,textarea:focus,select:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-inset: var(--tw-empty, );--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: #2563eb;--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow);border-color:#2563eb}input::-moz-placeholder,textarea::-moz-placeholder{color:#6b7280;opacity:1}input::placeholder,textarea::placeholder{color:#6b7280;opacity:1}::-webkit-datetime-edit-fields-wrapper{padding:0}::-webkit-date-and-time-value{min-height:1.5em;text-align:inherit}::-webkit-datetime-edit{display:inline-flex}::-webkit-datetime-edit,::-webkit-datetime-edit-year-field,::-webkit-datetime-edit-month-field,::-webkit-datetime-edit-day-field,::-webkit-datetime-edit-hour-field,::-webkit-datetime-edit-minute-field,::-webkit-datetime-edit-second-field,::-webkit-datetime-edit-millisecond-field,::-webkit-datetime-edit-meridiem-field{padding-top:0;padding-bottom:0}select{background-image:url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");background-position:right .5rem center;background-repeat:no-repeat;background-size:1.5em 1.5em;padding-right:2.5rem;-webkit-print-color-adjust:exact;print-color-adjust:exact}[multiple],[size]:where(select:not([size="1"])){background-image:initial;background-position:initial;background-repeat:unset;background-size:initial;padding-right:.75rem;-webkit-print-color-adjust:unset;print-color-adjust:unset}[type=checkbox],[type=radio]{-webkit-appearance:none;-moz-appearance:none;appearance:none;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact;display:inline-block;vertical-align:middle;background-origin:border-box;-webkit-user-select:none;-moz-user-select:none;user-select:none;flex-shrink:0;height:1rem;width:1rem;color:#2563eb;background-color:#fff;border-color:#6b7280;border-width:1px;--tw-shadow: 0 0 #0000}[type=checkbox]{border-radius:0}[type=radio]{border-radius:100%}[type=checkbox]:focus,[type=radio]:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-inset: var(--tw-empty, );--tw-ring-offset-width: 2px;--tw-ring-offset-color: #fff;--tw-ring-color: #2563eb;--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}[type=checkbox]:checked,[type=radio]:checked{border-color:transparent;background-color:currentColor;background-size:100% 100%;background-position:center;background-repeat:no-repeat}[type=checkbox]:checked{background-image:url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")}[type=radio]:checked{background-image:url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e")}[type=checkbox]:checked:hover,[type=checkbox]:checked:focus,[type=radio]:checked:hover,[type=radio]:checked:focus{border-color:transparent;background-color:currentColor}[type=checkbox]:indeterminate{background-image:url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 16 16'%3e%3cpath stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 8h8'/%3e%3c/svg%3e");border-color:transparent;background-color:currentColor;background-size:100% 100%;background-position:center;background-repeat:no-repeat}[type=checkbox]:indeterminate:hover,[type=checkbox]:indeterminate:focus{border-color:transparent;background-color:currentColor}[type=file]{background:unset;border-color:inherit;border-width:0;border-radius:0;padding:0;font-size:unset;line-height:inherit}[type=file]:focus{outline:1px solid ButtonText;outline:1px auto -webkit-focus-ring-color}html{font-family:Avenir Next,Avenir Local}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: }.\\!pointer-events-none{pointer-events:none!important}.visible{visibility:visible}.invisible{visibility:hidden}.fixed{position:fixed}.absolute{position:absolute}.\\!relative{position:relative!important}.relative{position:relative}.bottom-0{bottom:0}.bottom-6{bottom:1.5rem}.bottom-\\[-6px\\]{bottom:-6px}.bottom-\\[12\\%\\]{bottom:12%}.bottom-\\[5\\%\\]{bottom:5%}.left-0{left:0}.left-1\\/2{left:50%}.left-\\[-1px\\]{left:-1px}.left-\\[-2px\\]{left:-2px}.left-\\[12\\%\\]{left:12%}.left-\\[14\\%\\]{left:14%}.left-\\[5\\%\\]{left:5%}.left-\\[60\\%\\]{left:60%}.left-full{left:100%}.right-0{right:0}.right-\\[-2px\\]{right:-2px}.right-\\[10\\%\\]{right:10%}.right-\\[12\\%\\]{right:12%}.right-\\[26px\\]{right:26px}.right-\\[5\\%\\]{right:5%}.top-0{top:0}.top-1\\/2{top:50%}.top-1\\/3{top:33.333333%}.top-6{top:1.5rem}.top-\\[-8px\\]{top:-8px}.top-\\[25\\%\\]{top:25%}.top-\\[55\\%\\]{top:55%}.top-\\[7px\\]{top:7px}.top-\\[88px\\]{top:88px}.z-10{z-index:10}.z-20{z-index:20}.z-50{z-index:50}.z-\\[60\\]{z-index:60}.z-\\[999\\]{z-index:999}.col-span-2{grid-column:span 2 / span 2}.mx-auto{margin-left:auto;margin-right:auto}.my-1{margin-top:.25rem;margin-bottom:.25rem}.my-1\\.5{margin-top:.375rem;margin-bottom:.375rem}.mr-6{margin-right:1.5rem}.mt-2{margin-top:.5rem}.mt-auto{margin-top:auto}.block{display:block}.inline-block{display:inline-block}.inline{display:inline}.flex{display:flex}.inline-flex{display:inline-flex}.grid{display:grid}.hidden{display:none}.aspect-\\[97\\/66\\]{aspect-ratio:97/66}.h-0{height:0px}.h-0\\.5{height:.125rem}.h-10{height:2.5rem}.h-12{height:3rem}.h-14{height:3.5rem}.h-16{height:4rem}.h-2{height:.5rem}.h-24{height:6rem}.h-\\[18px\\]{height:18px}.h-\\[1px\\]{height:1px}.h-\\[32px\\]{height:32px}.h-\\[3px\\]{height:3px}.h-\\[80px\\]{height:80px}.h-\\[88px\\]{height:88px}.h-full{height:100%}.h-screen{height:100vh}.min-h-\\[44px\\]{min-height:44px}.w-1\\/2{width:50%}.w-1\\/3{width:33.333333%}.w-1\\/4{width:25%}.w-11\\/12{width:91.666667%}.w-12{width:3rem}.w-14{width:3.5rem}.w-16{width:4rem}.w-2{width:.5rem}.w-20{width:5rem}.w-24{width:6rem}.w-3\\/12{width:25%}.w-3\\/4{width:75%}.w-32{width:8rem}.w-36{width:9rem}.w-40{width:10rem}.w-48{width:12rem}.w-52{width:13rem}.w-56{width:14rem}.w-6{width:1.5rem}.w-\\[30px\\]{width:30px}.w-\\[3px\\]{width:3px}.w-\\[80\\%\\]{width:80%}.w-\\[90\\%\\]{width:90%}.w-full{width:100%}.w-screen{width:100vw}.max-w-1225{max-width:1225px}.max-w-2xl{max-width:42rem}.max-w-4xl{max-width:56rem}.max-w-7xl{max-width:80rem}.max-w-full{max-width:100%}.max-w-lg{max-width:32rem}.max-w-sm{max-width:24rem}.flex-1{flex:1 1 0%}.origin-left{transform-origin:left}.origin-right{transform-origin:right}.-translate-x-1\\/2{--tw-translate-x: -50%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.-translate-x-1\\/3{--tw-translate-x: -33.333333%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.-translate-x-full{--tw-translate-x: -100%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.-translate-y-1\\/2{--tw-translate-y: -50%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.-translate-y-2\\/3{--tw-translate-y: -66.666667%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.translate-x-1\\/2{--tw-translate-x: 50%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.translate-x-1\\/3{--tw-translate-x: 33.333333%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.translate-x-full{--tw-translate-x: 100%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.translate-y-1\\/2{--tw-translate-y: 50%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.translate-y-1\\/3{--tw-translate-y: 33.333333%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.translate-y-2\\/3{--tw-translate-y: 66.666667%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.translate-y-full{--tw-translate-y: 100%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.-rotate-45{--tw-rotate: -45deg;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.-rotate-\\[30deg\\]{--tw-rotate: -30deg;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.rotate-45{--tw-rotate: 45deg;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.rotate-90{--tw-rotate: 90deg;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.rotate-\\[30deg\\]{--tw-rotate: 30deg;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.transform{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.scroll-mt-32{scroll-margin-top:8rem}.grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}.flex-row-reverse{flex-direction:row-reverse}.flex-col{flex-direction:column}.flex-wrap{flex-wrap:wrap}.items-start{align-items:flex-start}.items-center{align-items:center}.justify-end{justify-content:flex-end}.justify-center{justify-content:center}.justify-between{justify-content:space-between}.gap-1{gap:.25rem}.gap-10{gap:2.5rem}.gap-12{gap:3rem}.gap-2{gap:.5rem}.gap-3{gap:.75rem}.gap-4{gap:1rem}.gap-5{gap:1.25rem}.gap-6{gap:1.5rem}.gap-8{gap:2rem}.gap-x-10{-moz-column-gap:2.5rem;column-gap:2.5rem}.gap-x-2{-moz-column-gap:.5rem;column-gap:.5rem}.gap-x-24{-moz-column-gap:6rem;column-gap:6rem}.gap-x-3{-moz-column-gap:.75rem;column-gap:.75rem}.gap-y-10{row-gap:2.5rem}.gap-y-12{row-gap:3rem}.gap-y-4{row-gap:1rem}.gap-y-8{row-gap:2rem}.overflow-hidden{overflow:hidden}.overflow-x-hidden{overflow-x:hidden}.overflow-y-scroll{overflow-y:scroll}.truncate{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.whitespace-nowrap{white-space:nowrap}.break-words{overflow-wrap:break-word}.rounded-full{border-radius:9999px}.border{border-width:1px}.border-0{border-width:0px}.border-solid{border-style:solid}.\\!border-blue-gray-400{--tw-border-opacity: 1 !important;border-color:rgb(148 159 197 / var(--tw-border-opacity))!important}.\\!border-blue-gray-900{--tw-border-opacity: 1 !important;border-color:rgb(28 33 53 / var(--tw-border-opacity))!important}.\\!border-transparent{border-color:transparent!important}.border-blue-gray-400{--tw-border-opacity: 1;border-color:rgb(148 159 197 / var(--tw-border-opacity))}.border-blue-gray-500{--tw-border-opacity: 1;border-color:rgb(123 132 163 / var(--tw-border-opacity))}.border-blue-gray-900{--tw-border-opacity: 1;border-color:rgb(28 33 53 / var(--tw-border-opacity))}.border-transparent{border-color:transparent}.\\!bg-blue-gray-400{--tw-bg-opacity: 1 !important;background-color:rgb(148 159 197 / var(--tw-bg-opacity))!important}.\\!bg-blue-gray-900{--tw-bg-opacity: 1 !important;background-color:rgb(28 33 53 / var(--tw-bg-opacity))!important}.\\!bg-transparent{background-color:transparent!important}.bg-\\[\\#EFEFFF\\]{--tw-bg-opacity: 1;background-color:rgb(239 239 255 / var(--tw-bg-opacity))}.bg-blue-gray-300{--tw-bg-opacity: 1;background-color:rgb(202 209 234 / var(--tw-bg-opacity))}.bg-blue-gray-400{--tw-bg-opacity: 1;background-color:rgb(148 159 197 / var(--tw-bg-opacity))}.bg-blue-gray-500{--tw-bg-opacity: 1;background-color:rgb(123 132 163 / var(--tw-bg-opacity))}.bg-blue-gray-900{--tw-bg-opacity: 1;background-color:rgb(28 33 53 / var(--tw-bg-opacity))}.bg-mf-gray{--tw-bg-opacity: 1;background-color:rgb(246 246 250 / var(--tw-bg-opacity))}.bg-transparent{background-color:transparent}.bg-white{--tw-bg-opacity: 1;background-color:rgb(255 255 255 / var(--tw-bg-opacity))}.bg-white\\/10{background-color:#ffffff1a}.bg-pattern{background-image:url(/pattern_9.png)}.bg-repeat{background-repeat:repeat}.p-0{padding:0}.p-10{padding:2.5rem}.p-12{padding:3rem}.p-4{padding:1rem}.p-6{padding:1.5rem}.px-16{padding-left:4rem;padding-right:4rem}.px-4{padding-left:1rem;padding-right:1rem}.px-6{padding-left:1.5rem;padding-right:1.5rem}.px-8{padding-left:2rem;padding-right:2rem}.py-1{padding-top:.25rem;padding-bottom:.25rem}.py-1\\.5{padding-top:.375rem;padding-bottom:.375rem}.py-14{padding-top:3.5rem;padding-bottom:3.5rem}.py-28{padding-top:7rem;padding-bottom:7rem}.py-3{padding-top:.75rem;padding-bottom:.75rem}.py-6{padding-top:1.5rem;padding-bottom:1.5rem}.py-8{padding-top:2rem;padding-bottom:2rem}.pb-1{padding-bottom:.25rem}.pb-14{padding-bottom:3.5rem}.pb-24{padding-bottom:6rem}.pr-4{padding-right:1rem}.pr-6{padding-right:1.5rem}.pr-8{padding-right:2rem}.pt-10{padding-top:2.5rem}.pt-14{padding-top:3.5rem}.text-left{text-align:left}.text-center{text-align:center}.text-right{text-align:right}.text-2xl{font-size:1.5rem;line-height:2rem}.text-3xl{font-size:1.875rem;line-height:2.25rem}.text-4xl{font-size:2.25rem;line-height:2.5rem}.text-base{font-size:1rem;line-height:1.5rem}.text-lg{font-size:1.125rem;line-height:1.75rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-xl{font-size:1.25rem;line-height:1.75rem}.font-bold{font-weight:700}.font-medium{font-weight:500}.font-normal{font-weight:400}.font-semibold{font-weight:600}.leading-normal{line-height:1.5}.leading-snug{line-height:1.375}.leading-tight{line-height:1.25}.\\!text-blue-gray-400{--tw-text-opacity: 1 !important;color:rgb(148 159 197 / var(--tw-text-opacity))!important}.\\!text-blue-gray-700{--tw-text-opacity: 1 !important;color:rgb(47 56 88 / var(--tw-text-opacity))!important}.\\!text-blue-gray-900{--tw-text-opacity: 1 !important;color:rgb(28 33 53 / var(--tw-text-opacity))!important}.\\!text-deep-purple-300{--tw-text-opacity: 1 !important;color:rgb(149 137 234 / var(--tw-text-opacity))!important}.\\!text-white{--tw-text-opacity: 1 !important;color:rgb(255 255 255 / var(--tw-text-opacity))!important}.text-blue-gray-500{--tw-text-opacity: 1;color:rgb(123 132 163 / var(--tw-text-opacity))}.text-blue-gray-900{--tw-text-opacity: 1;color:rgb(28 33 53 / var(--tw-text-opacity))}.text-deep-purple-700{--tw-text-opacity: 1;color:rgb(101 89 162 / var(--tw-text-opacity))}.text-green-700{--tw-text-opacity: 1;color:rgb(21 128 61 / var(--tw-text-opacity))}.text-ui-blue{--tw-text-opacity: 1;color:rgb(0 185 255 / var(--tw-text-opacity))}.text-white{--tw-text-opacity: 1;color:rgb(255 255 255 / var(--tw-text-opacity))}.underline{text-decoration-line:underline}.decoration-solid{text-decoration-style:solid}.decoration-1{text-decoration-thickness:1px}.underline-offset-2{text-underline-offset:2px}.opacity-0{opacity:0}.opacity-100{opacity:1}.opacity-40{opacity:.4}.opacity-70{opacity:.7}.outline-none{outline:2px solid transparent;outline-offset:2px}.outline{outline-style:solid}.outline-ui-blue{outline-color:#00b9ff}.backdrop-blur-md{--tw-backdrop-blur: blur(12px);-webkit-backdrop-filter:var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);backdrop-filter:var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia)}.backdrop-blur-xl{--tw-backdrop-blur: blur(24px);-webkit-backdrop-filter:var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);backdrop-filter:var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia)}.transition-all{transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-opacity{transition-property:opacity;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-shadow{transition-property:box-shadow;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.duration-300{transition-duration:.3s}@font-face{font-family:Avenir Local;font-style:normal;font-weight:100;src:url(/fonts/AvenirNextLTPro-UltLt.otf) format("opentype")}@font-face{font-family:Avenir Local;font-style:normal;font-weight:400;src:url(/fonts/AvenirNextLTPro-Regular.otf) format("opentype")}@font-face{font-family:Avenir Local;font-style:normal;font-weight:500;src:url(/fonts/AvenirNextLTPro-Medium.otf) format("opentype")}@font-face{font-family:Avenir Local;font-style:normal;font-weight:600;src:url(/fonts/AvenirNextLTPro-Demi.otf) format("opentype")}@font-face{font-family:Avenir Local;font-style:normal;font-weight:700;src:url(/fonts/AvenirNextLTPro-Bold.otf) format("opentype")}@font-face{font-family:Avenir Local;font-style:normal;font-weight:800;src:url(/fonts/AvenirNextLTPro-Heavy.otf) format("opentype")}.article{--tw-text-opacity: 1;color:rgb(28 33 53 / var(--tw-text-opacity))}.article h2{margin-bottom:1.5rem;font-size:1.875rem;line-height:2.25rem;font-weight:600}.article p,.article ul{margin-bottom:1.5rem}.article ul li{margin-bottom:1rem;list-style-position:inside;list-style-type:disc;padding-left:.5rem}.article a{--tw-text-opacity: 1;color:rgb(0 185 255 / var(--tw-text-opacity))}.empty\\:hidden:empty{display:none}.hover\\:border-blue-gray-600:hover{--tw-border-opacity: 1;border-color:rgb(70 83 128 / var(--tw-border-opacity))}.hover\\:border-blue-gray-700:hover{--tw-border-opacity: 1;border-color:rgb(47 56 88 / var(--tw-border-opacity))}.hover\\:bg-blue-gray-300:hover{--tw-bg-opacity: 1;background-color:rgb(202 209 234 / var(--tw-bg-opacity))}.hover\\:bg-blue-gray-600:hover{--tw-bg-opacity: 1;background-color:rgb(70 83 128 / var(--tw-bg-opacity))}.hover\\:bg-blue-gray-700:hover{--tw-bg-opacity: 1;background-color:rgb(47 56 88 / var(--tw-bg-opacity))}.hover\\:bg-white:hover{--tw-bg-opacity: 1;background-color:rgb(255 255 255 / var(--tw-bg-opacity))}.hover\\:text-blue-gray-600:hover{--tw-text-opacity: 1;color:rgb(70 83 128 / var(--tw-text-opacity))}.hover\\:text-deep-purple-700:hover{--tw-text-opacity: 1;color:rgb(101 89 162 / var(--tw-text-opacity))}.hover\\:text-white:hover{--tw-text-opacity: 1;color:rgb(255 255 255 / var(--tw-text-opacity))}.hover\\:shadow-card:hover{--tw-shadow: 0px 0px 32px 0px #201E3726;--tw-shadow-colored: 0px 0px 32px 0px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)}.focus\\:border-ui-blue:focus{--tw-border-opacity: 1;border-color:rgb(0 185 255 / var(--tw-border-opacity))}.focus\\:bg-mf-gray:focus{--tw-bg-opacity: 1;background-color:rgb(246 246 250 / var(--tw-bg-opacity))}.focus-visible\\:border-transparent:focus-visible{border-color:transparent}.focus-visible\\:shadow-outline:focus-visible{--tw-shadow: 0 0 0 2px #00B9FF;--tw-shadow-colored: 0 0 0 2px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)}.active\\:border-blue-gray-700:active{--tw-border-opacity: 1;border-color:rgb(47 56 88 / var(--tw-border-opacity))}.active\\:border-blue-gray-900:active{--tw-border-opacity: 1;border-color:rgb(28 33 53 / var(--tw-border-opacity))}.active\\:bg-blue-gray-700:active{--tw-bg-opacity: 1;background-color:rgb(47 56 88 / var(--tw-bg-opacity))}.active\\:bg-blue-gray-900:active{--tw-bg-opacity: 1;background-color:rgb(28 33 53 / var(--tw-bg-opacity))}.active\\:font-semibold:active{font-weight:600}.active\\:text-blue-gray-700:active{--tw-text-opacity: 1;color:rgb(47 56 88 / var(--tw-text-opacity))}.active\\:text-deep-purple-300:active{--tw-text-opacity: 1;color:rgb(149 137 234 / var(--tw-text-opacity))}.active\\:text-white:active{--tw-text-opacity: 1;color:rgb(255 255 255 / var(--tw-text-opacity))}@media (min-width: 768px){.md\\:bottom-\\[20\\%\\]{bottom:20%}.md\\:left-1\\/2{left:50%}.md\\:left-\\[14\\%\\]{left:14%}.md\\:left-\\[20\\%\\]{left:20%}.md\\:left-\\[5\\%\\]{left:5%}.md\\:right-1\\/4{right:25%}.md\\:right-\\[14\\%\\]{right:14%}.md\\:right-\\[5\\%\\]{right:5%}.md\\:top-1\\/2{top:50%}.md\\:top-1\\/3{top:33.333333%}.md\\:top-1\\/4{top:25%}.md\\:top-\\[60\\%\\]{top:60%}.md\\:flex{display:flex}.md\\:grid{display:grid}.md\\:hidden{display:none}.md\\:h-24{height:6rem}.md\\:h-\\[20px\\]{height:20px}.md\\:w-1\\/4{width:25%}.md\\:w-2\\/6{width:33.333333%}.md\\:w-20{width:5rem}.md\\:w-24{width:6rem}.md\\:w-36{width:9rem}.md\\:w-40{width:10rem}.md\\:w-44{width:11rem}.md\\:w-48{width:12rem}.md\\:w-5\\/12{width:41.666667%}.md\\:w-52{width:13rem}.md\\:w-56{width:14rem}.md\\:w-64{width:16rem}.md\\:w-72{width:18rem}.md\\:w-80{width:20rem}.md\\:w-\\[196px\\]{width:196px}.md\\:w-auto{width:auto}.md\\:min-w-\\[200px\\]{min-width:200px}.md\\:-translate-x-1\\/2{--tw-translate-x: -50%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.md\\:-translate-y-1\\/2{--tw-translate-y: -50%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.md\\:-translate-y-1\\/3{--tw-translate-y: -33.333333%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.md\\:translate-x-1\\/2{--tw-translate-x: 50%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.md\\:translate-y-0{--tw-translate-y: 0px;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.md\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.md\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.md\\:grid-cols-\\[1fr_auto\\]{grid-template-columns:1fr auto}.md\\:flex-row{flex-direction:row}.md\\:items-center{align-items:center}.md\\:justify-start{justify-content:flex-start}.md\\:justify-center{justify-content:center}.md\\:gap-1{gap:.25rem}.md\\:gap-10{gap:2.5rem}.md\\:gap-8{gap:2rem}.md\\:p-12{padding:3rem}.md\\:py-28{padding-top:7rem;padding-bottom:7rem}.md\\:py-32{padding-top:8rem;padding-bottom:8rem}.md\\:pb-28{padding-bottom:7rem}.md\\:pt-28{padding-top:7rem}.md\\:text-left{text-align:left}.md\\:text-3xl{font-size:1.875rem;line-height:2.25rem}.md\\:text-6xl{font-size:3.75rem;line-height:1}.md\\:leading-none{line-height:1}}@media (min-width: 1024px){.lg\\:flex-row{flex-direction:row}}@media (min-width: 1280px){.xl\\:flex{display:flex}.xl\\:hidden{display:none}.xl\\:flex-row{flex-direction:row}.xl\\:justify-start{justify-content:flex-start}}
`,Ve=`{
  "app": {
    "meta": {
      "description": "Module Federation aims to solve the sharing of modules in a distributed system. It allows you to ship those critical shared pieces as macro or as micro as you would like. It does this by pulling them out of the build pipeline and out of your apps"
    },
    "title": "Module Federation: streamline your microfrontends"
  }
}
`,We=`{
  "banner": {
    "text": {
      "firstLine": "At Valor, we are delighted to be the exclusive support partners for Module Federation - a technology created by Zack Jackson that has revolutionized modern development.",
      "secondLine": "Our collaboration and status as core team members has enabled us to reduce the community's reliance on a single individual, as well as bring greater value to OSS."
    },
    "title": "Enterprise Support & Training"
  }
}
`,et=`{
  "contact": {
    "disclaimer": {
      "action": "Privacy & Policy",
      "text": "By submitting this form, I confirm that I have read and understood the"
    },
    "form": {
      "action": "Submit",
      "company-email": {
        "label": "Company email"
      },
      "company-website": {
        "label": "Company website"
      },
      "how-can-we-help-you": {
        "label": "How can we help you?"
      },
      "name": {
        "label": "Your name"
      },
      "company-size": {
        "label": "Company size"
      }
    },
    "quote": {
      "author": {
        "name": "Zack Jackson",
        "title": "the сreator of Module Federation"
      },
      "text": "There are now 4000 companies using Module Federation in a detectable way. Likely many more who we cannot trace, but 4000 is still an impressive number of known entities."
    },
    "title": "Talk to our experts"
  }
}
`,tt=`{
  "discord": {
    "action": "Discord",
    "title": "Join to Module Federation community in"
  }
}
`,nt=`{
  "doc-summary": {
    "action": "Start using module federation",
    "cards": {
      "decentralized": {
        "action": "Documentation",
        "desc": "Module Federation allows developers to share code between multiple projects in a decentralized manner, making it easier to manage complex applications.",
        "title": "Decentralized code sharing"
      },
      "federated-runtime": {
        "action": "Documentation",
        "desc": "The modules can be combined and federated at runtime, allowing for greater collaboration and faster development times.",
        "title": "Federated runtime"
      },
      "flexibility": {
        "action": "Documentation",
        "desc": "Module Federation gives developers the freedom to choose and implement the architecture that best suits their needs, promoting a modular and scalable approach to application development.",
        "title": "Flexibility"
      },
      "modular-architecture": {
        "action": "Documentation",
        "desc": "Applications can be split into smaller, self-contained modules that can be developed, tested, and deployed independently.",
        "title": "Modular architecture"
      },
      "scalability": {
        "action": "Documentation",
        "desc": "Module Federation brings scalability to not only code but also individual and organizational productivity",
        "title": "Scalability with Module Federation"
      },
      "team-colaboration": {
        "action": "Documentation",
        "desc": "Independent teams can be assigned responsibility for specific microfrontends, making it easier to manage the development process and promote collaboration between team members.",
        "title": "Team collaboration"
      }
    },
    "subtitle": "Module Federation brings scalability to not only code but also individual and organizational productivity",
    "title": "Scalability with Module Federation"
  }
}
`,st=`{
  "evolving": {
    "rfcs": {
      "action": "Take part now!",
      "subtitle": "Participate in the community discussions to decide on what features are coming next",
      "title": "RFCs"
    },
    "roadmap": {
      "action": "Explore it!",
      "subtitle": "Discover the future of Module Federation",
      "title": "Module Federation Roadmap"
    },
    "subtitle": "The world of Module Federation is constantly evolving and growing based on the feedback from the community. The RFCs are open for all to participate in the discussion and the roadmap is published.",
    "supported-bundlers": {
      "title": "Supported bundlers"
    },
    "title": "Evolving Module Federation"
  }
}
`,ot=`{
  "explore": {
    "cards": {
      "community-content": {
        "action": "Find out more",
        "title": "Community content"
      },
      "conference-talks": {
        "action": "Watch now",
        "title": "Conference talks"
      },
      "implementing-module-federation": {
        "action": "Learn more",
        "title": "Implementing Module Federation"
      },
      "module-federation-courses": {
        "action": "Start exploring",
        "subtitle": "Gain expertise in Module Federation and enhance your skills now",
        "title": "Module Federation courses"
      },
      "practical-module-federation": {
        "action": "Get the book",
        "title": "Practical Module Federation"
      }
    },
    "disabled": "Coming soon"
  }
}
`,at=`{
  "footer": {
    "menu": {
      "documentation": "Documentation",
      "examples": "Examples",
      "medusa": "Try Medusa",
      "practical-guide": "Practical guide",
      "sponsor": "Become a sponsor",
      "privacy-policy": "Privacy Policy"
    }
  }
}
`,rt=`{
  "hero": {
    "actions": {
      "documentation": "Documentation",
      "learn": "Learn"
    },
    "subtitle": "Module Federation aims to solve the sharing of modules in a distributed system. It allows you to ship those critical shared pieces as macro or as micro as you would like. It does this by pulling them out of the build pipeline and out of your apps",
    "title": "Module Federation: streamline your microfrontends"
  }
}
`,it=`{
  "medusa": {
    "title": "Start using Module Federation with"
  }
}
`,ct=`{
  "navbar": {
    "menu": {
      "discover": "Discover",
      "documentation": "Documentation",
      "enterprise": "Enterprise",
      "medusa": "Medusa",
      "showcase": "Showcase"
    }
  }
}
`,lt=`{
  "showcase-page": {
    "action": "Become a showcase",
    "subtitle": "Meet leading companies embracing Module Federation for their web development needs.",
    "title": "Showcase"
  }
}
`,dt=`{
  "showcase": {
    "action": "See more showcases",
    "title": "Showcase"
  }
}
`,mt=`{
  "sponsor": {
    "action": "Become a sponsor",
    "subtitle": "Sponsoring Module Federation offers the chance to be part of a technology community making a positive impact<br> and receive benefits and recognition opportunities in return.",
    "title": "Sponsor Module Federation!"
  }
}
`,pt=`{
  "subscribe": {
    "action": "Subscribe",
    "input": {
      "placeholder": "Enter your email"
    },
    "title": "Subscribe to our email newsletter!"
  }
}
`,ut=`{
  "app": {
    "meta": {
      "description": "A Federação de Módulos tem como objetivo resolver o compartilhamento de módulos em um sistema distribuído. Ela permite que você envie essas peças críticas compartilhadas como macro ou micro conforme desejar. Isso é feito retirando-as do pipeline de build e de seus aplicativos."
    },
    "title": "Federação de Módulos: otimize seus microfrontends"
  }
}
`,bt=`{
  "banner": {
    "text": {
      "firstLine": "At Valor, we are delighted to be the exclusive support partners for Module Federation - a technology created by Zack Jackson that has revolutionized modern development.",
      "secondLine": "Our collaboration and status as core team members has enabled us to reduce the community's reliance on a single individual, as well as bring greater value to OSS."
    },
    "title": "Enterprise Support & Training"
  }
}
`,wt=`{
  "contact": {
    "disclaimer": {
      "action": "Política de privacidade",
      "text": "Ao enviar este formulário, confirmo que li e compreendi a nossa "
    },
    "form": {
      "action": "Enviar",
      "company-email": {
        "label": "Email corporativo"
      },
      "company-website": {
        "label": "Website da empresa"
      },
      "how-can-we-help-you": {
        "label": "Como podemos te ajudar?"
      },
      "name": {
        "label": "Seu nome"
      },
      "company-size": {
        "label": "Tamanho da empresa"
      }
    },
    "quote": {
      "author": {
        "name": "Zack Jackson",
        "title": "o criador de Module Federation"
      },
      "text": "Existem agora 4.000 empresas usando o Module Federation de forma detectável. Provavelmente muitos mais que não podemos rastrear, mas 4000 ainda é um número impressionante de entidades conhecidas."
    },
    "title": "Fale com nossos especialistas"
  }
}
`,ft=`{
  "discord": {
    "action": "Discord",
    "title": "Junte-se à comunidade Module Federation no"
  }
}
`,gt=`{
  "doc-summary": {
    "action": "Comece a usar Module Federation",
    "cards": {
      "decentralized": {
        "action": "Documentação",
        "desc": "Module Federation permite que os desenvolvedores compartilhem código entre vários projetos de maneira descentralizada, facilitando o gerenciamento de aplicativos complexos.",
        "title": "Compartilhamento de código descentralizado"
      },
      "federated-runtime": {
        "action": "Documentação",
        "desc": "Os módulos podem ser combinados e federados em tempo de execução, permitindo maior colaboração e tempos de desenvolvimento mais rápidos.",
        "title": "Tempo de execução federado"
      },
      "flexibility": {
        "action": "Documentação",
        "desc": "Module Federation dá aos desenvolvedores a liberdade de escolher e implementar a arquitetura que melhor se adapta às suas necessidades, promovendo uma abordagem modular e escalável para o desenvolvimento de aplicativos.",
        "title": "Flexibilidade"
      },
      "modular-architecture": {
        "action": "Documentação",
        "desc": "Os aplicativos podem ser divididos em módulos menores e independentes que podem ser desenvolvidos, testados e implantados de forma independente.",
        "title": "Modular architecture"
      },
      "team-colaboration": {
        "action": "Documentação",
        "desc": "Equipes independentes podem ser responsáveis por microfrontends específicos, facilitando o gerenciamento do processo de desenvolvimento e promovendo a colaboração entre os membros da equipe.",
        "title": "Colaboração em equipe"
      }
    },
    "subtitle": "Module Federation traz escalabilidade não apenas para o código, mas também para a produtividade individual e organizacional",
    "title": "Escalabilidade com Module Federation"
  }
}
`,ht=`{
  "evolving": {
    "rfcs": {
      "action": "Participe agora!",
      "subtitle": "Participe das discussões comunitárias para decidir quais recursos virão a seguir",
      "title": "RFCs"
    },
    "roadmap": {
      "action": "Explore!",
      "subtitle": "Descubra o futuro do Module Federation",
      "title": "Roadmap do Module Federation"
    },
    "subtitle": "O mundo do Module Federation está em constante evolução e crescimento com base nos feedbacks da comunidade. Os RFCs estão abertos para que todos possam participar da discussão e o roadmap é publicado.",
    "supported-bundlers": {
      "title": "Empacotadores suportados"
    },
    "title": "Evolução do Module Federation"
  }
}
`,yt=`{
  "explore": {
    "cards": {
      "community-content": {
        "action": "Saiba mais",
        "title": "Conteúdo da comunidade"
      },
      "conference-talks": {
        "action": "Assista agora",
        "title": "Palestras em conferências"
      },
      "implementing-module-federation": {
        "action": "Saiba mais",
        "title": "Implementando o Module Federation"
      },
      "module-federation-courses": {
        "action": "Comece a explorar",
        "subtitle": "Ganhe especialização em Module Federation e aprimore suas habilidades agora",
        "title": "Cursos de Module Federation"
      },
      "practical-module-federation": {
        "action": "Adquira o livro",
        "title": "Module Federation na prática"
      }
    },
    "disabled": "Em breve"
  }
}
`,_t=`{
  "footer": {
    "menu": {
      "documentation": "Documentação",
      "examples": "Exemplos",
      "medusa": "Experimente o Medusa",
      "practical-guide": "Guia prático",
      "sponsor": "Torne-se um patrocinador",
      "privacy-policy": "Política de Privacidade"
    }
  }
}
`,vt=`{
  "hero": {
    "actions": {
      "documentation": "Documentação",
      "learn": "Aprender"
    },
    "subtitle": "Module Federation tem como objetivo resolver o compartilhamento de módulos em um sistema distribuído. Ele permite que você envie esses pedaços compartilhados críticos como macro ou micro quanto desejar. Ele faz isso retirando-os do pipeline de build e de seus aplicativos",
    "title": "Module Federation: otimize seus microfrontends"
  }
}
`,xt=`{
  "medusa": {
    "title": "Comece a usar Module Federation com"
  }
}
`,jt=`{
  "navbar": {
    "menu": {
      "discover": "Descobrir",
      "documentation": "Documentação",
      "enterprise": "Empresarial",
      "medusa": "Medusa",
      "showcase": "Exemplos"
    }
  }
}
`,kt=`{
  "showcase-page": {
    "action": "Torne-se um exemplo",
    "subtitle": "Conheça as principais empresas que adotaram o Module Federation para suas necessidades de desenvolvimento web.",
    "title": "Exemplos"
  }
}
`,qt=`{
  "showcase": {
    "action": "Ver mais exemplos",
    "title": "Exemplos"
  }
}
`,St=`{
  "sponsor": {
    "action": "Torne-se um patrocinador",
    "subtitle": "Module Federation oferece a chance de fazer parte de uma comunidade tecnológica que está fazendo um impacto positivo e receber benefícios e oportunidades de reconhecimento em troca.",
    "title": "Patrocine o Module Federation!"
  }
}
`,Nt=`{
  "subscribe": {
    "action": "Inscreva-se",
    "input": {
      "placeholder": "Digite seu e-mail"
    },
    "title": "Inscreva-se em nossa newsletter!"
  }
}
`,zt=Object.assign({"/src/i18n/en-US/app.json":Ve,"/src/i18n/en-US/banner.json":We,"/src/i18n/en-US/contact.json":et,"/src/i18n/en-US/discord.json":tt,"/src/i18n/en-US/doc-summary.json":nt,"/src/i18n/en-US/evolving.json":st,"/src/i18n/en-US/explore.json":ot,"/src/i18n/en-US/footer.json":at,"/src/i18n/en-US/hero.json":rt,"/src/i18n/en-US/medusa.json":it,"/src/i18n/en-US/navbar.json":ct,"/src/i18n/en-US/showcase-page.json":lt,"/src/i18n/en-US/showcase.json":dt,"/src/i18n/en-US/sponsor.json":mt,"/src/i18n/en-US/subscribe.json":pt,"/src/i18n/pt-BR/app.json":ut,"/src/i18n/pt-BR/banner.json":bt,"/src/i18n/pt-BR/contact.json":wt,"/src/i18n/pt-BR/discord.json":ft,"/src/i18n/pt-BR/doc-summary.json":gt,"/src/i18n/pt-BR/evolving.json":ht,"/src/i18n/pt-BR/explore.json":yt,"/src/i18n/pt-BR/footer.json":_t,"/src/i18n/pt-BR/hero.json":vt,"/src/i18n/pt-BR/medusa.json":xt,"/src/i18n/pt-BR/navbar.json":jt,"/src/i18n/pt-BR/showcase-page.json":kt,"/src/i18n/pt-BR/showcase.json":qt,"/src/i18n/pt-BR/sponsor.json":St,"/src/i18n/pt-BR/subscribe.json":Nt}),Ft=he((e,t)=>JSON.parse(zt[`/src/i18n/${e}/${t}.json`]),"GUmrjQ0dxEI"),It=ge(x(Ft,"s_GUmrjQ0dxEI")),Et={loadTranslation$:It},At=()=>(ye(x(Ge,"s_kJTkeEh1U5c")),h(je,{children:h(_e,{children:[b("head",null,null,[b("meta",null,{charSet:"utf-8"},null,3,null),b("script",null,{async:!0,src:"https://www.googletagmanager.com/gtag/js?id=G-SDV5HRTM4G"},null,3,null),b("script",null,{dangerouslySetInnerHTML:`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-SDV5HRTM4G');
          `},null,3,null),b("link",null,{href:"/manifest.json",rel:"manifest"},null,3,null),h(Xe,null,3,"Le_0")],1,null),b("body",null,{class:"relative w-full bg-mf-gray overflow-y-scroll"},[b("div",null,{class:"w-full overflow-x-hidden"},h(ve,null,3,"Le_1"),1,null),h(xe,null,3,"Le_2")],1,null)]},1,"Le_3"),config:W,translationFn:Et,[S]:{config:S,translationFn:S}},1,"Le_4")),Ct=V(x(At,"s_eXD0K9bzzlo"));function Kt(e){var t;return $e(h(Ct,null,3,"Ro_0"),{manifest:Je,...e,containerAttributes:{lang:((t=e.serverData)==null?void 0:t.locale)||W.defaultLocale.lang,...e.containerAttributes}})}export{Je as m,Kt as r,Rt as s};
