if(!self.define){let e,n={};const s=(s,i)=>(s=new URL(s+".js",i).href,n[s]||new Promise((n=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=n,document.head.appendChild(e)}else e=s,importScripts(s),n()})).then((()=>{let e=n[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(i,a)=>{const c=e||("document"in self?document.currentScript.src:"")||location.href;if(n[c])return;let o={};const r=e=>s(e,c),t={module:{uri:c},exports:o,require:r};n[c]=Promise.all(i.map((e=>t[e]||r(e)))).then((e=>(a(...e),o)))}}define(["./workbox-6a1bf588"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/CNAME",revision:"18e5457c875a6051b104aae13095dde7"},{url:"/DevalParikhResume.pdf",revision:"86f12dafe026c2110e57b8d1a213a741"},{url:"/_next/static/chunks/38da7bfe-7c421490d8f4efee.js",revision:"oUcIs1aef3Vny2p8bx9Pv"},{url:"/_next/static/chunks/483-de8013f69bcc6079.js",revision:"oUcIs1aef3Vny2p8bx9Pv"},{url:"/_next/static/chunks/747-89bb7336a6ffbab0.js",revision:"oUcIs1aef3Vny2p8bx9Pv"},{url:"/_next/static/chunks/997-b28bcf7a0be07d39.js",revision:"oUcIs1aef3Vny2p8bx9Pv"},{url:"/_next/static/chunks/framework-872c0808d378f1a4.js",revision:"oUcIs1aef3Vny2p8bx9Pv"},{url:"/_next/static/chunks/main-8a5f9635a8614fb0.js",revision:"oUcIs1aef3Vny2p8bx9Pv"},{url:"/_next/static/chunks/pages/_app-bf47ac443a184bc3.js",revision:"oUcIs1aef3Vny2p8bx9Pv"},{url:"/_next/static/chunks/pages/_error-a4ba2246ff8fb532.js",revision:"oUcIs1aef3Vny2p8bx9Pv"},{url:"/_next/static/chunks/pages/about-ff73f58baa6f832d.js",revision:"oUcIs1aef3Vny2p8bx9Pv"},{url:"/_next/static/chunks/pages/articles-5115d82684e774c5.js",revision:"oUcIs1aef3Vny2p8bx9Pv"},{url:"/_next/static/chunks/pages/contact-113805cfc185d519.js",revision:"oUcIs1aef3Vny2p8bx9Pv"},{url:"/_next/static/chunks/pages/index-0c70388a1121ad5f.js",revision:"oUcIs1aef3Vny2p8bx9Pv"},{url:"/_next/static/chunks/pages/projects-e25a3d78e3153bbb.js",revision:"oUcIs1aef3Vny2p8bx9Pv"},{url:"/_next/static/chunks/pages/resume-16f70565f117cdbd.js",revision:"oUcIs1aef3Vny2p8bx9Pv"},{url:"/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js",revision:"oUcIs1aef3Vny2p8bx9Pv"},{url:"/_next/static/chunks/webpack-808fa64bce5497ad.js",revision:"oUcIs1aef3Vny2p8bx9Pv"},{url:"/_next/static/oUcIs1aef3Vny2p8bx9Pv/_buildManifest.js",revision:"oUcIs1aef3Vny2p8bx9Pv"},{url:"/_next/static/oUcIs1aef3Vny2p8bx9Pv/_ssgManifest.js",revision:"oUcIs1aef3Vny2p8bx9Pv"},{url:"/_redirects",revision:"3ff4c1275d6e2e53c9d2ce2a75cba192"},{url:"/css/base.css",revision:"a15c2ac3234aa8f6064ef9c1f7383c37"},{url:"/css/normalize.css",revision:"83dfa4b53957ddb51bd11084e290fc98"},{url:"/cursor.png",revision:"557559392458e9363895f6a8e12d7913"},{url:"/favicon.ico",revision:"b75f7649b05a7d76ce89f9cce47dcdab"},{url:"/fonts/NeurialGrotesk-Bold.otf",revision:"3bab5dc3f48892ba1c67afc4e2b6e8ad"},{url:"/fonts/NeurialGrotesk-Extrabold.otf",revision:"fb4d0ab59826d28cc4f00fabe737a2a3"},{url:"/fonts/NeurialGrotesk-Medium.otf",revision:"416223b099b615cfe8727d64ccf56ae2"},{url:"/fonts/NeurialGrotesk-Regular.otf",revision:"2307761bcc0c9168b60bd39011965452"},{url:"/icon.png",revision:"3b9ff3ac0b174ea3f4e9e81a6684a391"},{url:"/icons/16.png",revision:"783d0aa49395d0afefe6c1c9f52c2e59"},{url:"/icons/256.png",revision:"018c7c5dfa62ae78b390c29b15cfcdf1"},{url:"/icons/512.png",revision:"533d654a6dcd43851ebdb73321e1e2a5"},{url:"/icons/android-icon-144x144.png",revision:"c54ba85974d159ffdebfae531e16bb33"},{url:"/icons/android-icon-192x192.png",revision:"4071d08b60a42415a1af624bcdbeeb01"},{url:"/icons/android-icon-36x36.png",revision:"82f5f9e518a6284f065c921b5000cfb3"},{url:"/icons/android-icon-48x48.png",revision:"96040ea15f598f7901250dbf49a2f976"},{url:"/icons/android-icon-72x72.png",revision:"278513eb638109ad30eadb3d168fc3f3"},{url:"/icons/android-icon-96x96.png",revision:"fd902ae7ddf8f836bfb175223a1b2e86"},{url:"/icons/apple-icon-114x114.png",revision:"566287a7a74ad48c5431433c5a590cd1"},{url:"/icons/apple-icon-120x120.png",revision:"63a03dca5480fe4e85b2379a837ccd64"},{url:"/icons/apple-icon-144x144.png",revision:"c54ba85974d159ffdebfae531e16bb33"},{url:"/icons/apple-icon-152x152.png",revision:"dcb0e25ace03dd9bcdbf90790d8e889b"},{url:"/icons/apple-icon-180x180.png",revision:"846e489c0b52364bd232f00dc9b14d3d"},{url:"/icons/apple-icon-57x57.png",revision:"3f54cd6f1901ba3dbe717ed90a3a0d22"},{url:"/icons/apple-icon-60x60.png",revision:"8ab63b2055e3408d78e719528fdea991"},{url:"/icons/apple-icon-72x72.png",revision:"278513eb638109ad30eadb3d168fc3f3"},{url:"/icons/apple-icon-76x76.png",revision:"822c3b94bdedab28069d5047d0b096d6"},{url:"/icons/apple-icon-precomposed.png",revision:"e29d39dffb02bb31a40207b35aa03c92"},{url:"/icons/apple-icon.png",revision:"e29d39dffb02bb31a40207b35aa03c92"},{url:"/icons/browserconfig.xml",revision:"653d077300a12f09a69caeea7a8947f8"},{url:"/icons/favicon-16x16.png",revision:"dbca69e28422b6c4ee7494ee7d7437fb"},{url:"/icons/favicon-32x32.png",revision:"4a27942c6ea671ce96b010449fc04b3a"},{url:"/icons/favicon-96x96.png",revision:"fd902ae7ddf8f836bfb175223a1b2e86"},{url:"/icons/favicon.ico",revision:"4c221b238e2564fea2aba092beea7efd"},{url:"/icons/ms-icon-144x144.png",revision:"c54ba85974d159ffdebfae531e16bb33"},{url:"/icons/ms-icon-150x150.png",revision:"7e775d017d917a86533e778a5899d651"},{url:"/icons/ms-icon-310x310.png",revision:"ab4ab92df223f9b781391b99e8008bea"},{url:"/icons/ms-icon-70x70.png",revision:"da1989aabb1cd475a121c6d938f816eb"},{url:"/img/CW..svg",revision:"8d04c7909765130ce7c13d40854ec548"},{url:"/img/HousingHelperGif.gif",revision:"9320754182a2558582324762e74d78fb"},{url:"/img/RGILogo.png",revision:"ad6b35a874cd44ed2ab20f11e761feb1"},{url:"/img/devalparikhPreview.png",revision:"2fd9c0ff66dc6b562215d1104db88f21"},{url:"/img/eyebank.png",revision:"fd7d9c46573a87828c3f9718e7145b57"},{url:"/img/flipfeed.png",revision:"601a4a056d354dcc5aad7e25e2231e3a"},{url:"/img/geogram.png",revision:"72564796ea6b019ebd5de79af6ab9159"},{url:"/img/housinghelper.png",revision:"1b20acc93e9e1db27669f78b6e58c9bf"},{url:"/manifest.json",revision:"e5c546eb14f1c17070fef21b6f0559d0"},{url:"/wcursor.png",revision:"fcfdf3445d926013aaa325e98c4785e2"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:n,event:s,state:i})=>n&&"opaqueredirect"===n.type?new Response(n.body,{status:200,statusText:"OK",headers:n.headers}):n}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const n=e.pathname;return!n.startsWith("/api/auth/")&&!!n.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
