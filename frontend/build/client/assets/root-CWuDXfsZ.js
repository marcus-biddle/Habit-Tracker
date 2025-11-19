import{w as v,M as b,a as w,S as z,b as M,O as N}from"./chunk-UIGDSWPH-DZWXMQ1q.js";import{r as m,j as e}from"./catchall-DnhblMTB.js";/* empty css              */import{A as S}from"./AuthContext-CaC8Ux1v.js";import{T as _}from"./index-8kEh58Qm.js";import{c}from"./createLucideIcon-B0bOrvaQ.js";import"./index-ByB3n5A_.js";/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],T=c("circle-check",A);/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],L=c("info",C);/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]],E=c("loader-circle",$);/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=[["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z",key:"2d38gg"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]],O=c("octagon-x",I);/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R=[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]],H=c("triangle-alert",R);var P=(t,a,h,n,i,s,p,u)=>{let o=document.documentElement,y=["light","dark"];function l(r){(Array.isArray(t)?t:[t]).forEach(d=>{let x=d==="class",k=x&&s?i.map(f=>s[f]||f):i;x?(o.classList.remove(...k),o.classList.add(s&&s[r]?s[r]:r)):o.setAttribute(d,r)}),g(r)}function g(r){u&&y.includes(r)&&(o.style.colorScheme=r)}function j(){return window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(n)l(n);else try{let r=localStorage.getItem(a)||h,d=p&&r==="system"?j():r;l(d)}catch{}},q=m.createContext(void 0),U={setTheme:t=>{},themes:[]},F=()=>{var t;return(t=m.useContext(q))!=null?t:U};m.memo(({forcedTheme:t,storageKey:a,attribute:h,enableSystem:n,enableColorScheme:i,defaultTheme:s,value:p,themes:u,nonce:o,scriptProps:y})=>{let l=JSON.stringify([h,a,s,t,u,p,n,i]).slice(1,-1);return m.createElement("script",{...y,suppressHydrationWarning:!0,nonce:typeof window>"u"?o:"",dangerouslySetInnerHTML:{__html:`(${P.toString()})(${l})`}})});const J=({...t})=>{const{theme:a="system"}=F();return e.jsx(_,{theme:a,className:"toaster group",icons:{success:e.jsx(T,{className:"size-4"}),info:e.jsx(L,{className:"size-4"}),warning:e.jsx(H,{className:"size-4"}),error:e.jsx(O,{className:"size-4"}),loading:e.jsx(E,{className:"size-4 animate-spin"})},style:{"--normal-bg":"var(--popover)","--normal-text":"var(--popover-foreground)","--normal-border":"var(--border)","--border-radius":"var(--radius)"},...t})};function Q({children:t}){return e.jsxs("html",{lang:"en",children:[e.jsxs("head",{children:[e.jsx("meta",{charSet:"UTF-8"}),e.jsx("meta",{name:"viewport",content:"width=device-width, initial-scale=1.0"}),e.jsx("title",{children:"My App"}),e.jsx(b,{}),e.jsx(w,{})]}),e.jsxs("body",{children:[t,e.jsx(z,{}),e.jsx(M,{}),e.jsx(J,{})]})]})}const Y=v(function(){return e.jsx(S,{children:e.jsx(N,{})})});export{Q as Layout,Y as default};
