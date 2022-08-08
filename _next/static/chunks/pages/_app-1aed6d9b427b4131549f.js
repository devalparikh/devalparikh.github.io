_N_E=(window.webpackJsonp_N_E=window.webpackJsonp_N_E||[]).push([[7],{"/Ceq":function(t,e,n){"use strict";e.a=[{title:"Geogram",description:"A social network platform for travel.",about:"Geogram is an web application where users can share and view travel ideas and itenararies.",link:"https://www.geogramapp.com/",imageUrl:"",github:"private",type:["project","fullstack"],technologies:["React","Javascript","Java","Spring","MongoDB"]},{title:"HousingHelper",description:"A platform where users can find a roommate.",about:"A platform where users can find an alternative to corporate housing for internships and full-time positions out of town. This project was designed devloped using a multi-teired architecture to optimize reliability at higher scale.",link:"https://h-helper.herokuapp.com/",imageUrl:"https://devalparikh.me/img/HousingHelperGif.gif",github:"https://github.com/devalparikh/housinghelper",type:["project","fullstack"],technologies:["React","Javascript","NodeJs","MongoDB","AWS"]},{title:"FlipFeed",description:"A platform where users can share property flips and renovations.",about:"A platform where users can share property flips and renovations. Developed a scalable full stack web application. This project was designed as a multi-teired architecture to optimize reliability at higher scale. System architecture includes Redis, NGINX Reverse Proxy, Caching, and Microservices.",link:"https://h-helper.herokuapp.com/",imageUrl:"\thttps://devalparikh.me/img/flipfeedpic.png",github:"https://github.com/devalparikh/housinghelper",type:["project","fullstack"],technologies:["React","Javascript","NodeJs","MongoDB","AWS"]},{title:"EyeBank",description:"Visually Impaired ATM - (University of Maryland) Bitcamp 2019.",about:"Created software for ATMs that allow users to have a conversation with an ATM, replacing the need for buttons (assisting visually impaired).",link:"https://devpost.com/software/eyebank",github:"private",imageUrl:"https://challengepost-s3-challengepost.netdna-ssl.com/photos/production/software_photos/000/800/318/datas/gallery.jpg",type:["project","ml"],technologies:["Python","Machine Learning","Neural Networks","Darkflow CNN","Google ML API","Capital One Bank API"]},{title:"Weapon Detection",description:"(Georgetown University) Hoya Hacks 2019.",about:"Built a software service to detect weapons in real-time camera footage using image classification with YOLO Convolution Neural Network architecture and created dashboards using AWS, Google Maps API, HTML, CSS, JavaScript.",link:"https://devpost.com/software/no-more-shootings-20",github:"private",imageUrl:"https://challengepost-s3-challengepost.netdna-ssl.com/photos/production/software_photos/000/753/970/datas/gallery.jpg",type:["project","ml"],technologies:["Python","Machine Learning","Neural Networks","Darkflow CNN","AWS","Google ML API"]}]},1:function(t,e,n){n("GcxT"),t.exports=n("nOHt")},"1TCz":function(t,e,n){"use strict";n.r(e),n.d(e,"default",(function(){return C}));var o=n("o0o1"),r=n.n(o);function i(t,e,n,o,r,i,a){try{var s=t[i](a),l=s.value}catch(c){return void n(c)}s.done?e(l):Promise.resolve(l).then(o,r)}function a(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}function s(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function l(t,e){return(l=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}var c=n("cDf5"),u=n.n(c);function p(t,e){return!e||"object"!==u()(e)&&"function"!==typeof e?s(t):e}function f(t){return(f=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function d(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}var h=n("8Bbg"),m=n.n(h),g=n("q1tI"),y=n.n(g),v=n("FhCX"),b=n("Yc3X"),x="CODE_WONDERS",E=function(){try{var t=localStorage.getItem(x);return null===t?null:JSON.parse(t)}catch(e){return null}},w=y.a.createElement;function S(t){var e=function(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(t){return!1}}();return function(){var n,o=f(t);if(e){var r=f(this).constructor;n=Reflect.construct(o,arguments,r)}else n=o.apply(this,arguments);return p(this,n)}}var C=function(t){!function(t,e){if("function"!==typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&l(t,e)}(u,t);var e,n,o,c=S(u);function u(){var t;return function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,u),d(s(t=c.call(this)),"loadTheme",(function(){0==t.state.theme?function(){try{localStorage.removeItem(x)}catch(t){console.log(t)}}():function(t){try{var e=JSON.stringify(t);localStorage.setItem(x,e)}catch(n){console.log(n)}}(1)})),d(s(t),"handleopen",(function(){var e=t.state.show;t.setState({show:!e})})),d(s(t),"setTheme",(function(){var e=t.state.theme;t.setState({theme:!e})})),d(s(t),"closeShow",(function(){t.setState({show:!1})})),t.state={show:!1,theme:!!E()},t}return e=u,n=[{key:"render",value:function(){var t=this.props,e=t.Component,n=t.pageProps;return w(y.a.Fragment,null,w(v.PageTransition,{timeout:200,classNames:"page-transition",loadingDelay:100},w(b.c.Provider,{key:Math.floor(Math.random()*Math.floor(20)),value:{show:this.state.show,theme:this.state.theme,loadTheme:this.loadTheme,setTheme:this.setTheme,handleopen:this.handleopen,closeShow:this.closeShow}},w(e,n))))}}],o=[{key:"getInitialProps",value:function(){var t,e=(t=r.a.mark((function t(e){var n,o,i;return r.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(n=e.Component,o=e.ctx,i={},!n.getInitialProps){t.next=6;break}return t.next=5,n.getInitialProps(o);case 5:i=t.sent;case 6:return t.abrupt("return",{pageProps:i});case 7:case"end":return t.stop()}}),t)})),function(){var e=this,n=arguments;return new Promise((function(o,r){var a=t.apply(e,n);function s(t){i(a,o,r,s,l,"next",t)}function l(t){i(a,o,r,s,l,"throw",t)}s(void 0)}))});return function(t){return e.apply(this,arguments)}}()}],n&&a(e.prototype,n),o&&a(e,o),u}(m.a)},"48fX":function(t,e,n){var o=n("qhzo");t.exports=function(t,e){if("function"!==typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&o(t,e)}},"8Bbg":function(t,e,n){t.exports=n("B5Ud")},B5Ud:function(t,e,n){"use strict";var o=n("vJKn"),r=n("/GRZ"),i=n("i2R6"),a=n("48fX"),s=n("tCBg"),l=n("T0f4"),c=n("qVT1");function u(t){var e=function(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(t){return!1}}();return function(){var n,o=l(t);if(e){var r=l(this).constructor;n=Reflect.construct(o,arguments,r)}else n=o.apply(this,arguments);return s(this,n)}}var p=n("AroE");e.__esModule=!0,e.Container=function(t){0;return t.children},e.createUrl=y,e.default=void 0;var f=p(n("q1tI")),d=n("g/15");function h(t){return m.apply(this,arguments)}function m(){return(m=c(o.mark((function t(e){var n,r,i;return o.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return n=e.Component,r=e.ctx,t.next=3,(0,d.loadGetInitialProps)(n,r);case 3:return i=t.sent,t.abrupt("return",{pageProps:i});case 5:case"end":return t.stop()}}),t)})))).apply(this,arguments)}e.AppInitialProps=d.AppInitialProps,e.NextWebVitalsMetric=d.NextWebVitalsMetric;var g=function(t){a(n,t);var e=u(n);function n(){return r(this,n),e.apply(this,arguments)}return i(n,[{key:"componentDidCatch",value:function(t,e){throw t}},{key:"render",value:function(){var t=this.props,e=t.router,n=t.Component,o=t.pageProps,r=t.__N_SSG,i=t.__N_SSP;return f.default.createElement(n,Object.assign({},o,r||i?{}:{url:y(e)}))}}]),n}(f.default.Component);function y(t){var e=t.pathname,n=t.asPath,o=t.query;return{get query(){return o},get pathname(){return e},get asPath(){return n},back:function(){t.back()},push:function(e,n){return t.push(e,n)},pushTo:function(e,n){var o=n?e:"",r=n||e;return t.push(o,r)},replace:function(e,n){return t.replace(e,n)},replaceTo:function(e,n){var o=n?e:"",r=n||e;return t.replace(o,r)}}}e.default=g,g.origGetInitialProps=h,g.getInitialProps=h},FhCX:function(t,e,n){"use strict";var o,r=(o=n("TsXg"))&&o.__esModule?o:{default:o};t.exports={PageTransition:r.default}},GcxT:function(t,e,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/_app",function(){return n("1TCz")}])},S3Uj:function(t,e,n){"use strict";e.__esModule=!0,e.default=e.EXITING=e.ENTERED=e.ENTERING=e.EXITED=e.UNMOUNTED=void 0;var o=function(t){if(t&&t.__esModule)return t;var e={};if(null!=t)for(var n in t)if(Object.prototype.hasOwnProperty.call(t,n)){var o=Object.defineProperty&&Object.getOwnPropertyDescriptor?Object.getOwnPropertyDescriptor(t,n):{};o.get||o.set?Object.defineProperty(e,n,o):e[n]=t[n]}return e.default=t,e}(n("17x9")),r=s(n("q1tI")),i=s(n("i8i4")),a=n("VCL8");n("xfxO");function s(t){return t&&t.__esModule?t:{default:t}}var l="unmounted";e.UNMOUNTED=l;var c="exited";e.EXITED=c;var u="entering";e.ENTERING=u;var p="entered";e.ENTERED=p;var f="exiting";e.EXITING=f;var d=function(t){var e,n;function o(e,n){var o;o=t.call(this,e,n)||this;var r,i=n.transitionGroup,a=i&&!i.isMounting?e.enter:e.appear;return o.appearStatus=null,e.in?a?(r=c,o.appearStatus=u):r=p:r=e.unmountOnExit||e.mountOnEnter?l:c,o.state={status:r},o.nextCallback=null,o}n=t,(e=o).prototype=Object.create(n.prototype),e.prototype.constructor=e,e.__proto__=n;var a=o.prototype;return a.getChildContext=function(){return{transitionGroup:null}},o.getDerivedStateFromProps=function(t,e){return t.in&&e.status===l?{status:c}:null},a.componentDidMount=function(){this.updateStatus(!0,this.appearStatus)},a.componentDidUpdate=function(t){var e=null;if(t!==this.props){var n=this.state.status;this.props.in?n!==u&&n!==p&&(e=u):n!==u&&n!==p||(e=f)}this.updateStatus(!1,e)},a.componentWillUnmount=function(){this.cancelNextCallback()},a.getTimeouts=function(){var t,e,n,o=this.props.timeout;return t=e=n=o,null!=o&&"number"!==typeof o&&(t=o.exit,e=o.enter,n=void 0!==o.appear?o.appear:e),{exit:t,enter:e,appear:n}},a.updateStatus=function(t,e){if(void 0===t&&(t=!1),null!==e){this.cancelNextCallback();var n=i.default.findDOMNode(this);e===u?this.performEnter(n,t):this.performExit(n)}else this.props.unmountOnExit&&this.state.status===c&&this.setState({status:l})},a.performEnter=function(t,e){var n=this,o=this.props.enter,r=this.context.transitionGroup?this.context.transitionGroup.isMounting:e,i=this.getTimeouts(),a=r?i.appear:i.enter;e||o?(this.props.onEnter(t,r),this.safeSetState({status:u},(function(){n.props.onEntering(t,r),n.onTransitionEnd(t,a,(function(){n.safeSetState({status:p},(function(){n.props.onEntered(t,r)}))}))}))):this.safeSetState({status:p},(function(){n.props.onEntered(t)}))},a.performExit=function(t){var e=this,n=this.props.exit,o=this.getTimeouts();n?(this.props.onExit(t),this.safeSetState({status:f},(function(){e.props.onExiting(t),e.onTransitionEnd(t,o.exit,(function(){e.safeSetState({status:c},(function(){e.props.onExited(t)}))}))}))):this.safeSetState({status:c},(function(){e.props.onExited(t)}))},a.cancelNextCallback=function(){null!==this.nextCallback&&(this.nextCallback.cancel(),this.nextCallback=null)},a.safeSetState=function(t,e){e=this.setNextCallback(e),this.setState(t,e)},a.setNextCallback=function(t){var e=this,n=!0;return this.nextCallback=function(o){n&&(n=!1,e.nextCallback=null,t(o))},this.nextCallback.cancel=function(){n=!1},this.nextCallback},a.onTransitionEnd=function(t,e,n){this.setNextCallback(n);var o=null==e&&!this.props.addEndListener;t&&!o?(this.props.addEndListener&&this.props.addEndListener(t,this.nextCallback),null!=e&&setTimeout(this.nextCallback,e)):setTimeout(this.nextCallback,0)},a.render=function(){var t=this.state.status;if(t===l)return null;var e=this.props,n=e.children,o=function(t,e){if(null==t)return{};var n,o,r={},i=Object.keys(t);for(o=0;o<i.length;o++)n=i[o],e.indexOf(n)>=0||(r[n]=t[n]);return r}(e,["children"]);if(delete o.in,delete o.mountOnEnter,delete o.unmountOnExit,delete o.appear,delete o.enter,delete o.exit,delete o.timeout,delete o.addEndListener,delete o.onEnter,delete o.onEntering,delete o.onEntered,delete o.onExit,delete o.onExiting,delete o.onExited,"function"===typeof n)return n(t,o);var i=r.default.Children.only(n);return r.default.cloneElement(i,o)},o}(r.default.Component);function h(){}d.contextTypes={transitionGroup:o.object},d.childContextTypes={transitionGroup:function(){}},d.propTypes={},d.defaultProps={in:!1,mountOnEnter:!1,unmountOnExit:!1,appear:!1,enter:!0,exit:!0,onEnter:h,onEntering:h,onEntered:h,onExit:h,onExiting:h,onExited:h},d.UNMOUNTED=0,d.EXITED=1,d.ENTERING=2,d.ENTERED=3,d.EXITING=4;var m=(0,a.polyfill)(d);e.default=m},Si88:function(t,e,n){"use strict";e.__esModule=!0,e.default=void 0;!function(t){if(t&&t.__esModule)return t;var e={};if(null!=t)for(var n in t)if(Object.prototype.hasOwnProperty.call(t,n)){var o=Object.defineProperty&&Object.getOwnPropertyDescriptor?Object.getOwnPropertyDescriptor(t,n):{};o.get||o.set?Object.defineProperty(e,n,o):e[n]=t[n]}e.default=t}(n("17x9"));var o=s(n("ycFn")),r=s(n("VOcB")),i=s(n("q1tI")),a=s(n("S3Uj"));n("xfxO");function s(t){return t&&t.__esModule?t:{default:t}}function l(){return(l=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var o in n)Object.prototype.hasOwnProperty.call(n,o)&&(t[o]=n[o])}return t}).apply(this,arguments)}var c=function(t,e){return t&&e&&e.split(" ").forEach((function(e){return(0,o.default)(t,e)}))},u=function(t,e){return t&&e&&e.split(" ").forEach((function(e){return(0,r.default)(t,e)}))},p=function(t){var e,n;function o(){for(var e,n=arguments.length,o=new Array(n),r=0;r<n;r++)o[r]=arguments[r];return(e=t.call.apply(t,[this].concat(o))||this).onEnter=function(t,n){var o=e.getClassNames(n?"appear":"enter").className;e.removeClasses(t,"exit"),c(t,o),e.props.onEnter&&e.props.onEnter(t,n)},e.onEntering=function(t,n){var o=e.getClassNames(n?"appear":"enter").activeClassName;e.reflowAndAddClass(t,o),e.props.onEntering&&e.props.onEntering(t,n)},e.onEntered=function(t,n){var o=e.getClassNames("appear").doneClassName,r=e.getClassNames("enter").doneClassName,i=n?o+" "+r:r;e.removeClasses(t,n?"appear":"enter"),c(t,i),e.props.onEntered&&e.props.onEntered(t,n)},e.onExit=function(t){var n=e.getClassNames("exit").className;e.removeClasses(t,"appear"),e.removeClasses(t,"enter"),c(t,n),e.props.onExit&&e.props.onExit(t)},e.onExiting=function(t){var n=e.getClassNames("exit").activeClassName;e.reflowAndAddClass(t,n),e.props.onExiting&&e.props.onExiting(t)},e.onExited=function(t){var n=e.getClassNames("exit").doneClassName;e.removeClasses(t,"exit"),c(t,n),e.props.onExited&&e.props.onExited(t)},e.getClassNames=function(t){var n=e.props.classNames,o="string"===typeof n,r=o?(o&&n?n+"-":"")+t:n[t];return{className:r,activeClassName:o?r+"-active":n[t+"Active"],doneClassName:o?r+"-done":n[t+"Done"]}},e}n=t,(e=o).prototype=Object.create(n.prototype),e.prototype.constructor=e,e.__proto__=n;var r=o.prototype;return r.removeClasses=function(t,e){var n=this.getClassNames(e),o=n.className,r=n.activeClassName,i=n.doneClassName;o&&u(t,o),r&&u(t,r),i&&u(t,i)},r.reflowAndAddClass=function(t,e){e&&(t&&t.scrollTop,c(t,e))},r.render=function(){var t=l({},this.props);return delete t.classNames,i.default.createElement(a.default,l({},t,{onEnter:this.onEnter,onEntered:this.onEntered,onEntering:this.onEntering,onExit:this.onExit,onExiting:this.onExiting,onExited:this.onExited}))},o}(i.default.Component);p.defaultProps={classNames:""},p.propTypes={};var f=p;e.default=f,t.exports=e.default},T0f4:function(t,e){function n(e){return t.exports=n=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)},n(e)}t.exports=n},TqRt:function(t,e){t.exports=function(t){return t&&t.__esModule?t:{default:t}},t.exports.default=t.exports,t.exports.__esModule=!0},TsXg:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var o=function(t){if(t&&t.__esModule)return t;var e={};if(null!=t)for(var n in t)if(Object.prototype.hasOwnProperty.call(t,n)){var o=Object.defineProperty&&Object.getOwnPropertyDescriptor?Object.getOwnPropertyDescriptor(t,n):{};o.get||o.set?Object.defineProperty(e,n,o):e[n]=t[n]}return e.default=t,e}(n("q1tI")),r=l(n("17x9")),i=l(n("S3Uj")),a=l(n("Si88")),s=n("xfxO");function l(t){return t&&t.__esModule?t:{default:t}}function c(t){return(c="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"===typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function u(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}function p(t){return(p=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function f(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function d(t,e){return(d=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function h(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function m(t,e){return t!==e}function g(t){return o.default.isValidElement(t)&&t.type.pageTransitionDelayEnter}function y(t,e){return function(){this.setState(function(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{},o=Object.keys(n);"function"===typeof Object.getOwnPropertySymbols&&(o=o.concat(Object.getOwnPropertySymbols(n).filter((function(t){return Object.getOwnPropertyDescriptor(n,t).enumerable})))),o.forEach((function(e){h(t,e,n[e])}))}return t}({state:t},e))}}var v=function(t){function e(t){var n,o,r;!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,e),o=this,n=!(r=p(e).call(this,t))||"object"!==c(r)&&"function"!==typeof r?f(o):r,h(f(n),"onEntering",y("entering").bind(f(n))),h(f(n),"onEntered",y("entered").bind(f(n))),h(f(n),"onExiting",y("exiting").bind(f(n))),h(f(n),"onExited",y("exited",{renderedChildren:null}).bind(f(n)));var i=t.children;return n.state={state:t.skipInitialTransition?"init":"enter",isIn:!g(i),currentChildren:i,nextChildren:null,renderedChildren:i,showLoading:!1},n}var n,r,s;return function(t,e){if("function"!==typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&d(t,e)}(e,t),n=e,(r=[{key:"componentDidMount",value:function(){var t=this,e=this.props,n=e.children,o=e.monkeyPatchScrolling;g(n)&&this.setState({timeoutId:this.startEnterTimer()}),o&&"undefined"!==typeof window&&(this.originalScrollTo=window.scrollTo,this.disableScrolling=!1,window.scrollTo=function(){if(!t.disableScrolling){for(var e=arguments.length,n=new Array(e),o=0;o<e;o++)n[o]=arguments[o];t.originalScrollTo.apply(window,n)}})}},{key:"componentDidUpdate",value:function(t,e){var n,r,i=this.state,a=i.currentChildren,s=i.renderedChildren,l=i.nextChildren,c=i.isIn,u=i.state,p=this.props.children,f=this.state,d=f.timeoutId,h=f.showLoading,y=m(a,p),v=m(s,p),b=v&&(r=p,!(n=s)||!r||(o.default.isValidElement(n)&&o.default.isValidElement(r)?null==n.key||null==r.key?(console.warn("[next-page-transitions] PageTransition child does not have a key"),!0):n.key!==r.key:(console.warn("[next-page-transitions] PageTransition child is not a valid React component"),!0)));c&&v&&!b?this.setState({currentChildren:p,renderedChildren:p}):y?(this.setState({isIn:!1,nextChildren:p,currentChildren:p}),d&&clearTimeout(d)):!v||c||"enter"!==u&&"exited"!==u?e.showLoading&&!h&&this.setState({isIn:!0}):g(l)?this.setState({renderedChildren:l,nextChildren:null,timeoutId:this.startEnterTimer()}):this.setState({isIn:!0,renderedChildren:l,nextChildren:null})}},{key:"componentWillUnmount",value:function(){this.originalScrollTo&&"undefined"!==typeof window&&(window.scrollTo=this.originalScrollTo);var t=this.state.timeoutId;t&&clearTimeout(t)}},{key:"onEnter",value:function(){this.disableScrolling=!1,this.setState({state:"enter",showLoading:!1})}},{key:"onExit",value:function(){this.disableScrolling=!0,this.setState({state:"exit"})}},{key:"onChildLoaded",value:function(){var t=this.state,e=t.timeoutId,n=t.showLoading;e&&clearTimeout(e),n?this.setState({showLoading:!1}):this.setState({isIn:!0})}},{key:"startEnterTimer",value:function(){var t=this,e=this.props.loadingDelay;return setTimeout((function(){t.setState({showLoading:!0})}),e)}},{key:"render",value:function(){var t=this,e=this.props,n=e.tag,r=e.timeout,s=e.loadingComponent,l=e.loadingCallbackName,c=e.classNames,u=e.loadingClassNames,p=e.loadingTimeout,f=e.skipInitialTransition,d=this.state,m=d.renderedChildren,g=d.state,y=d.isIn,v=d.showLoading;-1!==["entering","exiting","exited"].indexOf(g)&&document.body&&document.body.scrollTop;var b=!!s,x=function(t,e){switch(e){case"enter":return"".concat(t,"-enter");case"entering":return"".concat(t,"-enter ").concat(t,"-enter-active");case"entered":return"".concat(t,"-enter-done");case"exit":return"".concat(t,"-exit");case"exiting":return"".concat(t,"-exit ").concat(t,"-exit-active");case"exited":return"".concat(t,"-exit-done");default:return""}}(c,g);return o.default.createElement(o.Fragment,null,o.default.createElement(i.default,{timeout:r,in:y,appear:!f,onEnter:function(){return t.onEnter()},onEntering:function(){return t.onEntering()},onEntered:function(){return t.onEntered()},onExit:function(){return t.onExit()},onExiting:function(){return t.onExiting()},onExited:function(){return t.onExited()}},o.default.createElement(n,{className:x},m&&o.default.cloneElement(m,h({},l,(function(){return t.onChildLoaded()}))))),b&&o.default.createElement(a.default,{in:v,mountOnEnter:!0,unmountOnExit:!0,appear:!0,classNames:u,timeout:p},s))}}])&&u(n.prototype,r),s&&u(n,s),e}(o.default.Component);v.propTypes={tag:r.default.oneOfType([r.default.func,r.default.string,r.default.shape({$$typeof:r.default.symbol,render:r.default.func})]),children:r.default.node.isRequired,classNames:r.default.string.isRequired,timeout:function(t){if(s.timeoutsShape){for(var e=arguments.length,n=new Array(e>1?e-1:0),o=1;o<e;o++)n[o-1]=arguments[o];return s.timeoutsShape.isRequired.apply(s.timeoutsShape,[t].concat(n))}},loadingComponent:r.default.element,loadingDelay:r.default.number,loadingCallbackName:r.default.string,loadingTimeout:function(t){if(s.timeoutsShape&&t.loadingComponent){for(var e=arguments.length,n=new Array(e>1?e-1:0),o=1;o<e;o++)n[o-1]=arguments[o];return s.timeoutsShape.isRequired.apply(s.timeoutsShape,[t].concat(n))}},loadingClassNames:function(t){var e=r.default.string;t.loadingTimeout&&(e=e.isRequired);for(var n=arguments.length,o=new Array(n>1?n-1:0),i=1;i<n;i++)o[i-1]=arguments[i];return e.apply(void 0,[t].concat(o))},monkeyPatchScrolling:r.default.bool,skipInitialTransition:r.default.bool},v.defaultProps={tag:"div",loadingComponent:null,loadingCallbackName:"pageTransitionReadyToEnter",loadingDelay:500,monkeyPatchScrolling:!1,skipInitialTransition:!1};var b=v;e.default=b},VCL8:function(t,e,n){"use strict";function o(){var t=this.constructor.getDerivedStateFromProps(this.props,this.state);null!==t&&void 0!==t&&this.setState(t)}function r(t){this.setState(function(e){var n=this.constructor.getDerivedStateFromProps(t,e);return null!==n&&void 0!==n?n:null}.bind(this))}function i(t,e){try{var n=this.props,o=this.state;this.props=t,this.state=e,this.__reactInternalSnapshotFlag=!0,this.__reactInternalSnapshot=this.getSnapshotBeforeUpdate(n,o)}finally{this.props=n,this.state=o}}function a(t){var e=t.prototype;if(!e||!e.isReactComponent)throw new Error("Can only polyfill class components");if("function"!==typeof t.getDerivedStateFromProps&&"function"!==typeof e.getSnapshotBeforeUpdate)return t;var n=null,a=null,s=null;if("function"===typeof e.componentWillMount?n="componentWillMount":"function"===typeof e.UNSAFE_componentWillMount&&(n="UNSAFE_componentWillMount"),"function"===typeof e.componentWillReceiveProps?a="componentWillReceiveProps":"function"===typeof e.UNSAFE_componentWillReceiveProps&&(a="UNSAFE_componentWillReceiveProps"),"function"===typeof e.componentWillUpdate?s="componentWillUpdate":"function"===typeof e.UNSAFE_componentWillUpdate&&(s="UNSAFE_componentWillUpdate"),null!==n||null!==a||null!==s){var l=t.displayName||t.name,c="function"===typeof t.getDerivedStateFromProps?"getDerivedStateFromProps()":"getSnapshotBeforeUpdate()";throw Error("Unsafe legacy lifecycles will not be called for components using new component APIs.\n\n"+l+" uses "+c+" but also contains the following legacy lifecycles:"+(null!==n?"\n  "+n:"")+(null!==a?"\n  "+a:"")+(null!==s?"\n  "+s:"")+"\n\nThe above lifecycles should be removed. Learn more about this warning here:\nhttps://fb.me/react-async-component-lifecycle-hooks")}if("function"===typeof t.getDerivedStateFromProps&&(e.componentWillMount=o,e.componentWillReceiveProps=r),"function"===typeof e.getSnapshotBeforeUpdate){if("function"!==typeof e.componentDidUpdate)throw new Error("Cannot polyfill getSnapshotBeforeUpdate() for components that do not define componentDidUpdate() on the prototype");e.componentWillUpdate=i;var u=e.componentDidUpdate;e.componentDidUpdate=function(t,e,n){var o=this.__reactInternalSnapshotFlag?this.__reactInternalSnapshot:n;u.call(this,t,e,o)}}return t}n.r(e),n.d(e,"polyfill",(function(){return a})),o.__suppressDeprecationWarning=!0,r.__suppressDeprecationWarning=!0,i.__suppressDeprecationWarning=!0},VOcB:function(t,e,n){"use strict";function o(t,e){return t.replace(new RegExp("(^|\\s)"+e+"(?:\\s|$)","g"),"$1").replace(/\s+/g," ").replace(/^\s*|\s*$/g,"")}t.exports=function(t,e){t.classList?t.classList.remove(e):"string"===typeof t.className?t.className=o(t.className,e):t.setAttribute("class",o(t.className&&t.className.baseVal||"",e))}},"Y3++":function(t,e,n){"use strict";e.a=[{title:"Visualizing Backpropagation in Neural Network Training at Any Scale",description:"Using HiPlot to generate parallel coordinate plots to visualize deep learning model training.",link:"https://towardsdatascience.com/visualizing-backpropagation-in-neural-network-training-2647f5977fdb",imageUrl:"https://miro.medium.com/max/1400/1*tveesbVZ-nCY_vZjlSCWOA.png",type:["article"]},{title:"Building a Real Time Chat Application with NLP Capabilities",description:"A Chat App with Sentiment Analysis and Tone Detection using TensorFlow JS Deep Learning API, IBM Cloud, Node.JS, Web Sockets, and React.",link:"https://towardsdatascience.com/building-a-real-time-chat-application-with-nlp-super-powers-ce800e19cb2b",imageUrl:"https://miro.medium.com/max/1400/1*KmVHS7miXDwxMc1ZRMKXqQ.gif",type:["article"]}]},Yc3X:function(t,e,n){"use strict";n.d(e,"a",(function(){return s})),n.d(e,"b",(function(){return l}));var o=n("q1tI"),r=n("Y3++"),i=n("/Ceq"),a=Object(o.createContext)(),s=Object(o.createContext)(r.a),l=Object(o.createContext)(i.a);e.c=a},cDf5:function(t,e){function n(e){return"function"===typeof Symbol&&"symbol"===typeof Symbol.iterator?(t.exports=n=function(t){return typeof t},t.exports.default=t.exports,t.exports.__esModule=!0):(t.exports=n=function(t){return t&&"function"===typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},t.exports.default=t.exports,t.exports.__esModule=!0),n(e)}t.exports=n,t.exports.default=t.exports,t.exports.__esModule=!0},o0o1:function(t,e,n){t.exports=n("ls82")},qXWd:function(t,e){t.exports=function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}},tCBg:function(t,e,n){var o=n("C+bE"),r=n("qXWd");t.exports=function(t,e){return!e||"object"!==o(e)&&"function"!==typeof e?r(t):e}},xfxO:function(t,e,n){"use strict";e.__esModule=!0,e.classNamesShape=e.timeoutsShape=void 0;var o;(o=n("17x9"))&&o.__esModule;e.timeoutsShape=null;e.classNamesShape=null},yD6e:function(t,e,n){"use strict";e.__esModule=!0,e.default=function(t,e){return t.classList?!!e&&t.classList.contains(e):-1!==(" "+(t.className.baseVal||t.className)+" ").indexOf(" "+e+" ")},t.exports=e.default},ycFn:function(t,e,n){"use strict";var o=n("TqRt");e.__esModule=!0,e.default=function(t,e){t.classList?t.classList.add(e):(0,r.default)(t,e)||("string"===typeof t.className?t.className=t.className+" "+e:t.setAttribute("class",(t.className&&t.className.baseVal||"")+" "+e))};var r=o(n("yD6e"));t.exports=e.default}},[[1,1,2,0]]]);