"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[997],{5780:function(n,e,t){var r=t(7297),i=t(5893),o=(t(7294),t(5697)),a=t.n(o),s=t(63);function c(){var n=(0,r.Z)(["\n  margin: 1.5em 0;\n  animation-duration: 1s;\n  animation-fill-mode: both;\n  -webkit-animation-duration: 1s;\n  animation-name: fadeInUp;\n  -webkit-animation-name: fadeInUp;\n  -webkit-animation-fill-mode: both;\n  max-width: auto;\n  column-gap: 1.5em;\n  @media only screen and (min-width: 1024px) {\n    column-count: 2;\n  }\n  @media only screen and (max-width: 1023px) and (min-width: 768px) {\n    column-count: 1;\n  }\n\n  @media only screen and (max-width: 767px) and (min-width: 540px) {\n    column-count: 1;\n  }\n  @keyframes fadeInUp {\n    from {\n      margin-top: 4rem;\n      opacity: 0;\n    }\n\n    to {\n      margin-top: 1.5em;\n      opacity: 1;\n    }\n  }\n\n  @-webkit-keyframes fadeInUp {\n    from {\n      margin-top: 4rem;\n      opacity: 0;\n    }\n\n    to {\n      margin-top: 1.5em;\n      opacity: 1;\n    }\n  }\n  @media (max-width: 585px) {\n    opacity: 1 !important;\n  }\n  @media (max-width: 989px) {\n    opacity: 1 !important;\n  }\n  @media (max-width: 220px) {\n    opacity: 1 !important;\n  }\n"]);return c=function(){return n},n}var l={children:a().oneOfType([a().node,a().element])},d=function(n){var e=n.children;return(0,i.jsx)(p,{children:e})},p=s.ZP.div(c());d.propTypes=l,e.Z=d},9535:function(n,e,t){t.d(e,{Z:function(){return C}});var r=t(7297),i=t(5893),o=t(7294),a=t(63),s=t(5697),c=t.n(s),l=t(1163),d=t(289),p={src:c().string.isRequired,alt:c().string,className:c().string},m=function(n){var e=n.src,t=n.alt,r=n.className;return(0,i.jsx)(d.Z,{src:e,placeholder:"https://i.ibb.co/BTvLMXq/Ripple-1-9s-201px.gif",children:function(n,o){return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)("img",{src:n,alt:t,className:o?"".concat(r," loading-img"):r}),(0,i.jsx)("noscript",{children:(0,i.jsx)("img",{src:e,alt:t,className:r})})]})}})};m.defaultProps={alt:"devalparikh",className:""},m.propTypes=p;var u=m,f=t(6599);function h(){var n=(0,r.Z)(["\n      width: 21.8em;\n      padding: 1.5rem;\n    "]);return h=function(){return n},n}function x(){var n=(0,r.Z)(["\n      width: 34em;\n    "]);return x=function(){return n},n}function g(){var n=(0,r.Z)(["\n      width: 29em;\n      padding: 2rem;\n    "]);return g=function(){return n},n}function b(){var n=(0,r.Z)(["\n\nbody{\n  overflow: hidden\n}"]);return b=function(){return n},n}function v(){var n=(0,r.Z)(["\n  .none-button {\n    border: none;\n    background: transparent;\n    padding-left: 0;\n    svg {\n      fill: none !important;\n    }\n  }\n\n  @keyframes fadeLeft {\n    from {\n      opacity: 0.8;\n      transform: translateX(80%);\n    }\n    to {\n      opacity: 1;\n      transform: translateX(0%);\n    }\n  }\n  aside {\n    background: var(--bg);\n    ","\n    @media (max-width: 768px) {\n      width: 100% !important;\n    }\n    height: 100%;\n    position: fixed;\n    right: 0;\n    top: 0;\n    z-index: 999999;\n    transition: all 0.3s linear;\n    will-change: opacity, transform;\n    &.fadeInLeft {\n      animation-name: fadeLeft;\n      animation-duration: 0.5s;\n      animation-fill-mode: both;\n    }\n    .header {\n      margin-bottom: 2rem;\n      padding-bottom: 0.8rem;\n      border-bottom: 1px solid var(--border-color);\n      svg {\n        /* path {\n          stroke: var(--article-color);\n          &:last-child {\n            fill: var(--article-color);\n          }\n        } */\n      }\n      a {\n        font-size: var(--font-sm);\n        font-weight: 900;\n        color: var(--sidebar-cta);\n      }\n    }\n    .pos__relative {\n      position: relative;\n      padding: 2rem 2rem 4rem;\n      overflow-x: overlay;\n      max-height: 100%;\n    }\n    .open__project {\n      background: var(--sidebar-cta);\n      position: fixed;\n      width: 100%;\n      left: 0;\n      bottom: 0;\n      padding: 17px;\n      color: #ffffff;\n      font-weight: 600;\n      text-align: center;\n      font-size: var(--font-sm);\n      svg {\n        width: 16px;\n        vertical-align: bottom;\n        margin-left: 6px;\n        fill: #fff;\n      }\n    }\n  }\n  .main__post {\n    h3 {\n      font-size: calc(var(--font-x-md) - 6px);\n      /* margin-bottom: 1.3rem; */\n      color: var(--cw);\n      font-weight: 800;\n    }\n    h4 {\n      font-size: var(--font-md);\n      color: var(--cw);\n      margin-top: 2rem;\n      margin-bottom: 0.8rem;\n      svg {\n        vertical-align: bottom;\n        width: 15px;\n        margin-right: 3px;\n      }\n    }\n    p {\n      color: var(--article-color);\n      font-size: var(--font-sm);\n      span {\n        background: var(--sidebar-tag);\n        padding: 6px 13px;\n        border-radius: 4px;\n        text-transform: capitalize;\n        font-size: 11px;\n        margin-right: 6px;\n        color: var(--cw);\n        font-weight: 700;\n      }\n      a {\n        font-weight: 600;\n        color: var(--sidebar-cta);\n        svg {\n          fill: var(--cw);\n        }\n      }\n    }\n    img {\n      width: 100%;\n      height: 300px;\n      object-fit: cover;\n      border-radius: 11px;\n    }\n  }\n"]);return v=function(){return n},n}function j(){var n=(0,r.Z)(["\n  z-index: 99999;\n  position: fixed;\n  height: 100%;\n  width: 100%;\n  top: 0;\n  right: 0;\n  background: ",";\n"]);return j=function(){return n},n}var y={show:c().bool,closeShow:c().func,size:c().string,overlayColor:c().string,css:c().object,data:c().object},w=function(n){var e=n.show,t=n.closeShow,r=n.size,a=n.overlayColor,s=n.css,c=n.data,l=(0,o.useCallback)((function(n){"Escape"===n.key&&(console.log("sdsdsd"),t())}),[]);return(0,o.useEffect)((function(){return window.addEventListener("keydown",l),function(){window.removeEventListener("keydown",l)}}),[]),(0,i.jsx)(i.Fragment,{children:e&&(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(k,{}),(0,i.jsxs)(_,{size:r,css:s,"data-testid":"sidebarmodal",children:[(0,i.jsx)(Z,{overlayColor:a,className:"overlay",onClick:function(){return t()}}),(0,i.jsx)("aside",{className:"fadeInLeft",children:(0,i.jsxs)("div",{className:"pos__relative",children:[(0,i.jsxs)("div",{className:"d-flex justify-content-between header",children:[(0,i.jsx)("button",{onClick:function(){return t()},className:"none-button",type:"button",children:(0,i.jsx)(f.x8,{})}),(0,i.jsx)("a",{href:"#",onClick:function(n){n.preventDefault(),t()},target:"_blank",rel:"noopener noreferrer",children:"Back To Projects."})]}),(0,i.jsxs)("div",{className:"main__post",children:[(0,i.jsx)("h3",{className:"mt-4",children:c.title}),(0,i.jsx)("p",{className:"te mb-4",children:c.description}),(0,i.jsx)("img",{src:c.imageUrl,alt:c.title}),(0,i.jsx)("h4",{children:"About"}),(0,i.jsx)("p",{children:c.about&&c.about}),(0,i.jsx)("h4",{children:"Technologies"}),c.technologies&&(0,i.jsx)("p",{className:"d-flex flex-wrap",children:c.technologies.map((function(n,e){return(0,i.jsx)("span",{className:"d-block mb-1",children:n},e)}))}),(0,i.jsxs)("h4",{children:[(0,i.jsx)(f.xs,{})," Website"]}),(0,i.jsx)("p",{children:(0,i.jsx)("a",{href:c.link,target:"_blank",rel:"noopener noreferrer",children:c.link})}),c.github&&(0,i.jsxs)(i.Fragment,{children:[(0,i.jsxs)("h4",{children:[(0,i.jsx)(f.Ey,{})," Github"]}),(0,i.jsx)("p",{children:(0,i.jsx)("a",{href:c.github,target:"_blank",rel:"noopener noreferrer",children:c.github})})]})]}),(0,i.jsxs)("a",{href:c.link,className:"open__project",target:"_blank",id:"cardHover",rel:"noopener noreferrer",children:["Open Project"," ",(0,i.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",children:(0,i.jsx)("path",{d:"M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z"})})]})]})})]})]})})},k=(0,a.vJ)(b()),_=a.ZP.div(v(),(function(n){return"sm"===(e=n.size)?(0,a.iv)(h()):"lg"===e?(0,a.iv)(x()):"md"===e?(0,a.iv)(g()):void 0;var e})),Z=a.ZP.div(j(),(function(n){return n.overlayColor||"rgba(0, 0, 0, 0.8)"}));w.propTypes=y,w.defaultProps={show:!1,closeShow:function(){},size:"md",overlayColor:"rgba(0, 0, 0, 0.8)",css:{}};var z=w;function P(){var n=(0,r.Z)(["\n  margin: 0 0 1.5em;\n  position: relative;\n\n  cursor: pointer;\n  border-radius: 9px;\n  object-fit: cover;\n  background-color: var(--button-index);\n  background-position: center;\n  background-repeat: no-repeat;\n  overflow: hidden;\n  padding: 1.4rem 2rem;\n  display: flex;\n  align-items: flex-end;\n  border-radius: 9px;\n  break-inside: avoid;\n  img {\n    width: 100% !important;\n    height: 100% !important;\n    position: absolute;\n    left: 0 !important;\n    top: 0 !important;\n    object-fit: cover;\n  }\n  &:before {\n    content: '';\n    pointer-events: none;\n    display: block;\n    position: absolute;\n    top: 0px;\n    right: 0px;\n    bottom: 0px;\n    left: 0px;\n    z-index: -1;\n    background: radial-gradient(\n      circle at center center,\n      white 10%,\n      whitesmoke 11%,\n      whitesmoke 100%\n    );\n  }\n  &:after {\n    content: '';\n    pointer-events: none;\n    position: absolute;\n    z-index: 1;\n    top: 0px;\n    right: 0px;\n    bottom: 0px;\n    left: 0px;\n    opacity: 0.9;\n    /* background: linear-gradient(\n      191deg,\n      rgba(0, 0, 0, 0.1) 20%,\n      rgba(0, 0, 0, 0.76) 100%\n    ); */\n    background: linear-gradient(\n      180deg,\n      rgba(0, 0, 0, 0.1) 10%,\n      rgb(0 0 0 / 78%) 80%\n    );\n  }\n  &:hover,\n  &:focus {\n    &:after {\n      opacity: 1;\n    }\n    div.content__slate {\n      z-index: 999;\n      transform: none;\n      opacity: 1;\n    }\n  }\n\n  h3 {\n    color: #fff;\n    font-size: var(--font-x-md);\n    font-weight: 800;\n  }\n  p {\n    color: #d5d5d5 !important;\n    font-size: calc(var(--font-sm) + 0.9px);\n    span {\n      background: #696869;\n      padding: 4px 10px;\n      border-radius: 50px;\n      text-transform: capitalize;\n      font-size: 11px;\n      margin-right: 6px;\n      color: #fff;\n      font-weight: 500;\n    }\n  }\n\n  div.content__slate {\n    opacity: 1;\n    z-index: 999;\n    transform: translateY(10%);\n    transition: opacity 300ms ease-in-out 0s, transform 300ms ease-in-out 0s;\n  }\n  @media (max-width: 585px) {\n    &:after {\n      opacity: 1 !important;\n    }\n    div.content__slate {\n      z-index: 999 !important;\n      transform: none !important;\n      opacity: 1 !important;\n    }\n  }\n  @media (max-width: 989px) {\n    &:after {\n      opacity: 1 !important;\n    }\n    div.content__slate {\n      z-index: 999 !important;\n      transform: none !important;\n      opacity: 1 !important;\n    }\n  }\n  @media (max-width: 220px) {\n    &:after {\n      opacity: 1 !important;\n    }\n    div.content__slate {\n      z-index: 999 !important;\n      transform: none !important;\n      opacity: 1 !important;\n    }\n  }\n"]);return P=function(){return n},n}var N={item:c().object},S=(0,l.withRouter)((function(n){var e=n.item,t=n.router.pathname,r=(0,o.useState)(!1),a=r[0],s=r[1],c=(0,o.useState)("400px")[0];return(0,i.jsx)(i.Fragment,{children:t.includes("/projects")?(0,i.jsxs)(i.Fragment,{children:[(0,i.jsxs)(O,{item:e,style:{height:c},role:"gridcell",id:"cardHover","aria-label":"".concat(e.title," ").concat(e.description),onClick:function(){return s(!0)},onKeyPress:function(n){if("Enter"===n.key)return s(!0)},tabIndex:"0",children:[(0,i.jsx)(u,{src:e.imageUrl,alt:e.imageUrl}),(0,i.jsxs)("div",{className:"content__slate",children:[(0,i.jsx)("h3",{children:e.title}),(0,i.jsx)("p",{children:e.description}),e.technologies&&(0,i.jsx)("p",{className:"d-flex flex-wrap",children:e.technologies.map((function(n,e){return(0,i.jsx)("span",{className:"d-block mb-1",children:n},e)}))})]})]}),(0,i.jsx)(z,{show:a,closeShow:function(){return s(!1)},size:"lg",data:e})]}):(0,i.jsx)("a",{href:e.link,target:"_blank",style:{color:"inherit",textDecoration:"none",display:"block"},rel:"noopener noreferrer",title:e.title,id:"cardHover","aria-label":"".concat(e.title," ").concat(e.description),children:(0,i.jsxs)(O,{item:e,style:{height:c},role:"gridcell",children:[(0,i.jsx)(u,{src:e.imageUrl,alt:e.imageUrl}),(0,i.jsxs)("div",{className:"content__slate",children:[(0,i.jsx)("h3",{children:e.title}),(0,i.jsx)("p",{children:e.description})]})]})})})})),O=a.ZP.div(P());S.propTypes=N;var C=S},9156:function(n,e,t){t.d(e,{l:function(){return j},Z:function(){return y}});var r=t(7297),i=t(5893),o=t(7294),a=t(5697),s=t.n(a),c=t(63),l=t(6042),d=t(9396),p=t(9534),m={activeTab:s().string.isRequired,label:s().string.isRequired,onClick:s().func.isRequired,href:s().string},u=function(n){var e=n.activeTab,t=n.label,r=n.onClick,o=n.href,a=(0,p.Z)(n,["activeTab","label","onClick","href"]);return o?(0,i.jsx)("a",(0,d.Z)((0,l.Z)({className:"tab-list-item ".concat(e===t?"tab-list-active":""),href:o,id:"cardHover",target:"_blank",rel:"noopener noreferrer","aria-label":"Open ".concat(t)},a),{children:t})):(0,i.jsx)(i.Fragment,{children:(0,i.jsx)("button",(0,d.Z)((0,l.Z)({className:"tab-list-item ".concat(e===t?"tab-list-active":""),type:"button",id:"cardHover",onClick:function(){return r(t)},"aria-label":"Open ".concat(t)},a),{children:t}))})};u.propTypes=m;var f=u;function h(){var n=(0,r.Z)(["\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 43px;\n\n  @media (max-width: 585px) {\n    white-space: nowrap;\n    overflow-x: auto;\n    margin: 0px auto;\n  }\n  @media (max-width: 989px) {\n    white-space: nowrap;\n    overflow-x: auto;\n    margin: 0px auto;\n  }\n  @media (max-width: 220px) {\n    white-space: nowrap;\n    overflow-x: auto;\n    margin: 0px auto;\n  }\n  .tab-list-item {\n    margin: 0 1rem 0 0;\n    font-size: calc(var(--font-sm) + 0.9px);\n    transition: all 0.3s ease;\n    background: transparent;\n    color: var(--article-color);\n    &.tab-list-active {\n      font-weight: 900 !important;\n      color: #e8e8e8;\n      background: var(--gray-dark);\n      padding: 5px 22px;\n    }\n  }\n"]);return h=function(){return n},n}function x(){var n=(0,r.Z)(["\n  display: block;\n"]);return x=function(){return n},n}var g={children:s().instanceOf(Array).isRequired},b=function(n){var e=n.children,t=(0,o.useState)(e[0].props.label),r=t[0],a=t[1],s=function(n){a(n)};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(v,{className:"d-md-flex d-block tabs",role:"tablist",children:e.map((function(n){var e=n.props,t=e.label,o=e.href;return(0,i.jsx)(f,{activeTab:r,label:t,href:o,"aria-current":r,onClick:s},t)}))}),(0,i.jsx)("div",{className:"tab-content",children:e.map((function(n){return n.props.label===r&&n.props.children}))})]})},v=c.ZP.nav(h()),j=c.ZP.div(x());b.propTypes=g;var y=b},8997:function(n,e,t){t.r(e),t.d(e,{PageSection:function(){return f}});var r=t(7297),i=t(5893),o=t(7294),a=t(63),s=t(4504),c=t(4459),l=t(9156),d=t(5780),p=t(9535),m=t(208);function u(){var n=(0,r.Z)(["\n  .intro__text {\n    font-size: var(--font-x-lg);\n    font-weight: 900;\n    margin: 4rem 0rem 1.5rem;\n    position: relative;\n  }\n  button {\n    font-size: calc(var(--font-sm) + 1.5px);\n    background: var(--mark);\n    border: none;\n    border-radius: 5px;\n    padding: 0px 9px;\n  }\n"]);return u=function(){return n},n}var f=a.ZP.div(u());e.default=function(){var n=(0,o.useContext)(m.v5);return(0,i.jsxs)(s.Z,{title:"Project",children:[(0,i.jsx)(f,{children:(0,i.jsxs)(s.F,{children:[(0,i.jsx)("h1",{className:"intro__text",children:"Projects"})," ",(0,i.jsx)("br",{}),(0,i.jsxs)(l.Z,{children:[(0,i.jsx)(l.l,{label:"All",children:(0,i.jsx)(d.Z,{children:n.map((function(n,e){return(0,i.jsx)(p.Z,{index:e,item:n},e)}))})}),(0,i.jsx)(l.l,{label:"Projects",children:(0,i.jsx)(d.Z,{children:n.map((function(n,e){return n.type.includes("project")&&(0,i.jsx)(p.Z,{index:e,item:n},e)}))})}),(0,i.jsx)(l.l,{label:"Full Stack",children:(0,i.jsx)(d.Z,{children:n.map((function(n,e){return n.type.includes("fullstack")&&(0,i.jsx)(p.Z,{index:e,item:n},e)}))})}),(0,i.jsx)(l.l,{label:"Machine Learning",children:(0,i.jsx)(d.Z,{children:n.map((function(n,e){return n.type.includes("ml")&&(0,i.jsx)(p.Z,{index:e,item:n},e)}))})}),(0,i.jsx)(l.l,{label:"Photography",href:"https://unsplash.com/@devalpp/"})]})]})}),(0,i.jsxs)(s.F,{children:[(0,i.jsx)(c.Z,{goto:"/resume",className:"mt-3 mb-5",children:"Lets Go To My Resume."}),(0,i.jsx)("br",{})]})]})}},289:function(n,e,t){function r(n){return r="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator?function(n){return typeof n}:function(n){return n&&"function"===typeof Symbol&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n},r(n)}function i(n,e){for(var t=0;t<e.length;t++){var r=e[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(n,r.key,r)}}function o(n){return o=Object.setPrototypeOf?Object.getPrototypeOf:function(n){return n.__proto__||Object.getPrototypeOf(n)},o(n)}function a(n,e){return a=Object.setPrototypeOf||function(n,e){return n.__proto__=e,n},a(n,e)}function s(n){if(void 0===n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return n}function c(n,e,t){return e in n?Object.defineProperty(n,e,{value:t,enumerable:!0,configurable:!0,writable:!0}):n[e]=t,n}e.Z=void 0;var l=function(n){function e(n){var t;return function(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}(this,e),t=function(n,e){return!e||"object"!==r(e)&&"function"!==typeof e?s(n):e}(this,o(e).call(this,n)),c(s(s(t)),"image",void 0),c(s(s(t)),"loadImage",(function(n,e){t.image&&(t.image.onload=null,t.image.onerror=null);var r=new Image;t.image=r,r.onload=t.onLoad,r.onerror=t.onError,r.src=n,e&&(r.srcset=e.srcSet,r.sizes=e.sizes)})),c(s(s(t)),"onLoad",(function(){t.props.delay?t.setImageWithDelay():t.setImage()})),c(s(s(t)),"setImageWithDelay",(function(){setTimeout((function(){t.setImage()}),t.props.delay)})),c(s(s(t)),"setImage",(function(){t.setState({image:t.image.src,loading:!1,srcSetData:{srcSet:t.image.srcset||"",sizes:t.image.sizes||""}})})),c(s(s(t)),"onError",(function(n){var e=t.props.onError;e&&e(n)})),t.state={image:n.placeholder,loading:!0,srcSetData:{srcSet:"",sizes:""}},t}var t,l,d;return function(n,e){if("function"!==typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,writable:!0,configurable:!0}}),e&&a(n,e)}(e,n),t=e,(l=[{key:"componentDidMount",value:function(){var n=this.props,e=n.src,t=n.srcSetData;this.loadImage(e,t)}},{key:"componentDidUpdate",value:function(n){var e=this,t=this.props,r=t.src,i=t.placeholder,o=t.srcSetData;r!==n.src&&this.setState({image:i,loading:!0},(function(){e.loadImage(r,o)}))}},{key:"componentWillUnmount",value:function(){this.image&&(this.image.onload=null,this.image.onerror=null)}},{key:"render",value:function(){var n=this.state,e=n.image,t=n.loading,r=n.srcSetData,i=this.props.children;if(!i||"function"!==typeof i)throw new Error("ProgressiveImage requires a function as its only child");return i(e,t,r)}}])&&i(t.prototype,l),d&&i(t,d),e}(function(n){if(n&&n.__esModule)return n;var e={};if(null!=n)for(var t in n)if(Object.prototype.hasOwnProperty.call(n,t)){var r=Object.defineProperty&&Object.getOwnPropertyDescriptor?Object.getOwnPropertyDescriptor(n,t):{};r.get||r.set?Object.defineProperty(e,t,r):e[t]=n[t]}return e.default=n,e}(t(7294)).Component);e.Z=l}}]);