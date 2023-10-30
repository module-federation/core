import{e as C,f as x,h as u,I as g,i as h,R as y,B}from"./q-6451e2b4.js";import{_ as k,U as p,F as S,V as P,G as T,Z as d,j as m,C as b,b as _,g as r,T as $,m as i,a as n}from"./q-824532ad.js";const w=C,E=()=>{const[e,t,l]=k();return{"--flex-dir":l.flexDir,"--flex-dir-tablet":x(t,l,e,{stackedStyle:l.flexDir,desktopStyle:"row"})}},z=()=>{const[e,t,l]=k();return`
        @media (max-width: ${u(t,l,e,"medium")}px) {
          .${t.builderBlock.id}-breakpoints {
            flex-direction: var(--flex-dir-tablet);
            align-items: stretch;
          }

          .${t.builderBlock.id}-breakpoints > .builder-column {
            width: var(--column-width-tablet) !important;
            margin-left: var(--column-margin-left-tablet) !important;
          }
        }

        @media (max-width: ${u(t,l,e,"small")}px) {
          .${t.builderBlock.id}-breakpoints {
            flex-direction: var(--flex-dir);
            align-items: stretch;
          }

          .${t.builderBlock.id}-breakpoints > .builder-column {
            width: var(--column-width-mobile) !important;
            margin-left: var(--column-margin-left-mobile) !important;
          }
        },
      `},L=e=>{p(),S(i(()=>n(()=>Promise.resolve().then(()=>a),void 0),"s_s7JLZz7MCCQ"));const t=P(B),l=T({cols:e.columns||[],flexDir:e.stackColumnsAt==="never"?"row":e.reverseColumnsWhenStacked?"column-reverse":"column",gutterSize:typeof e.space=="number"?e.space||0:20,stackAt:e.stackColumnsAt||"tablet"}),v=d(i(()=>n(()=>Promise.resolve().then(()=>a),void 0),"s_adFEq2RWT9s",[t,e,l])),c=d(i(()=>n(()=>Promise.resolve().then(()=>a),void 0),"s_nBtMPbzd1Wc",[t,e,l]));return m("div",null,{class:r(s=>`builder-columns ${s.builderBlock.id}-breakpoints div-Columns`,[e],'`builder-columns ${p0.builderBlock.id}-breakpoints`+" div-Columns"'),style:r(s=>s.value,[v],"p0.value")},[b(g,{get styles(){return c.value},[_]:{styles:r(s=>s.value,[c],"p0.value")}},3,"c0_0"),(e.columns||[]).map(function(s,o){return m("div",{style:h(e,l,t,o)},{class:"builder-column div-Columns-2"},b(y,{get blocks(){return s.blocks},path:`component.options.columns.${o}.blocks`,get parent(){return e.builderBlock.id},styleProp:{flexGrow:"1"},[_]:{blocks:$(s,"blocks"),parent:r(f=>f.builderBlock.id,[e],"p0.builderBlock.id")}},3,"c0_1"),1,o)})],1,"c0_2")},a=Object.freeze(Object.defineProperty({__proto__:null,s_7yLj4bxdI6c:L,s_adFEq2RWT9s:E,s_nBtMPbzd1Wc:z,s_s7JLZz7MCCQ:w},Symbol.toStringTag,{value:"Module"}));export{L as s_7yLj4bxdI6c,E as s_adFEq2RWT9s,z as s_nBtMPbzd1Wc,w as s_s7JLZz7MCCQ};
