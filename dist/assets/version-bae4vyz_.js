import{a as zp,c as Dt,g as Vp}from"./index-DozEBPGO.js";function Wp(t,e){for(var n=0;n<e.length;n++){const s=e[n];if(typeof s!="string"&&!Array.isArray(s)){for(const r in s)if(r!=="default"&&!(r in t)){const a=Object.getOwnPropertyDescriptor(s,r);a&&Object.defineProperty(t,r,a.get?a:{enumerable:!0,get:()=>s[r]})}}}return Object.freeze(Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}))}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Mp=1e-7,jp=1e-4;class Up{constructor(e,n){this.backend=e,this.dataMover=n,this.data=new WeakMap,this.dataIdsCount=0}get(e){return this.data.has(e)||this.dataMover.moveData(this.backend,e),this.data.get(e)}set(e,n){this.dataIdsCount++,this.data.set(e,n)}has(e){return this.data.has(e)}delete(e){return this.dataIdsCount--,this.data.delete(e)}numDataIds(){return this.dataIdsCount}}class ao{refCount(e){return me("refCount")}incRef(e){return me("incRef")}timerAvailable(){return!0}time(e){return me("time")}read(e){return me("read")}readSync(e){return me("readSync")}readToGPU(e,n){return me("readToGPU")}numDataIds(){return me("numDataIds")}disposeData(e,n){return me("disposeData")}write(e,n,s){return me("write")}move(e,n,s,r,a){return me("move")}createTensorFromGPUData(e,n,s){return me("createTensorFromGPUData")}memory(){return me("memory")}floatPrecision(){return me("floatPrecision")}epsilon(){return this.floatPrecision()===32?Mp:jp}dispose(){return me("dispose")}}function me(t){throw new Error(`'${t}' not yet implemented or not found in the registry. This kernel may not be supported by the tfjs backend you have chosen`)}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function oo(t){let e=t.length,n=0;for(;e>0;)n=Math.random()*e|0,e--,qn(t,e,n)}function qp(t,e){if(t.length!==e.length)throw new Error(`Array sizes must match to be shuffled together First array length was ${t.length}Second array length was ${e.length}`);let n=t.length,s=0;for(;n>0;)s=Math.random()*n|0,n--,qn(t,n,s),qn(e,n,s)}function hn(t,e,n){return Math.max(t,Math.min(e,n))}function Gp(t){return t%2===0?t:t+1}function qn(t,e,n){const s=t[e];t[e]=t[n],t[n]=s}function Hp(t){let e=0;for(let n=0;n<t.length;n++)e+=t[n];return e}function Kp(t,e){const n=Math.random();return e*n+(1-n)*t}function Xp(t,e){let n=0;for(let s=0;s<t.length;s++){const r=Number(t[s])-Number(e[s]);n+=r*r}return n}function g(t,e){if(!t)throw new Error(typeof e=="string"?e:e())}function fe(t,e,n=""){g(Re(t,e),()=>n+` Shapes ${t} and ${e} must match`)}function Ft(t){g(t!=null,()=>"The input to the tensor constructor must be a non-null value.")}function j(t){if(t.length===0)return 1;let e=t[0];for(let n=1;n<t.length;n++)e*=t[n];return e}function Zp(t){return t.length===0}function io(t,e){if(t===e)return!0;if(t==null||e==null||t.length!==e.length)return!1;for(let n=0;n<t.length;n++)if(t[n]!==null&&e[n]!==null&&t[n]!==e[n])return!1;return!0}function Re(t,e){if(t===e)return!0;if(t==null||e==null||t.length!==e.length)return!1;for(let n=0;n<t.length;n++)if(t[n]!==e[n])return!1;return!0}function qt(t){return t%1===0}function Jp(t){if(Math.tanh!=null)return Math.tanh(t);if(t===1/0)return 1;if(t===-1/0)return-1;{const e=Math.exp(2*t);return(e-1)/(e+1)}}function Yp(t){const e=Math.ceil(Math.sqrt(t));return[e,Math.ceil(t/e)]}function Qp(t){const e=new Uint32Array(t);for(let n=0;n<t;++n)e[n]=n;return oo(e),e}function cn(t,e){return e<=t.length?t:t+" ".repeat(e-t.length)}function ef(t,e=r=>0,n,s){return new Promise((r,a)=>{let o=0;const i=()=>{if(t()){r();return}o++;const u=e(o);if(n!=null&&o>=n){a();return}s!=null?s(i,u):setTimeout(i,u)};i()})}function tf(t,e){let n=1,s=-1;for(let a=0;a<t.length;++a)if(t[a]>=0)n*=t[a];else if(t[a]===-1){if(s!==-1)throw Error(`Shapes can only have 1 implicit size. Found -1 at dim ${s} and dim ${a}`);s=a}else if(t[a]<0)throw Error(`Shapes can not be < 0. Found ${t[a]} at dim ${a}`);if(s===-1){if(e>0&&e!==n)throw Error(`Size(${e}) must match the product of shape ${t}`);return t}if(n===0)throw Error(`Cannot infer the missing size in [${t}] when there are 0 elements`);if(e%n!==0)throw Error(`The implicit shape can't be a fractional number. Got ${e} / ${n}`);const r=t.slice();return r[s]=e/n,r}function kn(t,e){const n=e.length;return t=t==null?e.map((s,r)=>r):[].concat(t),g(t.every(s=>s>=-n&&s<n),()=>`All values in axis param must be in range [-${n}, ${n}) but got axis ${t}`),g(t.every(s=>qt(s)),()=>`All values in axis param must be integers but got axis ${t}`),t.map(s=>s<0?n+s:s)}function uo(t,e){const n=[],s=[],r=e!=null&&Array.isArray(e)&&e.length===0,a=e==null||r?null:kn(e,t).sort();let o=0;for(let i=0;i<t.length;++i){if(a!=null){if(a[o]===i&&t[i]!==1)throw new Error(`Can't squeeze axis ${i} since its dim '${t[i]}' is not 1`);(a[o]==null||a[o]>i)&&t[i]===1&&(n.push(t[i]),s.push(i)),a[o]<=i&&o++}t[i]!==1&&(n.push(t[i]),s.push(i))}return{newShape:n,keptDims:s}}function co(t,e){return cr(t,e)}function cr(t,e){let n=null;if(t==null||t==="float32")n=new Float32Array(e);else if(t==="int32")n=new Int32Array(e);else if(t==="bool")n=new Uint8Array(e);else if(t==="string")n=new Array(e);else throw new Error(`Unknown data type ${t}`);return n}function lo(t,e){for(let n=0;n<t.length;n++){const s=t[n];if(isNaN(s)||!isFinite(s))throw Error(`A tensor of type ${e} being uploaded contains ${s}.`)}}function ho(t){return t==="bool"||t==="complex64"||t==="float32"||t==="int32"||t==="string"}function nf(t,e){return!(e==="complex64"||e==="float32"&&t!=="complex64"||e==="int32"&&t!=="float32"&&t!=="complex64"||e==="bool"&&t==="bool")}function Gn(t){if(t==="float32"||t==="int32")return 4;if(t==="complex64")return 8;if(t==="bool")return 1;throw new Error(`Unknown dtype ${t}`)}function po(t){if(t==null)return 0;let e=0;return t.forEach(n=>e+=n.length),e}function nt(t){return typeof t=="string"||t instanceof String}function fo(t){return typeof t=="boolean"}function mo(t){return typeof t=="number"}function vn(t){return Array.isArray(t)?vn(t[0]):t instanceof Float32Array?"float32":t instanceof Int32Array||t instanceof Uint8Array||t instanceof Uint8ClampedArray?"int32":mo(t)?"float32":nt(t)?"string":fo(t)?"bool":"float32"}function ot(t){return!!(t&&t.constructor&&t.call&&t.apply)}function Hn(t,e){for(let n=e;n<t;++n)if(t%n===0)return n;return t}function en(t){const e=t.length;if(e<2)return[];const n=new Array(e-1);n[e-2]=t[e-1];for(let s=e-3;s>=0;--s)n[s]=n[s+1]*t[s+1];return n}function go(t,e,n,s=!1){const r=new Array;if(e.length===1){const a=e[0]*(s?2:1);for(let o=0;o<a;o++)r[o]=n[t+o]}else{const a=e[0],o=e.slice(1),i=o.reduce((u,c)=>u*c)*(s?2:1);for(let u=0;u<a;u++)r[u]=go(t+u*i,o,n,s)}return r}function Tt(t,e,n=!1){if(t.length===0)return e[0];const s=t.reduce((r,a)=>r*a)*(n?2:1);if(s===0)return[];if(s!==e.length)throw new Error(`[${t}] does not match the input size ${e.length}${n?" for a complex tensor":""}.`);return go(0,t,e,n)}function sf(t,e){if(Array.isArray(t))return t;if(e==="float32")return t instanceof Float32Array?t:new Float32Array(t);if(e==="int32")return t instanceof Int32Array?t:new Int32Array(t);if(e==="bool"||e==="string")return Uint8Array.from(new Int32Array(t));throw new Error(`Unknown dtype ${e}`)}function lr(t,e){const n=os(t,e);for(let s=0;s<n.length;s++)n[s]=1;return n}function os(t,e){if(e==null||e==="float32"||e==="complex64")return new Float32Array(t);if(e==="int32")return new Int32Array(t);if(e==="bool")return new Uint8Array(t);throw new Error(`Unknown data type ${e}`)}function rf(t,e){const n=t.reduce((s,r)=>s*r,1);if(e==null||e==="float32")return Tt(t,new Float32Array(n));if(e==="int32")return Tt(t,new Int32Array(n));if(e==="bool")return Tt(t,new Uint8Array(n));throw new Error(`Unknown data type ${e}`)}function Se(t){t.forEach(e=>{g(Number.isInteger(e)&&e>=0,()=>`Tensor must have a shape comprised of positive integers but got shape [${t}].`)})}function af(t,e,n){if(e===0)return 0;if(e===1)return t[0];let s=t[t.length-1];for(let r=0;r<t.length-1;++r)s+=n[r]*t[r];return s}function of(t,e,n){if(e===0)return[];if(e===1)return[t];const s=new Array(e);for(let r=0;r<s.length-1;++r)s[r]=Math.floor(t/n[r]),t-=s[r]*n[r];return s[s.length-1]=t,s}function it(t){return t&&t.then&&typeof t.then=="function"}/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const xa="tfjsflags";class yo{constructor(e){this.global=e,this.flags={},this.flagRegistry={},this.urlFlags={},this.getQueryParams=uf,this.populateURLFlags()}setPlatform(e,n){this.platform!=null&&(R().getBool("IS_TEST")||R().getBool("PROD")||console.warn(`Platform ${this.platformName} has already been set. Overwriting the platform with ${e}.`)),this.platformName=e,this.platform=n}registerFlag(e,n,s){if(this.flagRegistry[e]={evaluationFn:n,setHook:s},this.urlFlags[e]!=null){const r=this.urlFlags[e];R().getBool("IS_TEST")||R().getBool("PROD")||console.warn(`Setting feature override from URL ${e}: ${r}.`),this.set(e,r)}}async getAsync(e){return e in this.flags?this.flags[e]:(this.flags[e]=await this.evaluateFlag(e),this.flags[e])}get(e){if(e in this.flags)return this.flags[e];const n=this.evaluateFlag(e);if(it(n))throw new Error(`Flag ${e} cannot be synchronously evaluated. Please use getAsync() instead.`);return this.flags[e]=n,this.flags[e]}getNumber(e){return this.get(e)}getBool(e){return this.get(e)}getString(e){return this.get(e)}getFlags(){return this.flags}get features(){return this.flags}set(e,n){if(this.flagRegistry[e]==null)throw new Error(`Cannot set flag ${e} as it has not been registered.`);this.flags[e]=n,this.flagRegistry[e].setHook!=null&&this.flagRegistry[e].setHook(n)}evaluateFlag(e){if(this.flagRegistry[e]==null)throw new Error(`Cannot evaluate flag '${e}': no evaluation function found.`);return this.flagRegistry[e].evaluationFn()}setFlags(e){this.flags=Object.assign({},e)}reset(){this.flags={},this.urlFlags={},this.populateURLFlags()}populateURLFlags(){if(typeof this.global>"u"||typeof this.global.location>"u"||typeof this.global.location.search>"u")return;const e=this.getQueryParams(this.global.location.search);xa in e&&e[xa].split(",").forEach(s=>{const[r,a]=s.split(":");this.urlFlags[r]=lf(r,a)})}}function uf(t){const e={};return t.replace(/[?&]([^=?&]+)(?:=([^&]*))?/g,(n,...s)=>(cf(e,s[0],s[1]),s.join("="))),e}function cf(t,e,n){t[decodeURIComponent(e)]=decodeURIComponent(n||"")}function lf(t,e){const n=e.toLowerCase();return n==="true"||n==="false"?n==="true":`${+n}`===n?+n:e}function R(){return hr}let hr=null;function hf(t){hr=t}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */let Es;function bo(){if(Es==null){let t;if(typeof window<"u")t=window;else if(typeof global<"u")t=global;else if(typeof process<"u")t=process;else if(typeof self<"u")t=self;else throw new Error("Could not find a global object");Es=t}return Es}function pf(){const t=bo();return t._tfGlobals==null&&(t._tfGlobals=new Map),t._tfGlobals}function pr(t,e){const n=pf();if(n.has(t))return n.get(t);{const s=e();return n.set(t,s),n.get(t)}}const wo="Abs",No="Acos",So="Acosh",fr="Add",To="AddN",$o="All",Eo="Any",ko="ArgMax",vo="ArgMin",_o="Asin",Io="Asinh",xo="Atan",Ao="Atanh",Oo="Atan2",Do="AvgPool",ff="AvgPoolGrad",Fo="AvgPool3D",df="AvgPool3DGrad",Co="BatchMatMul",Ro="BatchToSpaceND",Lo="Bincount",Bo="BitwiseAnd",mf="BroadcastTo",Po="BroadcastArgs",dr="Cast",zo="Ceil",Vo="ClipByValue",Wo="Complex",Mo="ComplexAbs",jo="Concat",Uo="Conv2D",qo="Conv2DBackpropFilter",Go="Conv2DBackpropInput",Ho="Conv3D",gf="Conv3DBackpropFilterV2",Ko="Conv3DBackpropInputV2",Xo="Cos",Zo="Cosh",Jo="Cumprod",Yo="Cumsum",Qo="CropAndResize",ei="DenseBincount",ti="DepthToSpace",ni="DepthwiseConv2dNative",si="DepthwiseConv2dNativeBackpropFilter",ri="DepthwiseConv2dNativeBackpropInput",ai="Diag",oi="Dilation2D",yf="Dilation2DBackpropInput",bf="Dilation2DBackpropFilter",mr="Draw",ii="RealDiv",ui="Einsum",ci="Elu",wf="EluGrad",li="Erf",hi="Equal",pi="Exp",fi="ExpandDims",di="Expm1",mi="FFT",gi="Fill",yi="FlipLeftRight",bi="Floor",wi="FloorDiv",Ni="FusedBatchNorm",Si="GatherV2",Ti="GatherNd",$i="Greater",Ei="GreaterEqual",gr="Identity",ki="IFFT",vi="Imag",_i="IsFinite",Ii="IsInf",xi="IsNan",Ai="LeakyRelu",Oi="Less",Di="LessEqual",Fi="LinSpace",Ci="Log",Ri="Log1p",Li="LogicalAnd",Bi="LogicalNot",Pi="LogicalOr",Nf="LogicalXor",Sf="LogSoftmax",Tf="LowerBound",zi="LRN",$f="LRNGrad",Ef="MatrixBandPart",Vi="Max",Wi="Maximum",Mi="MaxPool",kf="MaxPoolGrad",ji="MaxPool3D",vf="MaxPool3DGrad",Ui="MaxPoolWithArgmax",qi="Mean",Gi="Min",Hi="Minimum",Ki="MirrorPad",Xi="Mod",Zi="Multinomial",Ji="Multiply",Yi="Neg",Qi="NotEqual",eu="NonMaxSuppressionV3",tu="NonMaxSuppressionV4",nu="NonMaxSuppressionV5",su="OnesLike",ru="OneHot",au="Pack",ou="PadV2",_f="Pool",iu="Pow",uu="Prelu",cu="Prod",lu="RaggedGather",hu="RaggedRange",pu="RaggedTensorToTensor",fu="Range",du="Real",mu="Reciprocal",gu="Relu",yu="Reshape",bu="ResizeNearestNeighbor",If="ResizeNearestNeighborGrad",wu="ResizeBilinear",xf="ResizeBilinearGrad",Nu="Relu6",Su="Reverse",Tu="Round",$u="Rsqrt",Eu="ScatterNd",ku="TensorScatterUpdate",vu="SearchSorted",_u="Select",Iu="Selu",xu="Slice",Au="Sin",Ou="Sinh",Du="Sign",Fu="Sigmoid",Cu="Softplus",Ru="Sqrt",Lu="Sum",Bu="SpaceToBatchND",Pu="SplitV",zu="Softmax",Vu="SparseFillEmptyRows",Wu="SparseReshape",Mu="SparseSegmentMean",ju="SparseSegmentSum",Uu="SparseToDense",qu="SquaredDifference",Af="Square",Gu="StaticRegexReplace",Hu="StridedSlice",Ku="StringNGrams",Xu="StringSplit",Zu="StringToHashBucketFast",Ju="Sub",Yu="Tan",Qu="Tanh",yr="Tile",ec="TopK",tc="Transform",Wn="Transpose",nc="Unique",sc="Unpack",rc="UnsortedSegmentSum",Of="UpperBound",ac="ZerosLike",oc="Step",Os="FromPixels",ic="RotateWithOffset",Ds="_FusedMatMul",Fs="FusedConv2D",Cs="FusedDepthwiseConv2D";/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function et(...t){R().getBool("IS_TEST")||R().getBool("PROD")||console.warn(...t)}function Df(...t){R().getBool("IS_TEST")||R().getBool("PROD")||console.log(...t)}/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Gt=pr("kernelRegistry",()=>new Map),pn=pr("gradRegistry",()=>new Map);function fn(t,e){const n=br(t,e);return Gt.get(n)}function Rs(t){return pn.get(t)}function Kn(t){const e=Gt.entries(),n=[];for(;;){const{done:s,value:r}=e.next();if(s)break;const[a,o]=r,[i]=a.split("_");i===t&&n.push(o)}return n}function uc(t){const{kernelName:e,backendName:n}=t,s=br(e,n);Gt.has(s)&&et(`The kernel '${e}' for backend '${n}' is already registered`),Gt.set(s,t)}function Ff(t){const{kernelName:e}=t;pn.has(e)&&R().getBool("DEBUG")&&et(`Overriding the gradient for '${e}'`),pn.set(e,t)}function Cf(t,e){const n=br(t,e);if(!Gt.has(n))throw new Error(`The kernel '${t}' for backend '${e}' is not registered`);Gt.delete(n)}function Rf(t){if(!pn.has(t))throw new Error(`The gradient '${t}' for backend is not registered`);pn.delete(t)}function Lf(t,e){Kn(t).forEach(s=>{const r=Object.assign({},s,{backendName:e});uc(r)})}function br(t,e){return`${e}_${t}`}/**
 * @license
 * Copyright 2023 Google LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function cc(t){return t instanceof Float32Array||t instanceof Int32Array||t instanceof Uint8Array||t instanceof Uint8ClampedArray}var lc=Z,ve=null;try{ve=new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([0,97,115,109,1,0,0,0,1,13,2,96,0,1,127,96,4,127,127,127,127,1,127,3,7,6,0,1,1,1,1,1,6,6,1,127,1,65,0,11,7,50,6,3,109,117,108,0,1,5,100,105,118,95,115,0,2,5,100,105,118,95,117,0,3,5,114,101,109,95,115,0,4,5,114,101,109,95,117,0,5,8,103,101,116,95,104,105,103,104,0,0,10,191,1,6,4,0,35,0,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,126,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,127,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,128,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,129,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,130,34,4,66,32,135,167,36,0,32,4,167,11])),{}).exports}catch{}function Z(t,e,n){this.low=t|0,this.high=e|0,this.unsigned=!!n}Z.prototype.__isLong__;Object.defineProperty(Z.prototype,"__isLong__",{value:!0});function Te(t){return(t&&t.__isLong__)===!0}Z.isLong=Te;var Aa={},Oa={};function Ct(t,e){var n,s,r;return e?(t>>>=0,(r=0<=t&&t<256)&&(s=Oa[t],s)?s:(n=J(t,(t|0)<0?-1:0,!0),r&&(Oa[t]=n),n)):(t|=0,(r=-128<=t&&t<128)&&(s=Aa[t],s)?s:(n=J(t,t<0?-1:0,!1),r&&(Aa[t]=n),n))}Z.fromInt=Ct;function _e(t,e){if(isNaN(t))return e?Nt:Ie;if(e){if(t<0)return Nt;if(t>=hc)return dc}else{if(t<=-Fa)return we;if(t+1>=Fa)return fc}return t<0?_e(-t,e).neg():J(t%Ht|0,t/Ht|0,e)}Z.fromNumber=_e;function J(t,e,n){return new Z(t,e,n)}Z.fromBits=J;var Xn=Math.pow;function wr(t,e,n){if(t.length===0)throw Error("empty string");if(t==="NaN"||t==="Infinity"||t==="+Infinity"||t==="-Infinity")return Ie;if(typeof e=="number"?(n=e,e=!1):e=!!e,n=n||10,n<2||36<n)throw RangeError("radix");var s;if((s=t.indexOf("-"))>0)throw Error("interior hyphen");if(s===0)return wr(t.substring(1),e,n).neg();for(var r=_e(Xn(n,8)),a=Ie,o=0;o<t.length;o+=8){var i=Math.min(8,t.length-o),u=parseInt(t.substring(o,o+i),n);if(i<8){var c=_e(Xn(n,i));a=a.mul(c).add(_e(u))}else a=a.mul(r),a=a.add(_e(u))}return a.unsigned=e,a}Z.fromString=wr;function Le(t,e){return typeof t=="number"?_e(t,e):typeof t=="string"?wr(t,e):J(t.low,t.high,typeof e=="boolean"?e:t.unsigned)}Z.fromValue=Le;var Da=65536,Bf=1<<24,Ht=Da*Da,hc=Ht*Ht,Fa=hc/2,Ca=Ct(Bf),Ie=Ct(0);Z.ZERO=Ie;var Nt=Ct(0,!0);Z.UZERO=Nt;var Vt=Ct(1);Z.ONE=Vt;var pc=Ct(1,!0);Z.UONE=pc;var Ls=Ct(-1);Z.NEG_ONE=Ls;var fc=J(-1,2147483647,!1);Z.MAX_VALUE=fc;var dc=J(-1,-1,!0);Z.MAX_UNSIGNED_VALUE=dc;var we=J(0,-2147483648,!1);Z.MIN_VALUE=we;var _=Z.prototype;_.toInt=function(){return this.unsigned?this.low>>>0:this.low};_.toNumber=function(){return this.unsigned?(this.high>>>0)*Ht+(this.low>>>0):this.high*Ht+(this.low>>>0)};_.toString=function(e){if(e=e||10,e<2||36<e)throw RangeError("radix");if(this.isZero())return"0";if(this.isNegative())if(this.eq(we)){var n=_e(e),s=this.div(n),r=s.mul(n).sub(this);return s.toString(e)+r.toInt().toString(e)}else return"-"+this.neg().toString(e);for(var a=_e(Xn(e,6),this.unsigned),o=this,i="";;){var u=o.div(a),c=o.sub(u.mul(a)).toInt()>>>0,h=c.toString(e);if(o=u,o.isZero())return h+i;for(;h.length<6;)h="0"+h;i=""+h+i}};_.getHighBits=function(){return this.high};_.getHighBitsUnsigned=function(){return this.high>>>0};_.getLowBits=function(){return this.low};_.getLowBitsUnsigned=function(){return this.low>>>0};_.getNumBitsAbs=function(){if(this.isNegative())return this.eq(we)?64:this.neg().getNumBitsAbs();for(var e=this.high!=0?this.high:this.low,n=31;n>0&&!(e&1<<n);n--);return this.high!=0?n+33:n+1};_.isZero=function(){return this.high===0&&this.low===0};_.eqz=_.isZero;_.isNegative=function(){return!this.unsigned&&this.high<0};_.isPositive=function(){return this.unsigned||this.high>=0};_.isOdd=function(){return(this.low&1)===1};_.isEven=function(){return(this.low&1)===0};_.equals=function(e){return Te(e)||(e=Le(e)),this.unsigned!==e.unsigned&&this.high>>>31===1&&e.high>>>31===1?!1:this.high===e.high&&this.low===e.low};_.eq=_.equals;_.notEquals=function(e){return!this.eq(e)};_.neq=_.notEquals;_.ne=_.notEquals;_.lessThan=function(e){return this.comp(e)<0};_.lt=_.lessThan;_.lessThanOrEqual=function(e){return this.comp(e)<=0};_.lte=_.lessThanOrEqual;_.le=_.lessThanOrEqual;_.greaterThan=function(e){return this.comp(e)>0};_.gt=_.greaterThan;_.greaterThanOrEqual=function(e){return this.comp(e)>=0};_.gte=_.greaterThanOrEqual;_.ge=_.greaterThanOrEqual;_.compare=function(e){if(Te(e)||(e=Le(e)),this.eq(e))return 0;var n=this.isNegative(),s=e.isNegative();return n&&!s?-1:!n&&s?1:this.unsigned?e.high>>>0>this.high>>>0||e.high===this.high&&e.low>>>0>this.low>>>0?-1:1:this.sub(e).isNegative()?-1:1};_.comp=_.compare;_.negate=function(){return!this.unsigned&&this.eq(we)?we:this.not().add(Vt)};_.neg=_.negate;_.add=function(e){Te(e)||(e=Le(e));var n=this.high>>>16,s=this.high&65535,r=this.low>>>16,a=this.low&65535,o=e.high>>>16,i=e.high&65535,u=e.low>>>16,c=e.low&65535,h=0,l=0,f=0,d=0;return d+=a+c,f+=d>>>16,d&=65535,f+=r+u,l+=f>>>16,f&=65535,l+=s+i,h+=l>>>16,l&=65535,h+=n+o,h&=65535,J(f<<16|d,h<<16|l,this.unsigned)};_.subtract=function(e){return Te(e)||(e=Le(e)),this.add(e.neg())};_.sub=_.subtract;_.multiply=function(e){if(this.isZero())return Ie;if(Te(e)||(e=Le(e)),ve){var n=ve.mul(this.low,this.high,e.low,e.high);return J(n,ve.get_high(),this.unsigned)}if(e.isZero())return Ie;if(this.eq(we))return e.isOdd()?we:Ie;if(e.eq(we))return this.isOdd()?we:Ie;if(this.isNegative())return e.isNegative()?this.neg().mul(e.neg()):this.neg().mul(e).neg();if(e.isNegative())return this.mul(e.neg()).neg();if(this.lt(Ca)&&e.lt(Ca))return _e(this.toNumber()*e.toNumber(),this.unsigned);var s=this.high>>>16,r=this.high&65535,a=this.low>>>16,o=this.low&65535,i=e.high>>>16,u=e.high&65535,c=e.low>>>16,h=e.low&65535,l=0,f=0,d=0,y=0;return y+=o*h,d+=y>>>16,y&=65535,d+=a*h,f+=d>>>16,d&=65535,d+=o*c,f+=d>>>16,d&=65535,f+=r*h,l+=f>>>16,f&=65535,f+=a*c,l+=f>>>16,f&=65535,f+=o*u,l+=f>>>16,f&=65535,l+=s*h+r*c+a*u+o*i,l&=65535,J(d<<16|y,l<<16|f,this.unsigned)};_.mul=_.multiply;_.divide=function(e){if(Te(e)||(e=Le(e)),e.isZero())throw Error("division by zero");if(ve){if(!this.unsigned&&this.high===-2147483648&&e.low===-1&&e.high===-1)return this;var n=(this.unsigned?ve.div_u:ve.div_s)(this.low,this.high,e.low,e.high);return J(n,ve.get_high(),this.unsigned)}if(this.isZero())return this.unsigned?Nt:Ie;var s,r,a;if(this.unsigned){if(e.unsigned||(e=e.toUnsigned()),e.gt(this))return Nt;if(e.gt(this.shru(1)))return pc;a=Nt}else{if(this.eq(we)){if(e.eq(Vt)||e.eq(Ls))return we;if(e.eq(we))return Vt;var o=this.shr(1);return s=o.div(e).shl(1),s.eq(Ie)?e.isNegative()?Vt:Ls:(r=this.sub(e.mul(s)),a=s.add(r.div(e)),a)}else if(e.eq(we))return this.unsigned?Nt:Ie;if(this.isNegative())return e.isNegative()?this.neg().div(e.neg()):this.neg().div(e).neg();if(e.isNegative())return this.div(e.neg()).neg();a=Ie}for(r=this;r.gte(e);){s=Math.max(1,Math.floor(r.toNumber()/e.toNumber()));for(var i=Math.ceil(Math.log(s)/Math.LN2),u=i<=48?1:Xn(2,i-48),c=_e(s),h=c.mul(e);h.isNegative()||h.gt(r);)s-=u,c=_e(s,this.unsigned),h=c.mul(e);c.isZero()&&(c=Vt),a=a.add(c),r=r.sub(h)}return a};_.div=_.divide;_.modulo=function(e){if(Te(e)||(e=Le(e)),ve){var n=(this.unsigned?ve.rem_u:ve.rem_s)(this.low,this.high,e.low,e.high);return J(n,ve.get_high(),this.unsigned)}return this.sub(this.div(e).mul(e))};_.mod=_.modulo;_.rem=_.modulo;_.not=function(){return J(~this.low,~this.high,this.unsigned)};_.and=function(e){return Te(e)||(e=Le(e)),J(this.low&e.low,this.high&e.high,this.unsigned)};_.or=function(e){return Te(e)||(e=Le(e)),J(this.low|e.low,this.high|e.high,this.unsigned)};_.xor=function(e){return Te(e)||(e=Le(e)),J(this.low^e.low,this.high^e.high,this.unsigned)};_.shiftLeft=function(e){return Te(e)&&(e=e.toInt()),(e&=63)===0?this:e<32?J(this.low<<e,this.high<<e|this.low>>>32-e,this.unsigned):J(0,this.low<<e-32,this.unsigned)};_.shl=_.shiftLeft;_.shiftRight=function(e){return Te(e)&&(e=e.toInt()),(e&=63)===0?this:e<32?J(this.low>>>e|this.high<<32-e,this.high>>e,this.unsigned):J(this.high>>e-32,this.high>=0?0:-1,this.unsigned)};_.shr=_.shiftRight;_.shiftRightUnsigned=function(e){if(Te(e)&&(e=e.toInt()),e&=63,e===0)return this;var n=this.high;if(e<32){var s=this.low;return J(s>>>e|n<<32-e,n>>>e,this.unsigned)}else return e===32?J(n,0,this.unsigned):J(n>>>e-32,0,this.unsigned)};_.shru=_.shiftRightUnsigned;_.shr_u=_.shiftRightUnsigned;_.toSigned=function(){return this.unsigned?J(this.low,this.high,!1):this};_.toUnsigned=function(){return this.unsigned?this:J(this.low,this.high,!0)};_.toBytes=function(e){return e?this.toBytesLE():this.toBytesBE()};_.toBytesLE=function(){var e=this.high,n=this.low;return[n&255,n>>>8&255,n>>>16&255,n>>>24,e&255,e>>>8&255,e>>>16&255,e>>>24]};_.toBytesBE=function(){var e=this.high,n=this.low;return[e>>>24,e>>>16&255,e>>>8&255,e&255,n>>>24,n>>>16&255,n>>>8&255,n&255]};Z.fromBytes=function(e,n,s){return s?Z.fromBytesLE(e,n):Z.fromBytesBE(e,n)};Z.fromBytesLE=function(e,n){return new Z(e[0]|e[1]<<8|e[2]<<16|e[3]<<24,e[4]|e[5]<<8|e[6]<<16|e[7]<<24,n)};Z.fromBytesBE=function(e,n){return new Z(e[4]<<24|e[5]<<16|e[6]<<8|e[7],e[0]<<24|e[1]<<16|e[2]<<8|e[3],n)};const mc=zp(lc),Pf=Wp({__proto__:null,default:mc},[lc]);/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const yt=mc||Pf;function _n(t){return yt.fromString(t,!0,16)}const gc=_n("c3a5c85c97cb3127"),gt=_n("b492b66fbe98f273"),le=_n("9ae16a3b2f90404f");function Bs(t){return t.xor(t.shru(47))}function yc(t,e,n){const s=t.slice(e,e+n);return yt.fromBytes(Array.from(s),!0,!0)}function G(t,e){return yc(t,e,8)}function Ra(t,e){return yc(t,e,4)}function re(t,e){return e===0?t:t.shru(e).or(t.shl(64-e))}function at(t,e,n=_n("9ddfea08eb382d69")){let s=t.xor(e).mul(n);s=s.xor(s.shru(47));let r=e.xor(s).mul(n);return r=r.xor(r.shru(47)),r=r.mul(n),r}function zf(t,e,n,s,r,a){r=r.add(t),a=re(a.add(r).add(s),21);const o=r;return r=r.add(e),r=r.add(n),a=a.add(re(r,44)),[r.add(s),a.add(o)]}function Pn(t,e,n,s){return zf(G(t,e),G(t,e+8),G(t,e+16),G(t,e+24),n,s)}function Vf(t,e=t.length){if(e>=8){const n=le.add(e*2),s=G(t,0).add(le),r=G(t,e-8),a=re(r,37).mul(n).add(s),o=re(s,25).add(r).mul(n);return at(a,o,n)}if(e>=4){const n=le.add(e*2),s=Ra(t,0);return at(s.shl(3).add(e),Ra(t,e-4),n)}if(e>0){const n=t[0],s=t[e>>1],r=t[e-1],a=n+(s<<8),o=e+(r<<2);return Bs(le.mul(a).xor(gc.mul(o))).mul(le)}return le}function Wf(t,e=t.length){const n=le.add(e*2),s=G(t,0).mul(gt),r=G(t,8),a=G(t,e-8).mul(n),o=G(t,e-16).mul(le);return at(re(s.add(r),43).add(re(a,30)).add(o),s.add(re(r.add(le),18)).add(a),n)}function Mf(t,e=t.length){const n=le.add(e*2),s=G(t,0).mul(le),r=G(t,8),a=G(t,e-8).mul(n),o=G(t,e-16).mul(le),i=re(s.add(r),43).add(re(a,30)).add(o),u=at(i,s.add(re(r.add(le),18)).add(a),n),c=G(t,16).mul(n),h=G(t,24),l=i.add(G(t,e-32)).mul(n),f=u.add(G(t,e-24)).mul(n);return at(re(c.add(h),43).add(re(l,30)).add(f),c.add(re(h.add(s),18)).add(l),n)}function jf(t,e=t.length){const n=yt.fromNumber(81,!0);if(e<=32)return e<=16?Vf(t,e):Wf(t,e);if(e<=64)return Mf(t,e);let s=n,r=n.mul(gt).add(113),a=Bs(r.mul(le).add(113)).mul(le),o=[yt.UZERO,yt.UZERO],i=[yt.UZERO,yt.UZERO];s=s.mul(le).add(G(t,0));let u=0;const c=(e-1>>6)*64,h=c+(e-1&63)-63;do s=re(s.add(r).add(o[0]).add(G(t,u+8)),37).mul(gt),r=re(r.add(o[1]).add(G(t,u+48)),42).mul(gt),s=s.xor(i[1]),r=r.add(o[0]).add(G(t,u+40)),a=re(a.add(i[0]),33).mul(gt),o=Pn(t,u,o[1].mul(gt),s.add(i[0])),i=Pn(t,u+32,a.add(i[1]),r.add(G(t,u+16))),[a,s]=[s,a],u+=64;while(u!==c);const l=gt.add(a.and(255).shl(1));return u=h,i[0]=i[0].add(e-1&63),o[0]=o[0].add(i[0]),i[0]=i[0].add(o[0]),s=re(s.add(r).add(o[0]).add(G(t,u+8)),37).mul(l),r=re(r.add(o[1]).add(G(t,u+48)),42).mul(l),s=s.xor(i[1].mul(9)),r=r.add(o[0].mul(9).add(G(t,u+40))),a=re(a.add(i[0]),33).mul(l),o=Pn(t,u,o[1].mul(l),s.add(i[0])),i=Pn(t,u+32,a.add(i[1]),r.add(G(t,u+16))),[a,s]=[s,a],at(at(o[0],i[0],l).add(Bs(r).mul(gc)).add(a),at(o[1],i[1],l).add(s),l)}/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Uf(t,e){return e==="string"?In(t):is([t],e)}function qf(t,e){return t instanceof Float32Array&&e==="float32"||t instanceof Int32Array&&e==="int32"||t instanceof Uint8Array&&e==="bool"}function is(t,e){if(e==="string")throw new Error("Cannot convert a string[] to a TypedArray");if(Array.isArray(t)&&(t=ut(t)),R().getBool("DEBUG")&&lo(t,e),qf(t,e))return t;if(e==null||e==="float32"||e==="complex64")return new Float32Array(t);if(e==="int32")return new Int32Array(t);if(e==="bool"){const n=new Uint8Array(t.length);for(let s=0;s<n.length;++s)Math.round(t[s])!==0&&(n[s]=1);return n}else throw new Error(`Unknown data type ${e}`)}function dn(){return R().platform.now()}function Gf(t,e){return R().platform.fetch(t,e)}function In(t,e="utf-8"){return e=e||"utf-8",R().platform.encode(t,e)}function Zn(t,e="utf-8"){return e=e||"utf-8",R().platform.decode(t,e)}function ae(t){return R().platform.isTypedArray!=null?R().platform.isTypedArray(t):cc(t)}function ut(t,e=[],n=!1){if(e==null&&(e=[]),typeof t=="boolean"||typeof t=="number"||typeof t=="string"||it(t)||t==null||ae(t)&&n)e.push(t);else if(Array.isArray(t)||ae(t))for(let s=0;s<t.length;++s)ut(t[s],e,n);else{let s=-1;for(const r of Object.keys(t))/^([1-9]+[0-9]*|0)$/.test(r)&&(s=Math.max(s,Number(r)));for(let r=0;r<=s;r++)ut(t[r],e,n)}return e}const Hf=Object.freeze(Object.defineProperty({__proto__:null,arraysEqual:Re,arraysEqualWithNull:io,assert:g,assertNonNegativeIntegerDimensions:Se,assertNonNull:Ft,assertShapesMatch:fe,bytesFromStringArray:po,bytesPerElement:Gn,checkConversionForErrors:lo,clamp:hn,computeStrides:en,convertBackendValuesAndArrayBuffer:sf,createScalarValue:Uf,createShuffledIndices:Qp,decodeString:Zn,distSquared:Xp,encodeString:In,fetch:Gf,fingerPrint64:jf,flatten:ut,getArrayFromDType:cr,getTypedArrayFromDType:co,hasEncodingLoss:nf,hexToLong:_n,indexToLoc:of,inferDtype:vn,inferFromImplicitShape:tf,isBoolean:fo,isFunction:ot,isInt:qt,isNumber:mo,isPromise:it,isScalarShape:Zp,isString:nt,isTypedArray:ae,isValidDtype:ho,locToIndex:af,makeOnesTypedArray:lr,makeZerosNestedTypedArray:rf,makeZerosTypedArray:os,nearestDivisor:Hn,nearestLargerEven:Gp,now:dn,parseAxisParam:kn,randUniform:Kp,repeatedTry:ef,rightPad:cn,shuffle:oo,shuffleCombo:qp,sizeFromShape:j,sizeToSquarishShape:Yp,squeezeShape:uo,sum:Hp,swap:qn,tanh:Jp,toNestedArray:Tt,toTypedArray:is},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Kf{constructor(e,n){this.backendTimer=e,this.logger=n,n==null&&(this.logger=new Zf)}profileKernel(e,n,s){let r;const a=()=>{r=s()};let o;const i=dn();if(this.backendTimer.timerAvailable())o=this.backendTimer.time(a);else{a();for(const c of r)c.dataSync();o=Promise.resolve({kernelMs:dn()-i})}if(R().getBool("CHECK_COMPUTATION_FOR_ERRORS"))for(let c=0;c<r.length;c++){const h=r[c];h.data().then(l=>{Xf(l,h.dtype,e)})}return{kernelName:e,outputs:r,inputs:n,timeMs:o.then(c=>c.kernelMs),extraInfo:o.then(c=>c.getExtraProfileInfo!=null?c.getExtraProfileInfo():"")}}logKernelProfile(e){const{kernelName:n,outputs:s,timeMs:r,inputs:a,extraInfo:o}=e;s.forEach(i=>{Promise.all([i.data(),r,o]).then(u=>{this.logger.logKernelProfile(n,i,u[0],u[1],a,u[2])})})}}function Xf(t,e,n){if(e!=="float32")return!1;for(let s=0;s<t.length;s++){const r=t[s];if(isNaN(r)||!isFinite(r))return console.warn(`Found ${r} in the result of '${n}'`),!0}return!1}class Zf{logKernelProfile(e,n,s,r,a,o){const i=typeof r=="number"?cn(`${r}ms`,9):r.error,u=cn(e,25),c=n.rank,h=n.size,l=cn(n.shape.toString(),14);let f="";for(const d in a){const y=a[d];if(y!=null){const S=y.shape||n.shape,N=S.length;f+=`${d}: ${N}D ${N>0?S:""} `}}console.log(`%c${u}	%c${i}	%c${c}D ${l}	%c${h}	%c${f}	%c${o}`,"font-weight:bold","color:red","color:blue","color: orange","color: green","color: steelblue")}}/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Jf(t,e,n){const s={},r={};for(let u=0;u<e.length;u++)s[e[u].id]=!0;for(let u=0;u<t.length;u++){const c=t[u],h=c.inputs;for(const l in h){const f=h[l];let d=!1;for(let y=0;y<e.length;y++)if(s[f.id]){c.outputs.forEach(S=>s[S.id]=!0),d=!0,r[c.id]=!0;break}if(d)break}}const a={};a[n.id]=!0;const o={};for(let u=t.length-1;u>=0;u--){const c=t[u],h=c.inputs;for(let l=0;l<c.outputs.length;l++)if(a[c.outputs[l].id]){for(const f in h)a[h[f].id]=!0,o[c.id]=!0;break}}const i=[];for(let u=0;u<t.length;u++){const c=t[u];if(r[c.id]&&o[c.id]){const h={};for(const f in c.inputs){const d=c.inputs[f];s[d.id]&&(h[f]=d)}const l=Object.assign({},c);l.inputs=h,l.outputs=c.outputs,i.push(l)}}return i}function Yf(t,e,n,s){for(let r=e.length-1;r>=0;r--){const a=e[r],o=[];if(a.outputs.forEach(u=>{const c=t[u.id];c!=null?o.push(c):o.push(null)}),a.gradient==null)throw new Error(`Cannot compute gradient: gradient function not found for ${a.kernelName}.`);const i=a.gradient(o);for(const u in a.inputs){if(!(u in i))throw new Error(`Cannot backprop through input ${u}. Available gradients found: ${Object.keys(i)}.`);const c=n(()=>i[u]());if(c.dtype!=="float32")throw new Error(`Error in gradient for op ${a.kernelName}. The gradient of input ${u} must have 'float32' dtype, but has '${c.dtype}'`);const h=a.inputs[u];if(!Re(c.shape,h.shape))throw new Error(`Error in gradient for op ${a.kernelName}. The gradient of input '${u}' has shape '${c.shape}', which does not match the shape of the input '${h.shape}'`);if(t[h.id]==null)t[h.id]=c;else{const l=t[h.id];t[h.id]=s(l,c),l.dispose()}}}}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const La=20,rn=3,ks=7;function Qf(t,e,n,s){const r=en(e),a=ed(t,e,n,r),o=e.length,i=Mn(t,e,n,r,a),u=["Tensor"];return s&&(u.push(`  dtype: ${n}`),u.push(`  rank: ${o}`),u.push(`  shape: [${e}]`),u.push("  values:")),u.push(i.map(c=>"    "+c).join(`
`)),u.join(`
`)}function ed(t,e,n,s){const r=j(e),a=s[s.length-1],o=new Array(a).fill(0),i=e.length,u=n==="complex64"?un(t):t;if(i>1)for(let c=0;c<r/a;c++){const h=c*a;for(let l=0;l<a;l++)o[l]=Math.max(o[l],on(u[h+l],0,n).length)}return o}function on(t,e,n){let s;return Array.isArray(t)?s=`${parseFloat(t[0].toFixed(ks))} + ${parseFloat(t[1].toFixed(ks))}j`:nt(t)?s=`'${t}'`:n==="bool"?s=bc(t):s=parseFloat(t.toFixed(ks)).toString(),cn(s,e)}function bc(t){return t===0?"false":"true"}function Mn(t,e,n,s,r,a=!0){const o=n==="complex64"?2:1,i=e[0],u=e.length;if(u===0){if(n==="complex64"){const S=un(t);return[on(S[0],0,n)]}return n==="bool"?[bc(t[0])]:[t[0].toString()]}if(u===1){if(i>La){const N=rn*o;let T=Array.from(t.slice(0,N)),A=Array.from(t.slice((i-rn)*o,i*o));return n==="complex64"&&(T=un(T),A=un(A)),["["+T.map((E,k)=>on(E,r[k],n)).join(", ")+", ..., "+A.map((E,k)=>on(E,r[i-rn+k],n)).join(", ")+"]"]}return["["+(n==="complex64"?un(t):Array.from(t)).map((N,T)=>on(N,r[T],n)).join(", ")+"]"]}const c=e.slice(1),h=s.slice(1),l=s[0]*o,f=[];if(i>La){for(let S=0;S<rn;S++){const N=S*l,T=N+l;f.push(...Mn(t.slice(N,T),c,n,h,r,!1))}f.push("...");for(let S=i-rn;S<i;S++){const N=S*l,T=N+l;f.push(...Mn(t.slice(N,T),c,n,h,r,S===i-1))}}else for(let S=0;S<i;S++){const N=S*l,T=N+l;f.push(...Mn(t.slice(N,T),c,n,h,r,S===i-1))}const d=u===2?",":"";f[0]="["+(i>0?f[0]+d:"");for(let S=1;S<f.length-1;S++)f[S]=" "+f[S]+d;let y=`,
`;for(let S=2;S<u;S++)y+=`
`;return f[f.length-1]=" "+f[f.length-1]+"]"+(a?"":y),f}function un(t){const e=[];for(let n=0;n<t.length;n+=2)e.push([t[n],t[n+1]]);return e}/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Jn{constructor(e,n,s){if(this.dtype=n,this.shape=e.slice(),this.size=j(e),s!=null){const r=s.length;g(r===this.size,()=>`Length of values '${r}' does not match the size inferred by the shape '${this.size}'.`)}if(n==="complex64")throw new Error("complex64 dtype TensorBuffers are not supported. Please create a TensorBuffer for the real and imaginary parts separately and call tf.complex(real, imag).");this.values=s||cr(n,this.size),this.strides=en(e)}set(e,...n){n.length===0&&(n=[0]),g(n.length===this.rank,()=>`The number of provided coordinates (${n.length}) must match the rank (${this.rank})`);const s=this.locToIndex(n);this.values[s]=e}get(...e){e.length===0&&(e=[0]);let n=0;for(const r of e){if(r<0||r>=this.shape[n]){const a=`Requested out of range element at ${e}.   Buffer shape=${this.shape}`;throw new Error(a)}n++}let s=e[e.length-1];for(let r=0;r<e.length-1;++r)s+=this.strides[r]*e[r];return this.values[s]}locToIndex(e){if(this.rank===0)return 0;if(this.rank===1)return e[0];let n=e[e.length-1];for(let s=0;s<e.length-1;++s)n+=this.strides[s]*e[s];return n}indexToLoc(e){if(this.rank===0)return[];if(this.rank===1)return[e];const n=new Array(this.shape.length);for(let s=0;s<n.length-1;++s)n[s]=Math.floor(e/this.strides[s]),e-=n[s]*this.strides[s];return n[n.length-1]=e,n}get rank(){return this.shape.length}toTensor(){return Oe().makeTensor(this.values,this.shape,this.dtype)}}let Oe=null,Pt=null;function td(t){Oe=t}function nd(t){Pt=t}class te{constructor(e,n,s,r){this.kept=!1,this.isDisposedInternal=!1,this.shape=e.slice(),this.dtype=n||"float32",this.size=j(e),this.strides=en(e),this.dataId=s,this.id=r,this.rankType=this.rank<5?this.rank.toString():"higher"}get rank(){return this.shape.length}async buffer(){const e=await this.data();return Pt.buffer(this.shape,this.dtype,e)}bufferSync(){return Pt.buffer(this.shape,this.dtype,this.dataSync())}async array(){const e=await this.data();return Tt(this.shape,e,this.dtype==="complex64")}arraySync(){return Tt(this.shape,this.dataSync(),this.dtype==="complex64")}async data(){this.throwIfDisposed();const e=Oe().read(this.dataId);if(this.dtype==="string"){const n=await e;try{return n.map(s=>Zn(s))}catch{throw new Error("Failed to decode the string bytes into utf-8. To get the original bytes, call tensor.bytes().")}}return e}dataToGPU(e){return this.throwIfDisposed(),Oe().readToGPU(this.dataId,e)}dataSync(){this.throwIfDisposed();const e=Oe().readSync(this.dataId);if(this.dtype==="string")try{return e.map(n=>Zn(n))}catch{throw new Error("Failed to decode the string bytes into utf-8. To get the original bytes, call tensor.bytes().")}return e}async bytes(){this.throwIfDisposed();const e=await Oe().read(this.dataId);return this.dtype==="string"?e:new Uint8Array(e.buffer)}dispose(){this.isDisposed||(this.kerasMask&&this.kerasMask.dispose(),Oe().disposeTensor(this),this.isDisposedInternal=!0)}get isDisposed(){return this.isDisposedInternal}throwIfDisposed(){if(this.isDisposed)throw new Error("Tensor is disposed.")}print(e=!1){return Pt.print(this,e)}clone(){return this.throwIfDisposed(),Pt.clone(this)}toString(e=!1){const n=this.dataSync();return Qf(n,this.shape,this.dtype,e)}cast(e){return this.throwIfDisposed(),Pt.cast(this,e)}variable(e=!0,n,s){return this.throwIfDisposed(),Oe().makeVariable(this,e,n,s)}}Object.defineProperty(te,Symbol.hasInstance,{value:t=>!!t&&t.data!=null&&t.dataSync!=null&&t.throwIfDisposed!=null});function wc(){return pr("Tensor",()=>te)}wc();class mn extends te{constructor(e,n,s,r){super(e.shape,e.dtype,e.dataId,r),this.trainable=n,this.name=s}assign(e){if(e.dtype!==this.dtype)throw new Error(`dtype of the new value (${e.dtype}) and previous value (${this.dtype}) must match`);if(!Re(e.shape,this.shape))throw new Error(`shape of the new value (${e.shape}) and previous value (${this.shape}) must match`);Oe().disposeTensor(this),this.dataId=e.dataId,Oe().incRef(this,null)}dispose(){Oe().disposeVariable(this),this.isDisposedInternal=!0}}Object.defineProperty(mn,Symbol.hasInstance,{value:t=>t instanceof te&&t.assign!=null&&t.assign instanceof Function});/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */var Ps;(function(t){t.R0="R0",t.R1="R1",t.R2="R2",t.R3="R3",t.R4="R4",t.R5="R5",t.R6="R6"})(Ps||(Ps={}));var zs;(function(t){t.float32="float32",t.int32="int32",t.bool="int32",t.complex64="complex64"})(zs||(zs={}));var Vs;(function(t){t.float32="float32",t.int32="int32",t.bool="bool",t.complex64="complex64"})(Vs||(Vs={}));var Ws;(function(t){t.float32="float32",t.int32="float32",t.bool="float32",t.complex64="complex64"})(Ws||(Ws={}));var Ms;(function(t){t.float32="complex64",t.int32="complex64",t.bool="complex64",t.complex64="complex64"})(Ms||(Ms={}));const sd={float32:Ws,int32:zs,bool:Vs,complex64:Ms};function us(t,e){if(t==="string"||e==="string"){if(t==="string"&&e==="string")return"string";throw new Error(`Can not upcast ${t} with ${e}`)}return sd[t][e]}function rd(t){return us(t,"int32")}function Nc(t){return t!=null&&typeof t=="object"&&"texture"in t&&t.texture instanceof WebGLTexture}function Sc(t){return typeof GPUBuffer<"u"&&t!=null&&typeof t=="object"&&"buffer"in t&&t.buffer instanceof GPUBuffer}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ee(t,e){if(t.dtype===e.dtype)return[t,e];const n=us(t.dtype,e.dtype);return[t.cast(n),e.cast(n)]}function Tc(t,e){g(t.dtype===e.dtype,()=>`The dtypes of the first(${t.dtype}) and second(${e.dtype}) input must match`)}function ad(t,e){return e.some(n=>n.id===t.id)}function Nr(t){const e=[];return $c(t,e,new Set),e}function $c(t,e,n){if(t==null)return;if(t instanceof te){e.push(t);return}if(!od(t))return;const s=t;for(const r in s){const a=s[r];n.has(a)||(n.add(a),$c(a,e,n))}}function od(t){return Array.isArray(t)||typeof t=="object"}const id=Object.freeze(Object.defineProperty({__proto__:null,assertTypesMatch:Tc,getTensorsInContainer:Nr,isTensorInList:ad,makeTypesMatch:ee},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function vs(t){return t.kernelName!=null}class Ba{constructor(){this.registeredVariables={},this.nextTapeNodeId=0,this.numBytes=0,this.numTensors=0,this.numStringTensors=0,this.numDataBuffers=0,this.gradientDepth=0,this.kernelDepth=0,this.scopeStack=[],this.numDataMovesStack=[],this.nextScopeId=0,this.tensorInfo=new WeakMap,this.profiling=!1,this.activeProfile={newBytes:0,newTensors:0,peakBytes:0,kernels:[],result:null,get kernelNames(){return Array.from(new Set(this.kernels.map(e=>e.name)))}}}dispose(){for(const e in this.registeredVariables)this.registeredVariables[e].dispose()}}class Kt{constructor(e){this.ENV=e,this.registry={},this.registryFactory={},this.pendingBackendInitId=0,this.state=new Ba}async ready(){if(this.pendingBackendInit!=null)return this.pendingBackendInit.then(()=>{});if(this.backendInstance!=null)return;const e=this.getSortedBackends();for(let n=0;n<e.length;n++){const s=e[n];if(await this.initializeBackend(s).success){await this.setBackend(s);return}}throw new Error("Could not initialize any backends, all backend initializations failed.")}get backend(){if(this.pendingBackendInit!=null)throw new Error(`Backend '${this.backendName}' has not yet been initialized. Make sure to await tf.ready() or await tf.setBackend() before calling other methods`);if(this.backendInstance==null){const{name:e,asyncInit:n}=this.initializeBackendsAndReturnBest();if(n)throw new Error(`The highest priority backend '${e}' has not yet been initialized. Make sure to await tf.ready() or await tf.setBackend() before calling other methods`);this.setBackend(e)}return this.backendInstance}backendNames(){return Object.keys(this.registryFactory)}findBackend(e){if(!(e in this.registry))if(e in this.registryFactory){const{asyncInit:n}=this.initializeBackend(e);if(n)return null}else return null;return this.registry[e]}findBackendFactory(e){return e in this.registryFactory?this.registryFactory[e].factory:null}registerBackend(e,n,s=1){return e in this.registryFactory?(et(`${e} backend was already registered. Reusing existing backend factory.`),!1):(this.registryFactory[e]={factory:n,priority:s},!0)}async setBackend(e){if(this.registryFactory[e]==null)throw new Error(`Backend name '${e}' not found in registry`);if(this.backendName=e,this.registry[e]==null){this.backendInstance=null;const{success:n,asyncInit:s}=this.initializeBackend(e);if(!(s?await n:n))return!1}return this.backendInstance=this.registry[e],this.setupRegisteredKernels(),this.profiler=new Kf(this.backendInstance),!0}setupRegisteredKernels(){Kn(this.backendName).forEach(n=>{n.setupFunc!=null&&n.setupFunc(this.backendInstance)})}disposeRegisteredKernels(e){Kn(e).forEach(s=>{s.disposeFunc!=null&&s.disposeFunc(this.registry[e])})}initializeBackend(e){const n=this.registryFactory[e];if(n==null)throw new Error(`Cannot initialize backend ${e}, no registration found.`);try{const s=n.factory();if(s&&!(s instanceof ao)&&typeof s.then=="function"){const r=++this.pendingBackendInitId,a=s.then(o=>r<this.pendingBackendInitId?!1:(this.registry[e]=o,this.pendingBackendInit=null,!0)).catch(o=>(r<this.pendingBackendInitId||(this.pendingBackendInit=null,et(`Initialization of backend ${e} failed`),et(o.stack||o.message)),!1));return this.pendingBackendInit=a,{success:a,asyncInit:!0}}else return this.registry[e]=s,{success:!0,asyncInit:!1}}catch(s){return et(`Initialization of backend ${e} failed`),et(s.stack||s.message),{success:!1,asyncInit:!1}}}removeBackend(e){if(!(e in this.registryFactory))throw new Error(`${e} backend not found in registry`);this.backendName===e&&this.pendingBackendInit!=null&&this.pendingBackendInitId++,e in this.registry&&(this.disposeRegisteredKernels(e),this.registry[e].dispose(),delete this.registry[e]),delete this.registryFactory[e],this.backendName===e&&(this.pendingBackendInit=null,this.backendName=null,this.backendInstance=null)}getSortedBackends(){if(Object.keys(this.registryFactory).length===0)throw new Error("No backend found in registry.");return Object.keys(this.registryFactory).sort((e,n)=>this.registryFactory[n].priority-this.registryFactory[e].priority)}initializeBackendsAndReturnBest(){const e=this.getSortedBackends();for(let n=0;n<e.length;n++){const s=e[n],{success:r,asyncInit:a}=this.initializeBackend(s);if(a||r)return{name:s,asyncInit:a}}throw new Error("Could not initialize any backends, all backend initializations failed.")}moveData(e,n){const s=this.state.tensorInfo.get(n),r=s.backend,a=this.readSync(n),o=r.refCount(n);r.disposeData(n,!0),s.backend=e,e.move(n,a,s.shape,s.dtype,o),this.shouldCheckForMemLeaks()&&this.state.numDataMovesStack[this.state.numDataMovesStack.length-1]++}tidy(e,n){let s=null;if(n==null){if(typeof e!="function")throw new Error("Please provide a function to tidy()");n=e}else{if(typeof e!="string"&&!(e instanceof String))throw new Error("When calling with two arguments, the first argument to tidy() must be a string");if(typeof n!="function")throw new Error("When calling with two arguments, the 2nd argument to tidy() must be a function");s=e}let r;return this.scopedRun(()=>this.startScope(s),()=>this.endScope(r),()=>(r=n(),r instanceof Promise&&console.error("Cannot return a Promise inside of tidy."),r))}scopedRun(e,n,s){e();try{const r=s();return n(),r}catch(r){throw n(),r}}nextTensorId(){return Kt.nextTensorId++}nextVariableId(){return Kt.nextVariableId++}clone(e){const n=w.runKernel(gr,{x:e}),s={x:e},r=o=>({x:()=>{const i="float32",u={x:o},c={dtype:i};return w.runKernel(dr,u,c)}}),a=[];return this.addTapeNode(this.state.activeScope.name,s,[n],r,a,{}),n}runKernel(e,n,s){if(this.backendName==null&&this.backend,!(fn(e,this.backendName)!=null))throw new Error(`Kernel '${e}' not registered for backend '${this.backendName}'`);return this.runKernelFunc({kernelName:e,inputs:n,attrs:s})}shouldCheckForMemLeaks(){return this.ENV.getBool("IS_TEST")}checkKernelForMemLeak(e,n,s){const r=this.backend.numDataIds();let a=0;s.forEach(u=>{a+=u.dtype==="complex64"?3:1});const o=this.state.numDataMovesStack[this.state.numDataMovesStack.length-1],i=r-n-a-o;if(i>0)throw new Error(`Backend '${this.backendName}' has an internal memory leak (${i} data ids) after running '${e}'`)}runKernelFunc(e){let n,s=[];const r=this.isTapeOn(),a=this.state.numBytes,o=this.state.numTensors;this.shouldCheckForMemLeaks()&&this.state.numDataMovesStack.push(0);let i;this.backendName==null&&this.backend;let u;const c=vs(e)?e.kernelName:this.state.activeScope!=null?this.state.activeScope.name:"";if(vs(e)){const{kernelName:y,inputs:S,attrs:N}=e;this.backendName==null&&this.backend;const T=fn(y,this.backendName);g(T!=null,()=>`Cannot find registered kernel '${y}' for backend '${this.backendName}'`),i=()=>{const A=this.backend.numDataIds();u=T.kernelFunc({inputs:S,attrs:N,backend:this.backend});const E=Array.isArray(u)?u:[u];this.shouldCheckForMemLeaks()&&this.checkKernelForMemLeak(y,A,E);const k=E.map(v=>v.rank!=null?v:this.makeTensorFromTensorInfo(v));if(r){const v=this.getTensorsForGradient(y,S,k);s=this.saveTensorsForBackwardMode(v)}return k}}else{const{forwardFunc:y}=e,S=N=>{r&&(s=N.map(T=>this.keep(this.clone(T))))};i=()=>{const N=this.backend.numDataIds();u=this.tidy(()=>y(this.backend,S));const T=Array.isArray(u)?u:[u];return this.shouldCheckForMemLeaks()&&this.checkKernelForMemLeak(c,N,T),T}}const{inputs:h,attrs:l}=e,f=vs(e)?null:e.backwardsFunc;let d;return this.scopedRun(()=>this.state.kernelDepth++,()=>this.state.kernelDepth--,()=>{!this.ENV.getBool("DEBUG")&&!this.state.profiling?n=i():(d=this.profiler.profileKernel(c,h,()=>i()),this.ENV.getBool("DEBUG")&&this.profiler.logKernelProfile(d),n=d.outputs)}),r&&this.addTapeNode(c,h,n,f,s,l),this.state.profiling&&this.state.activeProfile.kernels.push({name:c,bytesAdded:this.state.numBytes-a,totalBytesSnapshot:this.state.numBytes,tensorsAdded:this.state.numTensors-o,totalTensorsSnapshot:this.state.numTensors,inputShapes:Object.keys(h).map(y=>h[y]!=null?h[y].shape:null),outputShapes:n.map(y=>y.shape),kernelTimeMs:d.timeMs,extraInfo:d.extraInfo}),Array.isArray(u)?n:n[0]}saveTensorsForBackwardMode(e){return e.map(s=>this.keep(this.clone(s)))}getTensorsForGradient(e,n,s){const r=Rs(e);if(r!=null){const a=r.inputsToSave||[],o=r.outputsToSave||[];let i;r.saveAllInputs?(g(Array.isArray(n),()=>"saveAllInputs is true, expected inputs to be an array."),i=Object.keys(n).map(c=>n[c])):i=a.map(c=>n[c]);const u=s.filter((c,h)=>o[h]);return i.concat(u)}return[]}makeTensor(e,n,s,r){if(e==null)throw new Error("Values passed to engine.makeTensor() are null");s=s||"float32",r=r||this.backend;let a=e;s==="string"&&nt(e[0])&&(a=e.map(u=>In(u)));const o=r.write(a,n,s),i=new te(n,s,o,this.nextTensorId());if(this.trackTensor(i,r),s==="string"){const u=this.state.tensorInfo.get(o),c=po(a);this.state.numBytes+=c-u.bytes,u.bytes=c}return i}makeTensorFromDataId(e,n,s,r){s=s||"float32";const a={dataId:e,shape:n,dtype:s};return this.makeTensorFromTensorInfo(a,r)}makeTensorFromTensorInfo(e,n){const{dataId:s,shape:r,dtype:a}=e,o=new te(r,a,s,this.nextTensorId());return this.trackTensor(o,n),o}makeVariable(e,n=!0,s,r){s=s||this.nextVariableId().toString(),r!=null&&r!==e.dtype&&(e=e.cast(r));const a=new mn(e,n,s,this.nextTensorId());if(this.state.registeredVariables[a.name]!=null)throw new Error(`Variable with name ${a.name} was already registered`);return this.state.registeredVariables[a.name]=a,this.incRef(a,this.backend),a}trackTensor(e,n){this.state.numTensors++,e.dtype==="string"&&this.state.numStringTensors++;let s=0;e.dtype!=="complex64"&&e.dtype!=="string"&&(s=e.size*Gn(e.dtype)),this.state.numBytes+=s,this.state.tensorInfo.has(e.dataId)||(this.state.numDataBuffers++,this.state.tensorInfo.set(e.dataId,{backend:n||this.backend,dtype:e.dtype,shape:e.shape,bytes:s})),e instanceof mn||this.track(e)}incRef(e,n){this.trackTensor(e,n),this.backend.incRef(e.dataId)}removeDataId(e,n){this.state.tensorInfo.has(e)&&this.state.tensorInfo.get(e).backend===n&&(this.state.tensorInfo.delete(e),this.state.numDataBuffers--)}disposeTensor(e){if(!this.state.tensorInfo.has(e.dataId))return;const n=this.state.tensorInfo.get(e.dataId);if(this.state.numTensors--,e.dtype==="string"&&(this.state.numStringTensors--,this.state.numBytes-=n.bytes),e.dtype!=="complex64"&&e.dtype!=="string"){const s=e.size*Gn(e.dtype);this.state.numBytes-=s}n.backend.disposeData(e.dataId)&&this.removeDataId(e.dataId,n.backend)}disposeVariables(){for(const e in this.state.registeredVariables){const n=this.state.registeredVariables[e];this.disposeVariable(n)}}disposeVariable(e){this.disposeTensor(e),this.state.registeredVariables[e.name]!=null&&delete this.state.registeredVariables[e.name]}memory(){const e=this.backend.memory();return e.numTensors=this.state.numTensors,e.numDataBuffers=this.state.numDataBuffers,e.numBytes=this.state.numBytes,this.state.numStringTensors>0&&(e.unreliable=!0,e.reasons==null&&(e.reasons=[]),e.reasons.push("Memory usage by string tensors is approximate (2 bytes per character)")),e}async profile(e){this.state.profiling=!0;const n=this.state.numBytes,s=this.state.numTensors;this.state.activeProfile.kernels=[],this.state.activeProfile.result=await e(),this.state.profiling=!1,this.state.activeProfile.peakBytes=Math.max(...this.state.activeProfile.kernels.map(r=>r.totalBytesSnapshot)),this.state.activeProfile.newBytes=this.state.numBytes-n,this.state.activeProfile.newTensors=this.state.numTensors-s;for(const r of this.state.activeProfile.kernels)r.kernelTimeMs=await r.kernelTimeMs,r.extraInfo=await r.extraInfo;return this.state.activeProfile}isTapeOn(){return this.state.gradientDepth>0&&this.state.kernelDepth===0}addTapeNode(e,n,s,r,a,o){const i={id:this.state.nextTapeNodeId++,kernelName:e,inputs:n,outputs:s,saved:a},u=Rs(e);u!=null&&(r=u.gradFunc),r!=null&&(i.gradient=c=>(c=c.map((h,l)=>{if(h==null){const f=s[l],d=os(f.size,f.dtype);return this.makeTensor(d,f.shape,f.dtype)}return h}),r(c.length>1?c:c[0],a,o))),this.state.activeTape.push(i)}keep(e){return e.kept=!0,e}startTape(){this.state.gradientDepth===0&&(this.state.activeTape=[]),this.state.gradientDepth++}endTape(){this.state.gradientDepth--}startScope(e){const n={track:[],name:"unnamed scope",id:this.state.nextScopeId++};e&&(n.name=e),this.state.scopeStack.push(n),this.state.activeScope=n}endScope(e){const n=Nr(e),s=new Set(n.map(a=>a.id));for(let a=0;a<this.state.activeScope.track.length;a++){const o=this.state.activeScope.track[a];!o.kept&&!s.has(o.id)&&o.dispose()}const r=this.state.scopeStack.pop();this.state.activeScope=this.state.scopeStack.length===0?null:this.state.scopeStack[this.state.scopeStack.length-1],n.forEach(a=>{!a.kept&&a.scopeId===r.id&&this.track(a)})}gradients(e,n,s,r=!1){if(g(n.length>0,()=>"gradients() received an empty list of xs."),s!=null&&s.dtype!=="float32")throw new Error(`dy must have 'float32' dtype, but has '${s.dtype}'`);const a=this.scopedRun(()=>this.startTape(),()=>this.endTape(),()=>this.tidy("forward",e));g(a instanceof te,()=>"The result y returned by f() must be a tensor.");const o=Jf(this.state.activeTape,n,a);if(!r&&o.length===0&&n.length>0)throw new Error("Cannot compute gradient of y=f(x) with respect to x. Make sure that the f you passed encloses all operations that lead from x to y.");return this.tidy("backward",()=>{const i={};i[a.id]=s??ud(a.shape),Yf(i,o,c=>this.tidy(c),cd);const u=n.map(c=>i[c.id]);return this.state.gradientDepth===0&&(this.state.activeTape.forEach(c=>{for(const h of c.saved)h.dispose()}),this.state.activeTape=null),{value:a,grads:u}})}customGrad(e){return g(ot(e),()=>"The f passed in customGrad(f) must be a function."),(...n)=>{g(n.every(i=>i instanceof te),()=>"The args passed in customGrad(f)(x1, x2,...) must all be tensors");let s;const r={};n.forEach((i,u)=>{r[u]=i});const a=(i,u)=>(s=e(...n,u),g(s.value instanceof te,()=>"The function f passed in customGrad(f) must return an object where `obj.value` is a tensor"),g(ot(s.gradFunc),()=>"The function f passed in customGrad(f) must return an object where `obj.gradFunc` is a function."),s.value),o=(i,u)=>{const c=s.gradFunc(i,u),h=Array.isArray(c)?c:[c];g(h.length===n.length,()=>"The function f passed in customGrad(f) must return an object where `obj.gradFunc` is a function that returns the same number of tensors as inputs passed to f(...)."),g(h.every(f=>f instanceof te),()=>"The function f passed in customGrad(f) must return an object where `obj.gradFunc` is a function that returns a list of only tensors.");const l={};return h.forEach((f,d)=>{l[d]=()=>f}),l};return this.runKernelFunc({forwardFunc:a,backwardsFunc:o,inputs:r})}}readSync(e){return this.state.tensorInfo.get(e).backend.readSync(e)}read(e){return this.state.tensorInfo.get(e).backend.read(e)}readToGPU(e,n){return this.state.tensorInfo.get(e).backend.readToGPU(e,n)}async time(e){const n=dn(),s=await this.backend.time(e);return s.wallMs=dn()-n,s}track(e){return this.state.activeScope!=null&&(e.scopeId=this.state.activeScope.id,this.state.activeScope.track.push(e)),e}get registeredVariables(){return this.state.registeredVariables}reset(){this.pendingBackendInitId++,this.state.dispose(),this.ENV.reset(),this.state=new Ba;for(const e in this.registry)this.disposeRegisteredKernels(e),this.registry[e].dispose(),delete this.registry[e];this.backendName=null,this.backendInstance=null,this.pendingBackendInit=null}}Kt.nextTensorId=0;Kt.nextVariableId=0;function ud(t){const e=lr(j(t),"float32");return w.makeTensor(e,t,"float32")}function Ec(){const t=bo();if(t._tfengine==null){const e=new yo(t);t._tfengine=new Kt(e)}return hf(t._tfengine.ENV),td(()=>t._tfengine),t._tfengine}const w=Ec();function cd(t,e){const n={a:t,b:e};return w.runKernel(fr,n)}/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ld(){return typeof navigator<"u"&&navigator!=null}let js;function hd(t){js=t}function pd(t){if(js!==void 0)return js;if(t||ld()){if(t||(t=navigator),t.product==="ReactNative")return!0;const e=t.userAgent||t.vendor||(typeof window<"u"?window.opera:"");if(!e){const n=t;return n.userAgentData&&n.userAgentData.mobile}return/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(e)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(e.substr(0,4))}return!1}function kc(){return typeof window<"u"&&window.document!=null||typeof WorkerGlobalScope<"u"}const fd=Object.freeze(Object.defineProperty({__proto__:null,isBrowser:kc,isMobile:pd,mockIsMobile:hd},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const de=R();de.registerFlag("DEBUG",()=>!1,t=>{t&&console.warn("Debugging mode is ON. The output of every math call will be downloaded to CPU and checked for NaNs. This significantly impacts performance.")});de.registerFlag("IS_BROWSER",()=>kc());de.registerFlag("IS_NODE",()=>typeof process<"u"&&typeof process.versions<"u"&&typeof process.versions.node<"u");de.registerFlag("IS_CHROME",()=>typeof navigator<"u"&&navigator!=null&&navigator.userAgent!=null&&/Chrome/.test(navigator.userAgent)&&/Google Inc/.test(navigator.vendor));de.registerFlag("IS_SAFARI",()=>typeof navigator<"u"&&navigator!=null&&navigator.userAgent!=null&&/Safari/.test(navigator.userAgent)&&/Apple/.test(navigator.vendor));de.registerFlag("PROD",()=>!1);de.registerFlag("TENSORLIKE_CHECK_SHAPE_CONSISTENCY",()=>de.getBool("DEBUG"));de.registerFlag("DEPRECATION_WARNINGS_ENABLED",()=>!0);de.registerFlag("IS_TEST",()=>!1);de.registerFlag("CHECK_COMPUTATION_FOR_ERRORS",()=>de.getBool("DEBUG"));de.registerFlag("WRAP_TO_IMAGEBITMAP",()=>!1);de.registerFlag("CANVAS2D_WILL_READ_FREQUENTLY_FOR_GPU",()=>!1);de.registerFlag("USE_SETTIMEOUTCUSTOM",()=>!1);/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ze(t,e){let n=t;if(ae(t))return e==="string"?[]:[t.length];if(Nc(t)){const r=t.channels||"RGBA";return[t.height,t.width*r.length]}else if(Sc(t))return[t.buffer.size/(e==null?4:Gn(e))];if(!Array.isArray(t))return[];const s=[];for(;Array.isArray(n)||ae(n)&&e!=="string";)s.push(n.length),n=n[0];return Array.isArray(t)&&R().getBool("TENSORLIKE_CHECK_SHAPE_CONSISTENCY")&&vc(t,s,[]),s}function vc(t,e,n){if(n=n||[],!Array.isArray(t)&&!ae(t)){g(e.length===0,()=>`Element arr[${n.join("][")}] is a primitive, but should be an array/TypedArray of ${e[0]} elements`);return}g(e.length>0,()=>`Element arr[${n.join("][")}] should be a primitive, but is an array of ${t.length} elements`),g(t.length===e[0],()=>`Element arr[${n.join("][")}] should have ${e[0]} elements, but has ${t.length} elements`);const s=e.slice(1);for(let r=0;r<t.length;++r)vc(t[r],s,n.concat(r))}function Pa(t,e,n,s){if(t!=="string_or_numeric"){if(t==null)throw new Error("Expected dtype cannot be null.");if(t!=="numeric"&&t!==e||t==="numeric"&&e==="string")throw new Error(`Argument '${n}' passed to '${s}' must be ${t} tensor, but got ${e} tensor`)}}function m(t,e,n,s="numeric"){if(t instanceof wc())return Pa(s,t.dtype,e,n),t;let r=vn(t);if(r!=="string"&&["bool","int32","float32"].indexOf(s)>=0&&(r=s),Pa(s,r,e,n),t==null||!ae(t)&&!Array.isArray(t)&&typeof t!="number"&&typeof t!="boolean"&&typeof t!="string"){const u=t==null?"null":t.constructor.name;throw new Error(`Argument '${e}' passed to '${n}' must be a Tensor or TensorLike, but got '${u}'`)}const a=ze(t,r);!ae(t)&&!Array.isArray(t)&&(t=[t]);const i=r!=="string"?is(t,r):ut(t,[],!0);return w.makeTensor(i,a,r)}function gn(t,e,n,s="numeric"){if(!Array.isArray(t))throw new Error(`Argument ${e} passed to ${n} must be a \`Tensor[]\` or \`TensorLike[]\``);return t.map((a,o)=>m(a,`${e}[${o}]`,n,s))}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Sr="__op";function b(t){const e=Object.keys(t);if(e.length!==1)throw new Error(`Please provide an object with a single key (operation name) mapping to a function. Got an object with ${e.length} keys.`);let n=e[0];const s=t[n];n.endsWith("_")&&(n=n.substring(0,n.length-1)),n=n+Sr;const r=(...a)=>{w.startScope(n);try{const o=s(...a);return it(o)&&console.error("Cannot return a Promise inside of tidy."),w.endScope(o),o}catch(o){throw w.endScope(null),o}};return Object.defineProperty(r,"name",{value:n,configurable:!0}),r}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function dd(t,e){const n=m(t,"real","complex"),s=m(e,"imag","complex");fe(n.shape,s.shape,`real and imag shapes, ${n.shape} and ${s.shape}, must match in call to tf.complex().`);const r={real:n,imag:s};return w.runKernel(Wo,r)}const Je=b({complex_:dd});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function pt(t,e,n,s){if(s==null)s=vn(t);else if(s==="complex64")throw new Error("Cannot construct a complex64 tensor directly. Please use tf.complex(real, imag).");if(Sc(t)||Nc(t)){if(s!=="float32"&&s!=="int32")throw new Error(`Creating tensor from GPU data only supports 'float32'|'int32' dtype, while the dtype is ${s}.`);return w.backend.createTensorFromGPUData(t,e||n,s)}if(!ae(t)&&!Array.isArray(t)&&typeof t!="number"&&typeof t!="boolean"&&typeof t!="string")throw new Error("values passed to tensor(values) must be a number/boolean/string or an array of numbers/booleans/strings, or a TypedArray");if(e!=null){Se(e);const r=j(e),a=j(n);g(r===a,()=>`Based on the provided shape, [${e}], the tensor should have ${r} values but has ${a}`);for(let o=0;o<n.length;++o){const i=n[o],u=o===n.length-1?i!==j(e.slice(o)):!0;g(n[o]===e[o]||!u,()=>`Error creating a new Tensor. Inferred shape (${n}) does not match the provided shape (${e}). `)}}return!ae(t)&&!Array.isArray(t)&&(t=[t]),e=e||n,t=s!=="string"?is(t,s):ut(t,[],!0),w.makeTensor(t,e,s)}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Fe(t,e,n){const s=ze(t,n);return pt(t,e,s,n)}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const kt={float32:4,float16:2,int32:4,uint16:2,uint8:1,bool:1,complex64:8};class Be{static join(e){return new Be(e).slice()}constructor(e){if(this.shards=[],this.previousShardIndex=0,e==null||(e instanceof Array||(e=[e]),e=e.map(s=>ae(s)?s.buffer:s),e.length===0))return;this.bufferUniformSize=e[0].byteLength;let n=0;for(let s=0;s<e.length;s++){const r=e[s];s!==e.length-1&&r.byteLength!==this.bufferUniformSize&&(this.bufferUniformSize=void 0);const a=n+r.byteLength;this.shards.push({buffer:r,start:n,end:a}),n=a}this.shards.length===0&&(this.byteLength=0),this.byteLength=this.shards[this.shards.length-1].end}slice(e=0,n=this.byteLength){if(this.shards.length===0)return new ArrayBuffer(0);if(e=isNaN(Number(e))?0:e,n=isNaN(Number(n))?0:n,e=Math.max(0,e),n=Math.min(this.byteLength,n),n<=e)return new ArrayBuffer(0);const s=this.findShardForByte(e);if(s===-1)throw new Error(`Could not find start shard for byte ${e}`);const r=n-e,a=new ArrayBuffer(r),o=new Uint8Array(a);let i=0;for(let u=s;u<this.shards.length;u++){const c=this.shards[u],l=e+i-c.start,f=i,y=Math.min(n,c.end)-c.start,S=new Uint8Array(c.buffer,l,y-l);if(o.set(S,f),i+=S.length,n<c.end)break}return a}findShardForByte(e){if(this.shards.length===0||e<0||e>=this.byteLength)return-1;if(this.bufferUniformSize!=null)return this.previousShardIndex=Math.floor(e/this.bufferUniformSize),this.previousShardIndex;function n(r){return e<r.start?-1:e>=r.end?1:0}if(n(this.shards[this.previousShardIndex])===0)return this.previousShardIndex;const s=md(this.shards,n);return s===-1?-1:(this.previousShardIndex=s,this.previousShardIndex)}}function md(t,e){let n=0,s=t.length;for(;n<=s;){const r=Math.floor((s-n)/2)+n,a=e(t[r]);if(a===0)return r;a<0?s=r:n=r+1}return-1}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function gd(){R().set("PROD",!0)}function yd(){R().set("DEBUG",!0)}function bd(){R().set("DEPRECATION_WARNINGS_ENABLED",!1),console.warn("TensorFlow.js deprecation warnings have been disabled.")}function wd(t){R().getBool("DEPRECATION_WARNINGS_ENABLED")&&console.warn(t+" You can disable deprecation warnings with tf.disableDeprecationWarnings().")}function Nd(){w.disposeVariables()}function Sd(){return w}function Td(){return w.memory()}function $d(t){return w.profile(t)}function W(t,e){return w.tidy(t,e)}function pe(t){Nr(t).forEach(n=>n.dispose())}function De(t){return w.keep(t)}function Ed(t){return w.time(t)}function kd(t){return w.setBackend(t)}function vd(){return w.ready()}function _c(){return w.backendName}function _d(t){w.removeBackend(t)}function Id(t){return w.findBackend(t)}function xd(t){return w.findBackendFactory(t)}function Ad(t,e,n=1){return w.registerBackend(t,e,n)}function Ic(){return w.backend}function Od(t,e){R().setPlatform(t,e)}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const ct=4;async function Dd(t,e){const n=[],s=[],r=Array.isArray(t)?t.map(o=>o.name):Object.keys(t);for(let o=0;o<r.length;++o){const i=r[o],u=Array.isArray(t)?t[o].tensor:t[i];if(u.dtype!=="float32"&&u.dtype!=="int32"&&u.dtype!=="bool"&&u.dtype!=="string"&&u.dtype!=="complex64")throw new Error(`Unsupported dtype in weight '${i}': ${u.dtype}`);const c={name:i,shape:u.shape,dtype:u.dtype};if(u.dtype==="string"){const h=new Promise(async l=>{const f=await u.bytes(),d=f.reduce((N,T)=>N+T.length,0)+ct*f.length,y=new Uint8Array(d);let S=0;for(let N=0;N<f.length;N++){const T=f[N],A=new Uint8Array(new Uint32Array([T.length]).buffer);y.set(A,S),S+=ct,y.set(T,S),S+=T.length}l(y)});s.push(h)}else s.push(u.data());e!=null&&(c.group=e),n.push(c)}const a=await Promise.all(s);return{data:Rd(a),specs:n}}function xc(t,e){const n=new Be(t),s={};let r=0;for(const a of e){const o=Fd(a,(i,u)=>n.slice(r+i,r+u));s[a.name]=Ac(a,n.slice(r,r+o)),r+=o}return s}function Fd(t,e){const n=j(t.shape);let s;if("quantization"in t){const r=t.quantization;s=kt[r.dtype]}else if(t.dtype==="string"){let r=0;for(let a=0;a<n;a++)r+=ct+new Uint32Array(e(r,r+ct))[0];return r}else s=kt[t.dtype];return n*s}async function Cd(t,e){const n=j(t.shape);let s;if("quantization"in t){const r=t.quantization;s=kt[r.dtype]}else if(t.dtype==="string"){let r=0;for(let a=0;a<n;a++)r+=ct+new Uint32Array(await e(r,r+ct))[0];return r}else s=kt[t.dtype];return n*s}function Ac(t,e){const n=t.name,s=t.dtype,r=t.shape,a=j(r);let o,i=0;if("quantization"in t){const u=t.quantization;if(u.dtype==="uint8"||u.dtype==="uint16"){if(!("min"in u&&"scale"in u))throw new Error(`Weight ${t.name} with quantization ${u.dtype} doesn't have corresponding metadata min and scale.`)}else if(u.dtype==="float16"){if(s!=="float32")throw new Error(`Weight ${t.name} is quantized with ${u.dtype} which only supports weights of type float32 not ${s}.`)}else throw new Error(`Weight ${t.name} has unknown quantization dtype ${u.dtype}. Supported quantization dtypes are: 'uint8', 'uint16', and 'float16'.`);const c=kt[u.dtype],h=u.dtype==="uint8"?new Uint8Array(e):new Uint16Array(e);if(s==="float32")if(u.dtype==="uint8"||u.dtype==="uint16"){o=new Float32Array(h.length);for(let l=0;l<h.length;l++){const f=h[l];o[l]=f*u.scale+u.min}}else if(u.dtype==="float16")o=Md()(h);else throw new Error(`Unsupported quantization type ${u.dtype} for weight type float32.`);else if(s==="int32"){if(u.dtype!=="uint8"&&u.dtype!=="uint16")throw new Error(`Unsupported quantization type ${u.dtype} for weight type int32.`);o=new Int32Array(h.length);for(let l=0;l<h.length;l++){const f=h[l];o[l]=Math.round(f*u.scale+u.min)}}else throw new Error(`Unsupported dtype in weight '${n}': ${s}`);i+=a*c}else if(s==="string"){const u=j(t.shape);o=[];for(let c=0;c<u;c++){const h=new Uint32Array(e.slice(i,i+ct))[0];i+=ct;const l=new Uint8Array(e.slice(i,i+h));o.push(l),i+=h}}else{const u=kt[s];if(s==="float32")o=new Float32Array(e);else if(s==="int32")o=new Int32Array(e);else if(s==="bool")o=new Uint8Array(e);else if(s==="complex64"){o=new Float32Array(e);const c=new Float32Array(o.length/2),h=new Float32Array(o.length/2);for(let y=0;y<c.length;y++)c[y]=o[y*2],h[y]=o[y*2+1];const l=Fe(c,r,"float32"),f=Fe(h,r,"float32"),d=Je(l,f);return l.dispose(),f.dispose(),d}else throw new Error(`Unsupported dtype in weight '${n}': ${s}`);i+=a*u}return Fe(o,r,s)}async function za(t,e,n){let s=new Uint8Array(e);for(;s.byteLength<n;){const{done:r,value:a}=await t.read();if(r&&a==null){const i=n-s.byteLength;throw new Error(`Reader is done but ${i} bytes are still expected`)}const o=new Uint8Array(s.length+a.byteLength);o.set(s,0),o.set(new Uint8Array(a),s.length),s=o}return s.buffer}async function Oc(t,e){const n={},s=t.getReader();let r=new ArrayBuffer(0);for(const a of e){const o=await Cd(a,async(c,h)=>(r=await za(s,r,h),r.slice(c,h)));r=await za(s,r,o);const i=r.slice(0,o);r=r.slice(o);const u=Ac(a,i);if(n[a.name]=u,_c()==="webgpu"){const c=Ic();"uploadToGPU"in c&&j(u.shape)>=R().get("WEBGPU_CPU_HANDOFF_SIZE_THRESHOLD")&&c.uploadToGPU(u.dataId)}}return n}function Rd(t){if(t===null)throw new Error(`Invalid input value: ${JSON.stringify(t)}`);let e=0;const n=[];t.forEach(a=>{if(e+=a.byteLength,n.push(a.byteLength===a.buffer.byteLength?a:new a.constructor(a)),!(a instanceof Float32Array||a instanceof Int32Array||a instanceof Uint8Array))throw new Error(`Unsupported TypedArray subtype: ${a.constructor.name}`)});const s=new Uint8Array(e);let r=0;return n.forEach(a=>{s.set(new Uint8Array(a.buffer),r),r+=a.byteLength}),s.buffer}const Tr=typeof Buffer<"u"&&(typeof Blob>"u"||typeof atob>"u"||typeof btoa>"u");function Va(t){return Tr?Buffer.byteLength(t,"utf8"):new Blob([t]).size}function Ld(t){if(Tr)return Buffer.from(t).toString("base64");const e=new Uint8Array(t);let n="";for(let s=0,r=e.length;s<r;s++)n+=String.fromCharCode(e[s]);return btoa(n)}function Bd(t){if(Tr){const s=Buffer.from(t,"base64");return s.buffer.slice(s.byteOffset,s.byteOffset+s.byteLength)}const e=atob(t),n=new Uint8Array(e.length);for(let s=0;s<e.length;++s)n.set([e.charCodeAt(s)],s);return n.buffer}function Pd(t){return Be.join(t)}function Wa(t){const e="/";for(t=t.trim();t.endsWith(e);)t=t.slice(0,t.length-1);const n=t.split(e);return n[n.length-1]}function Dc(t,e){const n={modelTopology:t.modelTopology,format:t.format,generatedBy:t.generatedBy,convertedBy:t.convertedBy,weightsManifest:e};return t.signature!=null&&(n.signature=t.signature),t.userDefinedMetadata!=null&&(n.userDefinedMetadata=t.userDefinedMetadata),t.modelInitializer!=null&&(n.modelInitializer=t.modelInitializer),t.initializerSignature!=null&&(n.initializerSignature=t.initializerSignature),t.trainingConfig!=null&&(n.trainingConfig=t.trainingConfig),n}function $r(t,e,n){const s={modelTopology:t.modelTopology,format:t.format,generatedBy:t.generatedBy,convertedBy:t.convertedBy};if(t.trainingConfig!=null&&(s.trainingConfig=t.trainingConfig),t.weightsManifest!=null){if(!e)throw new Error("modelJSON has weightsManifest but weightSpecs is null");if(!n)throw new Error("modelJSON has weightsManifest but weightData is null");s.weightSpecs=e,s.weightData=n}return t.signature!=null&&(s.signature=t.signature),t.userDefinedMetadata!=null&&(s.userDefinedMetadata=t.userDefinedMetadata),t.modelInitializer!=null&&(s.modelInitializer=t.modelInitializer),t.initializerSignature!=null&&(s.initializerSignature=t.initializerSignature),s}async function Er(t,e){let n,s;return t.weightsManifest!=null&&([n,s]=await e(t.weightsManifest)),$r(t,n,s)}function xn(t){if(t.modelTopology instanceof ArrayBuffer)throw new Error("Expected JSON model topology, received ArrayBuffer.");return{dateSaved:new Date,modelTopologyType:"JSON",modelTopologyBytes:t.modelTopology==null?0:Va(JSON.stringify(t.modelTopology)),weightSpecsBytes:t.weightSpecs==null?0:Va(JSON.stringify(t.weightSpecs)),weightDataBytes:t.weightData==null?0:new Be(t.weightData).byteLength}}function Yn(t){const e=[];for(const n of t)e.push(...n.weights);return e}function zd(){const t=n=>{let s=n<<13,r=0;for(;!(s&8388608);)r-=8388608,s<<=1;return s&=-8388609,r+=947912704,s|r},e=new Uint32Array(2048);e[0]=0;for(let n=1;n<1024;n++)e[n]=t(n);for(let n=1024;n<2048;n++)e[n]=939524096+(n-1024<<13);return e}function Vd(){const t=new Uint32Array(64);t[0]=0,t[31]=1199570944,t[32]=2147483648,t[63]=3347054592;for(let e=1;e<31;e++)t[e]=e<<23;for(let e=33;e<63;e++)t[e]=2147483648+(e-32<<23);return t}function Wd(){const t=new Uint32Array(64);for(let e=0;e<64;e++)t[e]=1024;return t[0]=t[32]=0,t}function Md(){const t=zd(),e=Vd(),n=Wd();return s=>{const r=new ArrayBuffer(4*s.length),a=new Uint32Array(r);for(let o=0;o<s.length;o++){const i=s[o],u=t[n[i>>10]+(i&1023)]+e[i>>10];a[o]=u}return new Float32Array(r)}}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Q{constructor(){this.saveRouters=[],this.loadRouters=[]}static getInstance(){return Q.instance==null&&(Q.instance=new Q),Q.instance}static registerSaveRouter(e){Q.getInstance().saveRouters.push(e)}static registerLoadRouter(e){Q.getInstance().loadRouters.push(e)}static getSaveHandlers(e){return Q.getHandlers(e,"save")}static getLoadHandlers(e,n){return Q.getHandlers(e,"load",n)}static getHandlers(e,n,s){const r=[];return(n==="load"?Q.getInstance().loadRouters:Q.getInstance().saveRouters).forEach(o=>{const i=o(e,s);i!==null&&r.push(i)}),r}}const jd=t=>Q.registerSaveRouter(t),Ud=t=>Q.registerLoadRouter(t),qd=t=>Q.getSaveHandlers(t),Gd=(t,e)=>Q.getLoadHandlers(t,e);/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Us="tensorflowjs",qs=1,St="models_store",st="model_info_store";function Fc(){if(!R().getBool("IS_BROWSER"))throw new Error("Failed to obtain IndexedDB factory because the current environmentis not a web browser.");const t=typeof window>"u"?self:window,e=t.indexedDB||t.mozIndexedDB||t.webkitIndexedDB||t.msIndexedDB||t.shimIndexedDB;if(e==null)throw new Error("The current browser does not appear to support IndexedDB.");return e}function Gs(t){const e=t.result;e.createObjectStore(St,{keyPath:"modelPath"}),e.createObjectStore(st,{keyPath:"modelPath"})}class vt{constructor(e){if(this.indexedDB=Fc(),e==null||!e)throw new Error("For IndexedDB, modelPath must not be null, undefined or empty.");this.modelPath=e}async save(e){if(e.modelTopology instanceof ArrayBuffer)throw new Error("BrowserLocalStorage.save() does not support saving model topology in binary formats yet.");return this.databaseAction(this.modelPath,e)}async load(){return this.databaseAction(this.modelPath)}databaseAction(e,n){return new Promise((s,r)=>{const a=this.indexedDB.open(Us,qs);a.onupgradeneeded=()=>Gs(a),a.onsuccess=()=>{const o=a.result;if(n==null){const i=o.transaction(St,"readonly"),c=i.objectStore(St).get(this.modelPath);c.onsuccess=()=>{if(c.result==null)return o.close(),r(new Error(`Cannot find model with path '${this.modelPath}' in IndexedDB.`));s(c.result.modelArtifacts)},c.onerror=h=>(o.close(),r(c.error)),i.oncomplete=()=>o.close()}else{n.weightData=Be.join(n.weightData);const i=xn(n),u=o.transaction(st,"readwrite");let c=u.objectStore(st),h;try{h=c.put({modelPath:this.modelPath,modelArtifactsInfo:i})}catch(f){return r(f)}let l;h.onsuccess=()=>{l=o.transaction(St,"readwrite");const f=l.objectStore(St);let d;try{d=f.put({modelPath:this.modelPath,modelArtifacts:n,modelArtifactsInfo:i})}catch(y){return r(y)}d.onsuccess=()=>s({modelArtifactsInfo:i}),d.onerror=y=>{c=u.objectStore(st);const S=c.delete(this.modelPath);S.onsuccess=()=>(o.close(),r(d.error)),S.onerror=N=>(o.close(),r(d.error))}},h.onerror=f=>(o.close(),r(h.error)),u.oncomplete=()=>{l==null?o.close():l.oncomplete=()=>o.close()}}},a.onerror=o=>r(a.error)})}}vt.URL_SCHEME="indexeddb://";const Cc=t=>R().getBool("IS_BROWSER")&&!Array.isArray(t)&&t.startsWith(vt.URL_SCHEME)?Hd(t.slice(vt.URL_SCHEME.length)):null;Q.registerSaveRouter(Cc);Q.registerLoadRouter(Cc);function Hd(t){return new vt(t)}function Kd(t){return t.startsWith(vt.URL_SCHEME)?t.slice(vt.URL_SCHEME.length):t}class Xd{constructor(){this.indexedDB=Fc()}async listModels(){return new Promise((e,n)=>{const s=this.indexedDB.open(Us,qs);s.onupgradeneeded=()=>Gs(s),s.onsuccess=()=>{const r=s.result,a=r.transaction(st,"readonly"),i=a.objectStore(st).getAll();i.onsuccess=()=>{const u={};for(const c of i.result)u[c.modelPath]=c.modelArtifactsInfo;e(u)},i.onerror=u=>(r.close(),n(i.error)),a.oncomplete=()=>r.close()},s.onerror=r=>n(s.error)})}async removeModel(e){return e=Kd(e),new Promise((n,s)=>{const r=this.indexedDB.open(Us,qs);r.onupgradeneeded=()=>Gs(r),r.onsuccess=()=>{const a=r.result,o=a.transaction(st,"readwrite"),i=o.objectStore(st),u=i.get(e);let c;u.onsuccess=()=>{if(u.result==null)return a.close(),s(new Error(`Cannot find model with path '${e}' in IndexedDB.`));{const h=i.delete(e),l=()=>{c=a.transaction(St,"readwrite");const d=c.objectStore(St).delete(e);d.onsuccess=()=>n(u.result.modelArtifactsInfo),d.onerror=y=>s(u.error)};h.onsuccess=l,h.onerror=f=>(l(),a.close(),s(u.error))}},u.onerror=h=>(a.close(),s(u.error)),o.oncomplete=()=>{c==null?a.close():c.oncomplete=()=>a.close()}},r.onerror=a=>s(r.error)})}}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Ke="/",zt="tensorflowjs_models",Rc="info",Zd="model_topology",Jd="weight_specs",Yd="weight_data",Qd="model_metadata";function Lc(t){return{info:[zt,t,Rc].join(Ke),topology:[zt,t,Zd].join(Ke),weightSpecs:[zt,t,Jd].join(Ke),weightData:[zt,t,Yd].join(Ke),modelMetadata:[zt,t,Qd].join(Ke)}}function Bc(t){for(const e of Object.values(t))window.localStorage.removeItem(e)}function em(t){const e=t.split(Ke);if(e.length<3)throw new Error(`Invalid key format: ${t}`);return e.slice(1,e.length-1).join(Ke)}function tm(t){return t.startsWith(_t.URL_SCHEME)?t.slice(_t.URL_SCHEME.length):t}class _t{constructor(e){if(!R().getBool("IS_BROWSER")||typeof window>"u"||typeof window.localStorage>"u")throw new Error("The current environment does not support local storage.");if(this.LS=window.localStorage,e==null||!e)throw new Error("For local storage, modelPath must not be null, undefined or empty.");this.modelPath=e,this.keys=Lc(this.modelPath)}async save(e){if(e.modelTopology instanceof ArrayBuffer)throw new Error("BrowserLocalStorage.save() does not support saving model topology in binary formats yet.");{const n=JSON.stringify(e.modelTopology),s=JSON.stringify(e.weightSpecs),r=xn(e),a=Be.join(e.weightData);try{this.LS.setItem(this.keys.info,JSON.stringify(r)),this.LS.setItem(this.keys.topology,n),this.LS.setItem(this.keys.weightSpecs,s),this.LS.setItem(this.keys.weightData,Ld(a));const o={format:e.format,generatedBy:e.generatedBy,convertedBy:e.convertedBy,signature:e.signature!=null?e.signature:void 0,userDefinedMetadata:e.userDefinedMetadata!=null?e.userDefinedMetadata:void 0,modelInitializer:e.modelInitializer!=null?e.modelInitializer:void 0,initializerSignature:e.initializerSignature!=null?e.initializerSignature:void 0,trainingConfig:e.trainingConfig!=null?e.trainingConfig:void 0};return this.LS.setItem(this.keys.modelMetadata,JSON.stringify(o)),{modelArtifactsInfo:r}}catch{throw Bc(this.keys),new Error(`Failed to save model '${this.modelPath}' to local storage: size quota being exceeded is a possible cause of this failure: modelTopologyBytes=${r.modelTopologyBytes}, weightSpecsBytes=${r.weightSpecsBytes}, weightDataBytes=${r.weightDataBytes}.`)}}}async load(){const e=JSON.parse(this.LS.getItem(this.keys.info));if(e==null)throw new Error(`In local storage, there is no model with name '${this.modelPath}'`);if(e.modelTopologyType!=="JSON")throw new Error("BrowserLocalStorage does not support loading non-JSON model topology yet.");const n={},s=JSON.parse(this.LS.getItem(this.keys.topology));if(s==null)throw new Error(`In local storage, the topology of model '${this.modelPath}' is missing.`);n.modelTopology=s;const r=JSON.parse(this.LS.getItem(this.keys.weightSpecs));if(r==null)throw new Error(`In local storage, the weight specs of model '${this.modelPath}' are missing.`);n.weightSpecs=r;const a=this.LS.getItem(this.keys.modelMetadata);if(a!=null){const i=JSON.parse(a);n.format=i.format,n.generatedBy=i.generatedBy,n.convertedBy=i.convertedBy,i.signature!=null&&(n.signature=i.signature),i.userDefinedMetadata!=null&&(n.userDefinedMetadata=i.userDefinedMetadata),i.modelInitializer!=null&&(n.modelInitializer=i.modelInitializer),i.initializerSignature!=null&&(n.initializerSignature=i.initializerSignature),i.trainingConfig!=null&&(n.trainingConfig=i.trainingConfig)}const o=this.LS.getItem(this.keys.weightData);if(o==null)throw new Error(`In local storage, the binary weight values of model '${this.modelPath}' are missing.`);return n.weightData=Bd(o),n}}_t.URL_SCHEME="localstorage://";const Pc=t=>R().getBool("IS_BROWSER")&&!Array.isArray(t)&&t.startsWith(_t.URL_SCHEME)?nm(t.slice(_t.URL_SCHEME.length)):null;Q.registerSaveRouter(Pc);Q.registerLoadRouter(Pc);function nm(t){return new _t(t)}class sm{constructor(){g(R().getBool("IS_BROWSER"),()=>"Current environment is not a web browser"),g(typeof window>"u"||typeof window.localStorage<"u",()=>"Current browser does not appear to support localStorage"),this.LS=window.localStorage}async listModels(){const e={},n=zt+Ke,s=Ke+Rc;for(let r=0;r<this.LS.length;++r){const a=this.LS.key(r);if(a.startsWith(n)&&a.endsWith(s)){const o=em(a);e[o]=JSON.parse(this.LS.getItem(a))}}return e}async removeModel(e){e=tm(e);const n=Lc(e);if(this.LS.getItem(n.info)==null)throw new Error(`Cannot find model at path '${e}'`);const s=JSON.parse(this.LS.getItem(n.info));return Bc(n),s}}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Wt="://";class ce{constructor(){this.managers={}}static getInstance(){return ce.instance==null&&(ce.instance=new ce),ce.instance}static registerManager(e,n){g(e!=null,()=>"scheme must not be undefined or null."),e.endsWith(Wt)&&(e=e.slice(0,e.indexOf(Wt))),g(e.length>0,()=>"scheme must not be an empty string.");const s=ce.getInstance();g(s.managers[e]==null,()=>`A model store manager is already registered for scheme '${e}'.`),s.managers[e]=n}static getManager(e){const n=ce.getInstance().managers[e];if(n==null)throw new Error(`Cannot find model manager for scheme '${e}'`);return n}static getSchemes(){return Object.keys(ce.getInstance().managers)}}function jn(t){if(t.indexOf(Wt)===-1)throw new Error(`The url string provided does not contain a scheme. Supported schemes are: ${ce.getSchemes().join(",")}`);return{scheme:t.split(Wt)[0],path:t.split(Wt)[1]}}async function zc(t,e,n=!1){g(t!==e,()=>`Old path and new path are the same: '${t}'`);const s=Q.getLoadHandlers(t);g(s.length>0,()=>`Copying failed because no load handler is found for source URL ${t}.`),g(s.length<2,()=>`Copying failed because more than one (${s.length}) load handlers for source URL ${t}.`);const r=s[0],a=Q.getSaveHandlers(e);g(a.length>0,()=>`Copying failed because no save handler is found for destination URL ${e}.`),g(a.length<2,()=>`Copying failed because more than one (${s.length}) save handlers for destination URL ${e}.`);const o=a[0],i=jn(t).scheme,u=jn(t).path,c=i===jn(t).scheme,h=await r.load();n&&c&&await ce.getManager(i).removeModel(u);const l=await o.save(h);return n&&!c&&await ce.getManager(i).removeModel(u),l.modelArtifactsInfo}async function rm(){const t=ce.getSchemes(),e={};for(const n of t){const s=await ce.getManager(n).listModels();for(const r in s){const a=n+Wt+r;e[a]=s[r]}}return e}async function am(t){const e=jn(t);return ce.getManager(e.scheme).removeModel(e.path)}async function om(t,e){return zc(t,e,!1)}async function im(t,e){return zc(t,e,!0)}/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class um{constructor(){this.messageName="setTimeoutCustom",this.functionRefs=[],this.handledMessageCount=0,this.hasEventListener=!1}fetch(e,n){return fetch(e,n)}now(){return performance.now()}encode(e,n){if(n!=="utf-8"&&n!=="utf8")throw new Error(`Browser's encoder only supports utf-8, but got ${n}`);return this.textEncoder==null&&(this.textEncoder=new TextEncoder),this.textEncoder.encode(e)}decode(e,n){return new TextDecoder(n).decode(e)}setTimeoutCustom(e,n){if(typeof window>"u"||!R().getBool("USE_SETTIMEOUTCUSTOM")){setTimeout(e,n);return}this.functionRefs.push(e),setTimeout(()=>{window.postMessage({name:this.messageName,index:this.functionRefs.length-1},"*")},n),this.hasEventListener||(this.hasEventListener=!0,window.addEventListener("message",s=>{if(s.source===window&&s.data.name===this.messageName){s.stopPropagation();const r=this.functionRefs[s.data.index];r(),this.handledMessageCount++,this.handledMessageCount===this.functionRefs.length&&(this.functionRefs=[],this.handledMessageCount=0)}},!0))}isTypedArray(e){return cc(e)}}if(R().get("IS_BROWSER")){R().setPlatform("browser",new um);try{ce.registerManager(_t.URL_SCHEME,new sm)}catch{}try{ce.registerManager(vt.URL_SCHEME,new Xd)}catch{}}/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const cm={importFetch:()=>require("node-fetch")};let _s;class lm{constructor(){this.util=require("util"),this.textEncoder=new this.util.TextEncoder}fetch(e,n){return R().global.fetch!=null?R().global.fetch(e,n):(_s==null&&(_s=cm.importFetch()),_s(e,n))}now(){const e=process.hrtime();return e[0]*1e3+e[1]/1e6}encode(e,n){if(n!=="utf-8"&&n!=="utf8")throw new Error(`Node built-in encoder only supports utf-8, but got ${n}`);return this.textEncoder.encode(e)}decode(e,n){return e.length===0?"":new this.util.TextDecoder(n).decode(e)}isTypedArray(e){return this.util.types.isFloat32Array(e)||this.util.types.isInt32Array(e)||this.util.types.isUint8Array(e)||this.util.types.isUint8ClampedArray(e)}}R().get("IS_NODE")&&!R().get("IS_BROWSER")&&R().setPlatform("node",new lm);/**
 * @license
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Ve(t,e="float32",n){return e=e||"float32",Se(t),new Jn(t,e,n)}/**
 * @license
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function hm(t,e){const n=m(t,"x","cast");if(!ho(e))throw new Error(`Failed to cast to unknown dtype ${e}`);if(e==="string"&&n.dtype!=="string"||e!=="string"&&n.dtype==="string")throw new Error("Only strings can be casted to strings");const s={x:n},r={dtype:e};return w.runKernel(dr,s,r)}const X=b({cast_:hm});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function pm(t){const n={x:m(t,"x","clone","string_or_numeric")};return w.runKernel(gr,n)}const Xe=b({clone_:pm});/**
 * @license
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function kr(t,e=!1){console.log(t.toString(e))}/**
 * @license
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */Ec();const fm={buffer:Ve,cast:X,clone:Xe,print:kr};nd(fm);/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function dm(t,e){let n=m(t,"a","add"),s=m(e,"b","add");[n,s]=ee(n,s);const r={a:n,b:s};return w.runKernel(fr,r)}const C=b({add_:dm});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function mm(t,e){let n=m(t,"a","floorDiv"),s=m(e,"b","floorDiv");[n,s]=ee(n,s);const r={a:n,b:s};return w.runKernel(wi,r)}const vr=b({floorDiv_:mm});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function gm(t,e){let n=m(t,"a","div"),s=m(e,"b","div");if([n,s]=ee(n,s),n.dtype==="int32"&&s.dtype==="int32")return vr(n,s);const r={a:n,b:s},a={};return w.runKernel(ii,r,a)}const K=b({div_:gm});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ym(t,e){let n=m(t,"a","mul"),s=m(e,"b","mul");[n,s]=ee(n,s);const r={a:n,b:s};return w.runKernel(Ji,r)}const I=b({mul_:ym});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function bm(t){const e=m(t,"x","abs");if(e.dtype==="complex64"){const n={x:e};return w.runKernel(Mo,n)}else{const n={x:e};return w.runKernel(wo,n)}}const be=b({abs_:bm});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function wm(t){const n={x:m(t,"x","acos")};return w.runKernel(No,n)}const Vc=b({acos_:wm});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Nm(t){const n={x:m(t,"x","acosh")};return w.runKernel(So,n)}const Wc=b({acosh_:Nm});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Sm(t){g(Array.isArray(t),()=>"The argument passed to tf.addN() must be a list of tensors"),g(t.length>=1,()=>`Must pass at least one tensor to tf.addN(), but got ${t.length}`);const e=t.map((r,a)=>m(r,`tensors${a}`,"addN")),n=e[0];e.forEach(r=>{if(r.dtype!==n.dtype)throw new Error("All tensors passed to tf.addN() must have the same dtype")}),e.forEach(r=>{if(!Re(r.shape,n.shape))throw new Error("All tensors passed to tf.addN() must have the same shape")});const s=e;return w.runKernel(To,s)}const Mc=b({addN_:Sm});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Tm(t,e=null,n=!1){const r={x:m(t,"x","all","bool")},a={axis:e,keepDims:n};return w.runKernel($o,r,a)}const jc=b({all_:Tm});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function $m(t,e=null,n=!1){const r={x:m(t,"x","any","bool")},a={axis:e,keepDims:n};return w.runKernel(Eo,r,a)}const Uc=b({any_:$m});/**
 * @license
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Em(t,e=0){const s={x:m(t,"x","argMax")},r={axis:e};return w.runKernel(ko,s,r)}const qc=b({argMax_:Em});/**
 * @license
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function km(t,e=0){const s={x:m(t,"x","argMin")},r={axis:e};return w.runKernel(vo,s,r)}const Gc=b({argMin_:km});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function vm(t){const n={x:m(t,"x","asin")};return w.runKernel(_o,n)}const Hc=b({asin_:vm});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function _m(t){const n={x:m(t,"x","asinh")};return w.runKernel(Io,n)}const Kc=b({asinh_:_m});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Im(t){const n={x:m(t,"x","atan")};return w.runKernel(xo,n)}const Xc=b({atan_:Im});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function xm(t,e){let n=m(t,"a","atan2"),s=m(e,"b","atan2");[n,s]=ee(n,s);const r={a:n,b:s};return w.runKernel(Oo,r)}const Zc=b({atan2_:xm});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Am(t){const n={x:m(t,"x","atanh")};return w.runKernel(Ao,n)}const Jc=b({atanh_:Am});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Om(t,e,n,s,r="NHWC",a){const o=t[3],i=[...e,o],u=el(r);return An(t,i,n,a,s,null,null,u)}function Yc(t,e,n,s,r,a,o="channelsLast"){const[i,u]=yn(e);let c;if(o==="channelsLast")c=[i,u,t[3],t[3]];else if(o==="channelsFirst")c=[i,u,t[1],t[1]];else throw new Error(`Unknown dataFormat ${o}`);return An(t,c,n,s,r,a,!1,o)}function Dm(t,e,n,s,r,a,o="NDHWC"){const[i,u,c]=Hs(e);let h,l;if(o==="NDHWC")l="channelsLast",h=[i,u,c,t[4],t[4]];else if(o==="NCDHW")l="channelsFirst",h=[i,u,c,t[1],t[1]];else throw new Error(`Unknown dataFormat ${o}`);return Qc(t,h,n,s,r,!1,l,a)}function An(t,e,n,s,r,a,o=!1,i="channelsLast"){let[u,c,h,l]=[-1,-1,-1,-1];if(i==="channelsLast")[u,c,h,l]=t;else if(i==="channelsFirst")[u,l,c,h]=t;else throw new Error(`Unknown dataFormat ${i}`);const[f,d,,y]=e,[S,N]=yn(n),[T,A]=yn(s),E=Mt(f,T),k=Mt(d,A),{padInfo:v,outHeight:x,outWidth:O}=Rm(r,c,h,S,N,E,k,a,i),D=o?y*l:y;let F;return i==="channelsFirst"?F=[u,D,x,O]:i==="channelsLast"&&(F=[u,x,O,D]),{batchSize:u,dataFormat:i,inHeight:c,inWidth:h,inChannels:l,outHeight:x,outWidth:O,outChannels:D,padInfo:v,strideHeight:S,strideWidth:N,filterHeight:f,filterWidth:d,effectiveFilterHeight:E,effectiveFilterWidth:k,dilationHeight:T,dilationWidth:A,inShape:t,outShape:F,filterShape:e}}function Qc(t,e,n,s,r,a=!1,o="channelsLast",i){let[u,c,h,l,f]=[-1,-1,-1,-1,-1];if(o==="channelsLast")[u,c,h,l,f]=t;else if(o==="channelsFirst")[u,f,c,h,l]=t;else throw new Error(`Unknown dataFormat ${o}`);const[d,y,S,,N]=e,[T,A,E]=Hs(n),[k,v,x]=Hs(s),O=Mt(d,k),D=Mt(y,v),F=Mt(S,x),{padInfo:B,outDepth:L,outHeight:M,outWidth:U}=Lm(r,c,h,l,T,A,E,O,D,F,i),Y=a?N*f:N;let se;return o==="channelsFirst"?se=[u,Y,L,M,U]:o==="channelsLast"&&(se=[u,L,M,U,Y]),{batchSize:u,dataFormat:o,inDepth:c,inHeight:h,inWidth:l,inChannels:f,outDepth:L,outHeight:M,outWidth:U,outChannels:Y,padInfo:B,strideDepth:T,strideHeight:A,strideWidth:E,filterDepth:d,filterHeight:y,filterWidth:S,effectiveFilterDepth:O,effectiveFilterHeight:D,effectiveFilterWidth:F,dilationDepth:k,dilationHeight:v,dilationWidth:x,inShape:t,outShape:se,filterShape:e}}function Fm(t,e,n,s,r){s==null&&(s=_r(t,e,n));const a=t[0],o=t[1],i=bn((a-e+2*s)/n+1,r),u=bn((o-e+2*s)/n+1,r);return[i,u]}function Cm(t,e,n,s,r,a){r==null&&(r=_r(t,e[0],s[0]));const o=[0,0,0,n];for(let i=0;i<3;i++)t[i]+2*r>=e[i]&&(o[i]=bn((t[i]-e[i]+2*r)/s[i]+1,a));return o}function _r(t,e,n,s=1){const r=Mt(e,s);return Math.floor((t[0]*(n-1)-n+r)/2)}function yn(t){return typeof t=="number"?[t,t,t]:t.length===2?[t[0],t[1],1]:t}function Hs(t){return typeof t=="number"?[t,t,t]:t}function Mt(t,e){return e<=1?t:t+(t-1)*(e-1)}function Rm(t,e,n,s,r,a,o,i,u){let c,h,l;if(typeof t=="number"){c={top:t,bottom:t,left:t,right:t,type:t===0?"VALID":"NUMBER"};const d=Fm([e,n],a,s,t,i);h=d[0],l=d[1]}else if(t==="same"){h=Math.ceil(e/s),l=Math.ceil(n/r);const f=Math.max(0,(h-1)*s+a-e),d=Math.max(0,(l-1)*r+o-n),y=Math.floor(f/2),S=f-y,N=Math.floor(d/2),T=d-N;c={top:y,bottom:S,left:N,right:T,type:"SAME"}}else if(t==="valid")c={top:0,bottom:0,left:0,right:0,type:"VALID"},h=Math.ceil((e-a+1)/s),l=Math.ceil((n-o+1)/r);else if(typeof t=="object"){const f=u==="channelsLast"?t[1][0]:t[2][0],d=u==="channelsLast"?t[1][1]:t[2][1],y=u==="channelsLast"?t[2][0]:t[3][0],S=u==="channelsLast"?t[2][1]:t[3][1];c={top:f,bottom:d,left:y,right:S,type:f===0&&d===0&&y===0&&S===0?"VALID":"EXPLICIT"},h=bn((e-a+f+d)/s+1,i),l=bn((n-o+y+S)/r+1,i)}else throw Error(`Unknown padding parameter: ${t}`);return{padInfo:c,outHeight:h,outWidth:l}}function Lm(t,e,n,s,r,a,o,i,u,c,h){let l,f,d,y;if(t==="valid"&&(t=0),typeof t=="number"){l={top:t,bottom:t,left:t,right:t,front:t,back:t,type:t===0?"VALID":"NUMBER"};const N=Cm([e,n,s,1],[i,u,c],1,[r,a,o],t,h);f=N[0],d=N[1],y=N[2]}else if(t==="same"){f=Math.ceil(e/r),d=Math.ceil(n/a),y=Math.ceil(s/o);const S=(f-1)*r+i-e,N=(d-1)*a+u-n,T=(y-1)*o+c-s,A=Math.floor(S/2),E=S-A,k=Math.floor(N/2),v=N-k,x=Math.floor(T/2),O=T-x;l={top:k,bottom:v,left:x,right:O,front:A,back:E,type:"SAME"}}else throw Error(`Unknown padding parameter: ${t}`);return{padInfo:l,outDepth:f,outHeight:d,outWidth:y}}function bn(t,e){if(!e)return Math.trunc(t);switch(e){case"round":return Math.round(t);case"ceil":return Math.ceil(t);case"floor":return Math.floor(t);default:throw new Error(`Unknown roundingMode ${e}`)}}function wn(t){const[e,n,s]=yn(t);return e===1&&n===1&&s===1}function Ye(t,e){return wn(t)||wn(e)}function It(t){return yn(t).every(e=>e>0)}function el(t){if(t==="NHWC")return"channelsLast";if(t==="NCHW")return"channelsFirst";throw new Error(`Unknown dataFormat ${t}`)}function Ae(t,e,n){if(n!=null){if(typeof e=="string")throw Error(`Error in ${t}: pad must be an integer when using dimRoundingMode ${n} but got pad ${e}.`);if(typeof e=="number")g(qt(e),()=>`Error in ${t}: pad must be an integer when using dimRoundingMode ${n} but got pad ${e}.`);else if(typeof e=="object")e.forEach(s=>{s.forEach(r=>{g(qt(r),()=>`Error in ${t}: pad must be an integer when using dimRoundingMode ${n} but got pad ${r}.`)})});else throw Error(`Error in ${t}: Unknown padding parameter: ${e}`)}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Bm(t,e){const s={x:m(t,"x","reshape","string_or_numeric")},r={shape:e};return w.runKernel(yu,s,r)}const $=b({reshape_:Bm});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Pm(t,e,n,s,r){const a=m(t,"x","avgPool","float32"),o=1;g(Ye(n,o),()=>`Error in avgPool: Either strides or dilations must be 1. Got strides ${n} and dilations '${o}'`);let i=a,u=!1;a.rank===3&&(u=!0,i=$(a,[1,a.shape[0],a.shape[1],a.shape[2]])),g(i.rank===4,()=>`Error in avgPool: x must be rank 4 but got rank ${i.rank}.`),Ae("avgPool",s,r);const c={x:i},h={filterSize:e,strides:n,pad:s,dimRoundingMode:r};let l=w.runKernel(Do,c,h);return l=X(l,a.dtype),u?$(l,[l.shape[1],l.shape[2],l.shape[3]]):l}const Ir=b({avgPool_:Pm});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function zm(t,e,n,s,r,a="NDHWC"){const o=m(t,"x","avgPool3d","float32");let i=o,u=!1;o.rank===4&&(u=!0,i=$(o,[1,o.shape[0],o.shape[1],o.shape[2],o.shape[3]])),g(i.rank===5,()=>`Error in avgPool3d: x must be rank 5 but got rank ${i.rank}.`),g(a==="NDHWC",()=>`Error in avgPool3d: Only NDHWC is currently supported, but got dataFormat of ${a}`),g(typeof n=="number"&&n>0||Array.isArray(n)&&n[0]>0&&n[1]>0&&n[2]>0,()=>`Error in avgPool3d: Stride must be > 0, but got '${n}'`),Ae("avgPool3d",s,r);const c={x:i},h={filterSize:e,strides:n,pad:s,dimRoundingMode:r,dataFormat:a};let l=w.runKernel(Fo,c,h);return l=X(l,i.dtype),u?$(l,[l.shape[1],l.shape[2],l.shape[3],l.shape[4]]):l}const tl=b({avgPool3d_:zm});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Vm(t,e=0){g(t.length>=1,()=>"Pass at least one tensor to concat");const n=gn(t,"tensors","concat","string_or_numeric");if(n[0].dtype==="complex64"&&n.forEach(a=>{if(a.dtype!=="complex64")throw new Error(`Cannot concatenate complex64 tensors with a tensor
          with dtype ${a.dtype}. `)}),n.length===1)return Xe(n[0]);const s=n,r={axis:e};return w.runKernel(jo,s,r)}const ue=b({concat_:Vm});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Wm(t,e,n=!1,s=!1){let r=m(t,"a","matMul"),a=m(e,"b","matMul");[r,a]=ee(r,a);const o={a:r,b:a},i={transposeA:n,transposeB:s};return w.runKernel(Co,o,i)}const V=b({matMul_:Wm});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Mm(t){const n={x:m(t,"x","sigmoid","float32")};return w.runKernel(Fu,n)}const $t=b({sigmoid_:Mm});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function jm(t,e,n){const s=m(t,"x","slice","string_or_numeric");if(s.rank===0)throw new Error("Slicing scalar is not possible");const r={x:s},a={begin:e,size:n};return w.runKernel(xu,r,a)}const q=b({slice_:jm});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Um(t){const n={x:m(t,"x","tanh","float32")};return w.runKernel(Qu,n)}const Qn=b({tanh_:Um});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function qm(t,e,n,s,r,a){const o=m(t,"forgetBias","basicLSTMCell"),i=m(e,"lstmKernel","basicLSTMCell"),u=m(n,"lstmBias","basicLSTMCell"),c=m(s,"data","basicLSTMCell"),h=m(r,"c","basicLSTMCell"),l=m(a,"h","basicLSTMCell"),f=ue([c,l],1),d=V(f,i),y=C(d,u),S=y.shape[0],N=y.shape[1]/4,T=[S,N],A=q(y,[0,0],T),E=q(y,[0,N],T),k=q(y,[0,N*2],T),v=q(y,[0,N*3],T),x=C(I($t(A),Qn(E)),I(h,$t(C(o,k)))),O=I(Qn(x),$t(v));return[x,O]}const nl=b({basicLSTMCell_:qm});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Gm(t,e,n){const s=m(t,"x","batchToSpaceND"),r=e.reduce((i,u)=>i*u);g(s.rank>=1+e.length,()=>`input rank is ${s.rank} but should be > than blockShape.length ${e.length}`),g(n.length===e.length,()=>`crops.length is ${n.length} but should be equal to blockShape.length  ${e.length}`),g(s.shape[0]%r===0,()=>`input tensor batch is ${s.shape[0]} but is not divisible by the product of the elements of blockShape ${e.join(" * ")} === ${r}`);const a={x:s},o={blockShape:e,crops:n};return w.runKernel(Ro,a,o)}const xr=b({batchToSpaceND_:Gm});function Hm(t){let e;return t.rank===0||t.rank===1?e=$(t,[1,1,1,t.size]):t.rank===2?e=$(t,[1,1,t.shape[0],t.shape[1]]):t.rank===3?e=$(t,[1,t.shape[0],t.shape[1],t.shape[2]]):e=t,e}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Km(t,e,n,s,r,a){a==null&&(a=.001);const o=m(t,"x","batchNorm"),i=m(e,"mean","batchNorm"),u=m(n,"variance","batchNorm");let c;r!=null&&(c=m(r,"scale","batchNorm"));let h;s!=null&&(h=m(s,"offset","batchNorm")),g(i.rank===u.rank,()=>"Batch normalization gradient requires mean and variance to have equal ranks."),g(h==null||i.rank===h.rank,()=>"Batch normalization gradient requires mean and offset to have equal ranks."),g(c==null||i.rank===c.rank,()=>"Batch normalization gradient requires mean and scale to have equal ranks.");const f={x:Hm(o),scale:c,offset:h,mean:i,variance:u},d={varianceEpsilon:a},y=w.runKernel(Ni,f,d);return $(y,o.shape)}const On=b({batchNorm_:Km});function Xm(t,e,n,s,r,a){const o=m(t,"x","batchNorm"),i=m(e,"mean","batchNorm"),u=m(n,"variance","batchNorm");let c;r!=null&&(c=m(r,"scale","batchNorm"));let h;return s!=null&&(h=m(s,"offset","batchNorm")),g(o.rank===2,()=>`Error in batchNorm2D: x must be rank 2 but got rank ${o.rank}.`),g(i.rank===2||i.rank===1,()=>`Error in batchNorm2D: mean must be rank 2 or rank 1 but got rank ${i.rank}.`),g(u.rank===2||u.rank===1,()=>`Error in batchNorm2D: variance must be rank 2 or rank 1 but got rank ${u.rank}.`),c!=null&&g(c.rank===2||c.rank===1,()=>`Error in batchNorm2D: scale must be rank 2 or rank 1 but got rank ${c.rank}.`),h!=null&&g(h.rank===2||h.rank===1,()=>`Error in batchNorm2D: offset must be rank 2 or rank 1 but got rank ${h.rank}.`),On(o,i,u,h,c,a)}const sl=b({batchNorm2d_:Xm});function Zm(t,e,n,s,r,a){const o=m(t,"x","batchNorm"),i=m(e,"mean","batchNorm"),u=m(n,"variance","batchNorm");let c;r!=null&&(c=m(r,"scale","batchNorm"));let h;return s!=null&&(h=m(s,"offset","batchNorm")),g(o.rank===3,()=>`Error in batchNorm3D: x must be rank 3 but got rank ${o.rank}.`),g(i.rank===3||i.rank===1,()=>`Error in batchNorm3D: mean must be rank 3 or rank 1 but got rank ${i.rank}.`),g(u.rank===3||u.rank===1,()=>`Error in batchNorm3D: variance must be rank 3 or rank 1 but got rank ${u.rank}.`),c!=null&&g(c.rank===3||c.rank===1,()=>`Error in batchNorm3D: scale must be rank 3 or rank 1 but got rank ${c.rank}.`),h!=null&&g(h.rank===3||h.rank===1,()=>`Error in batchNorm3D: offset must be rank 3 or rank 1 but got rank ${h.rank}.`),On(o,i,u,h,c,a)}const rl=b({batchNorm3d_:Zm});function Jm(t,e,n,s,r,a){const o=m(t,"x","batchNorm"),i=m(e,"mean","batchNorm"),u=m(n,"variance","batchNorm");let c;r!=null&&(c=m(r,"scale","batchNorm"));let h;return s!=null&&(h=m(s,"offset","batchNorm")),g(o.rank===4,()=>`Error in batchNorm4D: x must be rank 4 but got rank ${o.rank}.`),g(i.rank===4||i.rank===1,()=>`Error in batchNorm4D: mean must be rank 4 or rank 1 but got rank ${i.rank}.`),g(u.rank===4||u.rank===1,()=>`Error in batchNorm4D: variance must be rank 4 or rank 1 but got rank ${u.rank}.`),c!=null&&g(c.rank===4||c.rank===1,()=>`Error in batchNorm4D: scale must be rank 4 or rank 1 but got rank ${c.rank}.`),h!=null&&g(h.rank===4||h.rank===1,()=>`Error in batchNorm4D: offset must be rank 4 or rank 1 but got rank ${h.rank}.`),On(o,i,u,h,c,a)}const al=b({batchNorm4d_:Jm});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Ym(t,e,n){const s=m(t,"x","bincount"),r=m(e,"weights","bincount");g(s.dtype==="int32",()=>`Error in bincount: input dtype must be int32, but got ${s.dtype}`),g(n>=0,()=>`size must be non-negative, but got ${n}.`),g(r.size===s.size||r.size===0,()=>`Error in bincount: weights must have the same size as input or0-length, but got input shape: ${s.shape}, weights shape: ${r.shape}.`);const a={x:s,weights:r},o={size:n};return w.runKernel(Lo,a,o)}const Ar=b({bincount_:Ym});/**
 * @license
 * Copyright 2023 Google LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Qm(t,e){const n=m(t,"x","bitwiseAnd"),s=m(e,"y","bitwiseAnd");if(!Re(n.shape,s.shape))throw new Error(`BitwiseAnd: Tensors must have the same shape. x: ${n.shape}, y: ${s.shape}`);if(n.dtype!=="int32"||s.dtype!=="int32")throw new Error(`BitwiseAnd: Only supports 'int32' values in tensor, found type of x: ${n.dtype} and type of y: ${s.dtype}`);const r={a:n,b:s};return w.runKernel(Bo,r)}const ol=b({bitwiseAnd_:Qm});/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function eg(t,e){const n=m(t,"s0","broadcastArgs","int32"),s=m(e,"s1","broadcastArgs","int32");if(n.rank!==1)throw new Error(`broadcastArgs(): first input must be a vector (rank=1). Has rank ${n.rank}`);if(s.rank!==1)throw new Error(`broadcastArgs(): second input must be a vector (rank=1). Has rank ${s.rank}`);const r={s0:n,s1:s};return w.runKernel(Po,r)}const il=b({broadcastArgs_:eg});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function tg(t,e){let n=m(t,"broadcastTo","x");const s=n.shape;if(Se(e),e.length<n.rank)throw new Error(`broadcastTo(): shape.length=${e.length} < input.rank=${n.rank}.`);if(e.length>n.rank){const c=n.shape.slice();for(;c.length<e.length;)c.unshift(1);n=$(n,c)}const r=n.shape,a=Array.from(e);for(let c=e.length-1;c>=0;c--)if(r[c]===e[c])a[c]=1;else if(n.shape[c]!==1)throw new Error(`broadcastTo(): [${s}] cannot be broadcast to [${e}].`);if(a.map((c,h)=>c>1?h:-1).filter(c=>c>=0).length===0)return Xe(n);const i={x:n},u={reps:a};return w.runKernel(yr,i,u)}const ln=b({broadcastTo_:tg});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ng(t){const n={x:m(t,"x","ceil","float32")};return w.runKernel(zo,n)}const ul=b({ceil_:ng});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function tn(t,e,n){Se(t),n=n||vn(e);const s={shape:t,value:e,dtype:n};return w.runKernel(gi,{},s)}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function sg(t,e,n){const s=m(t,"x","clipByValue");if(g(e<=n,()=>`Error in clip: min (${e}) must be less than or equal to max (${n}).`),e===n)return tn(s.shape,e,s.dtype);const r={x:s},a={clipValueMin:e,clipValueMax:n};return w.runKernel(Vo,r,a)}const cl=b({clipByValue_:sg});function rg(t){return ue(t,0)}const ll=b({concat1d_:rg});function ag(t,e){return ue(t,e)}const hl=b({concat2d_:ag});function og(t,e){return ue(t,e)}const pl=b({concat3d_:og});function ig(t,e){return ue(t,e)}const fl=b({concat4d_:ig});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ug(t,e,n,s,r="NHWC",a=[1,1],o){const i=m(t,"x","conv2d","float32"),u=m(e,"filter","conv2d","float32");let c=i,h=!1;i.rank===3&&(h=!0,c=$(i,[1,i.shape[0],i.shape[1],i.shape[2]])),g(c.rank===4,()=>`Error in conv2d: input must be rank 4, but got rank ${c.rank}.`),g(u.rank===4,()=>`Error in conv2d: filter must be rank 4, but got rank ${u.rank}.`),Ae("conv2d",s,o);const l=r==="NHWC"?c.shape[3]:c.shape[1];g(l===u.shape[2],()=>`Error in conv2d: depth of input (${l}) must match input depth for filter ${u.shape[2]}.`),g(Ye(n,a),()=>`Error in conv2D: Either strides or dilations must be 1. Got strides ${n} and dilations '${a}'`),g(It(a),()=>"Error in conv2D: Dilated rates should be larger than 0."),g(It(n),()=>"Error in conv2D: Strides should be larger than 0.");const f={x:c,filter:u},d={strides:n,pad:s,dataFormat:r,dilations:a,dimRoundingMode:o},y=w.runKernel(Uo,f,d);return h?$(y,[y.shape[1],y.shape[2],y.shape[3]]):y}const Dn=b({conv2d_:ug});function cg(t,e,n,s,r="NWC",a=1,o){const i=m(t,"x","conv1d"),u=m(e,"filter","conv1d");let c=i,h=!1;i.rank===2&&(h=!0,c=$(i,[1,i.shape[0],i.shape[1]])),g(c.rank===3,()=>`Error in conv1d: input must be rank 3, but got rank ${c.rank}.`),g(u.rank===3,()=>`Error in conv1d: filter must be rank 3, but got rank ${u.rank}.`),Ae("conv1d",s,o),g(c.shape[2]===u.shape[1],()=>`Error in conv1d: depth of input (${c.shape[2]}) must match input depth for filter ${u.shape[1]}.`),g(Ye(n,a),()=>`Error in conv1D: Either stride or dilation must be 1. Got stride ${n} and dilation '${a}'`),g(It(a),()=>"Error in conv1D: Dilated rates should be larger than 0."),g(It(n),()=>"Error in conv1D: Stride should be larger than 0."),g(r==="NWC",()=>`Error in conv1d: got dataFormat of ${r} but only NWC is currently supported.`);const l=$(u,[1,u.shape[0],u.shape[1],u.shape[2]]),f=$(c,[c.shape[0],1,c.shape[1],c.shape[2]]),N=Dn(f,l,[1,n],s,"NHWC",[1,a],o);return h?$(N,[N.shape[2],N.shape[3]]):$(N,[N.shape[0],N.shape[2],N.shape[3]])}const dl=b({conv1d_:cg});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function lg(t,e,n,s,r,a="NHWC",o){g(t.length===e.rank,()=>`Length of inShape (${t.length}) and rank of dy (${e.rank}) must match`);let i=t,u=e,c=!1;e.rank===3&&(c=!0,u=$(e,[1,e.shape[0],e.shape[1],e.shape[2]]),i=[1,t[0],t[1],t[2]]),g(i.length===4,()=>`Error in conv2dDerInput: inShape must be length 4, but got length ${i.length}.`),g(u.rank===4,()=>`Error in conv2dDerInput: dy must be rank 4, but got rank ${u.rank}`),g(n.rank===4,()=>`Error in conv2dDerInput: filter must be rank 4, but got rank ${n.rank}`);const h=a==="NHWC"?i[3]:i[1],l=a==="NHWC"?u.shape[3]:u.shape[1];g(h===n.shape[2],()=>`Error in conv2dDerInput: depth of input (${h}) must match input depth for filter ${n.shape[2]}.`),g(l===n.shape[3],()=>`Error in conv2dDerInput: depth of output (${l}) must match output depth for filter ${n.shape[3]}.`),Ae("conv2dDerInput",r,o);const f={dy:u,filter:n},d={strides:s,pad:r,dataFormat:a,dimRoundingMode:o,inputShape:i},y=w.runKernel(Go,f,d);return c?$(y,[y.shape[1],y.shape[2],y.shape[3]]):y}const ml=b({conv2DBackpropInput_:lg});function hg(t,e,n,s,r,a){const o=m(t,"x","conv2dTranspose"),i=m(e,"filter","conv2dTranspose");return ml(n,o,i,s,r,"NHWC",a)}const gl=b({conv2dTranspose_:hg});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function pg(t,e,n,s,r="NDHWC",a=[1,1,1]){const o=m(t,"x","conv3d"),i=m(e,"filter","conv3d");let u=o,c=!1;o.rank===4&&(c=!0,u=$(o,[1,o.shape[0],o.shape[1],o.shape[2],o.shape[3]])),g(u.rank===5,()=>`Error in conv3d: input must be rank 5, but got rank ${u.rank}.`),g(i.rank===5,()=>`Error in conv3d: filter must be rank 5, but got rank ${i.rank}.`),g(u.shape[4]===i.shape[3],()=>`Error in conv3d: depth of input (${u.shape[4]}) must match input depth for filter ${i.shape[3]}.`),g(Ye(n,a),()=>`Error in conv3D: Either strides or dilations must be 1. Got strides ${n} and dilations '${a}'`),g(r==="NDHWC",()=>`Error in conv3d: got dataFormat of ${r} but only NDHWC is currently supported.`),g(It(a),()=>"Error in conv3D: Dilated rates should be larger than 0."),g(It(n),()=>"Error in conv3D: Strides should be larger than 0.");const h={x:u,filter:i},l={strides:n,pad:s,dataFormat:r,dilations:a},f=w.runKernel(Ho,h,l);return c?$(f,[f.shape[1],f.shape[2],f.shape[3],f.shape[4]]):f}const yl=b({conv3d_:pg});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function fg(t,e,n,s,r){g(t.length===e.rank,()=>`Length of inShape (${t.length}) and rank of dy (${e.rank}) must match`);let a=t,o=e,i=!1;e.rank===4&&(i=!0,o=$(e,[1,e.shape[0],e.shape[1],e.shape[2],e.shape[3]]),a=[1,t[0],t[1],t[2],t[3]]);const u=a[4],c=o.shape[4];g(a.length===5,()=>`Error in conv3dDerInput: inShape must be length 5, but got length ${a.length}.`),g(o.rank===5,()=>`Error in conv3dDerInput: dy must be rank 5, but got rank ${o.rank}`),g(n.rank===5,()=>`Error in conv3dDerInput: filter must be rank 5, but got rank ${n.rank}`),g(u===n.shape[3],()=>`Error in conv3dDerInput: depth of input (${u}) must match input depth for filter ${n.shape[3]}.`),g(c===n.shape[4],()=>`Error in conv3dDerInput: depth of output (${c}) must match output depth for filter ${n.shape[4]}.`);const h={dy:o,filter:n},l={pad:r,strides:s,inputShape:a},f=w.runKernel(Ko,h,l);return i?$(f,[f.shape[1],f.shape[2],f.shape[3],f.shape[4]]):f}const dg=b({conv3DBackpropInput_:fg});function mg(t,e,n,s,r){const a=m(t,"x","conv3dTranspose"),o=m(e,"filter","conv3dTranspose");return dg(n,a,o,s,r)}const bl=b({conv3dTranspose_:mg});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function gg(t){const n={x:m(t,"x","cos","float32")};return w.runKernel(Xo,n)}const wl=b({cos_:gg});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function yg(t){const n={x:m(t,"x","cosh","float32")};return w.runKernel(Zo,n)}const Nl=b({cosh_:yg});/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function bg(t,e=0,n=!1,s=!1){const a={x:m(t,"x","cumprod")},o={axis:e,exclusive:n,reverse:s};return w.runKernel(Jo,a,o)}const Sl=b({cumprod_:bg});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function wg(t,e=0,n=!1,s=!1){const a={x:m(t,"x","cumsum")},o={axis:e,exclusive:n,reverse:s};return w.runKernel(Yo,a,o)}const Tl=b({cumsum_:wg});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Ng(t,e,n,s=!1){const r=m(t,"x","denseBincount"),a=m(e,"weights","denseBincount");g(r.dtype==="int32",()=>`Error in denseBincount: input dtype must be int32, but got ${r.dtype}`),g(r.rank<=2,()=>`Error in denseBincount: input must be at most rank 2, but got rank ${r.rank}.`),g(n>=0,()=>`size must be non-negative, but got ${n}.`),g(a.size===r.size||a.size===0,()=>`Error in denseBincount: weights must have the same shape as x or 0-length, but got x shape: ${r.shape}, weights shape: ${a.shape}.`);const o={x:r,weights:a},i={size:n,binaryOutput:s};return w.runKernel(ei,o,i)}const $l=b({denseBincount_:Ng});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Sg(t,e,n="NHWC"){const s=m(t,"x","depthToSpace","float32"),r=n==="NHWC"?s.shape[1]:s.shape[2],a=n==="NHWC"?s.shape[2]:s.shape[3],o=n==="NHWC"?s.shape[3]:s.shape[1];g(e>1,()=>`blockSize should be > 1 for depthToSpace, but was: ${e}`),g(r*e>=0,()=>`Negative dimension size caused by overflow when multiplying
    ${r} and ${e}  for depthToSpace with input shape
    ${s.shape}`),g(a*e>=0,()=>`Negative dimension size caused by overflow when multiplying
    ${a} and ${e} for depthToSpace with input shape
        ${s.shape}`),g(o%(e*e)===0,()=>`Dimension size must be evenly divisible by ${e*e} but is ${o} for depthToSpace with input shape ${s.shape}`);const i={x:s},u={blockSize:e,dataFormat:n};return w.runKernel(ti,i,u)}const El=b({depthToSpace_:Sg});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Tg(t,e,n,s,r="NHWC",a=[1,1],o){const i=m(t,"x","depthwiseConv2d","float32"),u=m(e,"filter","depthwiseConv2d","float32");let c=i,h=!1;i.rank===3&&(h=!0,c=$(i,[1,i.shape[0],i.shape[1],i.shape[2]])),g(c.rank===4,()=>`Error in depthwiseConv2d: input must be rank 4, but got rank ${c.rank}.`),g(u.rank===4,()=>`Error in depthwiseConv2d: filter must be rank 4, but got rank ${u.rank}.`);const l=r==="NHWC"?c.shape[3]:c.shape[1];g(l===u.shape[2],()=>`Error in depthwiseConv2d: number of input channels (${l}) must match the inChannels dimension in filter ${u.shape[2]}.`),Ae("depthwiseConv2d",s,o);const f={x:c,filter:u},d={strides:n,pad:s,dataFormat:r,dilations:a,dimRoundingMode:o},y=w.runKernel(ni,f,d);return h?$(y,[y.shape[1],y.shape[2],y.shape[3]]):y}const cs=b({depthwiseConv2d_:Tg});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function $g(t){const n={x:m(t,"x","diag")};return w.runKernel(ai,n)}const kl=b({diag_:$g});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Eg(t,e,n,s,r=[1,1],a="NHWC"){const o=m(t,"x","dilation2d"),i=m(e,"filter","dilation2d");g(o.rank===3||o.rank===4,()=>`Error in dilation2d: input must be rank 3 or 4, but got rank ${o.rank}.`),g(i.rank===3,()=>`Error in dilation2d: filter must be rank 3, but got rank ${i.rank}.`),g(a==="NHWC",()=>`Error in dilation2d: Only NHWC is currently supported, but got dataFormat of ${a}`);let u=o,c=!1;o.rank===3&&(u=$(o,[1,o.shape[0],o.shape[1],o.shape[2]]),c=!0),g(u.shape[3]===i.shape[2],()=>`Error in dilation2d:  input and filter must have the same depth: ${u.shape[3]} vs ${i.shape[2]}`);const h={x:u,filter:i},l={strides:n,pad:s,dilations:r},f=w.runKernel(oi,h,l);return c?$(f,[f.shape[1],f.shape[2],f.shape[3]]):f}const vl=b({dilation2d_:Eg});/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function _l(t,e){const n=t.length,s=[];for(let r=0;r<n;r++){const a=n-1-r,o=t[a]||1;(e[e.length-1-r]||1)>1&&o===1&&s.unshift(a)}return s}function Or(t,e){const n=[];for(let s=0;s<e.length;s++){const r=t[t.length-s-1],a=e.length-s-1,o=e[a];(r==null||r===1&&o>1)&&n.unshift(a)}return n}function ne(t,e){const n=Math.max(t.length,e.length),s=new Array(n);for(let r=0;r<n;r++){let a=t[t.length-r-1];a==null&&(a=1);let o=e[e.length-r-1];if(o==null&&(o=1),a===1)s[n-r-1]=o;else if(o===1)s[n-r-1]=a;else if(a!==o){const i=`Operands could not be broadcast together with shapes ${t} and ${e}.`;throw Error(i)}else s[n-r-1]=a}return s}const kg=Object.freeze(Object.defineProperty({__proto__:null,assertAndGetBroadcastShape:ne,getBroadcastDims:_l,getReductionAxes:Or},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function vg(t,e){let n=m(t,"a","equal","string_or_numeric"),s=m(e,"b","equal","string_or_numeric");[n,s]=ee(n,s),ne(n.shape,s.shape);const r={a:n,b:s};return w.runKernel(hi,r)}const Dr=b({equal_:vg});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function _g(t,e,n){const s=m(e,"a","where"),r=m(n,"b","where"),a=m(t,"condition","where","bool"),o=ne(ne(a.shape,s.shape),r.shape),i=ln(a,o),u=ln(s,o),c=ln(r,o),h={condition:i,t:u,e:c};return w.runKernel(_u,h)}const Ze=b({where_:_g});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Ig(t){const n={x:m(t,"x","zerosLike")};return w.runKernel(ac,n)}const Ne=b({zerosLike_:Ig});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function xg(t,e){let n=m(t,"a","div"),s=m(e,"b","div");[n,s]=ee(n,s);const r=K(n,s),a=Ne(r),o=Dr(s,a);return Ze(o,a,r)}const Il=b({divNoNan_:xg});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Ag(t,e){const n=m(t,"t1","dot"),s=m(e,"t2","dot");g((n.rank===1||n.rank===2)&&(s.rank===1||s.rank===2),()=>`Error in dot: inputs must all be rank 1 or 2, but got ranks ${n.rank} and ${s.rank}.`);const r=n.rank===1?n.size:n.shape[1],a=s.rank===1?s.size:s.shape[0];if(g(r===a,()=>`Error in dot: inner dimensions of inputs must match, but got ${r} and ${a}.`),n.rank===1&&s.rank===1){const o=$(n,[1,-1]),i=$(s,[-1,1]),u=V(o,i);return $(u,[])}else if(n.rank===1&&s.rank===2){const o=$(n,[1,-1]),i=$(s,[s.shape[0],s.shape[1]]),u=V(o,i);return $(u,[u.size])}else if(n.rank===2&&s.rank===1){const o=$(s,[-1,1]),i=V(n,o);return $(i,[i.size])}else{const o=$(s,[s.shape[0],s.shape[1]]);return V(n,o)}}const xl=b({dot_:Ag});/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Og(t,...e){const n=e.map((r,a)=>m(r,`tensors${a}`,"einsum")),s={equation:t};return w.runKernel(ui,n,s)}const bt=b({einsum_:Og});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Dg(t){const n={x:m(t,"x","elu","float32")};return w.runKernel(ci,n)}const Fr=b({elu_:Dg});/**
 * @license
 * Copyright 2023 Google LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Fg(t,e){const n=m(t,"x","ensureShape","string_or_numeric");if(!io(n.shape,e))throw new Error(`EnsureShape: Shape of tensor ${n.shape} is not compatible with expected shape ${e}`);return t}const Al=b({ensureShape_:Fg});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Cg(t){let e=m(t,"x","erf");g(e.dtype==="int32"||e.dtype==="float32",()=>"Input dtype must be `int32` or `float32`."),e.dtype==="int32"&&(e=X(e,"float32"));const n={x:e};return w.runKernel(li,n)}const Ol=b({erf_:Cg});/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Cr(t,e){for(let n=0;n<t.length;++n)if(t[t.length-n-1]!==e-1-n)return!1;return!0}function Dl(t,e,n){const s=t.length+e.length,r=[];let a=0,o=0;for(let i=0;i<s;i++)n.indexOf(i)===-1?r.push(t[a++]):r.push(e[o++]);return r}function Rg(t,e){const n=[],s=t.length;for(let a=0;a<s;a++)e.indexOf(a)===-1&&n.push(t[a]);const r=e.map(a=>t[a]);return[n,r]}function Fn(t,e){const n=e.map(s=>1);return Dl(t,n,e)}function Lg(t,e,n){g(Cr(e,n),()=>`${t} supports only inner-most axes for now. Got axes ${e} and rank-${n} input.`)}function Bg(t,e){if(Cr(t,e))return null;const n=[];for(let s=0;s<e;++s)t.indexOf(s)===-1&&n.push(s);return t.forEach(s=>n.push(s)),n}function Pg(t){return t.map((e,n)=>[n,e]).sort((e,n)=>e[1]-n[1]).map(e=>e[0])}function zg(t,e){const n=[];for(let s=e-t;s<e;++s)n.push(s);return n}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Vg(t,e=null,n=!1){const r={x:m(t,"x","max")},a={reductionIndices:e,keepDims:n};return w.runKernel(Vi,r,a)}const Et=b({max_:Vg});/**
 * @license
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Wg(t,e=null,n=!1){const r={x:m(t,"x","min")},a={axis:e,keepDims:n};return w.runKernel(Gi,r,a)}const es=b({min_:Wg});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Mg(t,e){let n=m(t,"base","pow"),s=m(e,"exp","pow");[n,s]=ee(n,s);const r={a:n,b:s};return w.runKernel(iu,r)}const Xt=b({pow_:Mg});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function z(t,e){if((ae(t)&&e!=="string"||Array.isArray(t))&&e!=="complex64")throw new Error("Error creating a new Scalar: value must be a primitive (number|boolean|string)");if(e==="string"&&ae(t)&&!(t instanceof Uint8Array))throw new Error("When making a scalar from encoded string, the value must be `Uint8Array`.");return pt(t,[],[],e)}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function jg(t){const n={x:m(t,"x","sqrt","float32")};return w.runKernel(Ru,n)}const We=b({sqrt_:jg});/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Ug(t){const e=m(t,"x","square"),n={};return w.runKernel("Square",{x:e},n)}const xe=b({square_:Ug});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function qg(t,e=null,n=!1){let s=m(t,"x","sum");s.dtype==="bool"&&(s=X(s,"int32"));const r={x:s},a={axis:e,keepDims:n};return w.runKernel(Lu,r,a)}const H=b({sum_:qg});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Gg(t,e="euclidean",n=null,s=!1){t=m(t,"x","norm");const r=Fl(t,e,n);let a=r.shape;if(s){const o=kn(n,t.shape);a=Fn(r.shape,o)}return $(r,a)}function Fl(t,e,n=null){if(t.rank===0)return be(t);if(t.rank!==1&&n===null)return Fl($(t,[-1]),e,n);if(t.rank===1||typeof n=="number"||Array.isArray(n)&&n.length===1){if(e===1)return H(be(t),n);if(e===1/0)return Et(be(t),n);if(e===-1/0)return es(be(t),n);if(e==="euclidean"||e===2)return We(H(Xt(be(t),z(2,"int32")),n));throw new Error(`Error in norm: invalid ord value: ${e}`)}if(Array.isArray(n)&&n.length===2){if(e===1)return Et(H(be(t),n[0]),n[1]-1);if(e===1/0)return Et(H(be(t),n[1]),n[0]);if(e===-1/0)return es(H(be(t),n[1]),n[0]);if(e==="fro"||e==="euclidean")return We(H(xe(t),n));throw new Error(`Error in norm: invalid ord value: ${e}`)}throw new Error(`Error in norm: invalid axis: ${n}`)}const Cn=b({norm_:Gg});/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Hg(t,e=null,n=!1){return Cn(t,"euclidean",e,n)}const Cl=b({euclideanNorm_:Hg});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Kg(t){const n={x:m(t,"x","exp")};return w.runKernel(pi,n)}const lt=b({exp_:Kg});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Xg(t,e=0){const n=m(t,"x","expandDims","string_or_numeric");g(e<=n.rank,()=>"Axis must be <= rank of the tensor");const s={input:n},r={dim:e};return w.runKernel(fi,s,r)}const qe=b({expandDims_:Xg});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Zg(t){const n={x:m(t,"x","expm1")};return w.runKernel(di,n)}const Rl=b({expm1_:Zg});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Jg(t,e){const n=m(t,"x","tile","string_or_numeric");g(n.rank===e.length,()=>`Error in transpose: rank of input ${n.rank} must match length of reps ${e}.`);const s={x:n},r={reps:e};return w.runKernel(yr,s,r)}const jt=b({tile_:Jg});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Yg(t,e,n,s="float32"){e==null&&(e=t);const r=Ve([t,e],s),a=t<=e?t:e;for(let i=0;i<a;++i)r.set(1,i,i);const o=$(r.toTensor(),[t,e]);if(n==null)return o;if(n.length===1)return jt(qe(o,0),[n[0],1,1]);if(n.length===2)return jt(qe(qe(o,0),0),[n[0],n[1],1,1]);if(n.length===3)return jt(qe(qe(qe(o,0),0),0),[n[0],n[1],n[2],1,1]);throw new Error(`eye() currently supports only 1D and 2D batchShapes, but received ${n.length}D.`)}const Rr=b({eye_:Yg});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Qg(t){const n={x:m(t,"x","floor","float32")};return w.runKernel(bi,n)}const Lr=b({floor_:Qg});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ey(t,e,n=0,s=0){const r=m(t,"x","gather"),a=m(e,"indices","gather","int32"),o={x:r,indices:a},i={axis:n,batchDims:s};return w.runKernel(Si,o,i)}const Br=b({gather_:ey});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ty(t,e){let n=m(t,"a","greater","string_or_numeric"),s=m(e,"b","greater","string_or_numeric");[n,s]=ee(n,s),ne(n.shape,s.shape);const r={a:n,b:s};return w.runKernel($i,r)}const Rn=b({greater_:ty});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ny(t,e){let n=m(t,"a","greaterEqual","string_or_numeric"),s=m(e,"b","greaterEqual","string_or_numeric");[n,s]=ee(n,s),ne(n.shape,s.shape);const r={a:n,b:s};return w.runKernel(Ei,r)}const Pr=b({greaterEqual_:ny});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function sy(t){const n={input:m(t,"input","imag")};return w.runKernel(vi,n)}const Ln=b({imag_:sy});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ry(t){const n={x:m(t,"x","isFinite")};return w.runKernel(_i,n)}const Ll=b({isFinite_:ry});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ay(t){const n={x:m(t,"x","isInf")};return w.runKernel(Ii,n)}const Bl=b({isInf_:ay});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function oy(t){const n={x:m(t,"x","isNaN")};return w.runKernel(xi,n)}const Pl=b({isNaN_:oy});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function iy(t,e=.2){const s={x:m(t,"x","leakyRelu")},r={alpha:e};return w.runKernel(Ai,s,r)}const zr=b({leakyRelu_:iy});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function uy(t,e){let n=m(t,"a","less","string_or_numeric"),s=m(e,"b","less","string_or_numeric");[n,s]=ee(n,s),ne(n.shape,s.shape);const r={a:n,b:s};return w.runKernel(Oi,r)}const ts=b({less_:uy});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function cy(t,e){let n=m(t,"a","lessEqual","string_or_numeric"),s=m(e,"b","lessEqual","string_or_numeric");[n,s]=ee(n,s),ne(n.shape,s.shape);const r={a:n,b:s};return w.runKernel(Di,r)}const ls=b({lessEqual_:cy});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function zl(t,e,n){if(n<=0)throw new Error("The number of values should be positive.");const s={start:t,stop:e,num:n};return w.runKernel(Fi,{},s)}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ly(t,e=5,n=1,s=1,r=.5){const a=m(t,"x","localResponseNormalization");g(a.rank===4||a.rank===3,()=>`Error in localResponseNormalization: x must be rank 3 or 4 but got
               rank ${a.rank}.`),g(qt(e),()=>`Error in localResponseNormalization: depthRadius must be an integer but got depthRadius ${e}.`);let o=a,i=!1;a.rank===3&&(i=!0,o=$(a,[1,a.shape[0],a.shape[1],a.shape[2]]));const u={x:o},c={depthRadius:e,bias:n,alpha:s,beta:r},h=w.runKernel(zi,u,c);return i?$(h,[h.shape[1],h.shape[2],h.shape[3]]):h}const Vl=b({localResponseNormalization_:ly});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function hy(t){const n={x:m(t,"x","log","float32")};return w.runKernel(Ci,n)}const Zt=b({log_:hy});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function py(t){const n={x:m(t,"x","log1p")};return w.runKernel(Ri,n)}const Vr=b({log1p_:py});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function fy(t){return g(ot(t),()=>"The f passed in grad(f) must be a function"),(e,n)=>{const s=m(e,"x","tf.grad","string_or_numeric"),r=n!=null?m(n,"dy","tf.grad"):null;return w.tidy(()=>{const{value:a,grads:o}=w.gradients(()=>t(s),[s],r);return r!=null&&fe(a.shape,r.shape,"The shape of dy passed in grad(f)(x, dy) must match the shape returned by f(x)"),hs(o),o[0]})}}function dy(t){return g(ot(t),()=>"The f passed in grads(f) must be a function"),(e,n)=>{g(Array.isArray(e),()=>"The args passed in grads(f)(args) must be an array of `Tensor`s or `TensorLike`s");const s=gn(e,"args","tf.grads","string_or_numeric"),r=n!=null?m(n,"dy","tf.grads"):null;return w.tidy(()=>{const{value:a,grads:o}=w.gradients(()=>t(...s),s,r);return r!=null&&fe(a.shape,r.shape,"The shape of dy passed in grads(f)([x1,...], dy) must match the shape returned by f([x1,...])"),hs(o),o})}}function my(t){return g(ot(t),()=>"The f passed in valueAndGrad(f) must be a function"),(e,n)=>{g(e instanceof te,()=>"The x passed in valueAndGrad(f)(x) must be a tensor"),g(n==null||n instanceof te,()=>"The dy passed in valueAndGrad(f)(x, dy) must be a tensor");const{grads:s,value:r}=w.gradients(()=>t(e),[e],n);return hs(s),{grad:s[0],value:r}}}function gy(t){return g(ot(t),()=>"The f passed in valueAndGrads(f) must be a function"),(e,n)=>{g(Array.isArray(e)&&e.every(r=>r instanceof te),()=>"The args passed in valueAndGrads(f)(args) must be array of tensors"),g(n==null||n instanceof te,()=>"The dy passed in valueAndGrads(f)(args, dy) must be a tensor");const s=w.gradients(()=>t(...e),e,n);return n!=null&&fe(s.value.shape,n.shape,"The shape of dy passed in valueAndGrads(f)([x1,...], dy) must match the shape returned by f([x1,...])"),hs(s.grads),s}}function Wl(t,e){g(ot(t),()=>"The f passed in variableGrads(f) must be a function"),g(e==null||Array.isArray(e)&&e.every(c=>c instanceof mn),()=>"The varList passed in variableGrads(f, varList) must be an array of variables");const n=e!=null;if(!n){e=[];for(const c in w.registeredVariables)e.push(w.registeredVariables[c])}const s=n?e.filter(c=>!c.trainable):null,r=e.length;e=e.filter(c=>c.trainable),g(e.length>0,()=>`variableGrads() expects at least one of the input variables to be trainable, but none of the ${r} variables is trainable.`);const a=!0,{value:o,grads:i}=w.gradients(t,e,null,a);g(i.some(c=>c!=null),()=>"Cannot find a connection between any variable and the result of the loss function y=f(x). Please make sure the operations that use variables are inside the function f passed to minimize()."),g(o.rank===0,()=>`The f passed in variableGrads(f) must return a scalar, but it returned a rank-${o.rank} tensor`);const u={};return e.forEach((c,h)=>{i[h]!=null&&(u[c.name]=i[h])}),s?.forEach(c=>u[c.name]=null),{value:o,grads:u}}function Me(t){return w.customGrad(t)}function hs(t){if(t.filter(n=>n==null).length>0)throw new Error(`Cannot compute gradient of y=f(x) with respect to x. Make sure that
    the f you passed encloses all operations that lead from x to y.`)}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function yy(t){const n={x:m(t,"x","neg")};return w.runKernel(Yi,n)}const Ce=b({neg_:yy});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function by(t){const n={x:m(t,"x","softplus")};return w.runKernel(Cu,n)}const Wr=b({softplus_:by});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function wy(t){const e=m(t,"x","logSigmoid");return Me(s=>({value:Ce(Wr(Ce(s))),gradFunc:o=>I(o,$t(Ce(s)))}))(e)}const Ml=b({logSigmoid_:wy});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Ny(t,e){let n=m(t,"a","sub"),s=m(e,"b","sub");[n,s]=ee(n,s);const r={a:n,b:s};return w.runKernel(Ju,r)}const P=b({sub_:Ny});/**
 * @license
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Sy(t,e=-1){const n=m(t,"logits","logSoftmax");if(e===-1&&(e=n.rank-1),e!==n.rank-1)throw Error(`Log Softmax along a non-last dimension is not yet supported. Logits was rank ${n.rank} and axis was ${e}`);return Me((r,a)=>{const i=Et(r,e,!0),u=P(r,i),c=P(X(u,"float32"),Zt(H(lt(u),e,!0)));return a([c]),{value:c,gradFunc:(l,f)=>{const[d]=f,y=!0,S=lt(d);return P(l,I(H(l,e,y),S))}}})(n)}const jl=b({logSoftmax_:Sy});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Ty(t,e=null,n=!1){const s=m(t,"x","logSumExp"),r=kn(e,s.shape),a=Et(s,r,!0),o=P(s,a),i=lt(o),u=H(i,r),c=Zt(u),h=C($(a,c.shape),c);if(n){const l=Fn(h.shape,r);return $(h,l)}return h}const Mr=b({logSumExp_:Ty});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function $y(t,e){const n=m(t,"a","logicalAnd","bool"),s=m(e,"b","logicalAnd","bool");ne(n.shape,s.shape);const r={a:n,b:s};return w.runKernel(Li,r)}const Nn=b({logicalAnd_:$y});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Ey(t){const n={x:m(t,"x","logicalNot","bool")};return w.runKernel(Bi,n)}const jr=b({logicalNot_:Ey});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ky(t,e){const n=m(t,"a","logicalOr","bool"),s=m(e,"b","logicalOr","bool");ne(n.shape,s.shape);const r={a:n,b:s};return w.runKernel(Pi,r)}const Ur=b({logicalOr_:ky});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function vy(t,e){const n=m(t,"a","logicalXor","bool"),s=m(e,"b","logicalXor","bool");return ne(n.shape,s.shape),Nn(Ur(t,e),jr(Nn(t,e)))}const Ul=b({logicalXor_:vy});/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const zn=2147483648;function _y(t,e,n="left"){const s=m(t,"sortedSequence","searchSorted"),r=m(e,"values","searchSorted"),a=s.shape[s.shape.length-1],o=r.shape[r.shape.length-1],i=$(s,[-1,a]),u=$(r,[-1,o]);if(i.rank<2)throw new Error("Sorted input argument must be at least 2-dimensional");if(i.shape[0]!==u.shape[0])throw new Error("Leading dimension of 'sortedSequence' and 'values' must match.");if(j(u.shape)>=zn)throw new Error(`values tensor size must less than ${zn}`);if(i.shape[1]>=zn)throw new Error(`trailing dim_size must less than ${zn} for int32 output type, was ${i.shape[1]}`);const c={sortedSequence:i,values:u},h={side:n};return w.runKernel(vu,c,h)}const ps=b({searchSorted_:_y});/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ql(t,e){return ps(t,e,"left")}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Iy(t,e,n,s,r){const a=m(t,"x","maxPool"),o=1;let i=a,u=!1;a.rank===3&&(u=!0,i=$(a,[1,a.shape[0],a.shape[1],a.shape[2]])),g(i.rank===4,()=>`Error in maxPool: input must be rank 4 but got rank ${i.rank}.`),g(Ye(n,o),()=>`Error in maxPool: Either strides or dilations must be 1. Got strides ${n} and dilations '${o}'`),Ae("maxPool",s,r);const c={x:i},h={filterSize:e,strides:n,pad:s,dimRoundingMode:r},l=w.runKernel(Mi,c,h);return u?$(l,[l.shape[1],l.shape[2],l.shape[3]]):l}const qr=b({maxPool_:Iy});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function xy(t,e=[1,1,1],n,s,r,a="NDHWC"){const o=m(t,"x","maxPool3d");let i=o,u=!1;o.rank===4&&(u=!0,i=$(o,[1,o.shape[0],o.shape[1],o.shape[2],o.shape[3]])),g(i.rank===5,()=>`Error in maxPool3d: x must be rank 5 but got rank ${i.rank}.`),g(a==="NDHWC",()=>`Error in maxPool3d: Only NDHWC is currently supported, but got dataFormat of ${a}`),Ae("maxPool3d",s,r);const c={x:i},h={filterSize:e,strides:n,pad:s,dimRoundingMode:r,dataFormat:a},l=w.runKernel(ji,c,h);return u?$(l,[l.shape[1],l.shape[2],l.shape[3],l.shape[4]]):l}const Gl=b({maxPool3d_:xy});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Ay(t,e,n,s,r=!1){const o={x:m(t,"x","maxPoolWithArgmax")},i={filterSize:e,strides:n,pad:s,includeBatchInIndex:r},u=w.runKernel(Ui,o,i);return{result:u[0],indexes:u[1]}}const Hl=b({maxPoolWithArgmax_:Ay});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Oy(t,e){let n=m(t,"a","maximum"),s=m(e,"b","maximum");[n,s]=ee(n,s),n.dtype==="bool"&&(n=X(n,"int32"),s=X(s,"int32")),ne(n.shape,s.shape);const r={a:n,b:s};return w.runKernel(Wi,r)}const Gr=b({maximum_:Oy});/**
 * @license
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Dy(t,e=null,n=!1){const r={x:m(t,"x","mean")},a={axis:e,keepDims:n};return w.runKernel(qi,r,a)}const Sn=b({mean_:Dy});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function xt(t,e="float32"){if(Se(t),e==="complex64"){const s=xt(t,"float32"),r=xt(t,"float32");return Je(s,r)}const n=os(j(t),e);return w.makeTensor(n,t,e)}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function rt(t,e="float32"){if(Se(t),e==="complex64"){const s=rt(t,"float32"),r=xt(t,"float32");return Je(s,r)}const n=lr(j(t),e);return w.makeTensor(n,t,e)}/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Kl(t,e,{indexing:n="xy"}={}){if(n!=="xy"&&n!=="ij")throw new TypeError(`${n} is not a valid third argument to meshgrid`);if(t===void 0)return[];let s=m(t,"x","meshgrid",t instanceof te?t.dtype:"float32");if(e===void 0)return[s];let r=m(e,"y","meshgrid",e instanceof te?e.dtype:"float32");const a=j(s.shape),o=j(r.shape);return n==="xy"?(s=$(s,[1,-1]),r=$(r,[-1,1]),[V(rt([o,1],s.dtype),s),V(r,rt([1,a],r.dtype))]):(s=$(s,[-1,1]),r=$(r,[1,-1]),[V(s,rt([1,o],s.dtype)),V(rt([a,1],r.dtype),r)])}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Fy(t,e){let n=m(t,"a","minimum"),s=m(e,"b","minimum");[n,s]=ee(n,s),n.dtype==="bool"&&(n=X(n,"int32"),s=X(s,"int32")),ne(n.shape,s.shape);const r={a:n,b:s};return w.runKernel(Hi,r)}const Tn=b({minimum_:Fy});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Cy(t,e,n){g(n==="reflect"||n==="symmetric",()=>`Invalid mode. Mode must be either reflect or symmetric. Got ${n}.`);const s=m(t,"x","mirrorPad");if(s.rank===0)throw new Error("mirrorPad(scalar) is not defined. Pass non-scalar to mirrorPad");g(e.length===s.rank,()=>`Padding doesn't match input. Must be ${s.rank}. Got ${e.length}.`);const r=n==="reflect"?1:0;for(let i=0;i<s.rank;i++)g(e[i].length===2,()=>"Invalid number of paddings. Must be length of 2 each."),g(e[i][0]>=0&&e[i][0]<=s.shape[i]-r&&e[i][1]>=0&&e[i][1]<=s.shape[i]-r,()=>`Padding in dimension ${i} cannot be greater than or equal to ${s.shape[i]-r} or less than 0 for input of shape ${s.shape}`);const a={paddings:e,mode:n},o={x:s};return w.runKernel(Ki,o,a)}const Xl=b({mirrorPad_:Cy});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Ry(t,e){let n=m(t,"a","mod"),s=m(e,"b","mod");[n,s]=ee(n,s);const r={a:n,b:s};return w.runKernel(Xi,r)}const Zl=b({mod_:Ry});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Ly(t,e=null,n=!1){t=m(t,"x","moments");const s=kn(e,t.shape),r=Sn(t,s,n);let a=r.shape;n||(a=Fn(r.shape,s));const o=xe(P(X(t,"float32"),$(r,a))),i=Sn(o,s,n);return{mean:r,variance:i}}const Jl=b({moments_:Ly});function By(t,e,n,s){const r=m(e,"data","multiRNNCell"),a=gn(n,"c","multiRNNCell"),o=gn(s,"h","multiRNNCell");let i=r;const u=[];for(let l=0;l<t.length;l++){const f=t[l](i,a[l],o[l]);u.push(f[0]),u.push(f[1]),i=f[1]}const c=[],h=[];for(let l=0;l<u.length;l+=2)c.push(u[l]),h.push(u[l+1]);return[c,h]}const Yl=b({multiRNNCell_:By});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Py(t,e,n,s=!1){const r=m(t,"logits","multinomial"),a=r.size,o=r.rank;if(a<2)throw new Error(`Error in multinomial: you need at least 2 outcomes, but got ${a}.`);if(o>2)throw new Error(`Rank of probabilities must be 1 or 2, but is ${o}`);n=n||Math.random();const u={logits:o===1?$(r,[1,-1]):r},c={numSamples:e,seed:n,normalized:s},h=w.runKernel(Zi,u,c);return o===1?$(h,[h.size]):h}const Ql=b({multinomial_:Py});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function zy(t,e){let n=m(t,"a","notEqual","string_or_numeric"),s=m(e,"b","notEqual","string_or_numeric");[n,s]=ee(n,s),ne(n.shape,s.shape);const r={a:n,b:s};return w.runKernel(Qi,r)}const Hr=b({notEqual_:zy});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Vy(t,e,n=1,s=0,r="int32"){if(e<2)throw new Error(`Error in oneHot: depth must be >=2, but it is ${e}`);const o={indices:m(t,"indices","oneHot","int32")},i={dtype:r,depth:e,onValue:n,offValue:s};return w.runKernel(ru,o,i)}const ns=b({oneHot_:Vy});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Wy(t){const n={x:m(t,"x","onesLike")};return w.runKernel(su,n)}const eh=b({onesLike_:Wy});function My(t,e){const n=m(t,"v1","outerProduct"),s=m(e,"v2","outerProduct");g(n.rank===1&&s.rank===1,()=>`Error in outerProduct: inputs must be rank 1, but got ranks ${n.rank} and ${s.rank}.`);const r=$(n,[-1,1]),a=$(s,[1,-1]);return V(r,a)}const th=b({outerProduct_:My});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function jy(t,e,n=0){const s=m(t,"x","pad");if(s.rank===0)throw new Error("pad(scalar) is not defined. Pass non-scalar to pad");const r={paddings:e,constantValue:n},a={x:s};return w.runKernel(ou,a,r)}const nn=b({pad_:jy});function Uy(t,e,n=0){return g(e.length===2,()=>"Invalid number of paddings. Must be length of 2."),nn(t,[e],n)}const nh=b({pad1d_:Uy});function qy(t,e,n=0){return g(e.length===2&&e[0].length===2&&e[1].length===2,()=>"Invalid number of paddings. Must be length of 2 each."),nn(t,e,n)}const sh=b({pad2d_:qy});function Gy(t,e,n=0){return g(e.length===3&&e[0].length===2&&e[1].length===2&&e[2].length===2,()=>"Invalid number of paddings. Must be length of 2 each."),nn(t,e,n)}const rh=b({pad3d_:Gy});function Hy(t,e,n=0){return g(e.length===4&&e[0].length===2&&e[1].length===2&&e[2].length===2&&e[3].length===2,()=>"Invalid number of paddings. Must be length of 2 each."),nn(t,e,n)}const ah=b({pad4d_:Hy});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Ky(t,e,n){const s=m(t,"x","spaceToBatchND");g(s.rank>=1+e.length,()=>`input rank ${s.rank} should be > than [blockShape] ${e.length}`),g(n.length===e.length,()=>`paddings.shape[0] ${n.length} must be equal to [blockShape] ${e.length}`),g(s.shape.reduce((o,i,u)=>u>0&&u<=e.length?o&&(i+n[u-1][0]+n[u-1][1])%e[u-1]===0:o,!0),()=>`input spatial dimensions ${s.shape.slice(1)} with paddings ${n.toString()} must be divisible by blockShapes ${e.toString()}`);const r={x:s},a={blockShape:e,paddings:n};return w.runKernel(Bu,r,a)}const Kr=b({spaceToBatchND_:Ky});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Xy(t,e,n,s,r,a,o){r==null&&(r=[1,1]),a==null&&(a=1),s===0&&(s="valid");const i=m(t,"x","maxPool");let u=i,c=!1;i.rank===3&&(c=!0,u=$(i,[1,i.shape[0],i.shape[1],i.shape[2]])),g(Ye(a,r),()=>`Error in pool: Either strides or dilations must be 1. Got strides ${a} and dilations '${r}'`);const h=Yc(u.shape,e,a,r,s),l=[h.dilationHeight,h.dilationWidth];let f;s==="same"?f=Jy([h.filterHeight,h.filterWidth],l):f=[[0,0],[0,0]];const d=l[0]===1&&l[1]===1,[y,S]=Zy([h.inHeight,h.inWidth],l,f),N=d?s:"valid",T=d?u:Kr(u,l,y),E=(n==="avg"?()=>Ir(T,e,a,N,o):()=>qr(T,e,a,N,o))(),k=d?E:xr(E,l,S);return c?$(k,[k.shape[1],k.shape[2],k.shape[3]]):k}function Zy(t,e,n){const s=n.map(h=>h[0]),r=n.map(h=>h[1]),a=t.concat(s,r),o=e.map((h,l)=>(h-a[l]%h)%h),i=r.map((h,l)=>h+o[l]),u=e.map((h,l)=>[s[l],i[l]]),c=e.map((h,l)=>[0,o[l]]);return[u,c]}function Jy(t,e){const s=t.map((o,i)=>o+(o-1)*(e[i]-1)).map(o=>o-1),r=s.map(o=>Math.floor(o/2)),a=s.map((o,i)=>o-r[i]);return s.map((o,i)=>[r[i],a[i]])}const oh=b({pool_:Xy});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Yy(t,e){const n=m(t,"x","prelu"),s=m(e,"alpha","prelu"),r={x:n,alpha:s};return w.runKernel(uu,r)}const Xr=b({prelu_:Yy});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Qy(t,e=null,n=!1){let s=m(t,"x","prod");s.dtype==="bool"&&(s=X(s,"int32"));const r={x:s},a={axis:e,keepDims:n};return w.runKernel(cu,r,a)}const ih=b({prod_:Qy});/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function eb(t,e,n,s){const r=t.map((h,l)=>m(h,`tensors${l}`,"raggedGather","int32")),a=m(e,"paramsDenseValues","raggedGather"),o=m(n,"indices","raggedGather","int32"),i={paramsNestedSplits:r,paramsDenseValues:a,indices:o},u={outputRaggedRank:s},c=w.runKernel(lu,i,u);return{outputNestedSplits:c.slice(0,c.length-1),outputDenseValues:c[c.length-1]}}const uh=b({raggedGather_:eb});/**
 * @license
 * Copyright 2022 Google LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function tb(t,e,n){const s=m(t,"starts","raggedRange"),r=m(e,"limits","raggedRange",s.dtype),a=m(n,"deltas","raggedRange",s.dtype),o={starts:s,limits:r,deltas:a},i=w.runKernel(hu,o);return{rtNestedSplits:i[0],rtDenseValues:i[1]}}const ch=b({raggedRange_:tb});/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function nb(t,e,n,s,r){const a=m(t,"shape","raggedTensorToTensor","int32"),o=m(e,"values","raggedTensorToTensor"),i=m(n,"defaultValue","raggedTensorToTensor",o.dtype),u=s.map((l,f)=>m(l,`tensors${f}`,"raggedTensorToTensor","int32")),c={shape:a,values:o,defaultValue:i,rowPartitionTensors:u},h={rowPartitionTypes:r};return w.runKernel(pu,c,h)}const lh=b({raggedTensorToTensor_:nb});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function sb(t,e,n){Se(t);const s=j(t);let r=null;if(n==null||n==="float32")r=new Float32Array(s);else if(n==="int32")r=new Int32Array(s);else if(n==="bool")r=new Uint8Array(s);else throw new Error(`Unknown data type ${n}`);for(let a=0;a<s;a++)r[a]=e();return w.makeTensor(r,t,n)}const hh=b({rand_:sb});var Zr={exports:{}};Zr.exports;(function(t){(function(e,n,s){function r(u){var c=this,h=i();c.next=function(){var l=2091639*c.s0+c.c*23283064365386963e-26;return c.s0=c.s1,c.s1=c.s2,c.s2=l-(c.c=l|0)},c.c=1,c.s0=h(" "),c.s1=h(" "),c.s2=h(" "),c.s0-=h(u),c.s0<0&&(c.s0+=1),c.s1-=h(u),c.s1<0&&(c.s1+=1),c.s2-=h(u),c.s2<0&&(c.s2+=1),h=null}function a(u,c){return c.c=u.c,c.s0=u.s0,c.s1=u.s1,c.s2=u.s2,c}function o(u,c){var h=new r(u),l=c&&c.state,f=h.next;return f.int32=function(){return h.next()*4294967296|0},f.double=function(){return f()+(f()*2097152|0)*11102230246251565e-32},f.quick=f,l&&(typeof l=="object"&&a(l,h),f.state=function(){return a(h,{})}),f}function i(){var u=4022871197,c=function(h){h=String(h);for(var l=0;l<h.length;l++){u+=h.charCodeAt(l);var f=.02519603282416938*u;u=f>>>0,f-=u,f*=u,u=f>>>0,f-=u,u+=f*4294967296}return(u>>>0)*23283064365386963e-26};return c}n&&n.exports?n.exports=o:this.alea=o})(Dt,t)})(Zr);var rb=Zr.exports,Jr={exports:{}};Jr.exports;(function(t){(function(e,n,s){function r(i){var u=this,c="";u.x=0,u.y=0,u.z=0,u.w=0,u.next=function(){var l=u.x^u.x<<11;return u.x=u.y,u.y=u.z,u.z=u.w,u.w^=u.w>>>19^l^l>>>8},i===(i|0)?u.x=i:c+=i;for(var h=0;h<c.length+64;h++)u.x^=c.charCodeAt(h)|0,u.next()}function a(i,u){return u.x=i.x,u.y=i.y,u.z=i.z,u.w=i.w,u}function o(i,u){var c=new r(i),h=u&&u.state,l=function(){return(c.next()>>>0)/4294967296};return l.double=function(){do var f=c.next()>>>11,d=(c.next()>>>0)/4294967296,y=(f+d)/(1<<21);while(y===0);return y},l.int32=c.next,l.quick=l,h&&(typeof h=="object"&&a(h,c),l.state=function(){return a(c,{})}),l}n&&n.exports?n.exports=o:this.xor128=o})(Dt,t)})(Jr);var ab=Jr.exports,Yr={exports:{}};Yr.exports;(function(t){(function(e,n,s){function r(i){var u=this,c="";u.next=function(){var l=u.x^u.x>>>2;return u.x=u.y,u.y=u.z,u.z=u.w,u.w=u.v,(u.d=u.d+362437|0)+(u.v=u.v^u.v<<4^(l^l<<1))|0},u.x=0,u.y=0,u.z=0,u.w=0,u.v=0,i===(i|0)?u.x=i:c+=i;for(var h=0;h<c.length+64;h++)u.x^=c.charCodeAt(h)|0,h==c.length&&(u.d=u.x<<10^u.x>>>4),u.next()}function a(i,u){return u.x=i.x,u.y=i.y,u.z=i.z,u.w=i.w,u.v=i.v,u.d=i.d,u}function o(i,u){var c=new r(i),h=u&&u.state,l=function(){return(c.next()>>>0)/4294967296};return l.double=function(){do var f=c.next()>>>11,d=(c.next()>>>0)/4294967296,y=(f+d)/(1<<21);while(y===0);return y},l.int32=c.next,l.quick=l,h&&(typeof h=="object"&&a(h,c),l.state=function(){return a(c,{})}),l}n&&n.exports?n.exports=o:this.xorwow=o})(Dt,t)})(Yr);var ob=Yr.exports,Qr={exports:{}};Qr.exports;(function(t){(function(e,n,s){function r(i){var u=this;u.next=function(){var h=u.x,l=u.i,f,d;return f=h[l],f^=f>>>7,d=f^f<<24,f=h[l+1&7],d^=f^f>>>10,f=h[l+3&7],d^=f^f>>>3,f=h[l+4&7],d^=f^f<<7,f=h[l+7&7],f=f^f<<13,d^=f^f<<9,h[l]=d,u.i=l+1&7,d};function c(h,l){var f,d=[];if(l===(l|0))d[0]=l;else for(l=""+l,f=0;f<l.length;++f)d[f&7]=d[f&7]<<15^l.charCodeAt(f)+d[f+1&7]<<13;for(;d.length<8;)d.push(0);for(f=0;f<8&&d[f]===0;++f);for(f==8?d[7]=-1:d[f],h.x=d,h.i=0,f=256;f>0;--f)h.next()}c(u,i)}function a(i,u){return u.x=i.x.slice(),u.i=i.i,u}function o(i,u){i==null&&(i=+new Date);var c=new r(i),h=u&&u.state,l=function(){return(c.next()>>>0)/4294967296};return l.double=function(){do var f=c.next()>>>11,d=(c.next()>>>0)/4294967296,y=(f+d)/(1<<21);while(y===0);return y},l.int32=c.next,l.quick=l,h&&(h.x&&a(h,c),l.state=function(){return a(c,{})}),l}n&&n.exports?n.exports=o:this.xorshift7=o})(Dt,t)})(Qr);var ib=Qr.exports,ea={exports:{}};ea.exports;(function(t){(function(e,n,s){function r(i){var u=this;u.next=function(){var h=u.w,l=u.X,f=u.i,d,y;return u.w=h=h+1640531527|0,y=l[f+34&127],d=l[f=f+1&127],y^=y<<13,d^=d<<17,y^=y>>>15,d^=d>>>12,y=l[f]=y^d,u.i=f,y+(h^h>>>16)|0};function c(h,l){var f,d,y,S,N,T=[],A=128;for(l===(l|0)?(d=l,l=null):(l=l+"\0",d=0,A=Math.max(A,l.length)),y=0,S=-32;S<A;++S)l&&(d^=l.charCodeAt((S+32)%l.length)),S===0&&(N=d),d^=d<<10,d^=d>>>15,d^=d<<4,d^=d>>>13,S>=0&&(N=N+1640531527|0,f=T[S&127]^=d+N,y=f==0?y+1:0);for(y>=128&&(T[(l&&l.length||0)&127]=-1),y=127,S=4*128;S>0;--S)d=T[y+34&127],f=T[y=y+1&127],d^=d<<13,f^=f<<17,d^=d>>>15,f^=f>>>12,T[y]=d^f;h.w=N,h.X=T,h.i=y}c(u,i)}function a(i,u){return u.i=i.i,u.w=i.w,u.X=i.X.slice(),u}function o(i,u){i==null&&(i=+new Date);var c=new r(i),h=u&&u.state,l=function(){return(c.next()>>>0)/4294967296};return l.double=function(){do var f=c.next()>>>11,d=(c.next()>>>0)/4294967296,y=(f+d)/(1<<21);while(y===0);return y},l.int32=c.next,l.quick=l,h&&(h.X&&a(h,c),l.state=function(){return a(c,{})}),l}n&&n.exports?n.exports=o:this.xor4096=o})(Dt,t)})(ea);var ub=ea.exports,ta={exports:{}};ta.exports;(function(t){(function(e,n,s){function r(i){var u=this,c="";u.next=function(){var l=u.b,f=u.c,d=u.d,y=u.a;return l=l<<25^l>>>7^f,f=f-d|0,d=d<<24^d>>>8^y,y=y-l|0,u.b=l=l<<20^l>>>12^f,u.c=f=f-d|0,u.d=d<<16^f>>>16^y,u.a=y-l|0},u.a=0,u.b=0,u.c=-1640531527,u.d=1367130551,i===Math.floor(i)?(u.a=i/4294967296|0,u.b=i|0):c+=i;for(var h=0;h<c.length+20;h++)u.b^=c.charCodeAt(h)|0,u.next()}function a(i,u){return u.a=i.a,u.b=i.b,u.c=i.c,u.d=i.d,u}function o(i,u){var c=new r(i),h=u&&u.state,l=function(){return(c.next()>>>0)/4294967296};return l.double=function(){do var f=c.next()>>>11,d=(c.next()>>>0)/4294967296,y=(f+d)/(1<<21);while(y===0);return y},l.int32=c.next,l.quick=l,h&&(typeof h=="object"&&a(h,c),l.state=function(){return a(c,{})}),l}n&&n.exports?n.exports=o:this.tychei=o})(Dt,t)})(ta);var cb=ta.exports,ph={exports:{}};const lb={},hb=Object.freeze(Object.defineProperty({__proto__:null,default:lb},Symbol.toStringTag,{value:"Module"})),pb=Vp(hb);(function(t){(function(e,n,s){var r=256,a=6,o=52,i="random",u=s.pow(r,a),c=s.pow(2,o),h=c*2,l=r-1,f;function d(k,v,x){var O=[];v=v==!0?{entropy:!0}:v||{};var D=T(N(v.entropy?[k,E(n)]:k??A(),3),O),F=new y(O),B=function(){for(var L=F.g(a),M=u,U=0;L<c;)L=(L+U)*r,M*=r,U=F.g(1);for(;L>=h;)L/=2,M/=2,U>>>=1;return(L+U)/M};return B.int32=function(){return F.g(4)|0},B.quick=function(){return F.g(4)/4294967296},B.double=B,T(E(F.S),n),(v.pass||x||function(L,M,U,Y){return Y&&(Y.S&&S(Y,F),L.state=function(){return S(F,{})}),U?(s[i]=L,M):L})(B,D,"global"in v?v.global:this==s,v.state)}function y(k){var v,x=k.length,O=this,D=0,F=O.i=O.j=0,B=O.S=[];for(x||(k=[x++]);D<r;)B[D]=D++;for(D=0;D<r;D++)B[D]=B[F=l&F+k[D%x]+(v=B[D])],B[F]=v;(O.g=function(L){for(var M,U=0,Y=O.i,se=O.j,Ee=O.S;L--;)M=Ee[Y=l&Y+1],U=U*r+Ee[l&(Ee[Y]=Ee[se=l&se+M])+(Ee[se]=M)];return O.i=Y,O.j=se,U})(r)}function S(k,v){return v.i=k.i,v.j=k.j,v.S=k.S.slice(),v}function N(k,v){var x=[],O=typeof k,D;if(v&&O=="object")for(D in k)try{x.push(N(k[D],v-1))}catch{}return x.length?x:O=="string"?k:k+"\0"}function T(k,v){for(var x=k+"",O,D=0;D<x.length;)v[l&D]=l&(O^=v[l&D]*19)+x.charCodeAt(D++);return E(v)}function A(){try{var k;return f&&(k=f.randomBytes)?k=k(r):(k=new Uint8Array(r),(e.crypto||e.msCrypto).getRandomValues(k)),E(k)}catch{var v=e.navigator,x=v&&v.plugins;return[+new Date,e,x,e.screen,E(n)]}}function E(k){return String.fromCharCode.apply(0,k)}if(T(s.random(),n),t.exports){t.exports=d;try{f=pb}catch{}}else s["seed"+i]=d})(typeof self<"u"?self:Dt,[],Math)})(ph);var fb=ph.exports,db=rb,mb=ab,gb=ob,yb=ib,bb=ub,wb=cb,Rt=fb;Rt.alea=db;Rt.xor128=mb;Rt.xorwow=gb;Rt.xorshift7=yb;Rt.xor4096=bb;Rt.tychei=wb;var na=Rt;/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Nb=.001,fh=.1;function Sb(t,e,n){return n==null&&(n=sa()),Ks(t,e,(s,r)=>ra(s,r,n))}function sa(){return w.backend.floatPrecision()===32?Nb:fh}function Ks(t,e,n){let s=!0;if((ae(t)||ae(e))&&(s=!1),ae(t)&&ae(e)&&(s=!0),s){const o=t.constructor.name,i=e.constructor.name;if(o!==i)throw new Error(`Arrays are of different type. Actual: ${o}. Expected: ${i}`)}if(Array.isArray(t)&&Array.isArray(e)){const o=ze(t),i=ze(e);if(!Re(o,i))throw new Error(`Arrays have different shapes. Actual: [${o}]. Expected: [${i}]`)}const r=ae(t)?t:ut(t),a=ae(e)?e:ut(e);if(r.length!==a.length)throw new Error(`Arrays have different lengths actual: ${r.length} vs expected: ${a.length}.
Actual:   ${r}.
Expected: ${a}.`);for(let o=0;o<a.length;++o){const i=r[o],u=a[o];if(!n(i,u))throw new Error(`Arrays differ: actual[${o}] = ${i}, expected[${o}] = ${u}.
Actual:   ${r}.
Expected: ${a}.`)}typeof expect<"u"&&expect().nothing()}function Tb(t,e){t().then(()=>e.fail(),()=>e()),typeof expect<"u"&&expect().nothing()}function $b(t,e){const n=typeof e=="string"||typeof e=="number"||typeof e=="boolean"?[e]:e;return nt(t)||nt(t[0])||nt(e)||nt(e[0])?Ks(t,n,(s,r)=>s==r):Ks(t,e,(s,r)=>ra(s,r,0))}function Eb(t,e,n){if(n==null&&(n=sa()),!ra(t,e,n))throw new Error(`Numbers differ: actual === ${t}, expected === ${e}`);typeof expect<"u"&&expect().nothing()}function ra(t,e,n){return!isFinite(t)&&!isFinite(e)?!0:!(isNaN(t)||isNaN(e)||Math.abs(t-e)>n)}function kb(t,e,n){for(let s=0;s<t.length;s++)if(t[s]<e||t[s]>n)throw new Error(`Value out of range:${t[s]} low: ${e}, high: ${n}`)}function vb(t,e){const n=new Float32Array(t),s=new Float32Array(e);if(n.length!==s.length)throw new Error(`Expected ArrayBuffer to be of length ${s.length}, but it was ${n.length}`);for(let r=0;r<s.length;r++)if(n[r]!==s[r])throw new Error(`Expected ArrayBuffer value at ${r} to be ${s[r]} but got ${n[r]} instead`)}function dh(t){for(let e=0;e<t.length;e++){const n=t[e];Array.isArray(n)?dh(n):t[e]=In(n)}return t}function _b(t){const e=document.createElement("video");return"playsInline"in e&&(e.playsInline=!0),e.muted=!0,e.loop=!0,e.style.position="fixed",e.style.left="0px",e.style.top="0px",e.preload="auto",e.appendChild(t),new Promise(n=>{e.addEventListener("loadeddata",s=>n(e)),e.load()})}async function Ib(t){await t.play(),"requestVideoFrameCallback"in t&&await new Promise(e=>{t.requestVideoFrameCallback(e)})}const xb=Object.freeze(Object.defineProperty({__proto__:null,TEST_EPSILON_FLOAT16:fh,createVideoElement:_b,encodeStrings:dh,expectArrayBuffersEqual:vb,expectArraysClose:Sb,expectArraysEqual:$b,expectNumbersClose:Eb,expectPromiseToFail:Tb,expectValuesInRange:kb,play:Ib,testEpsilon:sa},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class aa{constructor(e,n,s,r,a){this.mean=e,this.stdDev=n,this.dtype=s,this.nextVal=NaN,this.truncated=r,this.truncated&&(this.upper=this.mean+this.stdDev*2,this.lower=this.mean-this.stdDev*2);const o=a||Math.random();this.random=na.alea(o.toString())}nextValue(){if(!isNaN(this.nextVal)){const r=this.nextVal;return this.nextVal=NaN,r}let e,n,s=!1;for(;!s;){let r,a,o;do r=2*this.random()-1,a=2*this.random()-1,o=r*r+a*a;while(o>=1||o===0);const i=Math.sqrt(-2*Math.log(o)/o);e=this.mean+this.stdDev*r*i,n=this.mean+this.stdDev*a*i,(!this.truncated||this.isValidTruncated(e))&&(s=!0)}return(!this.truncated||this.isValidTruncated(n))&&(this.nextVal=this.convertValue(n)),this.convertValue(e)}convertValue(e){return this.dtype==null||this.dtype==="float32"?e:Math.round(e)}isValidTruncated(e){return e<=this.upper&&e>=this.lower}}class Ab{constructor(e,n,s,r){this.alpha=e,this.beta=1/n,this.dtype=s;const a=r||Math.random();this.randu=na.alea(a.toString()),this.randn=new aa(0,1,s,!1,this.randu()),e<1?this.d=e+2/3:this.d=e-1/3,this.c=1/Math.sqrt(9*this.d)}nextValue(){let e,n,s,r,a,o;for(;;){do r=this.randn.nextValue(),o=1+this.c*r;while(o<=0);if(o*=o*o,e=r*r,n=1-.331*e*e,s=.5*e+this.d*(1-o+Math.log(o)),a=this.randu(),a<n||Math.log(a)<s)break}return o=1/this.beta*this.d*o,this.alpha<1&&(o*=Math.pow(this.randu(),1/this.alpha)),this.convertValue(o)}convertValue(e){return this.dtype==="float32"?e:Math.round(e)}}class Ob{constructor(e=0,n=1,s,r){if(this.canReturnFloat=()=>this.dtype==null||this.dtype==="float32",this.min=e,this.range=n-e,this.dtype=s,r==null&&(r=Math.random()),typeof r=="number"&&(r=r.toString()),!this.canReturnFloat()&&this.range<=1)throw new Error(`The difference between ${e} - ${n} <= 1 and dtype is not float`);this.random=na.alea(r)}convertValue(e){return this.canReturnFloat()?e:Math.round(e)}nextValue(){return this.convertValue(this.min+this.range*this.random())}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Db(t,e,n=1,s="float32",r){if(Se(t),n==null&&(n=1),s==null&&(s="float32"),s!=="float32"&&s!=="int32")throw new Error(`Unsupported data type ${s}`);const a=new Ab(e,n,s,r),o=Ve(t,s);for(let i=0;i<o.values.length;i++)o.values[i]=a.nextValue();return o.toTensor()}const mh=b({randomGamma_:Db});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Fb(t,e=0,n=1,s,r){if(Se(t),s!=null&&s==="bool")throw new Error(`Unsupported data type ${s}`);const a=new aa(e,n,s,!1,r),o=Ve(t,s);for(let i=0;i<o.values.length;i++)o.values[i]=a.nextValue();return o.toTensor()}const oa=b({randomNormal_:Fb});/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Cb(t,e,n){if(e!=null&&e==="bool")throw new Error(`Unsupported data type ${e}`);return oa(t,0,1,e,n)}const gh=b({randomStandardNormal_:Cb});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Rb(t,e=0,n=1,s="float32",r){Se(t);const a=Ve(t,s),o=new Ob(e,n,null,r);for(let i=0;i<a.values.length;i++)a.values[i]=o.nextValue();return a.toTensor()}const fs=b({randomUniform_:Rb});/**
 * @license
 * Copyright 2023 Google LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Lb(t,e,n,s){return fs(t,e,n,"int32",s)}const yh=b({randomUniformInt_:Lb});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Jt(t,e,n=1,s="float32"){if(n===0)throw new Error("Cannot have a step of zero");const r={start:t,stop:e,step:n,dtype:s};return w.runKernel(fu,{},r)}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Bb(t){const n={input:m(t,"input","real")};return w.runKernel(du,n)}const Yt=b({real_:Bb});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Pb(t){const n={x:m(t,"x","reciprocal")};return w.runKernel(mu,n)}const bh=b({reciprocal_:Pb});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function zb(t){const n={x:m(t,"x","relu")};return w.runKernel(gu,n)}const Bn=b({relu_:zb});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Vb(t){const n={x:m(t,"x","relu6")};return w.runKernel(Nu,n)}const ia=b({relu6_:Vb});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Wb(t,e){const s={x:m(t,"x","reverse")},r={dims:e};return w.runKernel(Su,s,r)}const ht=b({reverse_:Wb});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Mb(t){const e=m(t,"x","reverse");return g(e.rank===1,()=>`Error in reverse1D: x must be rank 1 but got rank ${e.rank}.`),ht(e,0)}const wh=b({reverse1d_:Mb});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function jb(t,e){const n=m(t,"x","reverse");return g(n.rank===2,()=>`Error in reverse2D: x must be rank 2 but got rank ${n.rank}.`),ht(n,e)}const Nh=b({reverse2d_:jb});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Ub(t,e){const n=m(t,"x","reverse");return g(n.rank===3,()=>`Error in reverse3D: x must be rank 3 but got rank ${n.rank}.`),ht(n,e)}const Sh=b({reverse3d_:Ub});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function qb(t,e){const n=m(t,"x","reverse");return g(n.rank===4,()=>`Error in reverse4D: x must be rank 4 but got rank ${n.rank}.`),ht(n,e)}const Th=b({reverse4d_:qb});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Gb(t){const n={x:m(t,"x","round")};return w.runKernel(Tu,n)}const ua=b({round_:Gb});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Hb(t){const n={x:m(t,"x","rsqrt","float32")};return w.runKernel($u,n)}const $h=b({rsqrt_:Hb});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Kb(t){const n={x:m(t,"x","selu")};return w.runKernel(Iu,n)}const Eh=b({selu_:Kb});function Xb(t,e,n,s,r,a=[1,1],o="NHWC"){const i=m(t,"x","separableConv2d"),u=m(e,"depthwiseFilter","separableConv2d"),c=m(n,"pointwiseFilter","separableConv2d");let h=i,l=!1;if(i.rank===3&&(l=!0,h=$(i,[1,i.shape[0],i.shape[1],i.shape[2]])),o==="NCHW")throw new Error("separableConv2d currently does not support dataFormat NCHW; only NHWC is supported");g(h.rank===4,()=>`Error in separableConv2d: input must be rank 4, but got rank ${h.rank}.`),g(u.rank===4,()=>`Error in separableConv2d: depthwise filter must be rank 4, but got rank ${u.rank}.`),g(c.rank===4,()=>`Error in separableConv2d: pointwise filter must be rank 4, but got rank ${u.rank}.`),g(c.shape[0]===1,()=>`Error in separableConv2d: the first dimension of pointwise filter  must be 1, but got ${c.shape[0]}.`),g(c.shape[1]===1,()=>`Error in separableConv2d: the second dimension of pointwise filter must be 1, but got ${c.shape[1]}.`);const f=u.shape[2],d=u.shape[3];g(c.shape[2]===f*d,()=>`Error in separableConv2d: the third dimension of pointwise filter must be ${f*d}, but got ${c.shape[2]}.`);const y=cs(h,u,s,r,o,a),N=Dn(y,c,1,"valid",o);return l?$(N,[N.shape[1],N.shape[2],N.shape[3]]):N}const kh=b({separableConv2d_:Xb});/**
 * @license
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */async function Zb(t,e){const n=m(t,"x","setdiff1d"),s=m(e,"y","setdiff1d");g(n.dtype===s.dtype,()=>`x and y should have the same dtype, but got x (${n.dtype}) and y (${s.dtype}).`),g(n.rank===1,()=>`x should be 1D tensor, but got x (${n.shape}).`),g(s.rank===1,()=>`y should be 1D tensor, but got y (${s.shape}).`);const r=await n.data(),a=await s.data(),o=new Set(a);let i=0;for(let h=0;h<r.length;h++)o.has(r[h])||i++;const u=new Jn([i],n.dtype),c=new Jn([i],"int32");for(let h=0,l=0;h<r.length;h++)o.has(r[h])||(u.values[l]=r[h],c.values[l]=h,l++);return[u.toTensor(),c.toTensor()]}const vh=Zb;/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Jb(t){const n={x:m(t,"x","sign")};return w.runKernel(Du,n)}const _h=b({sign_:Jb});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Yb(t){const n={x:m(t,"x","sin","float32")};return w.runKernel(Au,n)}const Ih=b({sin_:Yb});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Qb(t){const n={x:m(t,"x","sinh")};return w.runKernel(Ou,n)}const xh=b({sinh_:Qb});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function e0(t,e,n){const s=m(t,"x","slice1d");return g(s.rank===1,()=>`slice1d expects a rank-1 tensor, but got a rank-${s.rank} tensor`),q(s,[e],[n])}const Ah=b({slice1d_:e0});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function t0(t,e,n){const s=m(t,"x","slice2d");return g(s.rank===2,()=>`slice2d expects a rank-2 tensor, but got a rank-${s.rank} tensor`),q(s,e,n)}const Oh=b({slice2d_:t0});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function n0(t,e,n){const s=m(t,"x","slice3d");return g(s.rank===3,()=>`slice3d expects a rank-3 tensor, but got a rank-${s.rank} tensor`),q(s,e,n)}const Dh=b({slice3d_:n0});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function s0(t,e,n){const s=m(t,"x","slice4d");return g(s.rank===4,()=>`slice4d expects a rank-4 tensor, but got a rank-${s.rank} tensor`),q(s,e,n)}const Fh=b({slice4d_:s0});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function r0(t,e=-1){const n=m(t,"logits","softmax","float32");if(e===-1&&(e=n.rank-1),e!==n.rank-1)throw Error(`Softmax along a non-last dimension is not yet supported. Logits was rank ${n.rank} and dim was ${e}`);const s={logits:n},r={dim:e};return w.runKernel(zu,s,r)}const Ch=b({softmax_:r0});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function a0(t){g(t.dtype==="complex64",()=>`The dtype for tf.spectral.fft() must be complex64 but got ${t.dtype}.`);const e={input:t};return w.runKernel(mi,e)}const ds=b({fft_:a0});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function o0(t){g(t.dtype==="complex64",()=>`The dtype for tf.spectral.ifft() must be complex64 but got ${t.dtype}.`);const e={input:t};return w.runKernel(ki,e)}const $n=b({ifft_:o0});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function i0(t){const e=t.shape[t.shape.length-1],n=t.size/e;let s;if(e<=2){const r=$(t,[n,e]);s=$n(r)}else{const r=[n,2*(e-1)],a=$(Yt(t),[n,e]),o=$(Ln(t),[n,e]),i=ht(q(a,[0,1],[n,e-2]),1),u=I(ht(q(o,[0,1],[n,e-2]),1),z(-1)),c=ue([a,i],1),h=ue([o,u],1),l=$(Je(c,h),[r[0],r[1]]);s=$n(l)}if(s=Yt(s),t.rank===3&&t.shape[0]!==0){const r=s,a=t.shape[0];s=$(s,[a,s.shape[0]/a,s.shape[1]]),r.dispose()}return s}const ca=b({irfft_:i0});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function u0(t,e,n=0){const r={x:m(t,"x","split")},a={numOrSizeSplits:e,axis:n};return w.runKernel(Pu,r,a)}const Qt=b({split_:u0});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function c0(t,e){g(t.dtype==="float32",()=>`The dtype for rfft() must be real value but got ${t.dtype}`);let n=t.shape[t.shape.length-1];const s=t.size/n;let r;if(e!=null&&e<n){const y=t.shape.map(N=>0),S=t.shape.map(N=>N);S[t.shape.length-1]=e,r=q(t,y,S),n=e}else if(e!=null&&e>n){const y=t.shape.map(S=>S);y[t.shape.length-1]=e-n,r=ue([t,xt(y)],t.shape.length-1),n=e}else r=t;const a=Ne(r),o=$(Je(r,a),[s,n]),i=ds(o),u=Math.floor(n/2)+1,c=Yt(i),h=Ln(i),l=Qt(c,[u,n-u],c.shape.length-1),f=Qt(h,[u,n-u],h.shape.length-1),d=r.shape.slice();return d[r.shape.length-1]=u,$(Je(l[0],f[0]),d)}const ms=b({rfft_:c0});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function l0(t,e){let n=m(t,"a","squaredDifference"),s=m(e,"b","squaredDifference");[n,s]=ee(n,s),ne(n.shape,s.shape);const r={a:n,b:s},a={};return w.runKernel(qu,r,a)}const la=b({squaredDifference_:l0});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function h0(t,e){const n=m(t,"x","squeeze","string_or_numeric");return $(n,uo(n.shape,e).newShape)}const gs=b({squeeze_:h0});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function p0(t,e=0){const n=gn(t,"tensors","stack","string_or_numeric");g(n.length>=1,()=>"Pass at least one tensor to tf.stack"),n.length>0&&g(e<=n[0].rank,()=>"Axis must be <= rank of the tensor");const s=n,r={axis:e};return w.runKernel(au,s,r)}const je=b({stack_:p0});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function f0(t,e=0){const s={x:m(t,"x","step")},r={alpha:e};return w.runKernel(oc,s,r)}const ha=b({step_:f0});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function d0(t,e,n,s,r=0,a=0,o=0,i=0,u=0){const h={x:m(t,"x","stridedSlice","string_or_numeric")},l={begin:e,end:n,strides:s,beginMask:r,endMask:a,ellipsisMask:o,newAxisMask:i,shrinkAxisMask:u};return w.runKernel(Hu,h,l)}const Rh=b({stridedSlice_:d0});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function m0(t){const n={x:m(t,"x","tan","float32")};return w.runKernel(Yu,n)}const Lh=b({tan_:m0});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function $e(t,e){Ft(t);const n=ze(t,e);if(n.length!==1)throw new Error("tensor1d() requires values to be a flat/TypedArray");return pt(t,null,n,e)}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Ut(t,e,n){if(Ft(t),e!=null&&e.length!==2)throw new Error("tensor2d() requires shape to have two numbers");const s=ze(t,n);if(s.length!==2&&s.length!==1)throw new Error("tensor2d() requires values to be number[][] or flat/TypedArray");if(s.length===1&&e==null)throw new Error("tensor2d() requires shape to be provided when `values` are a flat/TypedArray");return pt(t,e,s,n)}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function pa(t,e,n){if(Ft(t),e!=null&&e.length!==3)throw new Error("tensor3d() requires shape to have three numbers");const s=ze(t,n);if(s.length!==3&&s.length!==1)throw new Error("tensor3d() requires values to be number[][][] or flat/TypedArray");if(s.length===1&&e==null)throw new Error("tensor3d() requires shape to be provided when `values` are a flat array");return pt(t,e,s,n)}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Bh(t,e,n){if(Ft(t),e!=null&&e.length!==4)throw new Error("tensor4d() requires shape to have four numbers");const s=ze(t,n);if(s.length!==4&&s.length!==1)throw new Error("tensor4d() requires values to be number[][][][] or flat/TypedArray");if(s.length===1&&e==null)throw new Error("tensor4d() requires shape to be provided when `values` are a flat array");return pt(t,e,s,n)}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Ph(t,e,n){if(Ft(t),e!=null&&e.length!==5)throw new Error("tensor5d() requires shape to have five numbers");const s=ze(t,n);if(s.length!==5&&s.length!==1)throw new Error("tensor5d() requires values to be number[][][][][] or flat/TypedArray");if(s.length===1&&e==null)throw new Error("tensor5d() requires shape to be provided when `values` are a flat array");return pt(t,e,s,n)}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function zh(t,e,n){if(Ft(t),e!=null&&e.length!==6)throw new Error("tensor6d() requires shape to have six numbers");const s=ze(t,n);if(s.length!==6&&s.length!==1)throw new Error("tensor6d() requires values to be number[][][][][][] or flat/TypedArray");if(s.length===1&&e==null)throw new Error("tensor6d() requires shape to be provided when `values` are a flat array");return e=e||s,pt(t,e,s,n)}function fa(t,e,n){const s=e.rank>1?e.shape[e.rank-1]:1,r=e.rank>1?e.rank-1:1,a=`Must have updates.shape = indices.shape[:batchDim] + shape[sliceDim:], got updates.shape: ${n.shape}, indices.shape: ${e.shape}, shape: ${t}, sliceDim: ${s}, and batchDim: ${r}.`;if(n.rank<r)throw new Error(a+` update.rank < ${r}. `);if(t.length<s+(n.rank-r))throw new Error(a+` Output shape length < ${s+(n.rank-r)}`);if(n.rank!==r+t.length-s)throw new Error(a+` update.rank != ${r+t.length-s}`);for(let o=0;o<r;++o)if(n.shape[o]!==e.shape[o])throw new Error(a+` updates.shape[${o}] (${n.shape[o]}) != indices.shape[${o}] (${e.shape[o]}).`);for(let o=0;o<n.rank-r;++o)if(n.shape[o+r]!==t[o+s])throw new Error(a+` updates.shape[${o+r}] (${n.shape[o+r]}) != shape[${o+r}] (${t[o+r]})`)}function ys(t,e,n){if(e.rank<1)throw new Error(`tf.scatterND() expects the indices to be rank 1 or higher, but the rank was ${e.rank}.`);if(t.rank<1)throw new Error(`tf.scatterND() expects the updates to be rank 1 or higher, but the rank was ${t.rank}.`);if(e.dtype!=="int32")throw new Error(`The dtype of 'indices' should be int32, but got dtype: ${e.dtype}`);if(n.length<1)throw new Error(`Output rank must be greater or equal to 1, but got shape: ${n}`);if(n.length===0){if(e.size===0)throw new Error(`Indices specified for empty output. indices shape: ${e.shape}`);if(t.size===0)throw new Error(`Updates specified for empty output. updates shape: ${t.shape}`)}fa(n,e,t)}function Vh(t,e,n){const s=e.shape.length,r=s>1?e.shape[s-1]:1,a=n.length;let o=1;for(let l=r;l<a;++l)o*=n[l];const i=r<1?1:r,u=j(e.shape)/i,c=[...en(n.slice(0,r)),1],h=j(n);return{sliceRank:r,numUpdates:u,sliceSize:o,strides:c,outputSize:h}}const g0=Object.freeze(Object.defineProperty({__proto__:null,calculateShapes:Vh,validateInput:ys,validateUpdateShape:fa},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function y0(t,e,n){const s=m(t,"tensor","tensorScatterupdate"),r=m(e,"indices","tensorScatterupdate","int32"),a=m(n,"updates","tensorScatterupdate");if(ys(a,r,s.shape),s.dtype!==a.dtype)throw new Error(`tensor and updates must have the same dtype, instead they are ${s.dtype} and ${a.dtype}.`);const o={tensor:s,indices:r,updates:a},i={};return w.runKernel(ku,o,i)}const Wh=b({tensorScatterUpdate_:y0});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function b0(t,e=1,n=!0){const s=m(t,"x","topk");if(s.rank===0)throw new Error("topk() expects the input to be of rank 1 or higher");const r=s.shape[s.shape.length-1];if(e<0)throw new Error(`'k' passed to topk() must be >= 0 but got ${e}`);if(e>r)throw new Error(`'k' passed to topk() must be <= the last dimension (${r}) but got ${e}`);const a={x:s},o={k:e,sorted:n},[i,u]=w.runKernel(ec,a,o);return{values:i,indices:u}}const Mh=b({topk_:b0});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function w0(t,e=0,n=1,s,r){if(Se(t),s!=null&&s==="bool")throw new Error("Unsupported data type $ { dtype }");const a=new aa(e,n,s,!0,r),o=Ve(t,s);for(let i=0;i<o.values.length;i++)o.values[i]=a.nextValue();return o.toTensor()}const jh=b({truncatedNormal_:w0});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function N0(t,e=0){const n=m(t,"x","unique","string_or_numeric");g(n.rank>0,()=>"The input tensor must be at least 1D");const s={x:n},r={axis:e},[a,o]=w.runKernel(nc,s,r);return{values:a,indices:o}}const Uh=b({unique_:N0});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function S0(t,e,n){const s=m(t,"x","unsortedSegmentSum"),r=m(e,"segmentIds","unsortedSegmentSum","int32");g(qt(n),()=>"numSegments must be of dtype int");const a={x:s,segmentIds:r},o={numSegments:n};return w.runKernel(rc,a,o)}const qh=b({unsortedSegmentSum_:S0});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function T0(t,e=0){const n=m(t,"x","unstack","string_or_numeric");g(e>=-n.shape.length&&e<n.shape.length,()=>`Axis = ${e} is not in [-${n.shape.length}, ${n.shape.length})`);const s={value:n},r={axis:e};return w.runKernel(sc,s,r)}const ft=b({unstack_:T0});/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Gh(t,e){return ps(t,e,"right")}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Hh(t,e=!0,n,s){return w.makeVariable(t,e,n,s)}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Kh(t,e){const n=[];for(let a=0;a<e.length;a++)e[a]&&n.push(a);const s=Ve(t,"int32"),r=Ve([n.length,t.length],"int32");for(let a=0;a<n.length;a++){const o=s.indexToLoc(n[a]),i=a*t.length;r.values.set(o,i)}return r.toTensor()}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */async function $0(t){const e=m(t,"condition","whereAsync","bool"),n=await e.data(),s=Kh(e.shape,n);return t!==e&&e.dispose(),s}const da=$0;/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */async function E0(t,e,n){const s=m(t,"tensor","boolMask"),r=m(e,"mask","boolMask","bool"),a=n??0,o=r.rank,i=s.shape;g(o>0,()=>"mask cannot be scalar"),fe(i.slice(a,a+o),r.shape,"mask's shape must match the first K dimensions of tensor's shape,");let u=1;for(let S=a;S<a+o;S++)u*=i[S];const c=i.slice(0,a).concat([u],i.slice(a+o)),h=$(s,c),l=$(r,[-1]),f=await da(l),d=gs(f,[1]),y=Br(h,d,a);return t!==s&&s.dispose(),e!==r&&r.dispose(),d.dispose(),h.dispose(),l.dispose(),f.dispose(),y}const Xh=E0;/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function k0(t,e,n){const s=m(t,"x","transpose");if(e==null&&(e=s.shape.map((o,i)=>i).reverse()),g(s.rank===e.length,()=>`Error in transpose: rank of input ${s.rank} must match length of perm ${e}.`),e.forEach(o=>{g(o>=0&&o<s.rank,()=>`All entries in 'perm' must be between 0 and ${s.rank-1} but got ${e}`)}),s.rank<=1)return s.clone();const r={x:s},a={perm:e};return s.dtype==="complex64"?W(()=>{let o=Yt(s),i=Ln(s);return o=w.runKernel(Wn,{x:o},a),i=w.runKernel(Wn,{x:i},a),n&&(i=Ce(i)),Je(o,i)}):w.runKernel(Wn,r,a)}const En=b({transpose_:k0});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function v0(t,e,n,s,r=!0){const a=m(t,"v","movingAverage"),o=m(e,"x","movingAverage"),i=m(n,"decay","movingAverage");Tc(a,o),g(Re(a.shape,o.shape),()=>"Shape mismatch in v and x");const u=z(1),c=P(u,i);let h=I(P(o,a),c);if(r){g(s!=null,()=>"When using zeroDebias: true, step is required.");const l=m(s,"step","movingAverage");h=K(h,P(u,Xt(i,l)))}return C(a,h)}const Zh=b({movingAverage_:v0});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function _0(t,e,n){Se(n);const s=m(t,"indices","scatterND","int32"),r=m(e,"updates","scatterND");ys(r,s,n);const a={indices:s,updates:r},o={shape:n};return w.runKernel(Eu,a,o)}const Jh=b({scatterND_:_0});function I0(t,e,n,s){if(t.dtype!=="int32")throw new Error(`tf.sparseToDense() expects the indices to be int32 type, but the dtype was ${t.dtype}.`);if(t.rank>2)throw new Error(`sparseIndices should be a scalar, vector, or matrix, but got shape ${t.shape}.`);const r=t.rank>0?t.shape[0]:1,a=t.rank>1?t.shape[1]:1;if(n.length!==a)throw new Error(`outputShape has incorrect number of elements:, ${n.length}, should be: ${a}.`);const o=e.size;if(!(e.rank===0||e.rank===1&&o===r))throw new Error(`sparseValues has incorrect shape ${e.shape}, should be [] or [${r}]`);if(e.dtype!==s.dtype)throw new Error("sparseValues.dtype must match defaultValues.dtype")}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function x0(t,e,n,s=0){Se(n);const r=m(t,"sparseIndices","sparseToDense","int32"),a=m(e,"sparseValues","sparseToDense","string_or_numeric"),o=m(s,"defaultValue","sparseToDense",a.dtype);I0(r,a,n,o);const i={sparseIndices:r,sparseValues:a,defaultValue:o},u={outputShape:n};return w.runKernel(Uu,i,u)}const Yh=b({sparseToDense_:x0});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function A0(t,e){const n=m(e,"indices","gatherND","int32"),r={params:m(t,"x","gatherND","string_or_numeric"),indices:n};return w.runKernel(Ti,r)}const Qh=b({gatherND_:A0});/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function O0(t,e){if(e==null)return t.shape.slice();if(Re(t.shape,e))return e;if(t.shape.length===e.length){const n=[];for(let s=0;s<t.shape.length;s++)e[s]==null&&t.shape[s]!=null?n.push(t.shape[s]):n.push(e[s]);return n}return e}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function D0(t,e,n,s){const r=m(t,"x","dropout");if(g(r.dtype==="float32",()=>`x has to be a floating point tensor since it's going to be scaled, but got a ${r.dtype} tensor instead.`),g(e>=0&&e<1,()=>`rate must be a float in the range [0, 1), but got ${e}.`),e===0)return t instanceof te?r.clone():r;const a=O0(r,n),o=1-e,i=K(Lr(C(fs(a,0,1,"float32",s),o)),o);return I(r,i)}const ep=b({dropout_:D0});/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ma(t){return Math.floor(Math.pow(2,Math.ceil(Math.log(t)/Math.log(2))))}function bs(t,e,n){const s=1-t%2,r=new Float32Array(t);for(let a=0;a<t;++a){const o=2*Math.PI*a/(t+s-1);r[a]=e-n*Math.cos(o)}return $e(r,"float32")}/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */async function F0(t,e,n=1){const s=m(t,"predictions","inTopK"),r=m(e,"targets","inTopK");g(s.rank>1,()=>`inTopK() expects the predictions to be of rank 2 or higher, but got ${s.rank}`),g(s.rank-1===r.rank,()=>`predictions rank should be 1 larger than targets rank, but got predictions rank ${s.rank} and targets rank ${r.rank}`),fe(s.shape.slice(0,s.shape.length-1),r.shape,"predictions's shape should be align with the targets' shape, except the last dimension.");const a=s.shape[s.shape.length-1];g(n>0&&n<=a,()=>`'k' passed to inTopK() must be > 0 && <= the predictions last dimension (${a}), but got ${n}`);const o=await s.data(),i=await r.data(),[u,c]=[o.length/a,a],h=co("bool",u);for(let l=0;l<u;l++){const f=l*c,d=o.subarray(f,f+c),y=[];for(let S=0;S<d.length;S++)y.push({value:d[S],index:S});y.sort((S,N)=>N.value-S.value),h[l]=0;for(let S=0;S<n;S++)if(y[S].index===i[l]){h[l]=1;break}}return t!==s&&s.dispose(),e!==r&&r.dispose(),Fe(h,r.shape,"bool")}const tp=F0;/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function C0(t,e,n,s,r,a="NHWC",o){let i=t;t.rank===3&&(i=$(t,[1,t.shape[0],t.shape[1],t.shape[2]]));let u=e;u.rank===3&&(u=$(e,[1,e.shape[0],e.shape[1],e.shape[2]])),g(i.rank===4,()=>`Error in conv2dDerFilter: input must be rank 4, but got shape ${i.shape}.`),g(u.rank===4,()=>`Error in conv2dDerFilter: dy must be rank 4, but got shape ${u.shape}.`),g(n.length===4,()=>`Error in conv2dDerFilter: filterShape must be length 4, but got ${n}.`);const c=a==="NHWC"?i.shape[3]:i.shape[1],h=a==="NHWC"?u.shape[3]:u.shape[1];g(c===n[2],()=>`Error in conv2dDerFilter: depth of input ${c}) must match input depth in filter (${n[2]}.`),g(h===n[3],()=>`Error in conv2dDerFilter: depth of dy (${h}) must match output depth for filter (${n[3]}).`),Ae("conv2dDerFilter",r,o);const l={x:i,dy:u},f={strides:s,pad:r,dataFormat:a,dimRoundingMode:o,filterShape:n};return w.runKernel(qo,l,f)}const R0=b({conv2DBackpropFilter_:C0});/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ws(t,e,n){if(n==null||n==="linear")return t;if(n==="relu")return I(t,ha(e));throw new Error(`Cannot compute gradient for fused activation ${n}.`)}function Ns(t,e){let n=e;const s=Or(t.shape,e.shape);return s.length>0&&(n=H(n,s)),$(n,t.shape)}function Ss(t,e,n,s){if(e==="linear")return t;if(e==="relu")return Bn(t);if(e==="elu")return Fr(t);if(e==="relu6")return ia(t);if(e==="prelu")return Xr(t,n);if(e==="leakyrelu")return zr(t,s);if(e==="sigmoid")return $t(t);throw new Error(`Unknown fused activation ${e}.`)}const Ts=(t,e)=>!(t>0)||e==="linear";/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function L0({x:t,filter:e,strides:n,pad:s,dataFormat:r="NHWC",dilations:a=[1,1],dimRoundingMode:o,bias:i,activation:u="linear",preluActivationWeights:c,leakyreluAlpha:h}){if(u=u||"linear",Ts(w.state.gradientDepth,u)===!1){g(r==="NHWC",()=>`Error in fused conv2d: got dataFormat of ${r} but only NHWC is currently supported for the case of gradient depth is 0 and the activation is not linear.`);let x=Dn(t,e,n,s,r,a,o);return i!=null&&(x=C(x,i)),Ss(x,u,c,h)}const l=m(t,"x","conv2d","float32"),f=m(e,"filter","conv2d","float32");let d=l,y=!1;l.rank===3&&(y=!0,d=$(l,[1,l.shape[0],l.shape[1],l.shape[2]])),g(d.rank===4,()=>`Error in fused conv2d: input must be rank 4, but got rank ${d.rank}.`),g(f.rank===4,()=>`Error in fused conv2d: filter must be rank 4, but got rank ${f.rank}.`),Ae("fused conv2d",s,o);const S=r==="NHWC"?d.shape[3]:d.shape[1];g(f.shape[2]===S,()=>`Error in conv2d: depth of input (${S}) must match input depth for filter ${f.shape[2]}.`),g(Ye(n,a),()=>`Error in conv2D: Either strides or dilations must be 1. Got strides ${n} and dilations '${a}'`);const N=An(d.shape,f.shape,n,a,s,o);let T;i!=null&&(T=m(i,"bias","fused conv2d"),[T]=ee(T,l),r==="NHWC"?ne(N.outShape,T.shape):(g(T.shape.length<=1,()=>`Error in fused conv2d: only supports scalar or 1-D Tensor bias for NCHW format but got the bias of rank-${T.shape.length}.`),g(T.shape.length===0||T.shape[0]===N.outChannels||T.shape[0]===1,()=>`Error in fused conv2d: bias shape (${T.shape}) is not compatible with the number of output channels (${N.outChannels})`)));let A;if(c!=null){const x=c.shape;if(g(x.length<=1||x.length===3,()=>`Error in fused conv2d: only supports scalar, 1-D Tensor or 3-D Tensor PReLU activation weights but got a tensor of rank-${x.length}.`),x.length===1)g(x[0]===1||x[0]===N.outChannels,()=>`Error in fused conv2d: PReLU activation weights (${x}) is not compatible with the number of output channels (${N.outChannels}).`);else if(x.length===3)try{ne(x,N.outShape)}catch{const D=`Error in fused conv2d: PReLU activation weights (${x}) is not compatible with the output shape of the conv2d (${N.outShape}).`;throw Error(D)}A=m(c,"prelu weights","fused conv2d")}const E=(x,O)=>{g(r==="NHWC",()=>`Error in gradient of fused conv2D: got dataFormat of ${r} but only NHWC is currently supported.`);const[D,F,B,L]=O,M=ws(x,B,u);g(wn(a),()=>`Error in gradient of fused conv2D: dilation rates greater than 1 are not yet supported in gradients. Got dilations '${a}'`);const U=ml(F.shape,M,D,n,s),Y=R0(F,M,D.shape,n,s),se=[U,Y];if(L!=null){const Ee=Ns(L,M);se.push(Ee)}return se},k={x:d,filter:f,bias:T,preluActivationWeights:A},v={strides:n,pad:s,dataFormat:r,dilations:a,dimRoundingMode:o,activation:u,leakyreluAlpha:h};return i==null?Me((O,D,F)=>{let B=w.runKernel(Fs,k,v);return F([D,O,B]),y&&(B=$(B,[B.shape[1],B.shape[2],B.shape[3]])),{value:B,gradFunc:E}})(d,f):Me((O,D,F,B)=>{let L=w.runKernel(Fs,k,v);return B([D,O,L,F]),y&&(L=$(L,[L.shape[1],L.shape[2],L.shape[3]])),{value:L,gradFunc:E}})(d,f,T)}const B0=b({fusedConv2d_:L0});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function P0(t,e,n,s,r,a=[1,1],o){let i=t;t.rank===3&&(i=$(t,[1,t.shape[0],t.shape[1],t.shape[2]]));let u=e;u.rank===3&&(u=$(e,[1,e.shape[0],e.shape[1],e.shape[2]]));const c={x:i,dy:u},h={strides:s,pad:r,dimRoundingMode:o,dilations:a,filterShape:n};return w.runKernel(si,c,h)}const z0=b({depthwiseConv2dNativeBackpropFilter_:P0});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function V0(t,e,n,s,r,a=[1,1],o){let i=e,u=!1;e.rank===3&&(u=!0,i=$(e,[1,e.shape[0],e.shape[1],e.shape[2]]));const c={dy:i,filter:n},h={strides:s,pad:r,dimRoundingMode:o,dilations:a,inputShape:t},l=w.runKernel(ri,c,h);return u?$(l,[l.shape[1],l.shape[2],l.shape[3]]):l}const W0=b({depthwiseConv2dNativeBackpropInput_:V0});/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function M0({x:t,filter:e,strides:n,pad:s,dataFormat:r="NHWC",dilations:a=[1,1],dimRoundingMode:o,bias:i,activation:u="linear",preluActivationWeights:c,leakyreluAlpha:h}){if(Ts(w.state.gradientDepth,u)===!1){let v=cs(t,e,n,s,r,a,o);return i!=null&&(v=C(v,i)),Ss(v,u,c,h)}const l=m(t,"x","depthwiseConv2d","float32"),f=m(e,"filter","depthwiseConv2d","float32");let d=l,y=!1;l.rank===3&&(y=!0,d=$(l,[1,l.shape[0],l.shape[1],l.shape[2]])),g(d.rank===4,()=>`Error in fused depthwiseConv2d: input must be rank 4, but got rank ${d.rank}.`),g(f.rank===4,()=>`Error in fused depthwiseConv2d: filter must be rank 4, but got rank ${f.rank}.`),g(d.shape[3]===f.shape[2],()=>`Error in fused depthwiseConv2d: number of input channels (${d.shape[3]}) must match the inChannels dimension in filter ${f.shape[2]}.`),a==null&&(a=[1,1]),g(Ye(n,a),()=>`Error in fused depthwiseConv2d: Either strides or dilations must be 1. Got strides ${n} and dilations '${a}'`),Ae("fused depthwiseConv2d",s,o);const S=An(d.shape,f.shape,n,a,s,o,!0);let N;i!=null&&(N=m(i,"bias","fused conv2d"),[N]=ee(N,l),ne(S.outShape,N.shape));let T;c!=null&&(T=m(c,"prelu weights","fused depthwiseConv2d"));const A=(v,x)=>{g(wn(a),()=>`Error in gradient of fused depthwiseConv2d: dilation rates greater than 1 are not yet supported. Got dilations '${a}'`);const[O,D,F,B]=x,L=ws(v,F,u),M=W0(D.shape,L,O,n,s,a,o),U=z0(D,L,O.shape,n,s,a,o);if(B!=null){const Y=Ns(N,L);return[M,U,Y]}return[M,U]},E={x:d,filter:f,bias:N,preluActivationWeights:T},k={strides:n,pad:s,dataFormat:r,dilations:a,dimRoundingMode:o,activation:u,leakyreluAlpha:h};return i==null?Me((x,O,D)=>{let F=w.runKernel(Cs,E,k);return D([O,x,F]),y&&(F=$(F,[F.shape[1],F.shape[2],F.shape[3]])),{value:F,gradFunc:A}})(d,f):Me((x,O,D,F)=>{let B=w.runKernel(Cs,E,k);return F([O,x,B,D]),y&&(B=$(B,[B.shape[1],B.shape[2],B.shape[3]])),{value:B,gradFunc:A}})(d,f,N)}const j0=b({fusedDepthwiseConv2d_:M0});/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function U0({a:t,b:e,transposeA:n=!1,transposeB:s=!1,bias:r,activation:a="linear",preluActivationWeights:o,leakyreluAlpha:i=.2}){if(Ts(w.state.gradientDepth,a)===!1){let L=V(t,e,n,s);return r!=null&&(L=C(L,r)),Ss(L,a,o,i)}let u=m(t,"a","fused matMul"),c=m(e,"b","fused matMul");[u,c]=ee(u,c);const h=n?u.shape[u.rank-2]:u.shape[u.rank-1],l=s?c.shape[c.rank-1]:c.shape[c.rank-2],f=n?u.shape[u.rank-1]:u.shape[u.rank-2],d=s?c.shape[c.rank-2]:c.shape[c.rank-1],y=u.shape.slice(0,-2),S=c.shape.slice(0,-2),N=j(y),T=j(S);g(h===l,()=>`Error in fused matMul: inner shapes (${h}) and (${l}) of Tensors with shapes ${u.shape} and ${c.shape} and transposeA=${n} and transposeB=${s} must match.`);const E=ne(u.shape.slice(0,-2),c.shape.slice(0,-2)).concat([f,d]),k=n?$(u,[N,h,f]):$(u,[N,f,h]),v=s?$(c,[T,d,l]):$(c,[T,l,d]);let x;r!=null&&(x=m(r,"bias","fused matMul"),[x]=ee(x,u),ne(E,x.shape));let O;o!=null&&(O=m(o,"prelu weights","fused matMul"));const D=(L,M)=>{const[U,Y,se,Ee]=M,Ue=ws($(L,se.shape),se,a);let Lt,Bt;if(!n&&!s?(Lt=V(Ue,Y,!1,!0),Bt=V(U,Ue,!0,!1)):!n&&s?(Lt=V(Ue,Y,!1,!1),Bt=V(Ue,U,!0,!1)):n&&!s?(Lt=V(Y,Ue,!1,!0),Bt=V(U,Ue,!1,!1)):(Lt=V(Y,Ue,!0,!0),Bt=V(Ue,U,!0,!0)),r!=null){const Pp=Ns(Ee,Ue);return[Lt,Bt,Pp]}else return[Lt,Bt]},F={a:k,b:v,bias:x,preluActivationWeights:O},B={transposeA:n,transposeB:s,activation:a,leakyreluAlpha:i};return r==null?Me((M,U,Y)=>{const se=w.runKernel(Ds,F,B);return Y([M,U,se]),{value:$(se,E),gradFunc:D}})(k,v):Me((M,U,Y,se)=>{const Ee=w.runKernel(Ds,F,B);return se([M,U,Ee,Y]),{value:$(Ee,E),gradFunc:D}})(k,v,x)}const q0=b({fusedMatMul_:U0});/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const np=Object.freeze(Object.defineProperty({__proto__:null,conv2d:B0,depthwiseConv2d:j0,matMul:q0},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function G0(t){return bs(t,.54,.46)}const H0=b({hammingWindow_:G0});/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function K0(t){return bs(t,.5,.5)}const sp=b({hannWindow_:K0});/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function X0(t,e,n,s=!1,r=0){let a=0;const o=[];for(;a+e<=t.size;)o.push(q(t,a,e)),a+=n;if(s)for(;a<t.size;){const i=a+e-t.size,u=ue([q(t,a,e-i),tn([i],r)]);o.push(u),a+=n}return o.length===0?Ut([],[0,e]):$(ue(o),[o.length,e])}const rp=b({frame_:X0});/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Z0(t,e,n,s,r=sp){s==null&&(s=ma(e));const a=rp(t,e,n),o=I(a,r(e));return ms(o,s)}const J0=b({stft_:Z0});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Y0(t,e,n,s,r="bilinear",a=0){const o=m(t,"image","cropAndResize"),i=m(e,"boxes","cropAndResize","float32"),u=m(n,"boxInd","cropAndResize","int32"),c=i.shape[0];g(o.rank===4,()=>`Error in cropAndResize: image must be rank 4,but got rank ${o.rank}.`),g(i.rank===2&&i.shape[1]===4,()=>`Error in cropAndResize: boxes must be have size [${c},4] but had shape ${i.shape}.`),g(u.rank===1&&u.shape[0]===c,()=>`Error in cropAndResize: boxInd must be have size [${c}] but had shape ${i.shape}.`),g(s.length===2,()=>`Error in cropAndResize: cropSize must be of length 2, but got length ${s.length}.`),g(s[0]>=1&&s[1]>=1,()=>`cropSize must be atleast [1,1], but was ${s}`),g(r==="bilinear"||r==="nearest",()=>`method must be bilinear or nearest, but was ${r}`);const h={image:o,boxes:i,boxInd:u},l={method:r,extrapolationValue:a,cropSize:s};return w.runKernel(Qo,h,l)}const Q0=b({cropAndResize_:Y0});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ew(t){const e=m(t,"image","flipLeftRight","float32");g(e.rank===4,()=>`Error in flipLeftRight: image must be rank 4,but got rank ${e.rank}.`);const n={image:e};return w.runKernel(yi,n,{})}const tw=b({flipLeftRight_:ew});/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function nw(t){const e=m(t,"image","grayscaleToRGB"),n=e.rank-1,s=e.shape[n];g(e.rank>=2,()=>`Error in grayscaleToRGB: images must be at least rank 2, but got rank ${e.rank}.`),g(s===1,()=>`Error in grayscaleToRGB: last dimension of a grayscale image should be size 1, but got size ${s}.`);const r=new Array(e.rank);return r.fill(1,0,n),r[n]=3,jt(e,r)}const sw=b({grayscaleToRGB_:nw});/**
 * @license
 * Copyright 2023 Google LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function rw(t){const e=m(t,"image","RGBToGrayscale"),n=e.rank-1,s=e.shape[n];g(e.rank>=2,()=>`Error in RGBToGrayscale: images must be at least rank 2, but got rank ${e.rank}.`),g(s===3,()=>`Error in RGBToGrayscale: last dimension of an RGB image should be size 3, but got size ${s}.`);const r=e.dtype,a=X(e,"float32"),o=$e([.2989,.587,.114]);let i;switch(e.rank){case 2:i=bt("ij,j->i",a,o);break;case 3:i=bt("ijk,k->ij",a,o);break;case 4:i=bt("ijkl,l->ijk",a,o);break;case 5:i=bt("ijklm,m->ijkl",a,o);break;case 6:i=bt("ijklmn,n->ijklm",a,o);break;default:throw new Error("Not a valid tensor rank.")}return i=qe(i,-1),X(i,r)}const aw=b({rgbToGrayscale_:rw});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ow(t,e,n=0,s=.5){const r=m(t,"image","rotateWithOffset","float32");g(r.rank===4,()=>`Error in rotateWithOffset: image must be rank 4,but got rank ${r.rank}.`);const a={image:r},o={radians:e,fillValue:n,center:s};return w.runKernel(ic,a,o)}const iw=b({rotateWithOffset_:ow});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function sn(t,e,n,s,r,a){s==null&&(s=.5),r==null&&(r=Number.NEGATIVE_INFINITY),a==null&&(a=0);const o=t.shape[0];return n=Math.min(n,o),g(0<=s&&s<=1,()=>`iouThreshold must be in [0, 1], but was '${s}'`),g(t.rank===2,()=>`boxes must be a 2D tensor, but was of rank '${t.rank}'`),g(t.shape[1]===4,()=>`boxes must have 4 columns, but 2nd dimension was ${t.shape[1]}`),g(e.rank===1,()=>"scores must be a 1D tensor"),g(e.shape[0]===o,()=>`scores has incompatible shape with boxes. Expected ${o}, but was ${e.shape[0]}`),g(0<=a&&a<=1,()=>`softNmsSigma must be in [0, 1], but was '${a}'`),{maxOutputSize:n,iouThreshold:s,scoreThreshold:r,softNmsSigma:a}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function uw(t,e,n,s=.5,r=Number.NEGATIVE_INFINITY){const a=m(t,"boxes","nonMaxSuppression","float32"),o=m(e,"scores","nonMaxSuppression","float32"),i=sn(a,o,n,s,r);n=i.maxOutputSize,s=i.iouThreshold,r=i.scoreThreshold;const u={maxOutputSize:n,iouThreshold:s,scoreThreshold:r};return w.runKernel(eu,{boxes:a,scores:o},u)}const cw=b({nonMaxSuppression_:uw});/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function lw(t,e,n){const s=hw(t,e,n),r=s<0?-(s+1):s;t.splice(r,0,e)}function hw(t,e,n){return fw(t,e,n||pw)}function pw(t,e){return t>e?1:t<e?-1:0}function fw(t,e,n){let s=0,r=t.length,a=0,o=!1;for(;s<r;){a=s+(r-s>>>1);const i=n(e,t[a]);i>0?s=a+1:(r=a,o=!i)}return o?s:-s-1}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ap(t,e,n,s,r){return ga(t,e,n,s,r,0)}function op(t,e,n,s,r,a){return ga(t,e,n,s,r,0,!1,a,!0)}function ip(t,e,n,s,r,a){return ga(t,e,n,s,r,a,!0)}function ga(t,e,n,s,r,a,o=!1,i=!1,u=!1){const c=[];for(let N=0;N<e.length;N++)e[N]>r&&c.push({score:e[N],boxIndex:N,suppressBeginIndex:0});c.sort(Ma);const h=a>0?-.5/a:0,l=[],f=[];for(;l.length<n&&c.length>0;){const N=c.pop(),{score:T,boxIndex:A,suppressBeginIndex:E}=N;if(T<r)break;let k=!1;for(let v=l.length-1;v>=E;--v){const x=dw(t,A,l[v]);if(x>=s){k=!0;break}if(N.score=N.score*mw(s,h,x),N.score<=r)break}N.suppressBeginIndex=l.length,k||(N.score===T?(l.push(A),f.push(N.score)):N.score>r&&lw(c,N,Ma))}const d=l.length,y=n-d;i&&y>0&&(l.push(...new Array(y).fill(0)),f.push(...new Array(y).fill(0)));const S={selectedIndices:l};return o&&(S.selectedScores=f),u&&(S.validOutputs=d),S}function dw(t,e,n){const s=t.subarray(e*4,e*4+4),r=t.subarray(n*4,n*4+4),a=Math.min(s[0],s[2]),o=Math.min(s[1],s[3]),i=Math.max(s[0],s[2]),u=Math.max(s[1],s[3]),c=Math.min(r[0],r[2]),h=Math.min(r[1],r[3]),l=Math.max(r[0],r[2]),f=Math.max(r[1],r[3]),d=(i-a)*(u-o),y=(l-c)*(f-h);if(d<=0||y<=0)return 0;const S=Math.max(a,c),N=Math.max(o,h),T=Math.min(i,l),A=Math.min(u,f),E=Math.max(T-S,0)*Math.max(A-N,0);return E/(d+y-E)}function mw(t,e,n){const s=Math.exp(e*n*n);return n<=t?s:0}function Ma(t,e){return t.score-e.score||t.score===e.score&&e.boxIndex-t.boxIndex}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */async function gw(t,e,n,s=.5,r=Number.NEGATIVE_INFINITY){const a=m(t,"boxes","nonMaxSuppressionAsync"),o=m(e,"scores","nonMaxSuppressionAsync"),i=sn(a,o,n,s,r);n=i.maxOutputSize,s=i.iouThreshold,r=i.scoreThreshold;const u=await Promise.all([a.data(),o.data()]),c=u[0],h=u[1],{selectedIndices:l}=ap(c,h,n,s,r);return a!==t&&a.dispose(),o!==e&&o.dispose(),$e(l,"int32")}const yw=gw;/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function bw(t,e,n,s=.5,r=Number.NEGATIVE_INFINITY,a=0){const o=m(t,"boxes","nonMaxSuppression"),i=m(e,"scores","nonMaxSuppression"),u=sn(o,i,n,s,r,a);n=u.maxOutputSize,s=u.iouThreshold,r=u.scoreThreshold,a=u.softNmsSigma;const c={boxes:o,scores:i},h={maxOutputSize:n,iouThreshold:s,scoreThreshold:r,softNmsSigma:a},l=w.runKernel(nu,c,h);return{selectedIndices:l[0],selectedScores:l[1]}}const ww=b({nonMaxSuppressionWithScore_:bw});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */async function Nw(t,e,n,s=.5,r=Number.NEGATIVE_INFINITY,a=0){const o=m(t,"boxes","nonMaxSuppressionAsync"),i=m(e,"scores","nonMaxSuppressionAsync"),u=sn(o,i,n,s,r,a);n=u.maxOutputSize,s=u.iouThreshold,r=u.scoreThreshold,a=u.softNmsSigma;const c=await Promise.all([o.data(),i.data()]),h=c[0],l=c[1],{selectedIndices:f,selectedScores:d}=ip(h,l,n,s,r,a);return o!==t&&o.dispose(),i!==e&&i.dispose(),{selectedIndices:$e(f,"int32"),selectedScores:$e(d)}}const Sw=Nw;/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Tw(t,e,n,s=.5,r=Number.NEGATIVE_INFINITY,a=!1){const o=m(t,"boxes","nonMaxSuppression"),i=m(e,"scores","nonMaxSuppression"),u=sn(o,i,n,s,r,null),c=u.maxOutputSize,h=u.iouThreshold,l=u.scoreThreshold,f={boxes:o,scores:i},d={maxOutputSize:c,iouThreshold:h,scoreThreshold:l,padToMaxOutputSize:a},y=w.runKernel(tu,f,d);return{selectedIndices:y[0],validOutputs:y[1]}}const $w=b({nonMaxSuppressionPadded_:Tw});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */async function Ew(t,e,n,s=.5,r=Number.NEGATIVE_INFINITY,a=!1){const o=m(t,"boxes","nonMaxSuppressionAsync"),i=m(e,"scores","nonMaxSuppressionAsync"),u=sn(o,i,n,s,r,null),c=u.maxOutputSize,h=u.iouThreshold,l=u.scoreThreshold,[f,d]=await Promise.all([o.data(),i.data()]),{selectedIndices:y,validOutputs:S}=op(f,d,c,h,l,a);return o!==t&&o.dispose(),i!==e&&i.dispose(),{selectedIndices:$e(y,"int32"),validOutputs:z(S,"int32")}}const kw=Ew;/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function vw(t,e,n=!1,s=!1){const r=m(t,"images","resizeBilinear");g(r.rank===3||r.rank===4,()=>`Error in resizeBilinear: x must be rank 3 or 4, but got rank ${r.rank}.`),g(e.length===2,()=>`Error in resizeBilinear: new shape must 2D, but got shape ${e}.`),g(s===!1||n===!1,()=>"Error in resizeBilinear: If halfPixelCenters is true, alignCorners must be false.");let a=r,o=!1;r.rank===3&&(o=!0,a=$(r,[1,r.shape[0],r.shape[1],r.shape[2]]));const i={images:a},u={alignCorners:n,halfPixelCenters:s,size:e},c=w.runKernel(wu,i,u);return o?$(c,[c.shape[1],c.shape[2],c.shape[3]]):c}const _w=b({resizeBilinear_:vw});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Iw(t,e,n=!1,s=!1){const r=m(t,"images","resizeNearestNeighbor");g(r.rank===3||r.rank===4,()=>`Error in resizeNearestNeighbor: x must be rank 3 or 4, but got rank ${r.rank}.`),g(e.length===2,()=>`Error in resizeNearestNeighbor: new shape must 2D, but got shape ${e}.`),g(r.dtype==="float32"||r.dtype==="int32",()=>"`images` must have `int32` or `float32` as dtype"),g(s===!1||n===!1,()=>"Error in resizeNearestNeighbor: If halfPixelCenters is true, alignCorners must be false.");let a=r,o=!1;r.rank===3&&(o=!0,a=$(r,[1,r.shape[0],r.shape[1],r.shape[2]]));const i={images:a},u={alignCorners:n,halfPixelCenters:s,size:e},c=w.runKernel(bu,i,u);return o?$(c,[c.shape[1],c.shape[2],c.shape[3]]):c}const xw=b({resizeNearestNeighbor_:Iw});/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Aw(t,e="binary",n=!1,s=.5){const r=m(t,"image","threshold"),a=.2989,o=.587,i=.114,u=r.shape[0]*r.shape[1];let c=I($e([s]),255),h,l,f,d;if(g(r.rank===3,()=>`Error in threshold: image must be rank 3,but got rank ${r.rank}.`),g(r.shape[2]===3||r.shape[2]===1,()=>`Error in threshold: image color channel must be equal to 3 or 1but got ${r.shape[2]}.`),g(r.dtype==="int32"||r.dtype==="float32",()=>`Error in dtype: image dtype must be int32 or float32,but got dtype ${r.dtype}.`),g(e==="otsu"||e==="binary",()=>`Method must be binary or otsu, but was ${e}`),r.shape[2]===3){[h,l,f]=Qt(r,[1,1,1],-1);const N=I(h,a),T=I(l,o),A=I(f,i);d=C(C(N,T),A)}else d=t;if(e==="otsu"){const N=Ar(X(ua(d),"int32"),Fe([]),256);c=Ow(N,u)}const y=n?ls(d,c):Rn(d,c);return X(I(y,255),"int32")}function Ow(t,e){let n=$e([-1]),s=$e([0]),r=$e([0]),a,o,i,u,c,h;for(let l=0;l<t.size-1;l++){a=q(t,0,l+1),o=q(t,l+1),c=K(H(a),e),h=K(H(o),e);const f=H(I(a,Jt(0,a.size)));i=K(f,H(a));const d=tn(o.shape,a.size),y=C(Jt(0,o.size),d),S=I(o,y);u=K(H(S),H(o));const N=P(i,u),T=P(i,u),A=I(c,h);r=I(I(A,N),T);const E=Rn(r,s);s=Ze(E,r,s),n=Ze(E,$e([l]),n)}return n}const Dw=b({threshold_:Aw});/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Fw(t,e,n="nearest",s="constant",r=0,a){const o=m(t,"image","transform","float32"),i=m(e,"transforms","transform","float32");g(o.rank===4,()=>`Error in transform: image must be rank 4,but got rank ${o.rank}.`),g(i.rank===2&&(i.shape[0]===o.shape[0]||i.shape[0]===1)&&i.shape[1]===8,()=>"Error in transform: Input transform should be batch x 8 or 1 x 8"),g(a==null||a.length===2,()=>`Error in transform: outputShape must be [height, width] or null, but got ${a}.`);const u={image:o,transforms:i},c={interpolation:n,fillMode:s,fillValue:r,outputShape:a};return w.runKernel(tc,u,c)}const Cw=b({transform_:Fw});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Rw(t,e,n){const s=m(t,"a","bandPart");g(s.rank>=2,()=>`bandPart(): Rank must be at least 2, got ${s.rank}.`);const r=s.shape,[a,o]=s.shape.slice(-2);let i,u;typeof e=="number"?(g(e%1===0,()=>`bandPart(): numLower must be an integer, got ${e}.`),g(e<=a,()=>`bandPart(): numLower (${e}) must not be greater than the number of rows (${a}).`),i=m(e<0?a:e,"numLower","bandPart")):(g(e.dtype==="int32",()=>"bandPart(): numLower's dtype must be an int32."),i=Ze(ts(e,0),a,Tn(e,a))),typeof n=="number"?(g(n%1===0,()=>`bandPart(): numUpper must be an integer, got ${n}.`),g(n<=o,()=>`bandPart(): numUpper (${n}) must not be greater than the number of columns (${o}).`),u=m(n<0?o:n,"numUpper","bandPart")):(g(n.dtype==="int32",()=>"bandPart(): numUpper's dtype must be an int32."),u=Ze(ts(n,0),o,Tn(n,o)));const c=$(Jt(0,a,1,"int32"),[-1,1]),h=Jt(0,o,1,"int32"),l=P(c,h),f=Nn(ls(l,i),Pr(l,Ce(u))),d=xt([a,o],s.dtype);return $(je(ft($(s,[-1,a,o])).map(y=>Ze(f,y,d))),r)}const Lw=b({bandPart_:Rw});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Bw(t){let e;if(Array.isArray(t)){e=!1,g(t!=null&&t.length>0,()=>"Gram-Schmidt process: input must not be null, undefined, or empty");const r=t[0].shape[0];for(let a=1;a<t.length;++a)g(t[a].shape[0]===r,()=>`Gram-Schmidt: Non-unique lengths found in the input vectors: (${t[a].shape[0]} vs. ${r})`)}else e=!0,t=Qt(t,t.shape[0],0).map(r=>gs(r,[0]));g(t.length<=t[0].shape[0],()=>`Gram-Schmidt: Number of vectors (${t.length}) exceeds number of dimensions (${t[0].shape[0]}).`);const n=[],s=t;for(let r=0;r<t.length;++r)n.push(w.tidy(()=>{let a=s[r];if(r>0)for(let o=0;o<r;++o){const i=I(H(I(n[o],a)),n[o]);a=P(a,i)}return K(a,Cn(a,"euclidean"))}));return e?je(n,0):n}const Pw=b({gramSchmidt_:Bw});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function zw(t,e=!1){if(g(t.rank>=2,()=>`qr() requires input tensor to have a rank >= 2, but got rank ${t.rank}`),t.rank===2)return ja(t,e);{const n=t.shape.slice(0,t.shape.length-2).reduce((u,c)=>u*c),s=ft($(t,[n,t.shape[t.shape.length-2],t.shape[t.shape.length-1]]),0),r=[],a=[];s.forEach(u=>{const[c,h]=ja(u,e);r.push(c),a.push(h)});const o=$(je(r,0),t.shape),i=$(je(a,0),t.shape);return[o,i]}}function ja(t,e=!1){return w.tidy(()=>{g(t.shape.length===2,()=>`qr2d() requires a 2D Tensor, but got a ${t.shape.length}D Tensor.`);const n=t.shape[0],s=t.shape[1];let r=Rr(n),a=Xe(t);const o=Ut([[1]],[1,1]);let i=Xe(o);const u=n>=s?s:n;for(let c=0;c<u;++c){const h=a,l=i,f=r;[i,a,r]=w.tidy(()=>{const d=q(a,[c,c],[n-c,1]),y=Cn(d),S=q(a,[c,c],[1,1]),N=Ze(Rn(S,0),Ut([[-1]]),Ut([[1]])),T=P(S,I(N,y)),A=K(d,T);A.shape[0]===1?i=Xe(o):i=ue([o,q(A,[1,0],[A.shape[0]-1,A.shape[1]])],0);const E=Ce(K(V(N,T),y)),k=q(a,[c,0],[n-c,s]),v=I(E,i),x=En(i);if(c===0)a=P(k,V(v,V(x,k)));else{const F=P(k,V(v,V(x,k)));a=ue([q(a,[0,0],[c,s]),F],0)}const O=En(v),D=q(r,[0,c],[n,r.shape[1]-c]);if(c===0)r=P(D,V(V(D,i),O));else{const F=P(D,V(V(D,i),O));r=ue([q(r,[0,0],[n,c]),F],1)}return[i,a,r]}),pe([h,l,f])}return!e&&n>s&&(r=q(r,[0,0],[n,s]),a=q(a,[0,0],[s,s])),[r,a]})}const Vw=b({qr_:zw});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */var he;(function(t){t[t.NONE=0]="NONE",t[t.MEAN=1]="MEAN",t[t.SUM=2]="SUM",t[t.SUM_BY_NONZERO_WEIGHTS=3]="SUM_BY_NONZERO_WEIGHTS"})(he||(he={}));function Ww(t,e,n=he.SUM_BY_NONZERO_WEIGHTS){const s=m(t,"losses","computeWeightedLoss");let r=null;e!=null&&(r=m(e,"weights","computeWeightedLoss"));const a=r==null?s:I(s,r);if(n===he.NONE)return a;if(n===he.SUM)return H(a);if(n===he.MEAN){if(r==null)return Sn(a);{const o=s.size/r.size,i=K(H(a),H(r));return o>1?K(i,z(o)):i}}if(n===he.SUM_BY_NONZERO_WEIGHTS){if(r==null)return K(H(a),z(s.size));{const o=I(r,rt(s.shape)),i=X(H(Hr(o,z(0))),"float32");return K(H(a),i)}}throw Error(`Unknown reduction: ${n}`)}const Qe=b({computeWeightedLoss_:Ww});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Mw(t,e,n,s=he.SUM_BY_NONZERO_WEIGHTS){const r=m(t,"labels","absoluteDifference"),a=m(e,"predictions","absoluteDifference");let o=null;n!=null&&(o=m(n,"weights","absoluteDifference")),fe(r.shape,a.shape,"Error in absoluteDifference: ");const i=be(P(r,a));return Qe(i,o,s)}const jw=b({absoluteDifference_:Mw});function Uw(t,e,n,s,r=he.SUM_BY_NONZERO_WEIGHTS){const a=m(t,"labels","cosineDistance"),o=m(e,"predictions","cosineDistance");let i=null;s!=null&&(i=m(s,"weights","cosineDistance")),fe(a.shape,o.shape,"Error in cosineDistance: ");const u=z(1),c=P(u,H(I(a,o),n,!0));return Qe(c,i,r)}const qw=b({cosineDistance_:Uw});function Gw(t,e,n,s=he.SUM_BY_NONZERO_WEIGHTS){let r=m(t,"labels","hingeLoss");const a=m(e,"predictions","hingeLoss");let o=null;n!=null&&(o=m(n,"weights","hingeLoss")),fe(r.shape,a.shape,"Error in hingeLoss: ");const i=z(1);r=P(I(z(2),r),i);const u=Bn(P(i,I(r,a)));return Qe(u,o,s)}const Hw=b({hingeLoss_:Gw});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Kw(t,e,n,s=1,r=he.SUM_BY_NONZERO_WEIGHTS){const a=m(t,"labels","huberLoss"),o=m(e,"predictions","huberLoss");let i=null;n!=null&&(i=m(n,"weights","huberLoss")),fe(a.shape,o.shape,"Error in huberLoss: ");const u=z(s),c=be(P(o,a)),h=Tn(c,u),l=P(c,h),f=C(I(z(.5),xe(h)),I(u,l));return Qe(f,i,r)}const Xw=b({huberLoss_:Kw});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Zw(t,e,n,s=1e-7,r=he.SUM_BY_NONZERO_WEIGHTS){const a=m(t,"labels","logLoss"),o=m(e,"predictions","logLoss");let i=null;n!=null&&(i=m(n,"weights","logLoss")),fe(a.shape,o.shape,"Error in logLoss: ");const u=z(1),c=z(s),h=Ce(I(a,Zt(C(o,c)))),l=I(P(u,a),Zt(C(P(u,o),c))),f=P(h,l);return Qe(f,i,r)}const Jw=b({logLoss_:Zw});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Yw(t,e,n,s=he.SUM_BY_NONZERO_WEIGHTS){const r=m(t,"labels","meanSquaredError"),a=m(e,"predictions","meanSquaredError");let o=null;n!=null&&(o=m(n,"weights","meanSquaredError")),fe(r.shape,a.shape,"Error in meanSquaredError: ");const i=la(r,a);return Qe(i,o,s)}const Qw=b({meanSquaredError_:Yw});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function e1(t,e){const n=m(t,"labels","sigmoidCrossEntropyWithLogits"),s=m(e,"logits","sigmoidCrossEntropyWithLogits");fe(n.shape,s.shape,"Error in sigmoidCrossEntropyWithLogits: ");const r=Bn(s),a=I(s,n),o=Vr(lt(Ce(be(s))));return C(P(r,a),o)}function t1(t,e,n,s=0,r=he.SUM_BY_NONZERO_WEIGHTS){let a=m(t,"multiClassLabels","sigmoidCrossEntropy");const o=m(e,"logits","sigmoidCrossEntropy");let i=null;if(n!=null&&(i=m(n,"weights","sigmoidCrossEntropy")),fe(a.shape,o.shape,"Error in sigmoidCrossEntropy: "),s>0){const c=z(s),h=z(1),l=z(.5);a=C(I(a,P(h,c)),I(l,c))}const u=e1(a,o);return Qe(u,i,r)}const n1=b({sigmoidCrossEntropy_:t1});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function s1(t,e,n=-1){if(n===-1&&(n=e.rank-1),n!==e.rank-1)throw Error(`Softmax cross entropy along a non-last dimension is not yet supported. Labels / logits was rank ${e.rank} and dim was ${n}`);return Me((r,a,o)=>{const u=Mr(a,[n],!0),c=P(X(a,"float32"),u);o([r,c]);const h=Ce(I(c,r));return{value:H(h,[n]),gradFunc:(d,y)=>{const[S,N]=y,T=Fn(d.shape,[n]);return[I($(d,T),P(X(S,"float32"),lt(N))),I($(d,T),P(lt(N),X(S,"float32")))]}}})(t,e)}function r1(t,e,n,s=0,r=he.SUM_BY_NONZERO_WEIGHTS){let a=m(t,"onehotLabels","softmaxCrossEntropy");const o=m(e,"logits","softmaxCrossEntropy");let i=null;if(n!=null&&(i=m(n,"weights","softmaxCrossEntropy")),fe(a.shape,o.shape,"Error in softmaxCrossEntropy: "),s>0){const c=z(s),h=z(1),l=z(a.shape[1]);a=C(I(a,P(h,c)),K(c,l))}const u=s1(a,o);return Qe(u,i,r)}const a1=b({softmaxCrossEntropy_:r1});/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function o1(t,e,n,s){const r=m(t,"indices","sparseFillEmptyRows","int32"),a=m(e,"values","sparseFillEmptyRows"),o=m(n,"denseShape","sparseFillEmptyRows","int32"),i=m(s,"defaultValue","sparseFillEmptyRows",a.dtype);if(r.rank!==2)throw new Error(`Indices should be Tensor2D but received shape
        ${r.shape}`);if(a.rank!==1)throw new Error(`Values should be Tensor1D but received shape ${a.shape}`);if(o.rank!==1)throw new Error(`Dense shape should be Tensor1D but received shape ${o.shape}`);if(i.rank!==0)throw new Error(`Default value should be a scalar but received shape ${i.shape}`);const u={indices:r,values:a,denseShape:o,defaultValue:i},c=w.runKernel(Vu,u);return{outputIndices:c[0],outputValues:c[1],emptyRowIndicator:c[2],reverseIndexMap:c[3]}}const i1=b({sparseFillEmptyRows_:o1});/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function u1(t,e,n){const s=m(t,"inputIndices","sparseReshape","int32"),r=m(e,"inputShape","sparseReshape","int32"),a=m(n,"newShape","sparseReshape","int32");if(s.rank!==2)throw new Error(`Input indices should be Tensor2D but received shape
        ${s.shape}`);if(r.rank!==1)throw new Error(`Input shape should be Tensor1D but received shape ${r.shape}`);if(a.rank!==1)throw new Error(`New shape should be Tensor1D but received shape ${a.shape}`);const o={inputIndices:s,inputShape:r,newShape:a},i=w.runKernel(Wu,o);return{outputIndices:i[0],outputShape:i[1]}}const c1=b({sparseReshape_:u1});/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function l1(t,e,n){const s=m(t,"data","sparseSegmentMean"),r=m(e,"indices","sparseSegmentMean","int32"),a=m(n,"segmentIds","sparseSegmentMean","int32");if(s.rank<1)throw new Error("Data should be at least 1 dimensional but received scalar");if(r.rank!==1)throw new Error(`Indices should be Tensor1D but received shape
          ${r.shape}`);if(a.rank!==1)throw new Error(`Segment ids should be Tensor1D but received shape
          ${a.shape}`);const o={data:s,indices:r,segmentIds:a};return w.runKernel(Mu,o)}const h1=b({sparseSegmentMean_:l1});/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function p1(t,e,n){const s=m(t,"data","sparseSegmentSum"),r=m(e,"indices","sparseSegmentSum","int32"),a=m(n,"segmentIds","sparseSegmentSum","int32");if(s.rank<1)throw new Error("Data should be at least 1 dimensional but received scalar");if(r.rank!==1)throw new Error(`Indices should be Tensor1D but received shape
         ${r.shape}`);if(a.rank!==1)throw new Error(`Segment ids should be Tensor1D but received shape
         ${a.shape}`);const o={data:s,indices:r,segmentIds:a};return w.runKernel(ju,o)}const f1=b({sparseSegmentSum_:p1});/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function d1(t,e,n,s,r,a,o,i){const u=m(t,"data","stringNGrams","string");if(u.dtype!=="string")throw new Error("Data must be of datatype string");if(u.shape.length!==1)throw new Error(`Data must be a vector, saw: ${u.shape}`);const c=m(e,"dataSplits","stringNGrams");if(c.dtype!=="int32")throw new Error("Data splits must be of datatype int32");const h={separator:n,nGramWidths:s,leftPad:r,rightPad:a,padWidth:o,preserveShortSequences:i},l={data:u,dataSplits:c},f=w.runKernel(Ku,l,h);return{nGrams:f[0],nGramsSplits:f[1]}}const m1=b({stringNGrams_:d1});/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function g1(t,e,n=!0){const s=m(t,"input","stringSplit","string"),r=m(e,"delimiter","stringSplit","string");if(s.rank!==1)throw new Error(`Input should be Tensor1D but received shape ${s.shape}`);if(r.rank!==0)throw new Error(`Delimiter should be a scalar but received shape ${r.shape}`);const a={skipEmpty:n},o={input:s,delimiter:r},i=w.runKernel(Xu,o,a);return{indices:i[0],values:i[1],shape:i[2]}}const y1=b({stringSplit_:g1});/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function b1(t,e){const n=m(t,"input","stringToHashBucketFast","string"),s={numBuckets:e};if(e<=0)throw new Error("Number of buckets must be at least 1");const r={input:n};return w.runKernel(Zu,r,s)}const w1=b({stringToHashBucketFast_:b1});/**
 * @license
 * Copyright 2023 Google LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function N1(t,e,n,s=!0){const r=m(t,"input","staticRegexReplace","string"),a={pattern:e,rewrite:n,replaceGlobal:s};return w.runKernel(Gu,{x:r},a)}const S1=b({staticRegexReplace_:N1});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const up={fft:ds,ifft:$n,rfft:ms,irfft:ca},cp={hammingWindow:H0,hannWindow:sp,frame:rp,stft:J0},lp={flipLeftRight:tw,grayscaleToRGB:sw,resizeNearestNeighbor:xw,resizeBilinear:_w,rgbToGrayscale:aw,rotateWithOffset:iw,cropAndResize:Q0,nonMaxSuppression:cw,nonMaxSuppressionAsync:yw,nonMaxSuppressionWithScore:ww,nonMaxSuppressionWithScoreAsync:Sw,nonMaxSuppressionPadded:$w,nonMaxSuppressionPaddedAsync:kw,threshold:Dw,transform:Cw},hp={bandPart:Lw,gramSchmidt:Pw,qr:Vw},pp={absoluteDifference:jw,computeWeightedLoss:Qe,cosineDistance:qw,hingeLoss:Hw,huberLoss:Xw,logLoss:Jw,meanSquaredError:Qw,sigmoidCrossEntropy:n1,softmaxCrossEntropy:a1},fp={sparseFillEmptyRows:i1,sparseReshape:c1,sparseSegmentMean:h1,sparseSegmentSum:f1},dp={stringNGrams:m1,stringSplit:y1,stringToHashBucketFast:w1,staticRegexReplace:S1};/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const T1=new Map,Xs=new Map;class mp{getClassName(){return this.constructor.className}static fromConfig(e,n){return new e(n)}}class tt{constructor(){this.classNameMap={}}static getMap(){return tt.instance==null&&(tt.instance=new tt),tt.instance}static register(e){tt.getMap().classNameMap[e.className]=[e,e.fromConfig]}}function gp(t,e,n){g(t.className!=null,()=>"Class being registered does not have the static className property defined."),g(typeof t.className=="string",()=>"className is required to be a string, but got type "+typeof t.className),g(t.className.length>0,()=>"Class being registered has an empty-string as its className, which is disallowed."),typeof e>"u"&&(e="Custom"),typeof n>"u"&&(n=t.className);const s=n,r=e+">"+s;return tt.register(t),T1.set(r,t),Xs.set(t,r),t}function $1(t){return Xs.has(t)?Xs.get(t):t.className}const E1=Object.freeze(Object.defineProperty({__proto__:null,Serializable:mp,SerializationMap:tt,getRegisteredName:$1,registerClass:gp},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class dt extends mp{minimize(e,n=!1,s){const{value:r,grads:a}=this.computeGradients(e,s);if(s!=null){const o=s.map(i=>({name:i.name,tensor:a[i.name]}));this.applyGradients(o)}else this.applyGradients(a);return pe(a),n?r:(r.dispose(),null)}get iterations(){return this.iterations_==null&&(this.iterations_=0),this.iterations_}incrementIterations(){this.iterations_=this.iterations+1}computeGradients(e,n){return Wl(e,n)}dispose(){this.iterations_!=null&&pe(this.iterations_)}async saveIterations(){return this.iterations_==null&&(this.iterations_=0),{name:"iter",tensor:z(this.iterations_,"int32")}}async getWeights(){throw new Error("getWeights() is not implemented for this optimizer yet.")}async setWeights(e){throw new Error(`setWeights() is not implemented for this optimizer class ${this.getClassName()}`)}async extractIterations(e){return this.iterations_=(await e[0].tensor.data())[0],e.slice(1)}}Object.defineProperty(dt,Symbol.hasInstance,{value:t=>t.minimize!=null&&t.computeGradients!=null&&t.applyGradients!=null});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class ya extends dt{static get className(){return"Adadelta"}constructor(e,n,s=null){super(),this.learningRate=e,this.rho=n,this.epsilon=s,this.accumulatedGrads=[],this.accumulatedUpdates=[],s==null&&(this.epsilon=w.backend.epsilon())}applyGradients(e){(Array.isArray(e)?e.map(s=>s.name):Object.keys(e)).forEach((s,r)=>{const a=w.registeredVariables[s],o=!1;this.accumulatedGrads[r]==null&&(this.accumulatedGrads[r]={originalName:`${s}/accum_grad`,variable:W(()=>Ne(a).variable(o))}),this.accumulatedUpdates[r]==null&&(this.accumulatedUpdates[r]={originalName:`${s}/accum_var`,variable:W(()=>Ne(a).variable(o))});const i=Array.isArray(e)?e[r].tensor:e[s];if(i==null)return;const u=this.accumulatedGrads[r].variable,c=this.accumulatedUpdates[r].variable;W(()=>{const h=C(I(u,this.rho),I(xe(i),1-this.rho)),l=I(K(We(C(c,this.epsilon)),We(C(u,this.epsilon))),i),f=C(I(c,this.rho),I(xe(l),1-this.rho));u.assign(h),c.assign(f);const d=C(I(l,-this.learningRate),a);a.assign(d)})}),this.incrementIterations()}dispose(){this.accumulatedUpdates!=null&&(pe(this.accumulatedGrads.map(e=>e.variable)),pe(this.accumulatedUpdates.map(e=>e.variable)))}async getWeights(){const e=[...this.accumulatedGrads,...this.accumulatedUpdates];return[await this.saveIterations()].concat(e.map(n=>({name:n.originalName,tensor:n.variable})))}async setWeights(e){e=await this.extractIterations(e);const n=e.length/2,s=!1;this.accumulatedGrads=e.slice(0,n).map(r=>({originalName:r.name,variable:r.tensor.variable(s)})),this.accumulatedUpdates=e.slice(n,n*2).map(r=>({originalName:r.name,variable:r.tensor.variable(s)}))}getConfig(){return{learningRate:this.learningRate,rho:this.rho,epsilon:this.epsilon}}static fromConfig(e,n){return new e(n.learningRate,n.rho,n.epsilon)}}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class ba extends dt{static get className(){return"Adagrad"}constructor(e,n=.1){super(),this.learningRate=e,this.initialAccumulatorValue=n,this.accumulatedGrads=[]}applyGradients(e){(Array.isArray(e)?e.map(s=>s.name):Object.keys(e)).forEach((s,r)=>{const a=w.registeredVariables[s];this.accumulatedGrads[r]==null&&(this.accumulatedGrads[r]={originalName:`${s}/accumulator`,variable:W(()=>tn(a.shape,this.initialAccumulatorValue).variable(!1))});const o=Array.isArray(e)?e[r].tensor:e[s];if(o==null)return;const i=this.accumulatedGrads[r].variable;W(()=>{const u=C(i,xe(o));i.assign(u);const c=C(I(K(o,We(C(u,w.backend.epsilon()))),-this.learningRate),a);a.assign(c)})}),this.incrementIterations()}dispose(){this.accumulatedGrads!=null&&pe(this.accumulatedGrads.map(e=>e.variable))}async getWeights(){return[await this.saveIterations()].concat(this.accumulatedGrads.map(e=>({name:e.originalName,tensor:e.variable})))}async setWeights(e){e=await this.extractIterations(e);const n=!1;this.accumulatedGrads=e.map(s=>({originalName:s.name,variable:s.tensor.variable(n)}))}getConfig(){return{learningRate:this.learningRate,initialAccumulatorValue:this.initialAccumulatorValue}}static fromConfig(e,n){return new e(n.learningRate,n.initialAccumulatorValue)}}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class wa extends dt{static get className(){return"Adam"}constructor(e,n,s,r=null){super(),this.learningRate=e,this.beta1=n,this.beta2=s,this.epsilon=r,this.accumulatedFirstMoment=[],this.accumulatedSecondMoment=[],W(()=>{this.accBeta1=z(n).variable(),this.accBeta2=z(s).variable()}),r==null&&(this.epsilon=w.backend.epsilon())}applyGradients(e){const n=Array.isArray(e)?e.map(s=>s.name):Object.keys(e);W(()=>{const s=P(1,this.accBeta1),r=P(1,this.accBeta2);n.forEach((a,o)=>{const i=w.registeredVariables[a],u=!1;this.accumulatedFirstMoment[o]==null&&(this.accumulatedFirstMoment[o]={originalName:`${a}/m`,variable:W(()=>Ne(i).variable(u))}),this.accumulatedSecondMoment[o]==null&&(this.accumulatedSecondMoment[o]={originalName:`${a}/v`,variable:W(()=>Ne(i).variable(u))});const c=Array.isArray(e)?e[o].tensor:e[a];if(c==null)return;const h=this.accumulatedFirstMoment[o].variable,l=this.accumulatedSecondMoment[o].variable,f=C(I(h,this.beta1),I(c,1-this.beta1)),d=C(I(l,this.beta2),I(xe(c),1-this.beta2)),y=K(f,s),S=K(d,r);h.assign(f),l.assign(d);const N=C(I(K(y,C(We(S),this.epsilon)),-this.learningRate),i);i.assign(N)}),this.accBeta1.assign(I(this.accBeta1,this.beta1)),this.accBeta2.assign(I(this.accBeta2,this.beta2))}),this.incrementIterations()}dispose(){this.accBeta1.dispose(),this.accBeta2.dispose(),this.accumulatedFirstMoment!=null&&pe(this.accumulatedFirstMoment.map(e=>e.variable)),this.accumulatedSecondMoment!=null&&pe(this.accumulatedSecondMoment.map(e=>e.variable))}async getWeights(){const e=[...this.accumulatedFirstMoment,...this.accumulatedSecondMoment];return[await this.saveIterations()].concat(e.map(n=>({name:n.originalName,tensor:n.variable})))}async setWeights(e){e=await this.extractIterations(e),W(()=>{this.accBeta1.assign(Xt(this.beta1,this.iterations_+1)),this.accBeta2.assign(Xt(this.beta2,this.iterations_+1))});const n=e.length/2,s=!1;this.accumulatedFirstMoment=e.slice(0,n).map(r=>({originalName:r.name,variable:r.tensor.variable(s)})),this.accumulatedSecondMoment=e.slice(n,n*2).map(r=>({originalName:r.name,variable:r.tensor.variable(s)}))}getConfig(){return{learningRate:this.learningRate,beta1:this.beta1,beta2:this.beta2,epsilon:this.epsilon}}static fromConfig(e,n){return new e(n.learningRate,n.beta1,n.beta2,n.epsilon)}}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Na extends dt{static get className(){return"Adamax"}constructor(e,n,s,r=null,a=0){super(),this.learningRate=e,this.beta1=n,this.beta2=s,this.epsilon=r,this.decay=a,this.accumulatedFirstMoment=[],this.accumulatedWeightedInfNorm=[],W(()=>{this.iteration=z(0).variable(),this.accBeta1=z(n).variable()}),r==null&&(this.epsilon=w.backend.epsilon())}applyGradients(e){const n=Array.isArray(e)?e.map(s=>s.name):Object.keys(e);W(()=>{const s=P(1,this.accBeta1),r=K(-this.learningRate,C(I(this.iteration,this.decay),1));n.forEach((a,o)=>{const i=w.registeredVariables[a],u=!1;this.accumulatedFirstMoment[o]==null&&(this.accumulatedFirstMoment[o]={originalName:`${a}/m`,variable:Ne(i).variable(u)}),this.accumulatedWeightedInfNorm[o]==null&&(this.accumulatedWeightedInfNorm[o]={originalName:`${a}/v`,variable:Ne(i).variable(u)});const c=Array.isArray(e)?e[o].tensor:e[a];if(c==null)return;const h=this.accumulatedFirstMoment[o].variable,l=this.accumulatedWeightedInfNorm[o].variable,f=C(I(h,this.beta1),I(c,1-this.beta1)),d=I(l,this.beta2),y=be(c),S=Gr(d,y);h.assign(f),l.assign(S);const N=C(I(K(r,s),K(f,C(S,this.epsilon))),i);i.assign(N)}),this.iteration.assign(C(this.iteration,1)),this.accBeta1.assign(I(this.accBeta1,this.beta1))}),this.incrementIterations()}dispose(){this.accBeta1.dispose(),this.iteration.dispose(),this.accumulatedFirstMoment!=null&&pe(this.accumulatedFirstMoment.map(e=>e.variable)),this.accumulatedWeightedInfNorm!=null&&pe(this.accumulatedWeightedInfNorm.map(e=>e.variable))}async getWeights(){throw new Error("getWeights() is not implemented for Adamax yet.")}async setWeights(e){throw new Error("setWeights() is not implemented for Adamax yet.")}getConfig(){return{learningRate:this.learningRate,beta1:this.beta1,beta2:this.beta2,epsilon:this.epsilon,decay:this.decay}}static fromConfig(e,n){return new e(n.learningRate,n.beta1,n.beta2,n.epsilon,n.decay)}}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class $s extends dt{static get className(){return"SGD"}constructor(e){super(),this.learningRate=e,this.setLearningRate(e)}applyGradients(e){(Array.isArray(e)?e.map(s=>s.name):Object.keys(e)).forEach((s,r)=>{const a=Array.isArray(e)?e[r].tensor:e[s];if(a==null)return;const o=w.registeredVariables[s];W(()=>{const i=C(I(this.c,a),o);o.assign(i)})}),this.incrementIterations()}setLearningRate(e){this.learningRate=e,this.c!=null&&this.c.dispose(),this.c=De(z(-e))}dispose(){this.c.dispose()}async getWeights(){return[await this.saveIterations()]}async setWeights(e){if(e=await this.extractIterations(e),e.length!==0)throw new Error("SGD optimizer does not have settable weights.")}getConfig(){return{learningRate:this.learningRate}}static fromConfig(e,n){return new e(n.learningRate)}}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Sa extends $s{static get className(){return"Momentum"}constructor(e,n,s=!1){super(e),this.learningRate=e,this.momentum=n,this.useNesterov=s,this.accumulations=[],this.m=z(this.momentum)}applyGradients(e){(Array.isArray(e)?e.map(s=>s.name):Object.keys(e)).forEach((s,r)=>{const a=w.registeredVariables[s];this.accumulations[r]==null&&(this.accumulations[r]={originalName:`${s}/momentum`,variable:W(()=>Ne(a).variable(!1))});const o=this.accumulations[r].variable,i=Array.isArray(e)?e[r].tensor:e[s];i!=null&&W(()=>{let u;const c=C(I(this.m,o),i);this.useNesterov?u=C(I(this.c,C(i,I(c,this.m))),a):u=C(I(this.c,c),a),o.assign(c),a.assign(u)})}),this.incrementIterations()}dispose(){this.m.dispose(),this.accumulations!=null&&pe(this.accumulations.map(e=>e.variable))}setMomentum(e){this.momentum=e}async getWeights(){return[await this.saveIterations()].concat(this.accumulations.map(e=>({name:e.originalName,tensor:e.variable})))}async setWeights(e){e=await this.extractIterations(e);const n=!1;this.accumulations=e.map(s=>({originalName:s.name,variable:s.tensor.variable(n)}))}getConfig(){return{learningRate:this.learningRate,momentum:this.momentum,useNesterov:this.useNesterov}}static fromConfig(e,n){return new e(n.learningRate,n.momentum,n.useNesterov)}}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Ta extends dt{static get className(){return"RMSProp"}constructor(e,n=.9,s=0,r=null,a=!1){if(super(),this.learningRate=e,this.decay=n,this.momentum=s,this.epsilon=r,this.accumulatedMeanSquares=[],this.accumulatedMoments=[],this.accumulatedMeanGrads=[],this.centered=a,r==null&&(this.epsilon=w.backend.epsilon()),e==null)throw new Error("learningRate for RMSPropOptimizer must be defined.")}applyGradients(e){(Array.isArray(e)?e.map(s=>s.name):Object.keys(e)).forEach((s,r)=>{const a=w.registeredVariables[s],o=!1;this.accumulatedMeanSquares[r]==null&&(this.accumulatedMeanSquares[r]={originalName:`${s}/rms`,variable:W(()=>Ne(a).variable(o))}),this.accumulatedMoments[r]==null&&(this.accumulatedMoments[r]={originalName:`${s}/momentum`,variable:W(()=>Ne(a).variable(o))}),this.accumulatedMeanGrads[r]==null&&this.centered&&(this.accumulatedMeanGrads[r]={originalName:`${s}/mg`,variable:W(()=>Ne(a).variable(o))});const i=Array.isArray(e)?e[r].tensor:e[s];if(i==null)return;const u=this.accumulatedMeanSquares[r].variable,c=this.accumulatedMoments[r].variable;W(()=>{const h=C(I(u,this.decay),I(xe(i),1-this.decay));if(this.centered){const l=this.accumulatedMeanGrads[r].variable,f=C(I(l,this.decay),I(i,1-this.decay)),d=K(I(i,this.learningRate),We(P(h,C(xe(f),this.epsilon)))),y=C(I(c,this.momentum),d);u.assign(h),l.assign(f),c.assign(y);const S=P(a,y);a.assign(S)}else{const l=C(I(u,this.decay),I(xe(i),1-this.decay)),f=C(I(c,this.momentum),K(I(i,this.learningRate),We(C(l,this.epsilon))));u.assign(l),c.assign(f);const d=P(a,f);a.assign(d)}})}),this.incrementIterations()}dispose(){this.accumulatedMeanSquares!=null&&pe(this.accumulatedMeanSquares.map(e=>e.variable)),this.accumulatedMeanGrads!=null&&this.centered&&pe(this.accumulatedMeanGrads.map(e=>e.variable)),this.accumulatedMoments!=null&&pe(this.accumulatedMoments.map(e=>e.variable))}async getWeights(){const e=[...this.accumulatedMeanSquares,...this.accumulatedMoments];return this.centered&&e.push(...this.accumulatedMeanGrads),[await this.saveIterations()].concat(e.map(n=>({name:n.originalName,tensor:n.variable})))}async setWeights(e){e=await this.extractIterations(e);const n=this.centered?e.length/3:e.length/2,s=!1;this.accumulatedMeanSquares=e.slice(0,n).map(r=>({originalName:r.name,variable:r.tensor.variable(s)})),this.accumulatedMoments=e.slice(n,n*2).map(r=>({originalName:r.name,variable:r.tensor.variable(s)})),this.centered&&(this.accumulatedMeanGrads=e.slice(n*2,n*3).map(r=>({originalName:r.name,variable:r.tensor.variable(s)})))}getConfig(){return{learningRate:this.learningRate,decay:this.decay,momentum:this.momentum,epsilon:this.epsilon,centered:this.centered}}static fromConfig(e,n){return new e(n.learningRate,n.decay,n.momentum,n.epsilon,n.centered)}}/**
 * @license
 * Copyright 2022 Google LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const k1=[ya,ba,wa,Na,Sa,Ta,$s];function v1(){for(const t of k1)gp(t)}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const _1="model",I1=".json",x1=".weights.bin";function Ua(t){return new Promise(e=>setTimeout(e)).then(t)}class At{constructor(e){if(!R().getBool("IS_BROWSER"))throw new Error("browserDownloads() cannot proceed because the current environment is not a browser.");e.startsWith(At.URL_SCHEME)&&(e=e.slice(At.URL_SCHEME.length)),(e==null||e.length===0)&&(e=_1),this.modelJsonFileName=e+I1,this.weightDataFileName=e+x1}async save(e){if(typeof document>"u")throw new Error("Browser downloads are not supported in this environment since `document` is not present");const n=Be.join(e.weightData),s=window.URL.createObjectURL(new Blob([n],{type:"application/octet-stream"}));if(e.modelTopology instanceof ArrayBuffer)throw new Error("BrowserDownloads.save() does not support saving model topology in binary formats yet.");{const r=[{paths:["./"+this.weightDataFileName],weights:e.weightSpecs}],a=Dc(e,r),o=window.URL.createObjectURL(new Blob([JSON.stringify(a)],{type:"application/json"})),i=this.modelJsonAnchor==null?document.createElement("a"):this.modelJsonAnchor;if(i.download=this.modelJsonFileName,i.href=o,await Ua(()=>i.dispatchEvent(new MouseEvent("click"))),e.weightData!=null){const u=this.weightDataAnchor==null?document.createElement("a"):this.weightDataAnchor;u.download=this.weightDataFileName,u.href=s,await Ua(()=>u.dispatchEvent(new MouseEvent("click")))}return{modelArtifactsInfo:xn(e)}}}}At.URL_SCHEME="downloads://";class A1{constructor(e){if(e==null||e.length<1)throw new Error(`When calling browserFiles, at least 1 file is required, but received ${e}`);this.jsonFile=e[0],this.weightsFiles=e.slice(1)}async load(){return new Promise((e,n)=>{const s=new FileReader;s.onload=r=>{const a=JSON.parse(r.target.result),o=a.modelTopology;if(o==null){n(new Error(`modelTopology field is missing from file ${this.jsonFile.name}`));return}if(a.weightsManifest==null){n(new Error(`weightManifest field is missing from file ${this.jsonFile.name}`));return}if(this.weightsFiles.length===0){e({modelTopology:o});return}const u=Er(a,c=>this.loadWeights(c));e(u)},s.onerror=r=>n(`Failed to read model topology and weights manifest JSON from file '${this.jsonFile.name}'. BrowserFiles supports loading Keras-style tf.Model artifacts only.`),s.readAsText(this.jsonFile)})}loadWeights(e){const n=[],s=[];for(const o of e)n.push(...o.weights),s.push(...o.paths);const r=this.checkManifestAndWeightFiles(e),a=s.map(o=>this.loadWeightsFile(o,r[o]));return Promise.all(a).then(o=>[n,o])}loadWeightsFile(e,n){return new Promise((s,r)=>{const a=new FileReader;a.onload=o=>{const i=o.target.result;s(i)},a.onerror=o=>r(`Failed to weights data from file of path '${e}'.`),a.readAsArrayBuffer(n)})}checkManifestAndWeightFiles(e){const n=[],s=this.weightsFiles.map(a=>Wa(a.name)),r={};for(const a of e)a.paths.forEach(o=>{const i=Wa(o);if(n.indexOf(i)!==-1)throw new Error(`Duplicate file basename found in weights manifest: '${i}'`);if(n.push(i),s.indexOf(i)===-1)throw new Error(`Weight file with basename '${i}' is not provided.`);r[o]=this.weightsFiles[s.indexOf(i)]});if(n.length!==this.weightsFiles.length)throw new Error(`Mismatch in the number of files in weights manifest (${n.length}) and the number of weight files provided (${this.weightsFiles.length}).`);return r}}const O1=t=>R().getBool("IS_BROWSER")&&!Array.isArray(t)&&t.startsWith(At.URL_SCHEME)?D1(t.slice(At.URL_SCHEME.length)):null;Q.registerSaveRouter(O1);function D1(t="model"){return new At(t)}function F1(t){return new A1(t)}/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function qa(t,e,n,s){o(t),n=n??0,s=s??1,i(n,s);let r=0;const a=u=>(u.then(c=>{const h=n+ ++r/t.length*(s-n);return e(h),c}),u);function o(u){g(u!=null&&Array.isArray(u)&&u.length>0,()=>"promises must be a none empty array")}function i(u,c){g(u>=0&&u<=1,()=>`Progress fraction must be in range [0, 1], but got startFraction ${u}`),g(c>=0&&c<=1,()=>`Progress fraction must be in range [0, 1], but got endFraction ${c}`),g(c>=u,()=>`startFraction must be no more than endFraction, but got startFraction ${u} and endFraction ${c}`)}return Promise.all(t.map(a))}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */async function yp(t,e){e==null&&(e={});const n=e.fetchFunc==null?R().platform.fetch:e.fetchFunc,s=t.map(l=>n(l,e.requestInit,{isBinary:!0})),i=(e.onProgress==null?await Promise.all(s):await qa(s,e.onProgress,0,.5)).map(l=>l.arrayBuffer());return e.onProgress==null?await Promise.all(i):await qa(i,e.onProgress,.5,1)}function C1(t,e){var n;const s=e.fetchFunc==null?R().platform.fetch:e.fetchFunc;let r=0,a;return(n=e.onProgress)===null||n===void 0||n.call(e,0),new ReadableStream({pull:async o=>{for(var i;r<t.length;){a||(a=(await s(t[r],e.requestInit,{isBinary:!0})).body.getReader());const{done:u,value:c}=await a.read();if(u){r++,a=void 0,(i=e.onProgress)===null||i===void 0||i.call(e,r/t.length);continue}o.enqueue(c);return}o.close()}})}async function R1(t,e="",n,s){return bp(o=>yp(o,{requestInit:s}))(t,e,n)}function bp(t){return async(e,n="",s)=>{const r=e.map(()=>!1),a={},o=s!=null?s.map(()=>!1):[],i=[];if(e.forEach((d,y)=>{let S=0;d.weights.forEach(N=>{const T="quantization"in N?N.quantization.dtype:N.dtype,A=kt[T]*j(N.shape),E=()=>{r[y]=!0,a[y]==null&&(a[y]=[]),a[y].push({manifestEntry:N,groupOffset:S,sizeBytes:A})};s!=null?s.forEach((k,v)=>{k===N.name&&(E(),o[v]=!0)}):E(),i.push(N.name),S+=A})}),!o.every(d=>d)){const d=s.filter((y,S)=>!o[S]);throw new Error(`Could not find weights in manifest with names: ${d.join(", ")}. 
Manifest JSON has weights with names: ${i.join(", ")}.`)}const u=r.reduce((d,y,S)=>(y&&d.push(S),d),[]),c=[];u.forEach(d=>{e[d].paths.forEach(y=>{const S=n+(n.endsWith("/")?"":"/")+y;c.push(S)})});const h=await t(c),l={};let f=0;return u.forEach(d=>{const y=e[d].paths.length,S=new Be(h.slice(f,f+y));a[d].forEach(T=>{const A=S.slice(T.groupOffset,T.groupOffset+T.sizeBytes),E=xc(A,[T.manifestEntry]);for(const k in E)l[k]=E[k]}),f+=y}),l}}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const L1="application/octet-stream",B1="application/json";class $a{constructor(e,n){if(this.DEFAULT_METHOD="POST",n==null&&(n={}),this.weightPathPrefix=n.weightPathPrefix,this.weightUrlConverter=n.weightUrlConverter,n.fetchFunc!=null?(g(typeof n.fetchFunc=="function",()=>"Must pass a function that matches the signature of `fetch` (see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)"),this.fetch=n.fetchFunc):this.fetch=R().platform.fetch,g(e!=null&&e.length>0,()=>"URL path for http must not be null, undefined or empty."),Array.isArray(e)&&g(e.length===2,()=>`URL paths for http must have a length of 2, (actual length is ${e.length}).`),this.path=e,n.requestInit!=null&&n.requestInit.body!=null)throw new Error("requestInit is expected to have no pre-existing body, but has one.");this.requestInit=n.requestInit||{},this.loadOptions=n}async save(e){if(e.modelTopology instanceof ArrayBuffer)throw new Error("BrowserHTTPRequest.save() does not support saving model topology in binary formats yet.");const n=Object.assign({method:this.DEFAULT_METHOD},this.requestInit);n.body=new FormData;const s=[{paths:["./model.weights.bin"],weights:e.weightSpecs}],r=Dc(e,s);if(n.body.append("model.json",new Blob([JSON.stringify(r)],{type:B1}),"model.json"),e.weightData!=null){const o=Be.join(e.weightData);n.body.append("model.weights.bin",new Blob([o],{type:L1}),"model.weights.bin")}const a=await this.fetch(this.path,n);if(a.ok)return{modelArtifactsInfo:xn(e),responses:[a]};throw new Error(`BrowserHTTPRequest.save() failed due to HTTP response status ${a.status}.`)}async loadModelJSON(){const e=await this.fetch(this.path,this.requestInit);if(!e.ok)throw new Error(`Request to ${this.path} failed with status code ${e.status}. Please verify this URL points to the model JSON of the model to load.`);let n;try{n=await e.json()}catch{let o=`Failed to parse model JSON of response from ${this.path}.`;throw this.path.endsWith(".pb")?o+=" Your path contains a .pb file extension. Support for .pb models have been removed in TensorFlow.js 1.0 in favor of .json models. You can re-convert your Python TensorFlow model using the TensorFlow.js 1.0 conversion scripts or you can convert your.pb models with the 'pb2json'NPM script in the tensorflow/tfjs-converter repository.":o+=" Please make sure the server is serving valid JSON for this request.",new Error(o)}const s=n.modelTopology,r=n.weightsManifest;if(s==null&&r==null)throw new Error(`The JSON from HTTP path ${this.path} contains neither model topology or manifest for weights.`);return n}async load(){if(this.loadOptions.streamWeights)return this.loadStream();const e=await this.loadModelJSON();return Er(e,n=>this.loadWeights(n))}async loadStream(){const e=await this.loadModelJSON(),n=await this.getWeightUrls(e.weightsManifest),s=Yn(e.weightsManifest),r=()=>C1(n,this.loadOptions);return Object.assign(Object.assign({},e),{weightSpecs:s,getWeightStream:r})}async getWeightUrls(e){const n=Array.isArray(this.path)?this.path[1]:this.path,[s,r]=P1(n),a=this.weightPathPrefix||s,o=[],i=[];for(const u of e)for(const c of u.paths)this.weightUrlConverter!=null?i.push(this.weightUrlConverter(c)):o.push(a+c+r);return this.weightUrlConverter&&o.push(...await Promise.all(i)),o}async loadWeights(e){const n=await this.getWeightUrls(e),s=Yn(e),r=await yp(n,this.loadOptions);return[s,r]}}$a.URL_SCHEME_REGEX=/^https?:\/\//;function P1(t){const e=t.lastIndexOf("/"),n=t.lastIndexOf("?"),s=t.substring(0,e),r=n>e?t.substring(n):"";return[s+"/",r]}function Zs(t){return t.match($a.URL_SCHEME_REGEX)!=null}const wp=(t,e)=>{if(typeof fetch>"u"&&(e==null||e.fetchFunc==null))return null;{let n=!0;if(Array.isArray(t)?n=t.every(s=>Zs(s)):n=Zs(t),n)return Ea(t,e)}return null};Q.registerSaveRouter(wp);Q.registerLoadRouter(wp);function Ea(t,e){return new $a(t,e)}function z1(t,e){return Ea(t,e)}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Is{constructor(e){this.modelArtifacts=e}load(){return this.modelArtifacts}}class Np{constructor(e){this.saveHandler=e}save(e){return this.saveHandler(e)}}class V1{constructor(e){e.load&&(this.load=()=>Promise.resolve(e.load())),e.save&&(this.save=n=>Promise.resolve(e.save(n)))}}function W1(t,e,n,s){const r=arguments;return new V1(ss(...r))}function ss(t,e,n,s){return arguments.length===1?t.modelTopology!=null||t.weightSpecs!=null?new Is(t):(console.warn("Please call tf.io.fromMemory() with only one argument. The argument should be of type ModelArtifacts. The multi-argument signature of tf.io.fromMemory() has been deprecated and will be removed in a future release."),new Is({modelTopology:t})):(console.warn("Please call tf.io.fromMemory() with only one argument. The argument should be of type ModelArtifacts. The multi-argument signature of tf.io.fromMemory() has been deprecated and will be removed in a future release."),new Is({modelTopology:t,weightSpecs:e,weightData:n,trainingConfig:s}))}function M1(t){return new Np(t)}function j1(t){return new Np(t)}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const ka=Object.freeze(Object.defineProperty({__proto__:null,CompositeArrayBuffer:Be,browserFiles:F1,browserHTTPRequest:z1,concatenateArrayBuffers:Pd,copyModel:om,decodeWeights:xc,decodeWeightsStream:Oc,encodeWeights:Dd,fromMemory:W1,fromMemorySync:ss,getLoadHandlers:Gd,getModelArtifactsForJSON:Er,getModelArtifactsForJSONSync:$r,getModelArtifactsInfoForJSON:xn,getSaveHandlers:qd,getWeightSpecs:Yn,http:Ea,isHTTPScheme:Zs,listModels:rm,loadWeights:R1,moveModel:im,registerLoadRouter:Ud,registerSaveRouter:jd,removeModel:am,weightsLoaderFactory:bp,withSaveHandler:M1,withSaveHandlerSync:j1},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function U1(t,e,n){const s=m(t,"labels","confusionMatrix"),r=m(e,"predictions","confusionMatrix");g(n==null||n>0&&Number.isInteger(n),()=>`If provided, numClasses must be a positive integer, but got ${n}`),g(s.rank===1,()=>`Expected the rank of labels to be 1, but got ${s.rank}`),g(r.rank===1,()=>`Expected the rank of predictions to be 1, but got ${r.rank}`),g(s.shape[0]===r.shape[0],()=>`Mismatch in the number of examples: ${s.shape[0]} vs. ${r.shape[0]}. Labels and predictions should have the same number of elements.`),g(n>0&&Number.isInteger(n),()=>`numClasses is required to be a positive integer, but got ${n}`);const a=ns(X(s,"int32"),n),o=ns(X(r,"int32"),n),i=En(a),u=V(i,o);return X(u,"int32")}const q1=b({confusionMatrix_:U1});/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const G1=Object.freeze(Object.defineProperty({__proto__:null,confusionMatrix:q1},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */let mt,Ga=!1;function Sp(t,e=3){if(e>4)throw new Error("Cannot construct Tensor with more than 4 channels from pixels.");if(t==null)throw new Error("pixels passed to tf.browser.fromPixels() can not be null");let n=!1,s=!1,r=!1,a=!1,o=!1,i=!1;if(t.data instanceof Uint8Array)n=!0;else if(typeof ImageData<"u"&&t instanceof ImageData)s=!0;else if(typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement)r=!0;else if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement)a=!0;else if(t.getContext!=null)o=!0;else if(typeof ImageBitmap<"u"&&t instanceof ImageBitmap)i=!0;else throw new Error(`pixels passed to tf.browser.fromPixels() must be either an HTMLVideoElement, HTMLImageElement, HTMLCanvasElement, ImageData in browser, or OffscreenCanvas, ImageData in webworker or {data: Uint32Array, width: number, height: number}, but was ${t.constructor.name}`);if(fn(Os,w.backendName)!=null){const y={pixels:t},S={numChannels:e};return w.runKernel(Os,y,S)}const[c,h]=r?[t.videoWidth,t.videoHeight]:[t.width,t.height];let l;if(o)l=t.getContext("2d").getImageData(0,0,c,h).data;else if(s||n)l=t.data;else if(a||r||i){if(mt==null)if(typeof document>"u")if(typeof OffscreenCanvas<"u"&&typeof OffscreenCanvasRenderingContext2D<"u")mt=new OffscreenCanvas(1,1).getContext("2d");else throw new Error("Cannot parse input in current context. Reason: OffscreenCanvas Context2D rendering is not supported.");else mt=document.createElement("canvas").getContext("2d",{willReadFrequently:!0});mt.canvas.width=c,mt.canvas.height=h,mt.drawImage(t,0,0,c,h),l=mt.getImageData(0,0,c,h).data}let f;if(e===4)f=new Int32Array(l);else{const y=c*h;f=new Int32Array(y*e);for(let S=0;S<y;S++)for(let N=0;N<e;++N)f[S*e+N]=l[S*4+N]}return pa(f,[h,c,e],"int32")}function H1(t){return t!=null&&t.data instanceof Uint8Array}function K1(){return typeof window<"u"&&typeof ImageBitmap<"u"&&window.hasOwnProperty("createImageBitmap")}function X1(t){return t!=null&&t.width!==0&&t.height!==0}function Z1(t){return K1()&&!(t instanceof ImageBitmap)&&X1(t)&&!H1(t)}async function J1(t,e=3){let n=null;if(R().getBool("WRAP_TO_IMAGEBITMAP")&&Z1(t)){let s;try{s=await createImageBitmap(t,{premultiplyAlpha:"none"})}catch{s=null}s!=null&&s.width===t.width&&s.height===t.height?n=s:n=t}else n=t;return Sp(n,e)}function Tp(t){if(t.rank!==2&&t.rank!==3)throw new Error(`toPixels only supports rank 2 or 3 tensors, got rank ${t.rank}.`);const e=t.rank===2?1:t.shape[2];if(e>4||e===2)throw new Error(`toPixels only supports depth of size 1, 3 or 4 but got ${e}`);if(t.dtype!=="float32"&&t.dtype!=="int32")throw new Error(`Unsupported type for toPixels: ${t.dtype}. Please use float32 or int32 tensors.`)}function Y1(t){const e=t?.alpha||1;if(e>1||e<0)throw new Error(`Alpha value ${e} is suppoed to be in range [0 - 1].`)}async function Q1(t,e){let n=m(t,"img","toPixels");if(!(t instanceof te)){const c=n;n=X(c,"int32"),c.dispose()}Tp(n);const[s,r]=n.shape.slice(0,2),a=n.rank===2?1:n.shape[2],o=await n.data(),i=n.dtype==="float32"?255:1,u=new Uint8ClampedArray(r*s*4);for(let c=0;c<s*r;++c){const h=[0,0,0,255];for(let f=0;f<a;f++){const d=o[c*a+f];if(n.dtype==="float32"){if(d<0||d>1)throw new Error(`Tensor values for a float32 Tensor must be in the range [0 - 1] but encountered ${d}.`)}else if(n.dtype==="int32"&&(d<0||d>255))throw new Error(`Tensor values for a int32 Tensor must be in the range [0 - 255] but encountered ${d}.`);a===1?(h[0]=d*i,h[1]=d*i,h[2]=d*i):h[f]=d*i}const l=c*4;u[l+0]=Math.round(h[0]),u[l+1]=Math.round(h[1]),u[l+2]=Math.round(h[2]),u[l+3]=Math.round(h[3])}if(e!=null){Ga||fn(mr,w.backendName)!=null&&(console.warn("tf.browser.toPixels is not efficient to draw tensor on canvas. Please try tf.browser.draw instead."),Ga=!0),e.width=r,e.height=s;const c=e.getContext("2d"),h=new ImageData(u,r,s);c.putImageData(h,0,0)}return n!==t&&n.dispose(),u}function eN(t,e,n){let s=m(t,"img","draw");if(!(t instanceof te)){const o=s;s=X(o,"int32"),o.dispose()}Tp(s),Y1(n?.imageOptions);const r={image:s},a={canvas:e,options:n};w.runKernel(mr,r,a)}const tN=b({fromPixels_:Sp}),nN=Object.freeze(Object.defineProperty({__proto__:null,draw:eN,fromPixels:tN,fromPixelsAsync:J1,toPixels:Q1},Symbol.toStringTag,{value:"Module"}));function $p(t,e){const n=t.shape.length,s=e.shape.length;if(n<1)throw new Error(`tf.gatherND() expects the input to be rank 1 or higher, but the rank was ${n}.`);if(s<1)throw new Error(`tf.gatherND() expects the indices to be rank 1 or higher, but the rank was ${s}.`);if(e.dtype!=="int32")throw new Error(`tf.gatherND() expects the indices to be int32 type, but the dtype was ${e.dtype}.`);if(e.shape[s-1]>n)throw new Error(`index innermost dimension length must be <= tensor rank; saw: ${e.shape[s-1]} vs. ${n}`);if(j(t.shape)===0)throw new Error(`Requested more than 0 entries, but input is empty. Input shape: ${t.shape}.`);const r=e.shape,a=r[r.length-1];let o=1;for(let l=0;l<r.length-1;++l)o*=r[l];const i=t.shape,u=r.slice();u.pop();let c=1;for(let l=a;l<n;++l)c*=i[l],u.push(i[l]);const h=[...en(t.shape).map(l=>l/c),1].slice(0,a);return[u,o,c,h]}const sN=Object.freeze(Object.defineProperty({__proto__:null,prepareAndValidate:$p},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Js=-2,rN=-1;function aN(t,e,n){const s=t.shape.length;g(s===e.length,()=>`Error in slice${s}D: Length of begin ${e} must match the rank of the array (${s}).`),g(s===n.length,()=>`Error in slice${s}D: Length of size ${n} must match the rank of the array (${s}).`);for(let r=0;r<s;++r)g(e[r]+n[r]<=t.shape[r],()=>`Error in slice${s}D: begin[${r}] + size[${r}] (${e[r]+n[r]}) would overflow input.shape[${r}] (${t.shape[r]})`)}function oN(t){const e=[];let n=0;for(;t>0;)t&1&&e.push(n),t/=2,n++;return e}function iN(t,e,n){const s=[];for(let r=0;r<t.length;r++)s[r]=Math.ceil((e[r]-t[r])/n[r]);return s}function Ep(t,e,n,s){const r=[...t];for(let a=r.length;a<s.length;a++)r.push(1);for(let a=0;a<n;a++)a===0?r[e]=1:(r.splice(e,0,1),r.pop());return r}function kp(t,e,n){return n<=t?n:n-(e-1)}function vp(t,e){const n=[];for(let s=0;s<t;s++)n.push(e+s);return n}function uN(t,e,n,s,r,a,o,i,u){const c=t.length;let h=new Array(c),l=new Array(c),f=new Array(c);if(e.length&&n>0){const d=e[0],y=n+1;h=_p(o,d,y,s,t),l=Ip(i,d,y,r,t),f=Ep(a,d,y,t)}else for(let d=0;d<c;d++)h[d]=Ap(o,s,a,t,d,u),l[d]=Op(i,r,a,t,d,u),f[d]=xp(a,d,u);return{begin:h,end:l,strides:f}}function _p(t,e,n,s,r){const a=[...r],o=vp(n,e);for(let i=0;i<a.length;i++)if(o.indexOf(i)>-1)a[i]=0;else{const u=kp(e,n,i);let c=s[u];t&1<<u&&(c=0),a[i]=c}return a}function Ip(t,e,n,s,r){const a=[...r],o=vp(n,e);for(let i=0;i<a.length;i++)if(o.indexOf(i)>-1)a[i]=Number.MAX_SAFE_INTEGER;else{const u=kp(e,n,i);let c=s[u];t&1<<u&&(c=Number.MAX_SAFE_INTEGER),a[i]=c}for(let i=0;i<a.length;i++){const u=r[i];a[i]<0&&(a[i]+=u),a[i]=hn(0,a[i],r[i])}return a}function xp(t,e,n){let s=t[e];return(n&1<<e||s==null)&&(s=1),s}function Ap(t,e,n,s,r,a){let o=e[r];const i=n[r]||1;(t&1<<r||a&1<<r||o==null)&&(i>0?o=Number.MIN_SAFE_INTEGER:o=Number.MAX_SAFE_INTEGER);const u=s[r];return o<0&&(o+=u),o=hn(0,o,u-1),o}function Op(t,e,n,s,r,a){let o=e[r];const i=n[r]||1;(t&1<<r||a&1<<r||o==null)&&(i>0?o=Number.MAX_SAFE_INTEGER:o=Number.MIN_SAFE_INTEGER);const u=s[r];return o<0&&(o+=u),i>0?o=hn(0,o,u):o=hn(-1,o,u-1),o}function cN(t,e,n){let s=n.length;for(let r=0;r<n.length;r++)if(n[r]>1){s=r;break}for(let r=s+1;r<n.length;r++)if(e[r]>0||n[r]!==t[r])return!1;return!0}function lN(t,e){let n=t.length>0?t[t.length-1]:1;for(let s=0;s<t.length-1;s++)n+=t[s]*e[s];return n}function hN(t,e,n){let s;const r=t.shape.length;typeof e=="number"?s=[e,...new Array(r-1).fill(0)]:e.length<r?s=e.concat(new Array(r-e.length).fill(0)):s=e.slice(),s.forEach(o=>{g(o!==-1,()=>"slice() does not support negative begin indexing.")});let a;return n==null?a=new Array(r).fill(-1):typeof n=="number"?a=[n,...new Array(r-1).fill(-1)]:n.length<r?a=n.concat(new Array(r-n.length).fill(-1)):a=n,a=a.map((o,i)=>o>=0?o:(g(o===-1,()=>`Negative size values should be exactly -1 but got ${o} for the slice() size at index ${i}.`),t.shape[i]-s[i])),[s,a]}function pN(t,e,n,s,r,a,o,i,u){let c;if(s==null?(c=new Array(e.length),c.fill(1)):c=s,o!=null&&o&o-1)throw new Error("Multiple ellipses in slice is not allowed.");let h=!1;const l={dims:c.length,numAddAxisAfterEllipsis:0,begin:e.slice(),end:n.slice(),strides:c.slice(),beginMask:r,endMask:a,ellipsisMask:o,newAxisMask:i,shrinkAxisMask:u};for(let E=0;E<l.dims;E++)h&&1<<E&i&&l.numAddAxisAfterEllipsis++,1<<E&o&&(h=!0);h||(l.ellipsisMask|=1<<l.dims,l.dims++);const f={dims:t.length,beginMask:0,endMask:0,beginValid:!1,endValid:!1};fN(l,f);let d=!0,y=!0,S=!0;const N=[],T=[];for(let E=0;E<t.length;++E){if(f.strides[E]===0)throw Error(`strides[${E}] must be non-zero`);const k=!!(f.shrinkAxisMask&1<<E),v=t[E];if(v===-1){N.push(k?1:-1);continue}const x=[f.beginMask&1<<E,f.endMask&1<<E],O=[f.strides[E]>0?0:-1,f.strides[E]>0?v:v-1];if(k&&f.strides[E]<=0)throw Error("only stride 1 allowed on non-range indexing.");S=S&&f.strides[E]===1;const D=!!(f.beginMask&1<<E&&f.endMask&1<<E);if(f.beginValid&&f.endValid){if(k){const M=f.begin[E]<0?v+f.begin[E]:f.begin[E];if(f.begin[E]=M,f.end[E]=f.begin[E]+1,M<0||M>=v)throw Error(`slice index ${f.begin[E]} of dimension ${E} out of bounds.`)}else f.begin[E]=Ha(f.begin[E],0,f.strides[E],v,x,O),f.end[E]=Ha(f.end[E],1,f.strides[E],v,x,O);const L=f.strides[E]===1&&f.begin[E]===0&&f.end[E]===v;d=d&&L,y=y&&(E===0&&f.strides[E]===1||L)}else d=d&&f.strides[E]===1&&D,y=y&&(E===0&&f.strides[E]===1||D);let F,B=!1;if(f.beginValid&&f.endValid?(F=f.end[E]-f.begin[E],B=!0):k?(F=1,B=!0):D&&v>=0&&(f.strides[E]<0?F=-v:F=v,B=!0),B){let L;F===0||F<0!=f.strides[E]<0?L=0:L=Math.trunc(F/f.strides[E])+(F%f.strides[E]!==0?1:0),N.push(L)}else N.push(-1)}for(let E=0;E<f.finalShapeGatherIndices.length;++E){const k=f.finalShapeGatherIndices[E];k>=0?T.push(N[k]):k===Js&&T.push(1)}return{finalShapeSparse:T.filter((E,k)=>f.finalShapeGatherIndices[k]!==Js),finalShape:T,isIdentity:d,sliceDim0:y,isSimpleSlice:S,begin:f.begin,end:f.end,strides:f.strides}}function fN(t,e){e.beginMask=0,e.endMask=0,e.shrinkAxisMask=0;let n=0;e.beginValid=t.begin!=null,e.endValid=t.end!=null,e.begin=new Array(e.dims),e.end=new Array(e.dims),e.strides=new Array(e.dims),e.finalShapeGatherIndices=[],e.finalShapeGatherIndicesSparse=[],e.inputShapeGatherIndicesSparse=new Array(e.dims);for(let s=0;s<t.dims;s++)if(1<<s&t.ellipsisMask){const r=Math.min(e.dims-(t.dims-s)+1+t.numAddAxisAfterEllipsis,e.dims);for(;n<r;n++)e.begin[n]=0,e.end[n]=0,e.strides[n]=1,e.beginMask|=1<<n,e.endMask|=1<<n,e.finalShapeGatherIndices.push(n),e.finalShapeGatherIndicesSparse.push(-1),e.inputShapeGatherIndicesSparse[n]=s}else if(1<<s&t.newAxisMask)e.finalShapeGatherIndices.push(Js),e.finalShapeGatherIndicesSparse.push(-1);else{if(n===e.begin.length)throw Error(`Index out of range using input dim ${n}; input has only ${e.dims} dims, ${e.begin.length}.`);t.begin!=null&&(e.begin[n]=t.begin[s]),t.end!=null&&(e.end[n]=t.end[s]),e.strides[n]=t.strides[s],t.beginMask&1<<s&&(e.beginMask|=1<<n),t.endMask&1<<s&&(e.endMask|=1<<n),t.shrinkAxisMask&1<<s?(e.finalShapeGatherIndices.push(rN),e.finalShapeGatherIndicesSparse.push(-1),e.shrinkAxisMask|=1<<n):(e.finalShapeGatherIndices.push(n),e.finalShapeGatherIndicesSparse.push(s)),e.inputShapeGatherIndicesSparse[n]=s,n++}}function Ha(t,e,n,s,r,a){if(r[e])return n>0?a[e]:a[e+1&1];{const o=t<0?s+t:t;return o<a[0]?a[0]:o>a[1]?a[1]:o}}const Dp=Object.freeze(Object.defineProperty({__proto__:null,assertParamsValid:aN,computeFlatOffset:lN,computeOutShape:iN,getNormalizedAxes:uN,isSliceContinous:cN,maskToAxes:oN,parseSliceParams:hN,sliceInfo:pN,startForAxis:Ap,startIndicesWithElidedDims:_p,stopForAxis:Op,stopIndicesWithElidedDims:Ip,stridesForAxis:xp,stridesWithElidedDims:Ep},Symbol.toStringTag,{value:"Module"}));/** @license See the LICENSE file. */const dN="4.22.0";/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Fp{static sgd(e){return new $s(e)}static momentum(e,n,s=!1){return new Sa(e,n,s)}static rmsprop(e,n=.9,s=0,r=null,a=!1){return new Ta(e,n,s,r,a)}static adam(e=.001,n=.9,s=.999,r=null){return new wa(e,n,s,r)}static adadelta(e=.001,n=.95,s=null){return new ya(e,n,s)}static adamax(e=.002,n=.9,s=.999,r=null,a=0){return new Na(e,n,s,r,a)}static adagrad(e,n=.1){return new ba(e,n)}}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const mN=Fp;/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const gN=typeof requestAnimationFrame<"u"?requestAnimationFrame:typeof setImmediate<"u"?setImmediate:t=>t();function yN(){return new Promise(t=>gN(()=>t()))}/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function bN(t,e){const n=t[0].length;t.forEach((r,a)=>{g(r.length===n,()=>`Error in concat${n}D: rank of tensors[${a}] must be the same as the rank of the rest (${n})`)}),g(e>=0&&e<n,()=>`Error in concat${n}D: axis must be between 0 and ${n-1}.`);const s=t[0];t.forEach((r,a)=>{for(let o=0;o<n;o++)g(o===e||r[o]===s[o],()=>`Error in concat${n}D: Shape of tensors[${a}] (${r}) does not match the shape of the rest (${s}) along the non-concatenated axis ${a}.`)})}function wN(t,e){const n=t[0].slice();for(let s=1;s<t.length;s++)n[e]+=t[s][e];return n}/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */var Pe;(function(t){t[t.FIRST_DIM_SIZE=0]="FIRST_DIM_SIZE",t[t.VALUE_ROWIDS=1]="VALUE_ROWIDS",t[t.ROW_LENGTHS=2]="ROW_LENGTHS",t[t.ROW_SPLITS=3]="ROW_SPLITS",t[t.ROW_LIMITS=4]="ROW_LIMITS",t[t.ROW_STARTS=5]="ROW_STARTS"})(Pe||(Pe={}));function NN(t,e,n){let s=new Array;if(n==null&&e==null)return s;if(e==null)for(;s.length<t+n.length;)s.push(-1);else s=e.slice();if(n==null)return s;if(t+n.length!==s.length)throw new Error(`rt input.shape and shape=${e} are incompatible: rt input.rank = ${t+n.length}, but shape.rank = ${s.length}`);for(let r=1;r<n.length;++r){const a=n[r],o=s[s.length-n.length+r],i=s[o];if(a>=0)if(i>=0){if(i!==a)throw new Error(`rt input.shape and shape=${e} are incompatible: rt input.shape[${r+t}] = ${a} but shape[${r+t}] = ${i}`)}else s[o]=a}return s}function SN(t){const e={FIRST_DIM_SIZE:Pe.FIRST_DIM_SIZE,VALUE_ROWIDS:Pe.VALUE_ROWIDS,ROW_LENGTHS:Pe.ROW_LENGTHS,ROW_SPLITS:Pe.ROW_SPLITS,ROW_LIMITS:Pe.ROW_LIMITS,ROW_STARTS:Pe.ROW_STARTS},n=[];for(const s of t)if(s in e)n.push(e[s]);else break;return n}function TN(t){return t.length===0?0:t[0]===Pe.FIRST_DIM_SIZE?t.length-1:t.length}function $N(t,e){if(t==null||e==null)return;const n=t.length,s=e.length;if(n>=s)throw new Error(`defaultValue.shape=${t} and ragged tensor flatValues.shape=${e}, are incompatible: defaultValue.rank = ${n} must be less than ragged tensor input flatValues.rank = ${s})`);for(let r=0;r<Math.min(n,s-1);++r){const a=t[r],o=e[r+1];if(a>=0&&o>=0&&a!==1&&a!==o)throw new Error(`defaultValue.shape=${t}, and ragged tensor input flatValues.shape=${e} are incompatible: defaultValue.shape[${r-t.length}] = ${a} but ragged tensor input.flatValues.shape[${r-t.length}] = ${o}`)}}/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const va=30;function EN(t){return t<=va?t:Hn(t,Math.floor(Math.sqrt(t)))}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function kN(t,e,n){const s=n*(typeof t=="number"?t:t[0]),r=e*(typeof t=="number"?t:t[1]);return[s,r]}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function vN(t,e,n,s=!0){let r=[];if(s)r=r.concat(e.slice(0)),r.push(t[0]/n),r=r.concat(t.slice(1));else{r=r.concat(t[0]);const a=e.length;for(let o=0;o<a;++o)r=r.concat([t[o+1]/e[o],e[o]]);r=r.concat(t.slice(a+1))}return r}function _N(t,e,n=!0){const s=[];if(n){s.push(e);for(let r=e+1;r<t;++r)r<=2*e?(s.push(r),s.push(r-(e+1))):s.push(r)}else{const r=[],a=[];for(let o=1;o<t;++o)o>=e*2+1||o%2===1?a.push(o):r.push(o);s.push(...r),s.push(0),s.push(...a)}return s}function IN(t,e,n,s=!0){const r=[];s?r.push(t[0]/n):r.push(t[0]*n);for(let a=1;a<t.length;++a)a<=e.length?s?r.push(e[a-1]*t[a]):r.push(t[a]/e[a-1]):r.push(t[a]);return r}function xN(t,e){const n=[0];for(let s=0;s<e;++s)n.push(t[s][0]);return n}function AN(t,e,n){const s=t.slice(0,1);for(let r=0;r<n;++r)s.push(t[r+1]-e[r][0]-e[r][1]);return s}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const ON=1.7580993408473768,DN=1.0507009873554805;/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const FN=.3275911,CN=.254829592,RN=-.284496736,LN=1.421413741,BN=-1.453152027,PN=1.061405429;/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function zN(t,e){if(t.length!==e.length)throw new Error(`Cannot merge real and imag arrays of different lengths. real:${t.length}, imag: ${e.length}.`);const n=new Float32Array(t.length*2);for(let s=0;s<n.length;s+=2)n[s]=t[s/2],n[s+1]=e[s/2];return n}function VN(t){const e=new Float32Array(t.length/2),n=new Float32Array(t.length/2);for(let s=0;s<t.length;s+=2)e[s/2]=t[s],n[s/2]=t[s+1];return{real:e,imag:n}}function WN(t){const e=Math.ceil(t.length/4),n=new Float32Array(e),s=new Float32Array(e);for(let r=0;r<t.length;r+=4)n[Math.floor(r/4)]=t[r],s[Math.floor(r/4)]=t[r+1];return{real:n,imag:s}}function MN(t){const e=Math.floor(t.length/4),n=new Float32Array(e),s=new Float32Array(e);for(let r=2;r<t.length;r+=4)n[Math.floor(r/4)]=t[r],s[Math.floor(r/4)]=t[r+1];return{real:n,imag:s}}function jN(t,e){const n=t[e*2],s=t[e*2+1];return{real:n,imag:s}}function UN(t,e,n,s){t[s*2]=e,t[s*2+1]=n}function qN(t,e){const n=new Float32Array(t/2),s=new Float32Array(t/2);for(let r=0;r<Math.ceil(t/2);r++){const a=(e?2:-2)*Math.PI*(r/t);n[r]=Math.cos(a),s[r]=Math.sin(a)}return{real:n,imag:s}}function GN(t,e,n){const s=(n?2:-2)*Math.PI*(t/e),r=Math.cos(s),a=Math.sin(s);return{real:r,imag:a}}/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const xs="->",HN=/->/g,Ka=",",Xa="...";function KN(t,e){t=t.replace(/\s/g,"");const n=(t.length-t.replace(HN,"").length)/xs.length;if(n<1)throw new Error("Equations without an arrow are not supported.");if(n>1)throw new Error(`Equation must contain exactly one arrow ("${xs}").`);const[s,r]=t.split(xs);g(s.indexOf(Xa)===-1,()=>`The ellipsis notation ("${Xa}") is not supported yet.`);const a=s.split(Ka),o=a.length;if(e!==o)throw new Error(`Expected ${o} input tensors, received ${e}`);if(o>2)throw new Error("Support for more than 2 input tensors is not implemented yet.");const i=[];for(let f=0;f<r.length;++f){const d=r[f];if(!a.some(y=>y.indexOf(d)!==-1))throw new Error(`Output subscripts contain the label ${d} not present in the input subscripts.`);i.indexOf(d)===-1&&i.push(d)}for(let f=0;f<s.length;++f){const d=s[f];i.indexOf(d)===-1&&d!==Ka&&i.push(d)}const u=new Array(a.length);for(let f=0;f<o;++f){if(new Set(a[f].split("")).size!==a[f].length)throw new Error(`Found duplicate axes in input component ${a[f]}. Support for duplicate axes in input is not implemented yet.`);u[f]=[];for(let d=0;d<a[f].length;++d)u[f].push(i.indexOf(a[f][d]))}const c=i.length,h=r.length,l=[];for(let f=h;f<c;++f)l.push(f);return{allDims:i,summedDims:l,idDims:u}}function XN(t,e){let n=new Array(t);n.fill(-1);for(let r=0;r<e.length;++r)n[e[r]]=r;const s=[];for(let r=0;r<t;++r)n[r]===-1&&s.push(r);return n=n.filter(r=>r!==-1),{permutationIndices:n,expandDims:s}}function ZN(t,e,n){const s=new Array(t);for(let r=0;r<n.length;++r){const a=n[r].shape;for(let o=0;o<e[r].length;++o)s[e[r][o]]===void 0?s[e[r][o]]=a[o]:g(s[e[r][o]]===a[o],()=>`Expected dimension ${s[e[r][o]]} at axis ${o} of input shaped ${JSON.stringify(a)}, but got dimension ${a[o]}`)}}function JN(t,e){const n=t,s=[];let r=0;t.length===0&&n.push(-1),r=t.length+1;for(let o=0;o<r;++o)s.push([]);const a=[];for(let o=0;o<n.length;++o){const i=n[o],u=QN(e,i);for(const c of u)a.indexOf(c)===-1&&(s[o].push(c),a.push(c))}return{path:n,steps:s}}function YN(t){return t.every((e,n)=>e===n)}function QN(t,e){const n=[];for(let s=0;s<t.length;++s)(t[s].length===0||t[s].indexOf(e)!==-1||e===-1)&&n.push(s);return n}function eS(t,e,n=0){let s=[];if(typeof e=="number")g(t.shape[n]%e===0,()=>"Number of splits must evenly divide the axis."),s=new Array(e).fill(t.shape[n]/e);else{const r=e.reduce((o,i)=>(i===-1&&(o+=1),o),0);g(r<=1,()=>"There should be only one negative value in split array.");const a=e.indexOf(-1);if(a!==-1){const o=e.reduce((i,u)=>u>0?i+u:i);e[a]=t.shape[n]-o}g(t.shape[n]===e.reduce((o,i)=>o+i),()=>"The sum of sizes must match the size of the axis dimension."),s=e}return s}/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function tS(t){return`Received SparseTensor with denseShape[0] = 0 but
  indices.shape[0] = ${t}`}function nS(t,e){return`indices(${t}, 0) is invalid: ${e} < 0`}function sS(t,e,n){return`indices(${t}, 0) is invalid: ${e} >= ${n}`}/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function rS(t,e){return`only one output dimension may be -1, not both ${t} and ${e}`}function aS(t,e){return`size ${t} must be non-negative, not ${e}`}function oS(){return"reshape cannot infer the missing input size for an empty tensor unless all specified input sizes are non-zero"}function iS(t,e){const n=j(t),s=j(e);return`Input to reshape is a SparseTensor with ${n}
  dense values, but the requested shape requires a multiple of ${s}. inputShape=${t} outputShape= ${e}`}function uS(t,e){const n=j(t),s=j(e);return`Input to reshape is a tensor with ${n} dense values, but the requested shape has ${s}. inputShape=${t} outputShape=${e}`}/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function cS(){return"segment ids must be >= 0"}function lS(){return"segment ids are not increasing"}function hS(t,e){return`Segment id ${t} out of range [0, ${e}), possibly because segmentIds input is not sorted.`}function pS(t,e,n){return`Bad: indices[${t}] == ${e} out of range [0, ${n})`}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function fS(t,e){let n=!1,s;for(t<=va?(s=t,n=!0):s=Hn(t,Math.floor(Math.sqrt(t)));!n;)s>e||s===t?n=!0:s=Hn(t,s+1);return s}function dS(t,e,n){const s=[],r=t.length;for(let a=0;a<r;a++)a!==e?s.push(t[a]):s.push(n);return s}function mS(t,e,n,s){const r=e.shape.length,a=t.shape.length;if(s!==0&&(s<-r||s>r))throw new Error(`Expect batchDims in the range of [-${r}, ${r}], but got ${s}`);if(s<0&&(s+=r),s>a)throw new Error(`batchDims (${s}) must be less than rank(x) (
    ${a}).`);if(n<s)throw new Error(`batchDims (${s}) must be less than or equal to axis (${n}).`);for(let l=0;l<s;++l)if(t.shape[l]!==e.shape[l])throw new Error(`x.shape[${l}]: ${t.shape[l]} should be equal to indices.shape[${l}]: ${e.shape[l]}.`);const o=t.shape[n],i=[];let u=1,c=1,h=1;for(let l=0;l<s;++l)i.push(t.shape[l]),u*=t.shape[l];for(let l=s;l<n;l++)i.push(t.shape[l]),c*=t.shape[l];for(let l=s;l<r;l++)i.push(e.shape[l]);for(let l=n+1;l<a;l++)i.push(t.shape[l]),h*=t.shape[l];return{batchSize:u,sliceSize:h,outerSize:c,dimSize:o,outputShape:i}}const gS=Object.freeze(Object.defineProperty({__proto__:null,collectGatherOpShapeInfo:mS,computeOutShape:dS,segOpComputeOptimalWindowSize:fS},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function yS(t){try{return t.map(e=>Zn(e))}catch(e){throw new Error(`Failed to decode encoded string bytes into utf-8, error: ${e}`)}}function bS(t){return t.map(e=>In(e))}const wS=Object.freeze(Object.defineProperty({__proto__:null,ERF_A1:CN,ERF_A2:RN,ERF_A3:LN,ERF_A4:BN,ERF_A5:PN,ERF_P:FN,PARALLELIZE_THRESHOLD:va,get RowPartitionType(){return Pe},SELU_SCALE:DN,SELU_SCALEALPHA:ON,applyActivation:Ss,assertAndGetBroadcastShape:ne,assertAxesAreInnerMostDims:Lg,assertParamsConsistent:bN,assignToTypedArray:UN,axesAreInnerMostDims:Cr,calculateShapes:Vh,checkEinsumDimSizes:ZN,checkPadOnDimRoundingMode:Ae,combineLocations:Dl,combineRaggedTensorToTensorShapes:NN,complexWithEvenIndex:WN,complexWithOddIndex:MN,computeConv2DInfo:An,computeConv3DInfo:Qc,computeDefaultPad:_r,computeDilation2DInfo:Om,computeOptimalWindowSize:EN,computeOutAndReduceShapes:Rg,computeOutShape:wN,computePool2DInfo:Yc,computePool3DInfo:Dm,convertConv2DDataFormat:el,decodeEinsumEquation:KN,eitherStridesOrDilationsAreOne:Ye,expandShapeToKeepDim:Fn,exponent:GN,exponents:qN,fromStringArrayToUint8:bS,fromUint8ToStringArray:yS,getAxesPermutation:Bg,getBroadcastDims:_l,getComplexWithIndex:jN,getEinsumComputePath:JN,getEinsumPermutation:XN,getFusedBiasGradient:Ns,getFusedDyActivation:ws,getImageCenter:kN,getInnerMostAxes:zg,getPermuted:_N,getRaggedRank:TN,getReductionAxes:Or,getReshaped:vN,getReshapedPermuted:IN,getRowPartitionTypesHelper:SN,getSliceBeginCoords:xN,getSliceSize:AN,getSparseFillEmptyRowsIndicesDenseShapeMismatch:tS,getSparseFillEmptyRowsNegativeIndexErrorMessage:nS,getSparseFillEmptyRowsOutOfRangeIndexErrorMessage:sS,getSparseReshapeEmptyTensorZeroOutputDimErrorMessage:oS,getSparseReshapeInputOutputMismatchErrorMessage:uS,getSparseReshapeInputOutputMultipleErrorMessage:iS,getSparseReshapeMultipleNegativeOneOutputDimErrorMessage:rS,getSparseReshapeNegativeOutputDimErrorMessage:aS,getSparseSegmentReductionIndicesOutOfRangeErrorMessage:pS,getSparseSegmentReductionNegativeSegmentIdsErrorMessage:cS,getSparseSegmentReductionNonIncreasingSegmentIdsErrorMessage:lS,getSparseSegmentReductionSegmentIdOutOfRangeErrorMessage:hS,getUndoAxesPermutation:Pg,isIdentityPermutation:YN,log:Df,mergeRealAndImagArrays:zN,prepareAndValidate:$p,prepareSplitSize:eS,segment_util:gS,shouldFuse:Ts,slice_util:Dp,splitRealAndImagArrays:VN,stridesOrDilationsArePositive:It,tupleValuesAreOne:wn,upcastType:us,validateDefaultValueShape:$N,validateInput:ys,validateUpdateShape:fa,warn:et},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const NS=Object.freeze(Object.defineProperty({__proto__:null,nonMaxSuppressionV3Impl:ap,nonMaxSuppressionV4Impl:op,nonMaxSuppressionV5Impl:ip,whereImpl:Kh},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */v1();const KT=Object.freeze(Object.defineProperty({__proto__:null,Abs:wo,Acos:No,Acosh:So,AdadeltaOptimizer:ya,AdagradOptimizer:ba,AdamOptimizer:wa,AdamaxOptimizer:Na,Add:fr,AddN:To,All:$o,Any:Eo,ArgMax:ko,ArgMin:vo,Asin:_o,Asinh:Io,Atan:xo,Atan2:Oo,Atanh:Ao,AvgPool:Do,AvgPool3D:Fo,AvgPool3DGrad:df,AvgPoolGrad:ff,BatchMatMul:Co,BatchToSpaceND:Ro,Bincount:Lo,BitwiseAnd:Bo,BroadcastArgs:Po,BroadcastTo:mf,Cast:dr,Ceil:zo,ClipByValue:Vo,Complex:Wo,ComplexAbs:Mo,Concat:jo,Conv2D:Uo,Conv2DBackpropFilter:qo,Conv2DBackpropInput:Go,Conv3D:Ho,Conv3DBackpropFilterV2:gf,Conv3DBackpropInputV2:Ko,Cos:Xo,Cosh:Zo,CropAndResize:Qo,Cumprod:Jo,Cumsum:Yo,DataStorage:Up,DenseBincount:ei,DepthToSpace:ti,DepthwiseConv2dNative:ni,DepthwiseConv2dNativeBackpropFilter:si,DepthwiseConv2dNativeBackpropInput:ri,Diag:ai,Dilation2D:oi,Dilation2DBackpropFilter:bf,Dilation2DBackpropInput:yf,Draw:mr,get ENV(){return hr},Einsum:ui,Elu:ci,EluGrad:wf,Environment:yo,Equal:hi,Erf:li,Exp:pi,ExpandDims:fi,Expm1:di,FFT:mi,Fill:gi,FlipLeftRight:yi,Floor:bi,FloorDiv:wi,FromPixels:Os,FusedBatchNorm:Ni,FusedConv2D:Fs,FusedDepthwiseConv2D:Cs,GatherNd:Ti,GatherV2:Si,Greater:$i,GreaterEqual:Ei,IFFT:ki,Identity:gr,Imag:vi,IsFinite:_i,IsInf:Ii,IsNan:xi,KernelBackend:ao,LRN:zi,LRNGrad:$f,LeakyRelu:Ai,Less:Oi,LessEqual:Di,LinSpace:Fi,Log:Ci,Log1p:Ri,LogSoftmax:Sf,LogicalAnd:Li,LogicalNot:Bi,LogicalOr:Pi,LogicalXor:Nf,LowerBound:Tf,MatrixBandPart:Ef,Max:Vi,MaxPool:Mi,MaxPool3D:ji,MaxPool3DGrad:vf,MaxPoolGrad:kf,MaxPoolWithArgmax:Ui,Maximum:Wi,Mean:qi,Min:Gi,Minimum:Hi,MirrorPad:Ki,Mod:Xi,MomentumOptimizer:Sa,Multinomial:Zi,Multiply:Ji,Neg:Yi,NonMaxSuppressionV3:eu,NonMaxSuppressionV4:tu,NonMaxSuppressionV5:nu,NotEqual:Qi,OP_SCOPE_SUFFIX:Sr,OneHot:ru,OnesLike:su,Optimizer:dt,OptimizerConstructors:Fp,Pack:au,PadV2:ou,Pool:_f,Pow:iu,Prelu:uu,Prod:cu,RMSPropOptimizer:Ta,RaggedGather:lu,RaggedRange:hu,RaggedTensorToTensor:pu,Range:fu,get Rank(){return Ps},Real:du,RealDiv:ii,Reciprocal:mu,get Reduction(){return he},Relu:gu,Relu6:Nu,Reshape:yu,ResizeBilinear:wu,ResizeBilinearGrad:xf,ResizeNearestNeighbor:bu,ResizeNearestNeighborGrad:If,Reverse:Su,RotateWithOffset:ic,Round:Tu,Rsqrt:$u,SGDOptimizer:$s,ScatterNd:Eu,SearchSorted:vu,Select:_u,Selu:Iu,Sigmoid:Fu,Sign:Du,Sin:Au,Sinh:Ou,Slice:xu,Softmax:zu,Softplus:Cu,SpaceToBatchND:Bu,SparseFillEmptyRows:Vu,SparseReshape:Wu,SparseSegmentMean:Mu,SparseSegmentSum:ju,SparseToDense:Uu,SplitV:Pu,Sqrt:Ru,Square:Af,SquaredDifference:qu,StaticRegexReplace:Gu,Step:oc,StridedSlice:Hu,StringNGrams:Ku,StringSplit:Xu,StringToHashBucketFast:Zu,Sub:Ju,Sum:Lu,Tan:Yu,Tanh:Qu,Tensor:te,TensorBuffer:Jn,TensorScatterUpdate:ku,Tile:yr,TopK:ec,Transform:tc,Transpose:Wn,Unique:nc,Unpack:sc,UnsortedSegmentSum:rc,UpperBound:Of,Variable:mn,ZerosLike:ac,_FusedMatMul:Ds,abs:be,acos:Vc,acosh:Wc,add:C,addN:Mc,all:jc,any:Uc,argMax:qc,argMin:Gc,asin:Hc,asinh:Kc,atan:Xc,atan2:Zc,atanh:Jc,avgPool:Ir,avgPool3d:tl,backend:Ic,backend_util:wS,basicLSTMCell:nl,batchNorm:On,batchNorm2d:sl,batchNorm3d:rl,batchNorm4d:al,batchToSpaceND:xr,bincount:Ar,bitwiseAnd:ol,booleanMaskAsync:Xh,broadcastArgs:il,broadcastTo:ln,broadcast_util:kg,browser:nN,buffer:Ve,cast:X,ceil:ul,clipByValue:cl,clone:Xe,complex:Je,concat:ue,concat1d:ll,concat2d:hl,concat3d:pl,concat4d:fl,conv1d:dl,conv2d:Dn,conv2dTranspose:gl,conv3d:yl,conv3dTranspose:bl,copyRegisteredKernels:Lf,cos:wl,cosh:Nl,cosineWindow:bs,cumprod:Sl,cumsum:Tl,customGrad:Me,denseBincount:$l,deprecationWarn:wd,depthToSpace:El,depthwiseConv2d:cs,device_util:fd,diag:kl,dilation2d:vl,disableDeprecationWarnings:bd,dispose:pe,disposeVariables:Nd,div:K,divNoNan:Il,dot:xl,dropout:ep,einsum:bt,elu:Fr,enableDebugMode:yd,enableProdMode:gd,enclosingPowerOfTwo:ma,engine:Sd,ensureShape:Al,env:R,equal:Dr,erf:Ol,euclideanNorm:Cl,exp:lt,expandDims:qe,expm1:Rl,eye:Rr,fft:ds,fill:tn,findBackend:Id,findBackendFactory:xd,floor:Lr,floorDiv:vr,fused:np,gather:Br,gatherND:Qh,gather_util:sN,getBackend:_c,getGradient:Rs,getKernel:fn,getKernelsForBackend:Kn,grad:fy,grads:dy,greater:Rn,greaterEqual:Pr,ifft:$n,imag:Ln,image:lp,inTopKAsync:tp,io:ka,irfft:ca,isFinite:Ll,isInf:Bl,isNaN:Pl,keep:De,kernel_impls:NS,leakyRelu:zr,less:ts,lessEqual:ls,linalg:hp,linspace:zl,localResponseNormalization:Vl,log:Zt,log1p:Vr,logSigmoid:Ml,logSoftmax:jl,logSumExp:Mr,logicalAnd:Nn,logicalNot:jr,logicalOr:Ur,logicalXor:Ul,losses:pp,lowerBound:ql,matMul:V,math:G1,max:Et,maxPool:qr,maxPool3d:Gl,maxPoolWithArgmax:Hl,maximum:Gr,mean:Sn,memory:Td,meshgrid:Kl,min:es,minimum:Tn,mirrorPad:Xl,mod:Zl,moments:Jl,movingAverage:Zh,mul:I,multiRNNCell:Yl,multinomial:Ql,neg:Ce,nextFrame:yN,norm:Cn,notEqual:Hr,oneHot:ns,ones:rt,onesLike:eh,op:b,outerProduct:th,pad:nn,pad1d:nh,pad2d:sh,pad3d:rh,pad4d:ah,pool:oh,pow:Xt,prelu:Xr,print:kr,prod:ih,profile:$d,raggedGather:uh,raggedRange:ch,raggedTensorToTensor:lh,rand:hh,randomGamma:mh,randomNormal:oa,randomStandardNormal:gh,randomUniform:fs,randomUniformInt:yh,range:Jt,ready:vd,real:Yt,reciprocal:bh,registerBackend:Ad,registerGradient:Ff,registerKernel:uc,relu:Bn,relu6:ia,removeBackend:_d,reshape:$,reverse:ht,reverse1d:wh,reverse2d:Nh,reverse3d:Sh,reverse4d:Th,rfft:ms,round:ua,rsqrt:$h,scalar:z,scatterND:Jh,scatter_util:g0,searchSorted:ps,selu:Eh,separableConv2d:kh,serialization:E1,setBackend:kd,setPlatform:Od,setdiff1dAsync:vh,sigmoid:$t,sign:_h,signal:cp,sin:Ih,sinh:xh,slice:q,slice1d:Ah,slice2d:Oh,slice3d:Dh,slice4d:Fh,slice_util:Dp,softmax:Ch,softplus:Wr,spaceToBatchND:Kr,sparse:fp,sparseToDense:Yh,spectral:up,split:Qt,sqrt:We,square:xe,squaredDifference:la,squeeze:gs,stack:je,step:ha,stridedSlice:Rh,string:dp,sub:P,sum:H,sumOutType:rd,tan:Lh,tanh:Qn,tensor:Fe,tensor1d:$e,tensor2d:Ut,tensor3d:pa,tensor4d:Bh,tensor5d:Ph,tensor6d:zh,tensorScatterUpdate:Wh,tensor_util:id,test_util:xb,tidy:W,tile:jt,time:Ed,topk:Mh,train:mN,transpose:En,truncatedNormal:jh,unique:Uh,unregisterGradient:Rf,unregisterKernel:Cf,unsortedSegmentSum:qh,unstack:ft,upcastType:us,upperBound:Gh,util:Hf,valueAndGrad:my,valueAndGrads:gy,variable:Hh,variableGrads:Wl,version_core:dN,where:Ze,whereAsync:da,zeros:xt,zerosLike:Ne},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const SS=R();SS.registerFlag("KEEP_INTERMEDIATE_TENSORS",()=>!1,t=>{t&&console.warn("Keep intermediate tensors is ON. This will print the values of all intermediate tensors during model inference. Not all models support this mode. For details, check e2e/benchmarks/ model_config.js. This significantly impacts performance.")});/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * =============================================================================
 */var ge;(function(t){t[t.DT_INVALID=0]="DT_INVALID",t[t.DT_FLOAT=1]="DT_FLOAT",t[t.DT_DOUBLE=2]="DT_DOUBLE",t[t.DT_INT32=3]="DT_INT32",t[t.DT_UINT8=4]="DT_UINT8",t[t.DT_INT16=5]="DT_INT16",t[t.DT_INT8=6]="DT_INT8",t[t.DT_STRING=7]="DT_STRING",t[t.DT_COMPLEX64=8]="DT_COMPLEX64",t[t.DT_INT64=9]="DT_INT64",t[t.DT_BOOL=10]="DT_BOOL",t[t.DT_QINT8=11]="DT_QINT8",t[t.DT_QUINT8=12]="DT_QUINT8",t[t.DT_QINT32=13]="DT_QINT32",t[t.DT_BFLOAT16=14]="DT_BFLOAT16",t[t.DT_QINT16=15]="DT_QINT16",t[t.DT_QUINT16=16]="DT_QUINT16",t[t.DT_UINT16=17]="DT_UINT16",t[t.DT_COMPLEX128=18]="DT_COMPLEX128",t[t.DT_HALF=19]="DT_HALF",t[t.DT_RESOURCE=20]="DT_RESOURCE",t[t.DT_VARIANT=21]="DT_VARIANT",t[t.DT_UINT32=22]="DT_UINT32",t[t.DT_UINT64=23]="DT_UINT64",t[t.DT_FLOAT_REF=101]="DT_FLOAT_REF",t[t.DT_DOUBLE_REF=102]="DT_DOUBLE_REF",t[t.DT_INT32_REF=103]="DT_INT32_REF",t[t.DT_UINT8_REF=104]="DT_UINT8_REF",t[t.DT_INT16_REF=105]="DT_INT16_REF",t[t.DT_INT8_REF=106]="DT_INT8_REF",t[t.DT_STRING_REF=107]="DT_STRING_REF",t[t.DT_COMPLEX64_REF=108]="DT_COMPLEX64_REF",t[t.DT_INT64_REF=109]="DT_INT64_REF",t[t.DT_BOOL_REF=110]="DT_BOOL_REF",t[t.DT_QINT8_REF=111]="DT_QINT8_REF",t[t.DT_QUINT8_REF=112]="DT_QUINT8_REF",t[t.DT_QINT32_REF=113]="DT_QINT32_REF",t[t.DT_BFLOAT16_REF=114]="DT_BFLOAT16_REF",t[t.DT_QINT16_REF=115]="DT_QINT16_REF",t[t.DT_QUINT16_REF=116]="DT_QUINT16_REF",t[t.DT_UINT16_REF=117]="DT_UINT16_REF",t[t.DT_COMPLEX128_REF=118]="DT_COMPLEX128_REF",t[t.DT_HALF_REF=119]="DT_HALF_REF",t[t.DT_RESOURCE_REF=120]="DT_RESOURCE_REF",t[t.DT_VARIANT_REF=121]="DT_VARIANT_REF",t[t.DT_UINT32_REF=122]="DT_UINT32_REF",t[t.DT_UINT64_REF=123]="DT_UINT64_REF"})(ge||(ge={}));var Za;(function(t){(function(e){e[e.LEGACY=0]="LEGACY",e[e.V1=1]="V1",e[e.V2=2]="V2"})(t.CheckpointFormatVersion||(t.CheckpointFormatVersion={}))})(Za||(Za={}));/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const _a={};function XT(t,e){const n={tfOpName:t,category:"custom",inputs:[],attrs:[],customExecutor:e};_a[t]=n}function Cp(t){return _a[t]}function ZT(t){delete _a[t]}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function p(t,e,n,s,r){const a=e.inputParams[t];if(a&&a.inputIndexStart!==void 0){const i=a.inputIndexStart,u=a.inputIndexEnd===0?void 0:a.inputIndexEnd===void 0?i+1:a.inputIndexEnd,c=i<0?e.inputNames.length+i:i;if(a.type==="tensor")return oe(e.inputNames[c],n,s,r);if(a.type==="tensors"){const f=e.inputs.slice(i,u);return e.inputNames.slice(i,u).filter((y,S)=>{var N;return((N=f[S])===null||N===void 0?void 0:N.op)!=="NoOp"}).map(y=>oe(y,n,s,r))}const h=oe(e.inputNames[c],n,s,r),l=h.dataSync();return a.type==="number"?l[0]:Tt(h.shape,l)}const o=e.attrParams[t];return o&&o.value}function oe(t,e,n,s){const[r,a]=ye(t,n);if(s!=null){const i=s.getHashTableHandleByName(r);if(i!=null)return i}const o=n.currentContextIds.find(i=>!!e[rs(r,i)]);return o!==void 0?e[rs(r,o)][a]:void 0}function Ja(t,e,n){return e[rs(t,n.currentContextId)]}function Ge(t,e){const[n,s,r]=ye(t,e);return[rs(n,e&&e.currentContextId),s,r]}function rs(t,e){return e?`${t}-${e}`:t}function ye(t,e){if(t==="")return["",0,void 0];const n=e!=null&&e.parseNodeNameCache!=null;if(n){const a=e.parseNodeNameCache.get(t);if(a!=null)return a}const s=t.split(":");let r;if(s.length===1)r=[t,0,void 0];else{const a=s[0],o=s.length===3?s[1]:void 0,i=Number(s[s.length-1]);r=[a,i,o]}return n&&e.parseNodeNameCache.set(t,r),r}function Un(t,e,n){let s=p("pad",t,e,n);if(s==="explicit"){s=p("explicitPaddings",t,e,n);const r=[[0,0],[0,0],[0,0],[0,0]];for(let a=0;a<4;a++)r[a][0]=s[a*2],r[a][1]=s[a*2+1];return r}return s}function He(t){return t.kept?t:Xe(t)}/**
 * @license
 * Copyright 2023 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const TS=[{tfOpName:"Add",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"AddV2",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"AddN",category:"arithmetic",inputs:[{start:0,end:0,name:"tensors",type:"tensors"}]},{tfOpName:"BiasAdd",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0},{tfName:"data_format",name:"dataFormat",type:"string",notSupported:!0}]},{tfOpName:"Sub",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"RealDiv",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Div",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"DivNoNan",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"FloorDiv",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Mul",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Maximum",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Minimum",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Pow",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"SquaredDifference",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Mod",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"FloorMod",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]}],$S=Object.freeze(Object.defineProperty({__proto__:null,json:TS},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2023 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const ES=[{tfOpName:"Abs",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Acos",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Asin",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Atan",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Atan2",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"y",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Ceil",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"ClipByValue",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"clipValueMin",type:"number"},{start:2,name:"clipValueMax",type:"number"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Complex",category:"basic_math",inputs:[{start:0,name:"real",type:"tensor"},{start:1,name:"imag",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"ComplexAbs",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Cos",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Cosh",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Elu",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Exp",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Floor",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Log",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Imag",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0},{tfName:"Tout",name:"outputType",type:"dtype",notSupported:!0}]},{tfOpName:"Neg",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Real",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0},{tfName:"Tout",name:"outputType",type:"dtype",notSupported:!0}]},{tfOpName:"Prelu",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"alpha",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Relu",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Relu6",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Selu",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Sigmoid",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Sin",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Sinh",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Sqrt",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Rsqrt",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Square",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Tan",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Tanh",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Sign",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Round",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Expm1",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Log1p",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Reciprocal",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Softplus",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Asinh",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Acosh",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Atanh",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Erf",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"LeakyRelu",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"alpha",name:"alpha",type:"number",defaultValue:.2},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"IsNan",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"IsFinite",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"IsInf",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]}],kS=Object.freeze(Object.defineProperty({__proto__:null,json:ES},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2023 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const vS=[{tfOpName:"EmptyTensorList",category:"control",inputs:[{start:0,name:"elementShape",type:"shape"},{start:1,name:"maxNumElements",type:"number"}],attrs:[{tfName:"element_dtype",name:"elementDType",type:"dtype"}]},{tfOpName:"LoopCond",category:"control",inputs:[{start:0,name:"pred",type:"tensor"}]},{tfOpName:"Switch",category:"control",inputs:[{start:0,name:"data",type:"tensor"},{start:1,name:"pred",type:"tensor"}]},{tfOpName:"Merge",category:"control",inputs:[{start:0,end:0,name:"tensors",type:"tensors"}]},{tfOpName:"Enter",category:"control",inputs:[{start:0,name:"tensor",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0},{tfName:"frame_name",name:"frameName",type:"string"},{tfName:"is_constant",name:"isConstant",type:"bool"}]},{tfOpName:"Exit",category:"control",inputs:[{start:0,name:"tensor",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"NextIteration",category:"control",inputs:[{start:0,name:"tensor",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"TensorArrayV3",category:"control",inputs:[{start:0,name:"size",type:"number"}],attrs:[{tfName:"dtype",name:"dtype",type:"dtype"},{tfName:"element_shape",name:"elementShape",type:"shape"},{tfName:"dynamic_size",name:"dynamicSize",type:"bool"},{tfName:"clear_after_read",name:"clearAfterRead",type:"bool"},{tfName:"identical_element_shapes",name:"identicalElementShapes",type:"bool"},{tfName:"tensor_array_name",name:"name",type:"string"}]},{tfOpName:"TensorArrayWriteV3",category:"control",inputs:[{start:0,name:"tensorArrayId",type:"tensor"},{start:1,name:"index",type:"number"},{start:2,name:"tensor",type:"tensor"},{start:3,name:"flowIn",type:"number"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"TensorArrayReadV3",category:"control",inputs:[{start:0,name:"tensorArrayId",type:"tensor"},{start:1,name:"index",type:"number"},{start:2,name:"flowIn",type:"number"}],attrs:[{tfName:"dtype",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"TensorArrayGatherV3",category:"control",inputs:[{start:0,name:"tensorArrayId",type:"tensor"},{start:1,name:"indices",type:"number[]"},{start:2,name:"flowIn",type:"number"}],attrs:[{tfName:"dtype",name:"dtype",type:"dtype"},{tfName:"element_shape",name:"elementShape",type:"shape"}]},{tfOpName:"TensorArrayScatterV3",category:"control",inputs:[{start:0,name:"tensorArrayId",type:"tensor"},{start:1,name:"indices",type:"number[]"},{start:2,name:"tensor",type:"tensor"},{start:3,name:"flowIn",type:"number"}],attrs:[{tfName:"T",name:"dtype",type:"dtype"}]},{tfOpName:"TensorArrayConcatV3",category:"control",inputs:[{start:0,name:"tensorArrayId",type:"tensor"},{start:1,name:"flowIn",type:"number"}],attrs:[{tfName:"dtype",name:"dtype",type:"dtype"},{tfName:"element_shape_except0",name:"elementShapeExcept0",type:"shape",notSupported:!0}]},{tfOpName:"TensorArraySplitV3",category:"control",inputs:[{start:0,name:"tensorArrayId",type:"tensor"},{start:1,name:"tensor",type:"tensor"},{start:2,name:"lengths",type:"number[]"},{start:3,name:"flowIn",type:"number"}],attrs:[{tfName:"T",name:"dtype",type:"dtype"}]},{tfOpName:"TensorArraySizeV3",category:"control",inputs:[{start:0,name:"tensorArrayId",type:"tensor"},{start:1,name:"flowIn",type:"number"}]},{tfOpName:"TensorArrayCloseV3",category:"control",inputs:[{start:0,name:"tensorArrayId",type:"tensor"}]},{tfOpName:"StatelessIf",category:"control",inputs:[{start:0,name:"cond",type:"tensor"},{start:1,end:0,name:"args",type:"tensors"}],attrs:[{tfName:"then_branch",name:"thenBranch",type:"func"},{tfName:"else_branch",name:"elseBranch",type:"func"}]},{tfOpName:"If",category:"control",inputs:[{start:0,name:"cond",type:"tensor"},{start:1,end:0,name:"args",type:"tensors"}],attrs:[{tfName:"then_branch",name:"thenBranch",type:"func"},{tfName:"else_branch",name:"elseBranch",type:"func"}]},{tfOpName:"StatelessWhile",category:"control",inputs:[{start:0,end:0,name:"args",type:"tensors"}],attrs:[{tfName:"cond",name:"cond",type:"func"},{tfName:"body",name:"body",type:"func"}]},{tfOpName:"While",category:"control",inputs:[{start:0,end:0,name:"args",type:"tensors"}],attrs:[{tfName:"cond",name:"cond",type:"func"},{tfName:"body",name:"body",type:"func"}]},{tfOpName:"TensorListScatter",category:"control",inputs:[{start:0,name:"tensor",type:"tensor"},{start:1,name:"indices",type:"number[]"},{start:2,name:"elementShape",type:"shape"}],attrs:[{tfName:"element_dtype",name:"elementDType",type:"dtype"}]},{tfOpName:"TensorListScatterV2",category:"control",inputs:[{start:0,name:"tensor",type:"tensor"},{start:1,name:"indices",type:"number[]"},{start:2,name:"elementShape",type:"shape"},{start:3,name:"numElements",type:"number"}],attrs:[{tfName:"element_dtype",name:"elementDType",type:"dtype"}]},{tfOpName:"TensorListGather",category:"control",inputs:[{start:0,name:"tensorListId",type:"tensor"},{start:1,name:"indices",type:"number[]"},{start:2,name:"elementShape",type:"shape"}],attrs:[{tfName:"element_dtype",name:"elementDType",type:"dtype"}]},{tfOpName:"TensorListGetItem",category:"control",inputs:[{start:0,name:"tensorListId",type:"tensor"},{start:1,name:"index",type:"number"},{start:2,name:"elementShape",type:"shape"}],attrs:[{tfName:"element_dtype",name:"elementDType",type:"dtype"}]},{tfOpName:"TensorListSetItem",category:"control",inputs:[{start:0,name:"tensorListId",type:"tensor"},{start:1,name:"index",type:"number"},{start:2,name:"tensor",type:"tensor"}],attrs:[{tfName:"element_dtype",name:"elementDType",type:"dtype"}]},{tfOpName:"TensorListReserve",category:"control",inputs:[{start:0,name:"elementShape",type:"shape"},{start:1,name:"numElements",type:"number"}],attrs:[{tfName:"element_dtype",name:"elementDType",type:"dtype"}]},{tfOpName:"TensorListFromTensor",category:"control",inputs:[{start:0,name:"tensor",type:"tensor"},{start:1,name:"elementShape",type:"shape"}],attrs:[{tfName:"element_dtype",name:"elementDType",type:"dtype"}]},{tfOpName:"TensorListStack",category:"control",inputs:[{start:0,name:"tensorListId",type:"tensor"},{start:1,name:"elementShape",type:"shape"}],attrs:[{tfName:"element_dtype",name:"elementDType",type:"dtype"},{tfName:"num_elements",name:"numElements",type:"dtype"}]},{tfOpName:"TensorListSplit",category:"control",inputs:[{start:0,name:"tensor",type:"tensor"},{start:1,name:"elementShape",type:"shape"},{start:2,name:"lengths",type:"number[]"}],attrs:[{tfName:"element_dtype",name:"elementDType",type:"dtype"}]},{tfOpName:"TensorListConcat",category:"control",inputs:[{start:0,name:"tensorListId",type:"tensor"}],attrs:[{tfName:"element_shape",name:"elementShape",type:"shape"},{tfName:"element_dtype",name:"elementDType",type:"dtype"}]},{tfOpName:"TensorListConcatV2",category:"control",inputs:[{start:0,name:"tensorListId",type:"tensor"}],attrs:[{tfName:"element_shape",name:"elementShape",type:"shape"},{tfName:"element_dtype",name:"elementDType",type:"dtype"}]},{tfOpName:"TensorListPopBack",category:"control",inputs:[{start:0,name:"tensorListId",type:"tensor"},{start:1,name:"elementShape",type:"shape"}],attrs:[{tfName:"element_dtype",name:"elementDType",type:"dtype"}]},{tfOpName:"TensorListPushBack",category:"control",inputs:[{start:0,name:"tensorListId",type:"tensor"},{start:1,name:"tensor",type:"tensor"}],attrs:[{tfName:"element_dtype",name:"elementDType",type:"dtype"}]},{tfOpName:"TensorListLength",category:"control",inputs:[{start:0,name:"tensorListId",type:"tensor"}]},{tfOpName:"TensorListResize",category:"control",inputs:[{start:0,name:"tensorListId",type:"tensor"},{start:1,name:"size",type:"number"}]}],_S=Object.freeze(Object.defineProperty({__proto__:null,json:vS},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2023 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const IS=[{tfOpName:"AvgPool",category:"convolution",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"strides",name:"strides",type:"number[]"},{tfName:"padding",name:"pad",type:"string"},{tfName:"data_format",name:"dataFormat",type:"string",notSupported:!0},{tfName:"ksize",name:"kernelSize",type:"number[]"},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"MaxPool",category:"convolution",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"strides",name:"strides",type:"number[]"},{tfName:"padding",name:"pad",type:"string"},{tfName:"data_format",name:"dataFormat",type:"string",notSupported:!0},{tfName:"ksize",name:"kernelSize",type:"number[]"},{tfName:"explicit_paddings",name:"explicitPaddings",type:"number[]",defaultValue:[],notSupported:!0},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"MaxPoolWithArgmax",category:"convolution",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"strides",name:"strides",type:"number[]"},{tfName:"padding",name:"pad",type:"string"},{tfName:"ksize",name:"kernelSize",type:"number[]"},{tfName:"include_batch_in_index",name:"includeBatchInIndex",type:"bool"},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"AvgPool3D",category:"convolution",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"strides",name:"strides",type:"number[]"},{tfName:"padding",name:"pad",type:"string"},{tfName:"data_format",name:"dataFormat",type:"string",notSupported:!0},{tfName:"ksize",name:"kernelSize",type:"number[]"},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"MaxPool3D",category:"convolution",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"strides",name:"strides",type:"number[]"},{tfName:"padding",name:"pad",type:"string"},{tfName:"data_format",name:"dataFormat",type:"string",notSupported:!0},{tfName:"ksize",name:"kernelSize",type:"number[]"},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Conv1D",category:"convolution",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"filter",type:"tensor"}],attrs:[{tfName:"stride",name:"stride",type:"number"},{tfName:"padding",name:"pad",type:"string"},{tfName:"data_format",name:"dataFormat",type:"string",defaultValue:"NWC"},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0},{tfName:"dilation",name:"dilation",type:"number",defaultValue:1}]},{tfOpName:"Conv2D",category:"convolution",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"filter",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0},{tfName:"strides",name:"strides",type:"number[]"},{tfName:"padding",name:"pad",type:"string"},{tfName:"useCudnnOnGpu",name:"useCudnnOnGpu",type:"bool"},{tfName:"data_format",name:"dataFormat",type:"string",defaultValue:"NHWC"},{tfName:"explicit_paddings",name:"explicitPaddings",type:"number[]",defaultValue:[]},{tfName:"dilations",name:"dilations",type:"number[]"}]},{tfOpName:"_FusedConv2D",category:"convolution",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"filter",type:"tensor"},{start:2,end:0,name:"args",type:"tensors"}],attrs:[{tfName:"num_args",name:"numArgs",type:"number"},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0},{tfName:"strides",name:"strides",type:"number[]"},{tfName:"padding",name:"pad",type:"string"},{tfName:"explicit_paddings",name:"explicitPaddings",type:"number[]",defaultValue:[]},{tfName:"use_cudnn_on_gpu",name:"useCudnnOnGpu",type:"bool",defaultValue:!0},{tfName:"data_format",name:"dataFormat",type:"string",defaultValue:"NHWC"},{tfName:"dilations",name:"dilations",type:"number[]",defaultValue:[1,1,1,1]},{tfName:"fused_ops",name:"fusedOps",type:"string[]",defaultValue:[]},{tfName:"epsilon",name:"epsilon",type:"number",defaultValue:1e-4},{tfName:"leakyrelu_alpha",name:"leakyreluAlpha",type:"number",defaultValue:.2}]},{tfOpName:"Conv2DBackpropInput",category:"convolution",inputs:[{start:2,name:"x",type:"tensor"},{start:1,name:"filter",type:"tensor"},{start:0,name:"outputShape",type:"number[]"}],attrs:[{tfName:"strides",name:"strides",type:"number[]"},{tfName:"padding",name:"pad",type:"string"},{tfName:"data_format",name:"dataFormat",type:"string",notSupported:!0},{tfName:"explicit_paddings",name:"explicitPaddings",type:"number[]",defaultValue:[]},{tfName:"dilations",name:"dilations",type:"number[]",notSupported:!0}]},{tfOpName:"DepthwiseConv2d",category:"convolution",inputs:[{start:0,name:"input",type:"tensor"},{start:1,name:"filter",type:"tensor"}],attrs:[{tfName:"strides",name:"strides",type:"number[]"},{tfName:"padding",name:"pad",type:"string"},{tfName:"data_format",name:"dataFormat",type:"string",defaultValue:"NHWC"},{tfName:"explicit_paddings",name:"explicitPaddings",type:"number[]",defaultValue:[]},{tfName:"dilations",name:"dilations",type:"number[]"}]},{tfOpName:"DepthwiseConv2dNative",category:"convolution",inputs:[{start:0,name:"input",type:"tensor"},{start:1,name:"filter",type:"tensor"}],attrs:[{tfName:"strides",name:"strides",type:"number[]"},{tfName:"padding",name:"pad",type:"string"},{tfName:"data_format",name:"dataFormat",type:"string",defaultValue:"NHWC"},{tfName:"explicit_paddings",name:"explicitPaddings",type:"number[]",defaultValue:[]},{tfName:"dilations",name:"dilations",type:"number[]"}]},{tfOpName:"FusedDepthwiseConv2dNative",category:"convolution",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"filter",type:"tensor"},{start:2,end:0,name:"args",type:"tensors"}],attrs:[{tfName:"num_args",name:"numArgs",type:"number"},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0},{tfName:"strides",name:"strides",type:"number[]"},{tfName:"padding",name:"pad",type:"string"},{tfName:"data_format",name:"dataFormat",type:"string",defaultValue:"NHWC"},{tfName:"dilations",name:"dilations",type:"number[]",defaultValue:[1,1,1,1]},{tfName:"fused_ops",name:"fusedOps",type:"string[]",defaultValue:[]},{tfName:"explicit_paddings",name:"explicitPaddings",type:"number[]",defaultValue:[]}]},{tfOpName:"Conv3D",category:"convolution",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"filter",type:"tensor"}],attrs:[{tfName:"strides",name:"strides",type:"number[]"},{tfName:"padding",name:"pad",type:"string"},{tfName:"data_format",name:"dataFormat",type:"string",defaultValue:"NHWC"},{tfName:"dilations",name:"dilations",type:"number[]"}]},{tfOpName:"Dilation2D",category:"convolution",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"filter",type:"tensor"}],attrs:[{tfName:"strides",name:"strides",type:"number[]"},{tfName:"rates",name:"dilations",type:"number[]"},{tfName:"padding",name:"pad",type:"string"}]}],xS=Object.freeze(Object.defineProperty({__proto__:null,json:IS},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2023 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const AS=[{tfOpName:"Fill",category:"creation",inputs:[{start:0,name:"shape",type:"number[]"},{start:1,name:"value",type:"number"}],attrs:[{tfName:"T",name:"dtype",type:"dtype"}]},{tfOpName:"LinSpace",category:"creation",inputs:[{start:0,name:"start",type:"number"},{start:1,name:"stop",type:"number"},{start:2,name:"num",type:"number"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"OneHot",category:"creation",inputs:[{start:0,name:"indices",type:"tensor"},{start:1,name:"depth",type:"number"},{start:2,name:"onValue",type:"number",defaultValue:1},{start:3,name:"offValue",type:"number",defaultValue:0}],attrs:[{tfName:"axis",name:"axis",type:"number",notSupported:!0},{tfName:"T",name:"dtype",type:"dtype"}]},{tfOpName:"Ones",category:"creation",inputs:[{start:0,name:"shape",type:"number[]"}],attrs:[{tfName:"T",name:"dtype",type:"dtype"}]},{tfOpName:"OnesLike",category:"creation",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"dtype",name:"dtype",type:"dtype"}]},{tfOpName:"RandomStandardNormal",category:"creation",inputs:[{start:0,name:"shape",type:"number[]"}],attrs:[{tfName:"seed",name:"seed",type:"number",defaultValue:0},{tfName:"seed2",name:"seed2",type:"number",defaultValue:0,notSupported:!0},{tfName:"dtype",name:"dtype",type:"dtype"},{tfName:"T",name:"T",type:"number",notSupported:!0}]},{tfOpName:"RandomUniform",category:"creation",inputs:[{start:0,name:"shape",type:"number[]"}],attrs:[{tfName:"minval",name:"minval",type:"number",defaultValue:0},{tfName:"maxval",name:"maxval",type:"number",defaultValue:1},{tfName:"dtype",name:"dtype",type:"dtype"},{tfName:"seed",name:"seed",type:"number",defaultValue:0},{tfName:"seed2",name:"seed2",type:"number",defaultValue:0,notSupported:!0},{tfName:"T",name:"T",type:"number",notSupported:!0}]},{tfOpName:"RandomUniformInt",category:"creation",inputs:[{start:0,name:"shape",type:"number[]"}],attrs:[{tfName:"minval",name:"minval",type:"number"},{tfName:"maxval",name:"maxval",type:"number"},{tfName:"seed",name:"seed",type:"number",defaultValue:0},{tfName:"seed2",name:"seed2",type:"number",defaultValue:0,notSupported:!0}]},{tfOpName:"Range",category:"creation",inputs:[{start:0,name:"start",type:"number"},{start:1,name:"stop",type:"number"},{start:2,name:"step",type:"number",defaultValue:0}],attrs:[{tfName:"Tidx",name:"dtype",type:"dtype"}]},{tfOpName:"TruncatedNormal",category:"creation",inputs:[{start:0,name:"shape",type:"number[]"}],attrs:[{tfName:"means",name:"mean",type:"number",defaultValue:0},{tfName:"stddev",name:"stdDev",type:"number",defaultValue:1},{tfName:"seed",name:"seed",type:"number"},{tfName:"seed2",name:"seed2",type:"number",defaultValue:0,notSupported:!0},{tfName:"dtype",name:"dtype",type:"dtype"},{tfName:"T",name:"T",type:"number",notSupported:!0}]},{tfOpName:"Zeros",category:"creation",inputs:[{start:0,name:"shape",type:"number[]"}],attrs:[{tfName:"T",name:"dtype",type:"dtype"}]},{tfOpName:"ZerosLike",category:"creation",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype"}]},{tfOpName:"Multinomial",category:"creation",inputs:[{start:0,name:"logits",type:"tensor"},{start:1,name:"numSamples",type:"number"}],attrs:[{tfName:"seed",name:"seed",type:"number"},{tfName:"seed2",name:"seed2",type:"number"},{tfName:"T",name:"dtype",type:"dtype"},{tfName:"output_dtype",name:"output_dtype",type:"dtype"}]}],OS=Object.freeze(Object.defineProperty({__proto__:null,json:AS},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2023 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const DS=[{tfOpName:"NonMaxSuppressionV2",category:"dynamic",inputs:[{start:0,name:"boxes",type:"tensor"},{start:1,name:"scores",type:"tensor"},{start:2,name:"maxOutputSize",type:"number"},{start:3,name:"iouThreshold",type:"number"}]},{tfOpName:"NonMaxSuppressionV3",category:"dynamic",inputs:[{start:0,name:"boxes",type:"tensor"},{start:1,name:"scores",type:"tensor"},{start:2,name:"maxOutputSize",type:"number"},{start:3,name:"iouThreshold",type:"number"},{start:4,name:"scoreThreshold",type:"number"}]},{tfOpName:"NonMaxSuppressionV4",category:"dynamic",inputs:[{start:0,name:"boxes",type:"tensor"},{start:1,name:"scores",type:"tensor"},{start:2,name:"maxOutputSize",type:"number"},{start:3,name:"iouThreshold",type:"number"},{start:4,name:"scoreThreshold",type:"number"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0},{tfName:"T_threshold",name:"threshold",type:"dtype",notSupported:!0},{tfName:"pad_to_max_output_size",name:"padToMaxOutputSize",type:"bool"}]},{tfOpName:"NonMaxSuppressionV5",category:"dynamic",inputs:[{start:0,name:"boxes",type:"tensor"},{start:1,name:"scores",type:"tensor"},{start:2,name:"maxOutputSize",type:"number"},{start:3,name:"iouThreshold",type:"number"},{start:4,name:"scoreThreshold",type:"number"},{start:5,name:"softNmsSigma",type:"number"}]},{tfOpName:"Where",category:"dynamic",inputs:[{start:0,name:"condition",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"ListDiff",category:"dynamic",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"y",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]}],FS=Object.freeze(Object.defineProperty({__proto__:null,json:DS},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2023 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const CS=[{tfOpName:"LowerBound",category:"evaluation",inputs:[{start:0,name:"sortedSequence",type:"tensor"},{start:1,name:"values",type:"tensor"}]},{tfOpName:"TopKV2",category:"evaluation",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"k",type:"number"}],attrs:[{tfName:"sorted",name:"sorted",type:"bool"}]},{tfOpName:"UpperBound",category:"evaluation",inputs:[{start:0,name:"sortedSequence",type:"tensor"},{start:1,name:"values",type:"tensor"}]},{tfOpName:"Unique",category:"evaluation",inputs:[{start:0,name:"x",type:"tensor"}]},{tfOpName:"UniqueV2",category:"evaluation",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number"}]}],RS=Object.freeze(Object.defineProperty({__proto__:null,json:CS},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2023 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const LS=[{tfOpName:"PlaceholderWithDefault",category:"graph",inputs:[{start:0,name:"default",type:"tensor"}],attrs:[{tfName:"shape",name:"shape",type:"shape"},{tfName:"dtype",name:"dtype",type:"dtype"}]},{tfOpName:"Placeholder",category:"graph",attrs:[{tfName:"shape",name:"shape",type:"shape"},{tfName:"dtype",name:"dtype",type:"dtype"}]},{tfOpName:"Const",category:"graph"},{tfOpName:"Identity",category:"graph",inputs:[{start:0,name:"x",type:"tensor"}]},{tfOpName:"IdentityN",category:"graph",inputs:[{start:0,end:0,name:"x",type:"tensors"}]},{tfOpName:"Snapshot",category:"graph",inputs:[{start:0,name:"x",type:"tensor"}]},{tfOpName:"Rank",category:"graph",inputs:[{start:0,name:"x",type:"tensor"}]},{tfOpName:"Size",category:"graph",inputs:[{start:0,name:"x",type:"tensor"}]},{tfOpName:"Shape",category:"graph",inputs:[{start:0,name:"x",type:"tensor"}]},{tfOpName:"ShapeN",category:"graph",inputs:[{start:0,end:0,name:"x",type:"tensors"}]},{tfOpName:"Print",category:"graph",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"data",type:"tensors"}],attrs:[{tfName:"message",name:"message",type:"string"},{tfName:"first_n",name:"firstN",type:"number",notSupported:!0},{tfName:"summarize",name:"summarize",type:"number",defaultValue:3}]},{tfOpName:"NoOp",category:"graph",inputs:[]},{tfOpName:"StopGradient",category:"graph",inputs:[{start:0,name:"x",type:"tensor"}]},{tfOpName:"FakeQuantWithMinMaxVars",category:"graph",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"min",name:"min",type:"number"},{tfName:"max",name:"max",type:"number"}]}],BS=Object.freeze(Object.defineProperty({__proto__:null,json:LS},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2023 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const PS=[{tfOpName:"HashTable",category:"hash_table",inputs:[],attrs:[{tfName:"shared_name",name:"sharedName",type:"string"},{tfName:"use_node_name_sharing",name:"useNodeNameSharing",type:"bool"},{tfName:"key_dtype",name:"keyDType",type:"dtype"},{tfName:"value_dtype",name:"valueDType",type:"dtype"}]},{tfOpName:"HashTableV2",category:"hash_table",inputs:[],attrs:[{tfName:"shared_name",name:"sharedName",type:"string"},{tfName:"use_node_name_sharing",name:"useNodeNameSharing",type:"bool"},{tfName:"key_dtype",name:"keyDType",type:"dtype"},{tfName:"value_dtype",name:"valueDType",type:"dtype"}]},{tfOpName:"LookupTableImport",category:"hash_table",inputs:[{start:0,name:"tableHandle",type:"tensor"},{start:1,name:"keys",type:"tensor"},{start:2,name:"values",type:"tensor"}],attrs:[{tfName:"Tin",name:"tIn",type:"dtype",notSupported:!0},{tfName:"Tout",name:"tOut",type:"dtype",notSupported:!0}]},{tfOpName:"LookupTableImportV2",category:"hash_table",inputs:[{start:0,name:"tableHandle",type:"tensor"},{start:1,name:"keys",type:"tensor"},{start:2,name:"values",type:"tensor"}],attrs:[{tfName:"Tin",name:"tIn",type:"dtype",notSupported:!0},{tfName:"Tout",name:"tOut",type:"dtype",notSupported:!0}]},{tfOpName:"LookupTableFind",category:"hash_table",inputs:[{start:0,name:"tableHandle",type:"tensor"},{start:1,name:"keys",type:"tensor"},{start:2,name:"defaultValue",type:"tensor"}],attrs:[{tfName:"Tin",name:"tIn",type:"dtype",notSupported:!0},{tfName:"Tout",name:"tOut",type:"dtype",notSupported:!0}]},{tfOpName:"LookupTableFindV2",category:"hash_table",inputs:[{start:0,name:"tableHandle",type:"tensor"},{start:1,name:"keys",type:"tensor"},{start:2,name:"defaultValue",type:"tensor"}],attrs:[{tfName:"Tin",name:"tIn",type:"dtype",notSupported:!0},{tfName:"Tout",name:"tOut",type:"dtype",notSupported:!0}]},{tfOpName:"LookupTableSize",category:"hash_table",inputs:[{start:0,name:"tableHandle",type:"tensor"}]},{tfOpName:"LookupTableSizeV2",category:"hash_table",inputs:[{start:0,name:"tableHandle",type:"tensor"}]},{tfOpName:"InitializeTable",category:"hash_table",inputs:[{start:0,name:"tableHandle",type:"tensor"},{start:1,name:"keys",type:"tensor"},{start:2,name:"values",type:"tensor"}]},{tfOpName:"InitializeTableV2",category:"hash_table",inputs:[{start:0,name:"tableHandle",type:"tensor"},{start:1,name:"keys",type:"tensor"},{start:2,name:"values",type:"tensor"}]}],zS=Object.freeze(Object.defineProperty({__proto__:null,json:PS},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2023 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const VS=[{tfOpName:"ResizeBilinear",category:"image",inputs:[{start:0,name:"images",type:"tensor"},{start:1,name:"size",type:"number[]"}],attrs:[{tfName:"align_corners",name:"alignCorners",type:"bool"},{tfName:"half_pixel_centers",name:"halfPixelCenters",type:"bool"},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"ResizeNearestNeighbor",category:"image",inputs:[{start:0,name:"images",type:"tensor"},{start:1,name:"size",type:"number[]"}],attrs:[{tfName:"align_corners",name:"alignCorners",type:"bool"},{tfName:"half_pixel_centers",name:"halfPixelCenters",type:"bool"},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"CropAndResize",category:"image",inputs:[{start:0,name:"image",type:"tensor"},{start:1,name:"boxes",type:"tensor"},{start:2,name:"boxInd",type:"tensor"},{start:3,name:"cropSize",type:"number[]"}],attrs:[{tfName:"method",name:"method",type:"string"},{tfName:"extrapolation_value",name:"extrapolationValue",type:"number"}]},{tfOpName:"ImageProjectiveTransformV3",category:"image",inputs:[{start:0,name:"images",type:"tensor"},{start:1,name:"transforms",type:"tensor"},{start:2,name:"outputShape",type:"number[]"},{start:3,name:"fillValue",type:"number"}],attrs:[{tfName:"interpolation",name:"interpolation",type:"string"},{tfName:"fill_mode",name:"fillMode",type:"string"}]}],WS=Object.freeze(Object.defineProperty({__proto__:null,json:VS},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2023 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const MS=[{tfOpName:"Equal",category:"logical",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"NotEqual",category:"logical",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Greater",category:"logical",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"GreaterEqual",category:"logical",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Less",category:"logical",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"LessEqual",category:"logical",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"LogicalAnd",category:"logical",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"LogicalNot",category:"logical",inputs:[{start:0,name:"a",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"LogicalOr",category:"logical",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Select",category:"logical",inputs:[{start:0,name:"condition",type:"tensor"},{start:1,name:"a",type:"tensor"},{start:2,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"SelectV2",category:"logical",inputs:[{start:0,name:"condition",type:"tensor"},{start:1,name:"a",type:"tensor"},{start:2,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"BitwiseAnd",category:"logical",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"y",type:"tensor"}]}],jS=Object.freeze(Object.defineProperty({__proto__:null,json:MS},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2023 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const US=[{tfOpName:"_FusedMatMul",category:"matrices",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"},{start:2,end:0,name:"args",type:"tensors"}],attrs:[{tfName:"num_args",name:"numArgs",type:"number"},{tfName:"fused_ops",name:"fusedOps",type:"string[]",defaultValue:[]},{tfName:"epsilon",name:"epsilon",type:"number",defaultValue:1e-4},{tfName:"transpose_a",name:"transposeA",type:"bool",defaultValue:!1},{tfName:"transpose_b",name:"transposeB",type:"bool",defaultValue:!1},{tfName:"leakyrelu_alpha",name:"leakyreluAlpha",type:"number",defaultValue:.2},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"MatMul",category:"matrices",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"transpose_a",name:"transposeA",type:"bool",defaultValue:!1},{tfName:"transpose_b",name:"transposeB",type:"bool",defaultValue:!1},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"BatchMatMul",category:"matrices",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"adj_x",name:"transposeA",type:"bool",defaultValue:!1},{tfName:"adj_y",name:"transposeB",type:"bool",defaultValue:!1},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"BatchMatMulV2",category:"matrices",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"adj_x",name:"transposeA",type:"bool",defaultValue:!1},{tfName:"adj_y",name:"transposeB",type:"bool",defaultValue:!1},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Transpose",category:"matrices",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"perm",type:"number[]"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Einsum",category:"matrices",inputs:[{start:0,end:0,name:"tensors",type:"tensors"}],attrs:[{tfName:"equation",name:"equation",type:"string"},{tfName:"N",name:"n",type:"number",defaultValue:2},{tfName:"T",name:"dtype",type:"dtype"}]},{tfOpName:"MatrixBandPart",category:"matrices",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"numLower",type:"tensor"},{start:1,name:"numUpper",type:"tensor"}]}],qS=Object.freeze(Object.defineProperty({__proto__:null,json:US},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2023 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const GS=[{tfOpName:"EuclideanNorm",category:"normalization",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number[]"}],attrs:[{tfName:"keep_dims",name:"keepDims",type:"bool",defaultValue:!1}]},{tfOpName:"FusedBatchNorm",category:"normalization",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"scale",type:"tensor"},{start:2,name:"offset",type:"tensor"},{start:3,name:"mean",type:"tensor"},{start:4,name:"variance",type:"tensor"}],attrs:[{tfName:"epsilon",name:"epsilon",type:"number",defaultValue:.001},{tfName:"data_format",name:"dataFormat",type:"string",notSupported:!0}]},{tfOpName:"FusedBatchNormV2",category:"normalization",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"scale",type:"tensor"},{start:2,name:"offset",type:"tensor"},{start:3,name:"mean",type:"tensor"},{start:4,name:"variance",type:"tensor"}],attrs:[{tfName:"epsilon",name:"epsilon",type:"number",defaultValue:.001},{tfName:"data_format",name:"dataFormat",type:"string",notSupported:!0}]},{tfOpName:"FusedBatchNormV3",category:"normalization",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"scale",type:"tensor"},{start:2,name:"offset",type:"tensor"},{start:3,name:"mean",type:"tensor"},{start:4,name:"variance",type:"tensor"}],attrs:[{tfName:"epsilon",name:"epsilon",type:"number",defaultValue:.001},{tfName:"data_format",name:"dataFormat",type:"string",notSupported:!0}]},{tfOpName:"LRN",category:"normalization",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"depth_radius",name:"radius",type:"number",defaultValue:5},{tfName:"bias",name:"bias",type:"number",defaultValue:1},{tfName:"alpha",name:"alpha",type:"number",defaultValue:1},{tfName:"beta",name:"beta",type:"number",defaultValue:.5}]},{tfOpName:"Softmax",category:"normalization",inputs:[{start:0,name:"x",type:"tensor"}]},{tfOpName:"LogSoftmax",category:"normalization",inputs:[{start:0,name:"x",type:"tensor"}]}],HS=Object.freeze(Object.defineProperty({__proto__:null,json:GS},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2023 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const KS=[{tfOpName:"Bincount",category:"reduction",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"size",type:"number"},{start:2,name:"weights",type:"tensor"}]},{tfOpName:"DenseBincount",category:"reduction",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"size",type:"number"},{start:2,name:"weights",type:"tensor"}],attrs:[{tfName:"binary_output",name:"binaryOutput",type:"bool"}]},{tfOpName:"Max",category:"reduction",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number[]"}],attrs:[{tfName:"keep_dims",name:"keepDims",type:"bool"}]},{tfOpName:"Mean",category:"reduction",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number[]"}],attrs:[{tfName:"keep_dims",name:"keepDims",type:"bool"}]},{tfOpName:"Min",category:"reduction",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number[]"}],attrs:[{tfName:"keep_dims",name:"keepDims",type:"bool"}]},{tfOpName:"Sum",category:"reduction",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number[]"}],attrs:[{tfName:"keep_dims",name:"keepDims",type:"bool"}]},{tfOpName:"All",category:"reduction",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number[]"}],attrs:[{tfName:"keep_dims",name:"keepDims",type:"bool"}]},{tfOpName:"Any",category:"reduction",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number[]"}],attrs:[{tfName:"keep_dims",name:"keepDims",type:"bool"}]},{tfOpName:"ArgMax",category:"reduction",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number"}]},{tfOpName:"ArgMin",category:"reduction",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number"}]},{tfOpName:"Prod",category:"reduction",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number[]"}],attrs:[{tfName:"keep_dims",name:"keepDims",type:"bool"},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Cumprod",category:"reduction",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number"}],attrs:[{tfName:"exclusive",name:"exclusive",type:"bool"},{tfName:"reverse",name:"reverse",type:"bool"}]},{tfOpName:"Cumsum",category:"reduction",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number"}],attrs:[{tfName:"exclusive",name:"exclusive",type:"bool"},{tfName:"reverse",name:"reverse",type:"bool"}]}],XS=Object.freeze(Object.defineProperty({__proto__:null,json:KS},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2023 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const ZS=[{tfOpName:"ConcatV2",category:"slice_join",inputs:[{start:0,end:-1,name:"tensors",type:"tensors"},{start:-1,name:"axis",type:"number"}],attrs:[{tfName:"N",name:"n",type:"number",defaultValue:2}]},{tfOpName:"Concat",category:"slice_join",inputs:[{start:1,end:0,name:"tensors",type:"tensors"},{start:0,name:"axis",type:"number"}],attrs:[{tfName:"N",name:"n",type:"number",defaultValue:2}]},{tfOpName:"GatherV2",category:"slice_join",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"indices",type:"tensor"},{start:2,name:"axis",type:"number",defaultValue:0}],attrs:[{tfName:"batch_dims",name:"batchDims",type:"number",defaultValue:0}]},{tfOpName:"Gather",category:"slice_join",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"indices",type:"tensor"}],attrs:[{tfName:"validate_indices",name:"validateIndices",type:"bool",notSupported:!0}]},{tfOpName:"Reverse",category:"slice_join",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"dims",type:"bool[]"}]},{tfOpName:"ReverseV2",category:"slice_join",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number[]"}]},{tfOpName:"Slice",category:"slice_join",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"begin",type:"number[]"},{start:2,name:"size",type:"number[]"}]},{tfOpName:"StridedSlice",category:"slice_join",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"begin",type:"number[]"},{start:2,name:"end",type:"number[]"},{start:3,name:"strides",type:"number[]"}],attrs:[{tfName:"begin_mask",name:"beginMask",type:"number",defaultValue:0},{tfName:"end_mask",name:"endMask",type:"number",defaultValue:0},{tfName:"new_axis_mask",name:"newAxisMask",type:"number",defaultValue:0},{tfName:"ellipsis_mask",name:"ellipsisMask",type:"number",defaultValue:0},{tfName:"shrink_axis_mask",name:"shrinkAxisMask",type:"number",defaultValue:0}]},{tfOpName:"Pack",category:"slice_join",inputs:[{start:0,end:0,name:"tensors",type:"tensors"}],attrs:[{tfName:"axis",name:"axis",type:"number",defaultValue:0}]},{tfOpName:"Unpack",category:"slice_join",inputs:[{start:0,name:"tensor",type:"tensor"}],attrs:[{tfName:"axis",name:"axis",type:"number",defaultValue:0},{tfName:"num",name:"num",type:"number",defaultValue:0,notSupported:!0}]},{tfOpName:"Tile",category:"slice_join",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"reps",type:"number[]"}]},{tfOpName:"Split",category:"slice_join",inputs:[{start:0,name:"axis",type:"number",defaultValue:0},{start:1,name:"x",type:"tensor"}],attrs:[{tfName:"num_split",name:"numOrSizeSplits",type:"number",defaultValue:1}]},{tfOpName:"SplitV",category:"slice_join",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"numOrSizeSplits",type:"number[]"},{start:2,name:"axis",type:"number",defaultValue:0}]},{tfOpName:"ScatterNd",category:"slice_join",inputs:[{start:0,name:"indices",type:"tensor"},{start:1,name:"values",type:"tensor"},{start:2,name:"shape",type:"number[]"}]},{tfOpName:"GatherNd",category:"slice_join",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"indices",type:"tensor"}]},{tfOpName:"SparseToDense",category:"slice_join",inputs:[{start:0,name:"sparseIndices",type:"tensor"},{start:1,name:"outputShape",type:"number[]"},{start:2,name:"sparseValues",type:"tensor"},{start:3,name:"defaultValue",type:"tensor"}],attrs:[{tfName:"validate_indices",name:"validateIndices",type:"bool",defaultValue:!1,notSupported:!0}]},{tfOpName:"TensorScatterUpdate",category:"slice_join",inputs:[{start:0,name:"tensor",type:"tensor"},{start:1,name:"indices",type:"tensor"},{start:2,name:"values",type:"tensor"}]}],JS=Object.freeze(Object.defineProperty({__proto__:null,json:ZS},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2023 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const YS=[{tfOpName:"SparseFillEmptyRows",category:"sparse",inputs:[{start:0,name:"indices",type:"tensor"},{start:1,name:"values",type:"tensor"},{start:2,name:"denseShape",type:"tensor"},{start:3,name:"defaultValue",type:"tensor"}]},{tfOpName:"SparseReshape",category:"sparse",inputs:[{start:0,name:"inputIndices",type:"tensor"},{start:1,name:"inputShape",type:"tensor"},{start:2,name:"newShape",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"SparseSegmentMean",category:"sparse",inputs:[{start:0,name:"data",type:"tensor"},{start:1,name:"indices",type:"tensor"},{start:2,name:"segmentIds",type:"tensor"}]},{tfOpName:"SparseSegmentSum",category:"sparse",inputs:[{start:0,name:"data",type:"tensor"},{start:1,name:"indices",type:"tensor"},{start:2,name:"segmentIds",type:"tensor"}]}],QS=Object.freeze(Object.defineProperty({__proto__:null,json:YS},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2023 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const eT=[{tfOpName:"FFT",category:"spectral",inputs:[{start:0,name:"x",type:"tensor"}]},{tfOpName:"IFFT",category:"spectral",inputs:[{start:0,name:"x",type:"tensor"}]},{tfOpName:"RFFT",category:"spectral",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"fft_length",type:"number",notSupported:!0}]},{tfOpName:"IRFFT",category:"spectral",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"fft_length",type:"number",notSupported:!0}]}],tT=Object.freeze(Object.defineProperty({__proto__:null,json:eT},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2023 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const nT=[{tfOpName:"StaticRegexReplace",category:"string",inputs:[{start:0,name:"input",type:"tensor"}],attrs:[{tfName:"pattern",name:"pattern",type:"string"},{tfName:"rewrite",name:"rewrite",type:"string"},{tfName:"replace_global",name:"replaceGlobal",type:"bool"}]},{tfOpName:"StringNGrams",category:"string",inputs:[{start:0,name:"data",type:"tensor"},{start:1,name:"dataSplits",type:"tensor"}],attrs:[{tfName:"separator",name:"separator",type:"string"},{tfName:"ngram_widths",name:"nGramWidths",type:"number[]"},{tfName:"left_pad",name:"leftPad",type:"string"},{tfName:"right_pad",name:"rightPad",type:"string"},{tfName:"pad_width",name:"padWidth",type:"number"},{tfName:"preserve_short_sequences",name:"preserveShortSequences",type:"bool"}],outputs:["ngrams","ngrams_splits"]},{tfOpName:"StringSplit",category:"string",inputs:[{start:0,name:"input",type:"tensor"},{start:1,name:"delimiter",type:"tensor"}],attrs:[{tfName:"skip_empty",name:"skipEmpty",type:"bool"}],outputs:["indices","values","shape"]},{tfOpName:"StringToHashBucketFast",category:"string",inputs:[{start:0,name:"input",type:"tensor"}],attrs:[{tfName:"num_buckets",name:"numBuckets",type:"number"}]}],sT=Object.freeze(Object.defineProperty({__proto__:null,json:nT},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2023 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const rT=[{tfOpName:"Cast",category:"transformation",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"SrcT",name:"sdtype",type:"dtype",notSupported:!0},{tfName:"DstT",name:"dtype",type:"dtype"}]},{tfOpName:"ExpandDims",category:"transformation",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number"}]},{tfOpName:"MirrorPad",category:"transformation",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"padding",type:"number[]"}],attrs:[{tfName:"mode",name:"mode",type:"string"}]},{tfOpName:"Pad",category:"transformation",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"padding",type:"number[]"}],attrs:[{tfName:"constant_value",name:"constantValue",type:"number",defaultValue:0}]},{tfOpName:"PadV2",category:"transformation",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"padding",type:"number[]"},{start:2,name:"constantValue",type:"number",defaultValue:0}]},{tfOpName:"Reshape",category:"transformation",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"shape",type:"number[]"}]},{tfOpName:"EnsureShape",category:"transformation",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"shape",type:"number[]"}]},{tfOpName:"Squeeze",category:"transformation",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"axis",tfDeprecatedName:"squeeze_dims",name:"axis",type:"number[]"}]},{tfOpName:"SpaceToBatchND",category:"transformation",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"blockShape",type:"number[]"},{start:2,name:"paddings",type:"number[]"}]},{tfOpName:"BatchToSpaceND",category:"transformation",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"blockShape",type:"number[]"},{start:2,name:"crops",type:"number[]"}]},{tfOpName:"DepthToSpace",category:"transformation",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"block_size",name:"blockSize",type:"number"},{tfName:"data_format",name:"dataFormat",type:"string"}]},{tfOpName:"BroadcastTo",category:"transformation",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"shape",type:"number[]"}],attrs:[]},{tfOpName:"BroadcastArgs",category:"transformation",inputs:[{start:0,name:"s0",type:"tensor"},{start:1,name:"s1",type:"tensor"}],attrs:[]}],aT=Object.freeze(Object.defineProperty({__proto__:null,json:rT},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Ya{static get Instance(){return this._instance||(this._instance=new this)}constructor(){const e=[$S,kS,_S,xS,OS,FS,RS,BS,zS,WS,jS,qS,HS,XS,JS,QS,tT,sT,aT],n=[].concat(...e.map(s=>s.json));this.opMappers=n.reduce((s,r)=>(s[r.tfOpName]=r,s),{})}transformGraph(e,n={}){const s=e.node,r=[],a=[],o=[],i=s.reduce((S,N)=>(S[N.name]=this.mapNode(N),N.op.startsWith("Placeholder")?r.push(S[N.name]):N.op==="Const"?a.push(S[N.name]):(N.input==null||N.input.length===0)&&o.push(S[N.name]),S),{});let u=[];const c=[];let h={},l={};n!=null&&(h=this.mapSignatureEntries(n.inputs),l=this.mapSignatureEntries(n.outputs));const f=Object.keys(i);f.forEach(S=>{const N=i[S];N.inputNames.forEach((T,A)=>{const[E,,k]=Ge(T),v=i[E];if(v.outputs!=null){const x=v.outputs.indexOf(k);if(x!==-1){const O=`${E}:${x}`;N.inputNames[A]=O}}N.inputs.push(v),v.children.push(N)})}),Object.keys(l).length===0?f.forEach(S=>{const N=i[S];N.children.length===0&&c.push(N)}):Object.keys(l).forEach(S=>{const[N]=Ge(S),T=i[N];T!=null&&(T.signatureKey=l[S],c.push(T))}),Object.keys(h).length>0?Object.keys(h).forEach(S=>{const[N]=Ge(S),T=i[N];T&&(T.signatureKey=h[S],u.push(T))}):u=r;let d={};e.library!=null&&e.library.function!=null&&(d=e.library.function.reduce((S,N)=>(S[N.signature.name]=this.mapFunction(N),S),{}));const y={nodes:i,inputs:u,outputs:c,weights:a,placeholders:r,signature:n,functions:d};return o.length>0&&(y.initNodes=o),y}mapSignatureEntries(e){return Object.keys(e||{}).reduce((n,s)=>(n[e[s].name]=s,n),{})}mapNode(e){const n=Cp(e.op)||this.opMappers[e.op]||{};e.attr==null&&(e.attr={});const s={name:e.name,op:e.op,category:n.category,inputNames:(e.input||[]).map(r=>r.startsWith("^")?r.slice(1):r),inputs:[],children:[],inputParams:{},attrParams:{},rawAttrs:e.attr,outputs:n.outputs};return n.inputs!=null&&(s.inputParams=n.inputs.reduce((r,a)=>(r[a.name]={type:a.type,inputIndexStart:a.start,inputIndexEnd:a.end},r),{})),n.attrs!=null&&(s.attrParams=n.attrs.reduce((r,a)=>{const o=a.type;let i;switch(a.type){case"string":i=Ys(e.attr,a.tfName,a.defaultValue),i===void 0&&a.tfDeprecatedName&&(i=Ys(e.attr,a.tfDeprecatedName,a.defaultValue));break;case"string[]":i=ar(e.attr,a.tfName,a.defaultValue),i===void 0&&a.tfDeprecatedName&&(i=ar(e.attr,a.tfDeprecatedName,a.defaultValue));break;case"number":i=er(e.attr,a.tfName,a.defaultValue||0),i===void 0&&a.tfDeprecatedName&&(i=er(e.attr,a.tfDeprecatedName,a.defaultValue));break;case"number[]":i=rr(e.attr,a.tfName,a.defaultValue),i===void 0&&a.tfDeprecatedName&&(i=rr(e.attr,a.tfDeprecatedName,a.defaultValue));break;case"bool":i=Qs(e.attr,a.tfName,a.defaultValue),i===void 0&&a.tfDeprecatedName&&(i=Qs(e.attr,a.tfDeprecatedName,a.defaultValue));break;case"bool[]":i=ir(e.attr,a.tfName,a.defaultValue),i===void 0&&a.tfDeprecatedName&&(i=ir(e.attr,a.tfDeprecatedName,a.defaultValue));break;case"shape":i=sr(e.attr,a.tfName,a.defaultValue),i===void 0&&a.tfDeprecatedName&&(i=sr(e.attr,a.tfDeprecatedName,a.defaultValue));break;case"shape[]":i=or(e.attr,a.tfName,a.defaultValue),i===void 0&&a.tfDeprecatedName&&(i=or(e.attr,a.tfDeprecatedName,a.defaultValue));break;case"dtype":i=tr(e.attr,a.tfName,a.defaultValue),i===void 0&&a.tfDeprecatedName&&(i=tr(e.attr,a.tfDeprecatedName,a.defaultValue));break;case"dtype[]":i=nr(e.attr,a.tfName,a.defaultValue),i===void 0&&a.tfDeprecatedName&&(i=nr(e.attr,a.tfDeprecatedName,a.defaultValue));break;case"func":i=Qa(e.attr,a.tfName,a.defaultValue),i===void 0&&a.tfDeprecatedName&&(i=Qa(e.attr,a.tfDeprecatedName,a.defaultValue));break;case"tensor":case"tensors":break;default:throw new Error(`Unsupported param type: ${a.type} for op: ${e.op}`)}return r[a.name]={value:i,type:o},r},{})),s}mapFunction(e){const n=e.nodeDef,s=[],r=[];let a={};n!=null&&(a=n.reduce((l,f)=>(l[f.name]=this.mapNode(f),f.op==="Const"&&r.push(l[f.name]),l),{}));const o=[],i=[];e.signature.inputArg.forEach(l=>{const[f]=Ge(l.name),d={name:f,op:"Placeholder",inputs:[],inputNames:[],category:"graph",inputParams:{},attrParams:{dtype:{value:Ia(l.type),type:"dtype"}},children:[]};d.signatureKey=l.name,o.push(d),a[f]=d}),Object.keys(a).forEach(l=>{const f=a[l];f.inputNames.forEach((d,y)=>{const[S,,N]=Ge(d),T=a[S];if(T.outputs!=null){const A=T.outputs.indexOf(N);if(A!==-1){const E=`${S}:${A}`;f.inputNames[y]=E}}f.inputs.push(T),T.children.push(f)})});const c=e.ret;e.signature.outputArg.forEach(l=>{const[f,d]=Ge(c[l.name]),y=a[f];y!=null&&(y.defaultOutput=d,i.push(y))});const h=this.mapArgsToSignature(e);return{nodes:a,inputs:o,outputs:i,weights:r,placeholders:s,signature:h}}mapArgsToSignature(e){return{methodName:e.signature.name,inputs:e.signature.inputArg.reduce((n,s)=>(n[s.name]=this.mapArgToTensorInfo(s),n),{}),outputs:e.signature.outputArg.reduce((n,s)=>(n[s.name]=this.mapArgToTensorInfo(s,e.ret),n),{})}}mapArgToTensorInfo(e,n){let s=e.name;return n!=null&&(s=n[s]),{name:s,dtype:e.type}}}function oT(t){const e=R().global;if(typeof e.atob<"u")return e.atob(t);if(typeof Buffer<"u")return new Buffer(t,"base64").toString();throw new Error("Unable to decode base64 in this environment. Missing built-in atob() or Buffer()")}function Rp(t,e){const n=Array.isArray(t)?String.fromCharCode.apply(null,t):oT(t);return e?n:n.toLowerCase()}function Ys(t,e,n,s=!1){const r=t[e];return r!=null?Rp(r.s,s):n}function Qs(t,e,n){const s=t[e];return s?s.b:n}function er(t,e,n){const s=t[e]||{},r=s.i!=null?s.i:s.f!=null?s.f:n;return typeof r=="number"?r:parseInt(r,10)}function Ia(t){switch(typeof t=="string"&&(t=ge[t]),t){case ge.DT_FLOAT:case ge.DT_HALF:return"float32";case ge.DT_INT32:case ge.DT_INT64:case ge.DT_INT8:case ge.DT_UINT8:return"int32";case ge.DT_BOOL:return"bool";case ge.DT_DOUBLE:return"float32";case ge.DT_STRING:return"string";case ge.DT_COMPLEX64:case ge.DT_COMPLEX128:return"complex64";default:return null}}function Qa(t,e,n){const s=t[e];return s&&s.func?s.func.name:n}function tr(t,e,n){const s=t[e];return s&&s.type?Ia(s.type):n}function nr(t,e,n){const s=t[e];return s&&s.list&&s.list.type?s.list.type.map(r=>Ia(r)):n}function Lp(t){if(!t.unknownRank)return t.dim!=null?t.dim.map(e=>typeof e.size=="number"?e.size:parseInt(e.size,10)):[]}function sr(t,e,n){const s=t[e];return s&&s.shape?Lp(s.shape):n}function rr(t,e,n){const s=t[e];return s?((s.list.f&&s.list.f.length?s.list.f:s.list.i)||[]).map(r=>typeof r=="number"?r:parseInt(r,10)):n}function ar(t,e,n,s=!1){const r=t[e];return r&&r.list&&r.list.s?r.list.s.map(a=>Rp(a,s)):n}function or(t,e,n){const s=t[e];return s&&s.list&&s.list.shape?s.list.shape.map(r=>Lp(r)):n}function ir(t,e,n){const s=t[e];return s&&s.list&&s.list.b?s.list.b:n}/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class iT{constructor(e,n,s){this.node=e,this.tensorMap=n,this.context=s,this.inputs=[],this.attrs={},this.inputs=e.inputNames.map(r=>this.getInput(r)),e.rawAttrs!=null&&(this.attrs=Object.keys(e.rawAttrs).reduce((r,a)=>(r[a]=this.getAttr(a),r),{}))}getInput(e){return oe(e,this.tensorMap,this.context)}getAttr(e,n){const s=this.node.rawAttrs[e];if(s.tensor!=null)return oe(e,this.tensorMap,this.context);if(s.i!=null||s.f!=null)return er(this.node.rawAttrs,e,n);if(s.s!=null)return Ys(this.node.rawAttrs,e,n);if(s.b!=null)return Qs(this.node.rawAttrs,e,n);if(s.shape!=null)return sr(this.node.rawAttrs,e,n);if(s.type!=null)return tr(this.node.rawAttrs,e,n);if(s.list!=null){if(s.list.i!=null||s.list.f!=null)return rr(this.node.rawAttrs,e,n);if(s.list.s!=null)return ar(this.node.rawAttrs,e,n);if(s.list.shape!=null)return or(this.node.rawAttrs,e,n);if(s.list.b!=null)return ir(this.node.rawAttrs,e,n);if(s.list.type!=null)return nr(this.node.rawAttrs,e,n)}return n}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const ie=Object.freeze(Object.defineProperty({__proto__:null,OP_SCOPE_SUFFIX:Sr,abs:be,acos:Vc,acosh:Wc,add:C,addN:Mc,all:jc,any:Uc,argMax:qc,argMin:Gc,asin:Hc,asinh:Kc,atan:Xc,atan2:Zc,atanh:Jc,avgPool:Ir,avgPool3d:tl,basicLSTMCell:nl,batchNorm:On,batchNorm2d:sl,batchNorm3d:rl,batchNorm4d:al,batchToSpaceND:xr,bincount:Ar,bitwiseAnd:ol,booleanMaskAsync:Xh,broadcastArgs:il,broadcastTo:ln,buffer:Ve,cast:X,ceil:ul,clipByValue:cl,clone:Xe,complex:Je,concat:ue,concat1d:ll,concat2d:hl,concat3d:pl,concat4d:fl,conv1d:dl,conv2d:Dn,conv2dTranspose:gl,conv3d:yl,conv3dTranspose:bl,cos:wl,cosh:Nl,cosineWindow:bs,cumprod:Sl,cumsum:Tl,denseBincount:$l,depthToSpace:El,depthwiseConv2d:cs,diag:kl,dilation2d:vl,div:K,divNoNan:Il,dot:xl,dropout:ep,einsum:bt,elu:Fr,enclosingPowerOfTwo:ma,ensureShape:Al,equal:Dr,erf:Ol,euclideanNorm:Cl,exp:lt,expandDims:qe,expm1:Rl,eye:Rr,fft:ds,fill:tn,floor:Lr,floorDiv:vr,fused:np,gather:Br,gatherND:Qh,greater:Rn,greaterEqual:Pr,ifft:$n,imag:Ln,image:lp,inTopKAsync:tp,irfft:ca,isFinite:Ll,isInf:Bl,isNaN:Pl,leakyRelu:zr,less:ts,lessEqual:ls,linalg:hp,linspace:zl,localResponseNormalization:Vl,log:Zt,log1p:Vr,logSigmoid:Ml,logSoftmax:jl,logSumExp:Mr,logicalAnd:Nn,logicalNot:jr,logicalOr:Ur,logicalXor:Ul,losses:pp,lowerBound:ql,matMul:V,max:Et,maxPool:qr,maxPool3d:Gl,maxPoolWithArgmax:Hl,maximum:Gr,mean:Sn,meshgrid:Kl,min:es,minimum:Tn,mirrorPad:Xl,mod:Zl,moments:Jl,movingAverage:Zh,mul:I,multiRNNCell:Yl,multinomial:Ql,neg:Ce,norm:Cn,notEqual:Hr,oneHot:ns,ones:rt,onesLike:eh,op:b,outerProduct:th,pad:nn,pad1d:nh,pad2d:sh,pad3d:rh,pad4d:ah,pool:oh,pow:Xt,prelu:Xr,print:kr,prod:ih,raggedGather:uh,raggedRange:ch,raggedTensorToTensor:lh,rand:hh,randomGamma:mh,randomNormal:oa,randomStandardNormal:gh,randomUniform:fs,randomUniformInt:yh,range:Jt,real:Yt,reciprocal:bh,relu:Bn,relu6:ia,reshape:$,reverse:ht,reverse1d:wh,reverse2d:Nh,reverse3d:Sh,reverse4d:Th,rfft:ms,round:ua,rsqrt:$h,scalar:z,scatterND:Jh,searchSorted:ps,selu:Eh,separableConv2d:kh,setdiff1dAsync:vh,sigmoid:$t,sign:_h,signal:cp,sin:Ih,sinh:xh,slice:q,slice1d:Ah,slice2d:Oh,slice3d:Dh,slice4d:Fh,softmax:Ch,softplus:Wr,spaceToBatchND:Kr,sparse:fp,sparseToDense:Yh,spectral:up,split:Qt,sqrt:We,square:xe,squaredDifference:la,squeeze:gs,stack:je,step:ha,stridedSlice:Rh,string:dp,sub:P,sum:H,tan:Lh,tanh:Qn,tensor:Fe,tensor1d:$e,tensor2d:Ut,tensor3d:pa,tensor4d:Bh,tensor5d:Ph,tensor6d:zh,tensorScatterUpdate:Wh,tile:jt,topk:Mh,transpose:En,truncatedNormal:jh,unique:Uh,unsortedSegmentSum:qh,unstack:ft,upperBound:Gh,variable:Hh,where:Ze,whereAsync:da,zeros:xt,zerosLike:Ne},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const uT=(t,e,n,s=ie)=>{switch(t.op){case"BiasAdd":case"AddV2":case"Add":return[s.add(p("a",t,e,n),p("b",t,e,n))];case"AddN":return[s.addN(p("tensors",t,e,n))];case"FloorMod":case"Mod":return[s.mod(p("a",t,e,n),p("b",t,e,n))];case"Mul":return[s.mul(p("a",t,e,n),p("b",t,e,n))];case"RealDiv":case"Div":return[s.div(p("a",t,e,n),p("b",t,e,n))];case"DivNoNan":return[s.divNoNan(p("a",t,e,n),p("b",t,e,n))];case"FloorDiv":return[s.floorDiv(p("a",t,e,n),p("b",t,e,n))];case"Sub":return[s.sub(p("a",t,e,n),p("b",t,e,n))];case"Minimum":return[s.minimum(p("a",t,e,n),p("b",t,e,n))];case"Maximum":return[s.maximum(p("a",t,e,n),p("b",t,e,n))];case"Pow":return[s.pow(p("a",t,e,n),p("b",t,e,n))];case"SquaredDifference":return[s.squaredDifference(p("a",t,e,n),p("b",t,e,n))];default:throw TypeError(`Node type ${t.op} is not implemented`)}};/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const cT=(t,e,n,s=ie)=>{switch(t.op){case"Abs":case"ComplexAbs":return[s.abs(p("x",t,e,n))];case"Acos":return[s.acos(p("x",t,e,n))];case"Acosh":return[s.acosh(p("x",t,e,n))];case"Asin":return[s.asin(p("x",t,e,n))];case"Asinh":return[s.asinh(p("x",t,e,n))];case"Atan":return[s.atan(p("x",t,e,n))];case"Atan2":return[s.atan2(p("x",t,e,n),p("y",t,e,n))];case"Atanh":return[s.atanh(p("x",t,e,n))];case"Ceil":return[s.ceil(p("x",t,e,n))];case"Complex":return[s.complex(p("real",t,e,n),p("imag",t,e,n))];case"Cos":return[s.cos(p("x",t,e,n))];case"Cosh":return[s.cosh(p("x",t,e,n))];case"Elu":return[s.elu(p("x",t,e,n))];case"Erf":return[s.erf(p("x",t,e,n))];case"Exp":return[s.exp(p("x",t,e,n))];case"Expm1":return[s.expm1(p("x",t,e,n))];case"Floor":return[s.floor(p("x",t,e,n))];case"Log":return[s.log(p("x",t,e,n))];case"Log1p":return[s.log1p(p("x",t,e,n))];case"Imag":return[s.imag(p("x",t,e,n))];case"Neg":return[s.neg(p("x",t,e,n))];case"Reciprocal":return[s.reciprocal(p("x",t,e,n))];case"Real":return[s.real(p("x",t,e,n))];case"Relu":return[s.relu(p("x",t,e,n))];case"Round":return[s.round(p("x",t,e,n))];case"Selu":return[s.selu(p("x",t,e,n))];case"Sigmoid":return[s.sigmoid(p("x",t,e,n))];case"Sin":return[s.sin(p("x",t,e,n))];case"Sign":return[s.sign(p("x",t,e,n))];case"Sinh":return[s.sinh(p("x",t,e,n))];case"Softplus":return[s.softplus(p("x",t,e,n))];case"Sqrt":return[s.sqrt(p("x",t,e,n))];case"Square":return[s.square(p("x",t,e,n))];case"Tanh":return[s.tanh(p("x",t,e,n))];case"Tan":return[s.tan(p("x",t,e,n))];case"ClipByValue":return[s.clipByValue(p("x",t,e,n),p("clipValueMin",t,e,n),p("clipValueMax",t,e,n))];case"Relu6":return[s.relu6(p("x",t,e,n))];case"Rsqrt":return[s.rsqrt(oe(t.inputNames[0],e,n))];case"LeakyRelu":return[s.leakyRelu(p("x",t,e,n),p("alpha",t,e,n))];case"Prelu":return[s.prelu(p("x",t,e,n),p("alpha",t,e,n))];case"IsNan":return[s.isNaN(oe(t.inputNames[0],e,n))];case"IsInf":return[s.isInf(oe(t.inputNames[0],e,n))];case"IsFinite":return[s.isFinite(oe(t.inputNames[0],e,n))];default:throw TypeError(`Node type ${t.op} is not implemented`)}};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ke(t,e,n=""){if(!(typeof t=="number"||typeof e=="number")){g(t.length===e.length,()=>n+` Shapes ${t} and ${e} must match`);for(let s=0;s<t.length;s++){const r=t[s],a=e[s];g(r<0||a<0||r===a,()=>n+` Shapes ${t} and ${e} must match`)}}}function eo(t){return!(typeof t=="number"||t.some(e=>e<0))}function an(t,e,n){let s=ur(t,n);const r=!eo(s);if(r&&e.length===0)throw new Error(`Tried to calculate elements of an empty list with non-fully-defined elementShape: ${s}`);if(r&&e.forEach(a=>{s=ur(a.shape,s)}),!eo(s))throw new Error(`Non-fully-defined elementShape: ${s}`);return s}function ur(t,e){if(typeof t=="number")return e;if(typeof e=="number")return t;if(t.length!==e.length)throw new Error(`Incompatible ranks during merge: ${t} vs. ${e}`);const n=[];for(let s=0;s<t.length;++s){const r=t[s],a=e[s];if(r>=0&&a>=0&&r!==a)throw new Error(`Incompatible shape during merge: ${t} vs. ${e}`);n[s]=r>=0?r:a}return n}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class lT{constructor(e,n,s,r,a,o,i){this.name=e,this.dtype=n,this.maxSize=s,this.elementShape=r,this.identicalElementShapes=a,this.dynamicSize=o,this.clearAfterRead=i,this.tensors=[],this.closed_=!1,this.idTensor=z(0),De(this.idTensor)}get id(){return this.idTensor.id}get closed(){return this.closed_}clearAndClose(e){this.tensors.forEach(n=>{(e==null||!e.has(n.tensor.id))&&n.tensor.dispose()}),this.tensors=[],this.closed_=!0,this.idTensor.dispose()}size(){return this.tensors.length}read(e){if(this.closed_)throw new Error(`TensorArray ${this.name} has already been closed.`);if(e<0||e>=this.size())throw new Error(`Tried to read from index ${e}, but array size is: ${this.size()}`);const n=this.tensors[e];if(n.cleared)throw new Error(`TensorArray ${this.name}: Could not read index ${e} twice because it was cleared after a previous read (perhaps try setting clear_after_read = false?).`);return this.clearAfterRead&&(n.cleared=!0),n.read=!0,n.tensor}readMany(e){return e.map(n=>this.read(n))}write(e,n){if(this.closed_)throw new Error(`TensorArray ${this.name} has already been closed.`);if(e<0||!this.dynamicSize&&e>=this.maxSize)throw new Error(`Tried to write to index ${e}, but array is not resizeable and size is: ${this.maxSize}`);const s=this.tensors[e]||{};if(n.dtype!==this.dtype)throw new Error(`TensorArray ${this.name}: Could not write to TensorArray index ${e},
          because the value dtype is ${n.dtype}, but TensorArray dtype is ${this.dtype}.`);if(this.size()===0&&(this.elementShape==null||this.elementShape.length===0)&&(this.elementShape=n.shape),ke(this.elementShape,n.shape,`TensorArray ${this.name}: Could not write to TensorArray index ${e}.`),s.read)throw new Error(`TensorArray ${this.name}: Could not write to TensorArray index ${e}, because it has already been read.`);if(s.written)throw new Error(`TensorArray ${this.name}: Could not write to TensorArray index ${e}, because it has already been written.`);s.tensor=n,De(n),s.written=!0,this.tensors[e]=s}writeMany(e,n){if(e.length!==n.length)throw new Error(`TensorArray ${this.name}: could not write multiple tensors,because the index size: ${e.length} is not the same as tensors size: ${n.length}.`);e.forEach((s,r)=>this.write(s,n[r]))}gather(e,n){if(n&&n!==this.dtype)throw new Error(`TensorArray dtype is ${this.dtype} but gather requested dtype ${n}`);if(e)e=e.slice(0,this.size());else{e=[];for(let r=0;r<this.size();r++)e.push(r)}if(e.length===0)return Fe([],[0].concat(this.elementShape));const s=this.readMany(e);return ke(this.elementShape,s[0].shape,"TensorArray shape mismatch: "),je(s,0)}concat(e){if(e&&e!==this.dtype)throw new Error(`TensorArray dtype is ${this.dtype} but concat requested dtype ${e}`);if(this.size()===0)return Fe([],[0].concat(this.elementShape));const n=[];for(let r=0;r<this.size();r++)n.push(r);const s=this.readMany(n);return ke(this.elementShape,s[0].shape,`TensorArray shape mismatch: tensor array shape (${this.elementShape}) vs first tensor shape (${s[0].shape})`),ue(s,0)}scatter(e,n){if(n.dtype!==this.dtype)throw new Error(`TensorArray dtype is ${this.dtype} but tensor has dtype ${n.dtype}`);if(e.length!==n.shape[0])throw new Error(`Expected len(indices) == tensor.shape[0], but saw: ${e.length} vs. ${n.shape[0]}`);const s=Math.max(...e);if(!this.dynamicSize&&s>=this.maxSize)throw new Error(`Max index must be < array size (${s}  vs. ${this.maxSize})`);this.writeMany(e,ft(n,0))}split(e,n){if(n.dtype!==this.dtype)throw new Error(`TensorArray dtype is ${this.dtype} but tensor has dtype ${n.dtype}`);let s=0;const r=e.map(u=>(s+=u,s));if(s!==n.shape[0])throw new Error(`Expected sum of lengths to be equal to
          tensor.shape[0], but sum of lengths is
        ${s}, and tensor's shape is: ${n.shape}`);if(!this.dynamicSize&&e.length!==this.maxSize)throw new Error(`TensorArray's size is not equal to the size of lengths (${this.maxSize} vs. ${e.length}), and the TensorArray is not marked as dynamically resizeable`);const a=s===0?0:n.size/s,o=[];W(()=>{n=$(n,[1,s,a]);for(let u=0;u<e.length;++u){const h=[0,u===0?0:r[u-1],0],l=[1,e[u],a];o[u]=$(q(n,h,l),this.elementShape)}return o});const i=[];for(let u=0;u<e.length;u++)i[u]=u;this.writeMany(i,o)}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Ot{get id(){return this.idTensor.id}constructor(e,n,s,r=-1){this.tensors=e,this.elementShape=n,this.elementDtype=s,e?.forEach(a=>{if(s!==a.dtype)throw new Error(`Invalid data types; op elements ${s}, but list elements ${a.dtype}`);ke(n,a.shape,"TensorList shape mismatch: "),De(a)}),this.idTensor=z(0),this.maxNumElements=r,De(this.idTensor)}copy(){return new Ot([...this.tensors],this.elementShape,this.elementDtype)}clearAndClose(e){this.tensors.forEach(n=>{(e==null||!e.has(n.id))&&n.dispose()}),this.tensors.length=0,this.idTensor.dispose()}size(){return this.tensors.length}stack(e,n,s=-1){if(n!==this.elementDtype)throw new Error(`Invalid data types; op elements ${n}, but list elements ${this.elementDtype}`);if(s!==-1&&this.tensors.length!==s)throw new Error(`Operation expected a list with ${s} elements but got a list with ${this.tensors.length} elements.`);ke(e,this.elementShape,"TensorList shape mismatch: ");const r=an(this.elementShape,this.tensors,e);return W(()=>{const a=this.tensors.map(o=>$(o,r));return je(a,0)})}popBack(e,n){if(n!==this.elementDtype)throw new Error(`Invalid data types; op elements ${n}, but list elements ${this.elementDtype}`);if(this.size()===0)throw new Error("Trying to pop from an empty list.");const s=an(this.elementShape,this.tensors,e),r=this.tensors.pop();return r.kept=!1,ke(r.shape,e,"TensorList shape mismatch: "),$(r,s)}pushBack(e){if(e.dtype!==this.elementDtype)throw new Error(`Invalid data types; op elements ${e.dtype}, but list elements ${this.elementDtype}`);if(ke(e.shape,this.elementShape,"TensorList shape mismatch: "),this.maxNumElements===this.size())throw new Error("Trying to push element into a full list.");De(e),this.tensors.push(e)}resize(e){if(e<0)throw new Error(`TensorListResize expects size to be non-negative. Got: ${e}`);if(this.maxNumElements!==-1&&e>this.maxNumElements)throw new Error(`TensorListResize input size ${e} is greater maxNumElement ${this.maxNumElements}.`);const n=new Ot([],this.elementShape,this.elementDtype,this.maxNumElements);n.tensors.length=e;for(let s=0;s<Math.min(this.tensors.length,e);++s)n.tensors[s]=this.tensors[s];return n}getItem(e,n,s){if(s!==this.elementDtype)throw new Error(`Invalid data types; op elements ${s}, but list elements ${this.elementDtype}`);if(e<0||e>this.tensors.length)throw new Error(`Trying to access element ${e} in a list with ${this.tensors.length} elements.`);if(this.tensors[e]==null)throw new Error(`element at index ${e} is null.`);ke(this.tensors[e].shape,n,"TensorList shape mismatch: ");const r=an(this.elementShape,this.tensors,n);return $(this.tensors[e],r)}setItem(e,n){if(n.dtype!==this.elementDtype)throw new Error(`Invalid data types; op elements ${n.dtype}, but list elements ${this.elementDtype}`);if(e<0||this.maxNumElements!==-1&&e>=this.maxNumElements)throw new Error(`Trying to set element ${e} in a list with max ${this.maxNumElements} elements.`);ke(this.elementShape,n.shape,"TensorList shape mismatch: "),De(n),this.tensors[e]!=null&&(this.tensors[e].kept=!1),this.tensors[e]=n}gather(e,n,s){if(n!==this.elementDtype)throw new Error(`Invalid data types; op elements ${n}, but list elements ${this.elementDtype}`);ke(this.elementShape,s,"TensorList shape mismatch: "),e=e.slice(0,this.size());const r=an(this.elementShape,this.tensors,s);return e.length===0?Fe([],[0].concat(r)):W(()=>{const a=e.map(o=>$(this.tensors[o],r));return je(a,0)})}concat(e,n){if(e&&e!==this.elementDtype)throw new Error(`TensorList dtype is ${this.elementDtype} but concat requested dtype ${e}`);ke(this.elementShape,n,"TensorList shape mismatch: ");const s=an(this.elementShape,this.tensors,n);return this.size()===0?Fe([],[0].concat(s)):W(()=>{const r=this.tensors.map(a=>$(a,s));return ue(r,0)})}}function hT(t,e,n){const s=t.dtype;if(t.shape.length<1)throw new Error(`Tensor must be at least a vector, but saw shape: ${t.shape}`);if(t.dtype!==n)throw new Error(`Invalid data types; op elements ${t.dtype}, but list elements ${n}`);const r=t.shape.slice(1);ke(r,e,"TensorList shape mismatch: ");const a=ft(t);return new Ot(a,e,s)}function pT(t,e,n,s){return new Ot([],t,e,s)}function fT(t,e,n,s){if(e.length!==t.shape[0])throw new Error(`Expected len(indices) == tensor.shape[0], but saw: ${e.length} vs. ${t.shape[0]}`);const r=Math.max(...e);if(s!=null&&s!==-1&&r>=s)throw new Error(`Max index must be < array size (${r}  vs. ${s})`);const a=new Ot([],n,t.dtype,s),o=ft(t,0);return e.forEach((i,u)=>{a.setItem(i,o[u])}),a}function dT(t,e,n){let s=0;const r=e.map(h=>(s+=h,s));if(s!==t.shape[0])throw new Error(`Expected sum of lengths to be equal to
          tensor.shape[0], but sum of lengths is
        ${s}, and tensor's shape is: ${t.shape}`);const a=t.shape.slice(1),o=ur(a,n),i=s===0?0:t.size/s,u=W(()=>{const h=[];t=$(t,[1,s,i]);for(let l=0;l<e.length;++l){const d=[0,l===0?0:r[l-1],0],y=[1,e[l],i];h[l]=$(q(t,d,y),o)}return t.dispose(),h}),c=new Ot([],n,t.dtype,e.length);for(let h=0;h<u.length;h++)c.setItem(h,u[h]);return c}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const mT=async(t,e,n)=>{switch(t.op){case"If":case"StatelessIf":{const s=p("thenBranch",t,e,n),r=p("elseBranch",t,e,n),a=p("cond",t,e,n),o=p("args",t,e,n);return(await a.data())[0]?n.functionMap[s].executeFunctionAsync(o,n.tensorArrayMap,n.tensorListMap):n.functionMap[r].executeFunctionAsync(o,n.tensorArrayMap,n.tensorListMap)}case"While":case"StatelessWhile":{const s=p("body",t,e,n),r=p("cond",t,e,n),a=p("args",t,e,n),o=await n.functionMap[r].executeFunctionAsync(a,n.tensorArrayMap,n.tensorListMap),i=a.map(h=>h.id);let u=await o[0].data();o.forEach(h=>{!h.kept&&i.indexOf(h.id)===-1&&h.dispose()});let c=a;for(;u[0];){const h=c;c=await n.functionMap[s].executeFunctionAsync(c,n.tensorArrayMap,n.tensorListMap);const l=c.map(d=>d.id);h.forEach(d=>{!d.kept&&i.indexOf(d.id)===-1&&l.indexOf(d.id)===-1&&d.dispose()});const f=await n.functionMap[r].executeFunctionAsync(c,n.tensorArrayMap,n.tensorListMap);u=await f[0].data(),f.forEach(d=>{!d.kept&&i.indexOf(d.id)===-1&&l.indexOf(d.id)===-1&&d.dispose()})}return c}case"LoopCond":{const s=p("pred",t,e,n);return[He(s)]}case"Switch":{const s=p("pred",t,e,n);let r=p("data",t,e,n);return r.kept||(r=He(r)),(await s.data())[0]?[void 0,r]:[r,void 0]}case"Merge":{const s=t.inputNames.find(r=>oe(r,e,n)!==void 0);if(s){const r=oe(s,e,n);return[He(r)]}return}case"Enter":{const s=p("frameName",t,e,n),r=p("tensor",t,e,n);return n.enterFrame(s),[He(r)]}case"Exit":{const s=p("tensor",t,e,n);return n.exitFrame(),[He(s)]}case"NextIteration":{const s=p("tensor",t,e,n);return n.nextIteration(),[He(s)]}case"TensorArrayV3":{const s=p("size",t,e,n),r=p("dtype",t,e,n),a=p("elementShape",t,e,n),o=p("dynamicSize",t,e,n),i=p("clearAfterRead",t,e,n),u=p("identicalElementShapes",t,e,n),c=p("name",t,e,n),h=new lT(c,r,s,a,u,o,i);return n.addTensorArray(h),[h.idTensor,z(1)]}case"TensorArrayWriteV3":{const s=p("tensorArrayId",t,e,n),r=p("index",t,e,n),a=p("tensor",t,e,n),o=n.getTensorArray(s.id);return o.write(r,a),[o.idTensor]}case"TensorArrayReadV3":{const s=p("tensorArrayId",t,e,n),r=p("index",t,e,n);return[n.getTensorArray(s.id).read(r)]}case"TensorArrayGatherV3":{const s=p("tensorArrayId",t,e,n),r=p("indices",t,e,n),a=p("dtype",t,e,n);return[n.getTensorArray(s.id).gather(r,a)]}case"TensorArrayScatterV3":{const s=p("tensorArrayId",t,e,n),r=p("indices",t,e,n),a=p("tensor",t,e,n),o=n.getTensorArray(s.id);return o.scatter(r,a),[o.idTensor]}case"TensorArrayConcatV3":{const s=p("tensorArrayId",t,e,n),r=n.getTensorArray(s.id),a=p("dtype",t,e,n);return[r.concat(a)]}case"TensorArraySplitV3":{const s=p("tensorArrayId",t,e,n),r=p("tensor",t,e,n),a=p("lengths",t,e,n),o=n.getTensorArray(s.id);return o.split(a,r),[o.idTensor]}case"TensorArraySizeV3":{const s=p("tensorArrayId",t,e,n),r=n.getTensorArray(s.id);return[z(r.size(),"int32")]}case"TensorArrayCloseV3":{const s=p("tensorArrayId",t,e,n),r=n.getTensorArray(s.id);return r.clearAndClose(),[r.idTensor]}case"TensorListSetItem":{const s=p("tensorListId",t,e,n),r=p("index",t,e,n),a=p("tensor",t,e,n),o=n.getTensorList(s.id);return o.setItem(r,a),[o.idTensor]}case"TensorListGetItem":{const s=p("tensorListId",t,e,n),r=p("index",t,e,n),a=p("elementShape",t,e,n),o=p("elementDType",t,e,n);return[n.getTensorList(s.id).getItem(r,a,o)]}case"TensorListScatterV2":case"TensorListScatter":{const s=p("indices",t,e,n),r=p("tensor",t,e,n),a=p("elementShape",t,e,n),o=p("numElements",t,e,n),i=fT(r,s,a,o);return n.addTensorList(i),[i.idTensor]}case"TensorListReserve":case"EmptyTensorList":{const s=p("elementShape",t,e,n),r=p("elementDType",t,e,n);let a;t.op==="TensorListReserve"?a="numElements":a="maxNumElements";const o=p(a,t,e,n),i=t.op==="TensorListReserve"?-1:o,u=pT(s,r,o,i);return n.addTensorList(u),[u.idTensor]}case"TensorListGather":{const s=p("tensorListId",t,e,n),r=p("indices",t,e,n),a=p("elementShape",t,e,n),o=p("elementDType",t,e,n);return[n.getTensorList(s.id).gather(r,o,a)]}case"TensorListStack":{const s=p("tensorListId",t,e,n),r=p("elementShape",t,e,n),a=p("elementDType",t,e,n),o=p("numElements",t,e,n);return[n.getTensorList(s.id).stack(r,a,o)]}case"TensorListFromTensor":{const s=p("tensor",t,e,n),r=p("elementShape",t,e,n),a=p("elementDType",t,e,n),o=hT(s,r,a);return n.addTensorList(o),[o.idTensor]}case"TensorListConcat":case"TensorListConcatV2":{const s=p("tensorListId",t,e,n),r=n.getTensorList(s.id),a=p("dtype",t,e,n),o=p("elementShape",t,e,n);return[r.concat(a,o)]}case"TensorListPushBack":{const s=p("tensorListId",t,e,n),r=p("tensor",t,e,n),a=n.getTensorList(s.id);return a.pushBack(r),[a.idTensor]}case"TensorListPopBack":{const s=p("tensorListId",t,e,n),r=p("elementShape",t,e,n),a=p("elementDType",t,e,n);return[n.getTensorList(s.id).popBack(r,a)]}case"TensorListSplit":{const s=p("tensor",t,e,n),r=p("elementShape",t,e,n),a=p("lengths",t,e,n),o=dT(s,a,r);return n.addTensorList(o),[o.idTensor]}case"TensorListLength":{const s=p("tensorListId",t,e,n),r=n.getTensorList(s.id);return[z(r.size(),"int32")]}case"TensorListResize":{const s=p("tensorListId",t,e,n),r=p("size",t,e,n),o=n.getTensorList(s.id).resize(r);return n.addTensorList(o),[o.idTensor]}default:throw TypeError(`Node type ${t.op} is not implemented`)}};/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function to(t,e,n){const[s,r]=p("fusedOps",t,e,n),a=s==="biasadd",o=!a,i=r==="prelu",u=s==="fusedbatchnorm",c=p("numArgs",t,e,n);if(a){if(i&&c!==2)throw new Error("FusedConv2d and DepthwiseConv2d with BiasAdd and Prelu must have two extra arguments: bias and alpha.");if(!i&&a&&c!==1)throw new Error("FusedConv2d and DepthwiseConv2d with BiasAdd must have one extra argument: bias.")}if(u)throw new Error("FusedConv2d and DepthwiseConv2d with FusedBatchNorm is not supported");const h=p("strides",t,e,n),l=Un(t,e,n),f=p("dataFormat",t,e,n).toUpperCase(),d=p("dilations",t,e,n);let[y,S]=p("args",t,e,n);o&&(S=y,y=void 0);const N=p("leakyreluAlpha",t,e,n);return{stride:h,pad:l,dataFormat:f,dilations:d,biasArg:y,preluArg:S,activationFunc:r,leakyreluAlpha:N}}const gT=(t,e,n,s=ie)=>{switch(t.op){case"Conv1D":{const r=p("stride",t,e,n),a=p("pad",t,e,n),o=p("dataFormat",t,e,n).toUpperCase(),i=p("dilation",t,e,n);return[s.conv1d(p("x",t,e,n),p("filter",t,e,n),r,a,o,i)]}case"Conv2D":{const r=p("strides",t,e,n),a=Un(t,e,n),o=p("dataFormat",t,e,n).toUpperCase(),i=p("dilations",t,e,n);return[s.conv2d(p("x",t,e,n),p("filter",t,e,n),[r[1],r[2]],a,o,[i[1],i[2]])]}case"_FusedConv2D":{const{stride:r,pad:a,dataFormat:o,dilations:i,biasArg:u,preluArg:c,activationFunc:h,leakyreluAlpha:l}=to(t,e,n);return[s.fused.conv2d({x:p("x",t,e,n),filter:p("filter",t,e,n),strides:[r[1],r[2]],pad:a,dataFormat:o,dilations:[i[1],i[2]],bias:u,activation:h,preluActivationWeights:c,leakyreluAlpha:l})]}case"FusedDepthwiseConv2dNative":{const{stride:r,pad:a,dataFormat:o,dilations:i,biasArg:u,preluArg:c,activationFunc:h,leakyreluAlpha:l}=to(t,e,n);return[s.fused.depthwiseConv2d({x:p("x",t,e,n),filter:p("filter",t,e,n),strides:[r[1],r[2]],pad:a,dataFormat:o,dilations:[i[1],i[2]],bias:u,activation:h,preluActivationWeights:c,leakyreluAlpha:l})]}case"Conv2DBackpropInput":case"Conv2dTranspose":{const r=p("outputShape",t,e,n),a=p("strides",t,e,n),o=Un(t,e,n);return[s.conv2dTranspose(p("x",t,e,n),p("filter",t,e,n),r,[a[1],a[2]],o)]}case"DepthwiseConv2dNative":case"DepthwiseConv2d":{const r=p("strides",t,e,n),a=Un(t,e,n),o=p("dilations",t,e,n),i=p("dataFormat",t,e,n).toUpperCase();return[s.depthwiseConv2d(p("input",t,e,n),p("filter",t,e,n),[r[1],r[2]],a,i,[o[1],o[2]])]}case"Conv3D":{const r=p("strides",t,e,n),a=p("pad",t,e,n),o=p("dataFormat",t,e,n).toUpperCase(),i=p("dilations",t,e,n);return[s.conv3d(p("x",t,e,n),p("filter",t,e,n),[r[1],r[2],r[3]],a,o,[i[1],i[2],i[3]])]}case"AvgPool":{const r=p("strides",t,e,n),a=p("pad",t,e,n),o=p("kernelSize",t,e,n);return[s.avgPool(p("x",t,e,n),[o[1],o[2]],[r[1],r[2]],a)]}case"MaxPool":{const r=p("strides",t,e,n),a=p("pad",t,e,n),o=p("kernelSize",t,e,n);return[s.maxPool(p("x",t,e,n),[o[1],o[2]],[r[1],r[2]],a)]}case"MaxPoolWithArgmax":{const r=p("strides",t,e,n),a=p("pad",t,e,n),o=p("kernelSize",t,e,n),i=p("includeBatchInIndex",t,e,n),{result:u,indexes:c}=s.maxPoolWithArgmax(p("x",t,e,n),[o[1],o[2]],[r[1],r[2]],a,i);return[u,c]}case"AvgPool3D":{const r=p("strides",t,e,n),a=p("pad",t,e,n),o=p("kernelSize",t,e,n);return[s.avgPool3d(p("x",t,e,n),[o[1],o[2],o[3]],[r[1],r[2],r[3]],a)]}case"MaxPool3D":{const r=p("strides",t,e,n),a=p("pad",t,e,n),o=p("kernelSize",t,e,n);return[s.maxPool3d(p("x",t,e,n),[o[1],o[2],o[3]],[r[1],r[2],r[3]],a)]}case"Dilation2D":{const r=p("strides",t,e,n),a=p("pad",t,e,n),o=p("dilations",t,e,n),i=r[1],u=r[2],c=o[1],h=o[2];return[s.dilation2d(p("x",t,e,n),p("filter",t,e,n),[i,u],a,[c,h],"NHWC")]}default:throw TypeError(`Node type ${t.op} is not implemented`)}};/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const yT=(t,e,n,s=ie)=>{switch(t.op){case"Fill":{const r=p("shape",t,e,n),a=p("dtype",t,e,n),o=p("value",t,e,n);return[s.fill(r,o,a)]}case"LinSpace":{const r=p("start",t,e,n),a=p("stop",t,e,n),o=p("num",t,e,n);return[s.linspace(r,a,o)]}case"Multinomial":{const r=p("logits",t,e,n),a=p("numSamples",t,e,n),o=p("seed",t,e,n);return[s.multinomial(r,a,o)]}case"OneHot":{const r=p("indices",t,e,n),a=p("depth",t,e,n),o=p("onValue",t,e,n),i=p("offValue",t,e,n),u=p("dtype",t,e,n);return[s.oneHot(r,a,o,i,u)]}case"Ones":return[s.ones(p("shape",t,e,n),p("dtype",t,e,n))];case"OnesLike":return[s.onesLike(p("x",t,e,n))];case"RandomStandardNormal":return[s.randomStandardNormal(p("shape",t,e,n),p("dtype",t,e,n),p("seed",t,e,n))];case"RandomUniform":return[s.randomUniform(p("shape",t,e,n),p("minval",t,e,n),p("maxval",t,e,n),p("dtype",t,e,n))];case"RandomUniformInt":return[s.randomUniformInt(p("shape",t,e,n),p("minval",t,e,n),p("maxval",t,e,n),p("seed",t,e,n))];case"Range":{const r=p("start",t,e,n),a=p("stop",t,e,n),o=p("step",t,e,n);return[s.range(r,a,o,p("dtype",t,e,n))]}case"TruncatedNormal":{const r=p("shape",t,e,n),a=p("mean",t,e,n),o=p("stdDev",t,e,n),i=p("seed",t,e,n);return[s.truncatedNormal(r,a,o,p("dtype",t,e,n),i)]}case"Zeros":return[s.zeros(p("shape",t,e,n),p("dtype",t,e,n))];case"ZerosLike":return[s.zerosLike(p("x",t,e,n))];default:throw TypeError(`Node type ${t.op} is not implemented`)}};/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function As(t,e,n){const s=p("boxes",t,e,n),r=p("scores",t,e,n),a=p("maxOutputSize",t,e,n),o=p("iouThreshold",t,e,n),i=p("scoreThreshold",t,e,n),u=p("softNmsSigma",t,e,n);return{boxes:s,scores:r,maxOutputSize:a,iouThreshold:o,scoreThreshold:i,softNmsSigma:u}}const bT=async(t,e,n,s,r=ie)=>{switch(t.op){case"NonMaxSuppressionV5":{const{boxes:a,scores:o,maxOutputSize:i,iouThreshold:u,scoreThreshold:c,softNmsSigma:h}=As(t,e,n),l=await r.image.nonMaxSuppressionWithScoreAsync(a,o,i,u,c,h);return[l.selectedIndices,l.selectedScores]}case"NonMaxSuppressionV4":{const{boxes:a,scores:o,maxOutputSize:i,iouThreshold:u,scoreThreshold:c}=As(t,e,n),h=p("padToMaxOutputSize",t,e,n),l=await r.image.nonMaxSuppressionPaddedAsync(a,o,i,u,c,h);return[l.selectedIndices,l.validOutputs]}case"NonMaxSuppressionV3":case"NonMaxSuppressionV2":{const{boxes:a,scores:o,maxOutputSize:i,iouThreshold:u,scoreThreshold:c}=As(t,e,n);return[await r.image.nonMaxSuppressionAsync(a,o,i,u,c)]}case"Where":{const a=r.cast(p("condition",t,e,n),"bool"),o=[await r.whereAsync(a)];return a.dispose(),o}case"ListDiff":return r.setdiff1dAsync(p("x",t,e,n),p("y",t,e,n));default:throw TypeError(`Node type ${t.op} is not implemented`)}};/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const wT=(t,e,n,s=ie)=>{switch(t.op){case"LowerBound":{const r=p("sortedSequence",t,e,n),a=p("values",t,e,n);return[s.lowerBound(r,a)]}case"TopKV2":{const r=p("x",t,e,n),a=p("k",t,e,n),o=p("sorted",t,e,n),i=s.topk(r,a,o);return[i.values,i.indices]}case"UpperBound":{const r=p("sortedSequence",t,e,n),a=p("values",t,e,n);return[s.upperBound(r,a)]}case"Unique":{const r=p("x",t,e,n),a=s.unique(r);return[a.values,a.indices]}case"UniqueV2":{const r=p("x",t,e,n),a=p("axis",t,e,n),o=s.unique(r,a);return[o.values,o.indices]}default:throw TypeError(`Node type ${t.op} is not implemented`)}};/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const NT=(t,e,n,s=ie)=>{switch(t.op){case"Const":return e[t.name];case"PlaceholderWithDefault":const r=p("default",t,e,n);return[oe(t.name,e,n)||r];case"Placeholder":return[oe(t.name,e,n)];case"Identity":case"StopGradient":case"FakeQuantWithMinMaxVars":{const h=p("x",t,e,n);return[He(h)]}case"IdentityN":return p("x",t,e,n).map(h=>He(h));case"Snapshot":const a=p("x",t,e,n);return[He(a)];case"Shape":return[s.tensor1d(p("x",t,e,n).shape,"int32")];case"ShapeN":return p("x",t,e,n).map(h=>s.tensor1d(h.shape));case"Size":return[s.scalar(p("x",t,e,n).size,"int32")];case"Rank":return[s.scalar(p("x",t,e,n).rank,"int32")];case"NoOp":return[s.scalar(1)];case"Print":const o=p("x",t,e,n),i=p("data",t,e,n),u=p("message",t,e,n),c=p("summarize",t,e,n);console.warn("The graph has a tf.print() operation,usually used for debugging, which slows down performance."),console.log(u);for(let h=0;h<i.length;h++)console.log(Array.prototype.slice.call(i[h].dataSync()).slice(0,c));return[o];default:throw TypeError(`Node type ${t.op} is not implemented`)}};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class ST{get id(){return this.handle.id}constructor(e,n){this.keyDType=e,this.valueDType=n,this.handle=z(0),this.tensorMap=new Map,De(this.handle)}clearAndClose(){this.tensorMap.forEach(e=>e.dispose()),this.tensorMap.clear(),this.handle.dispose()}size(){return this.tensorMap.size}tensorSize(){return z(this.size(),"int32")}async import(e,n){this.checkKeyAndValueTensor(e,n);const s=await e.data();return this.tensorMap.forEach(r=>r.dispose()),this.tensorMap.clear(),W(()=>{const r=ft(n),a=s.length,o=r.length;g(a===o,()=>`The number of elements doesn't match, keys has ${a} elements, the values has ${o} elements.`);for(let i=0;i<a;i++){const u=s[i],c=r[i];De(c),this.tensorMap.set(u,c)}return this.handle})}async find(e,n){this.checkKeyAndValueTensor(e,n);const s=await e.data();return W(()=>{const r=[];for(let a=0;a<s.length;a++){const o=s[a],i=this.findWithDefault(o,n);r.push(i)}return je(r)})}findWithDefault(e,n){const s=this.tensorMap.get(e);return s??n}checkKeyAndValueTensor(e,n){if(e.dtype!==this.keyDType)throw new Error(`Expect key dtype ${this.keyDType}, but got ${e.dtype}`);if(n.dtype!==this.valueDType)throw new Error(`Expect value dtype ${this.valueDType}, but got ${n.dtype}`)}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const TT=async(t,e,n,s)=>{switch(t.op){case"HashTable":case"HashTableV2":{const r=s.getHashTableHandleByName(t.name);if(r!=null)return[r];{const a=p("keyDType",t,e,n),o=p("valueDType",t,e,n),i=new ST(a,o);return s.addHashTable(t.name,i),[i.handle]}}case"InitializeTable":case"InitializeTableV2":case"LookupTableImport":case"LookupTableImportV2":{const r=p("tableHandle",t,e,n,s),a=p("keys",t,e,n),o=p("values",t,e,n);return[await s.getHashTableById(r.id).import(a,o)]}case"LookupTableFind":case"LookupTableFindV2":{const r=p("tableHandle",t,e,n,s),a=p("keys",t,e,n),o=p("defaultValue",t,e,n);return[await s.getHashTableById(r.id).find(a,o)]}case"LookupTableSize":case"LookupTableSizeV2":{const r=p("tableHandle",t,e,n,s);return[s.getHashTableById(r.id).tensorSize()]}default:throw TypeError(`Node type ${t.op} is not implemented`)}};/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const $T=(t,e,n,s=ie)=>{switch(t.op){case"ResizeBilinear":{const r=p("images",t,e,n),a=p("size",t,e,n),o=p("alignCorners",t,e,n),i=p("halfPixelCenters",t,e,n);return[s.image.resizeBilinear(r,[a[0],a[1]],o,i)]}case"ResizeNearestNeighbor":{const r=p("images",t,e,n),a=p("size",t,e,n),o=p("alignCorners",t,e,n),i=p("halfPixelCenters",t,e,n);return[s.image.resizeNearestNeighbor(r,[a[0],a[1]],o,i)]}case"CropAndResize":{const r=p("image",t,e,n),a=p("boxes",t,e,n),o=p("boxInd",t,e,n),i=p("cropSize",t,e,n),u=p("method",t,e,n),c=p("extrapolationValue",t,e,n);return[s.image.cropAndResize(r,a,o,i,u,c)]}case"ImageProjectiveTransformV3":{const r=p("images",t,e,n),a=p("transforms",t,e,n),o=p("outputShape",t,e,n),i=p("fillValue",t,e,n),u=p("interpolation",t,e,n),c=p("fillMode",t,e,n);return[s.image.transform(r,a,u.toLowerCase(),c.toLowerCase(),i,o)]}default:throw TypeError(`Node type ${t.op} is not implemented`)}};/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const ET=(t,e,n,s=ie)=>{switch(t.op){case"Equal":return[s.equal(p("a",t,e,n),p("b",t,e,n))];case"NotEqual":return[s.notEqual(p("a",t,e,n),p("b",t,e,n))];case"Greater":return[s.greater(p("a",t,e,n),p("b",t,e,n))];case"GreaterEqual":return[s.greaterEqual(p("a",t,e,n),p("b",t,e,n))];case"Less":return[s.less(p("a",t,e,n),p("b",t,e,n))];case"LessEqual":return[s.lessEqual(p("a",t,e,n),p("b",t,e,n))];case"LogicalAnd":return[s.logicalAnd(p("a",t,e,n),p("b",t,e,n))];case"LogicalNot":return[s.logicalNot(p("a",t,e,n))];case"LogicalOr":return[s.logicalOr(p("a",t,e,n),p("b",t,e,n))];case"Select":case"SelectV2":return[s.where(p("condition",t,e,n),p("a",t,e,n),p("b",t,e,n))];case"BitwiseAnd":return[s.bitwiseAnd(p("a",t,e,n),p("b",t,e,n))];default:throw TypeError(`Node type ${t.op} is not implemented`)}};/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const kT=(t,e,n,s=ie)=>{switch(t.op){case"BatchMatMul":case"BatchMatMulV2":case"MatMul":return[s.matMul(p("a",t,e,n),p("b",t,e,n),p("transposeA",t,e,n),p("transposeB",t,e,n))];case"Einsum":return[s.einsum(p("equation",t,e,n),...p("tensors",t,e,n))];case"Transpose":return[s.transpose(p("x",t,e,n),p("perm",t,e,n))];case"_FusedMatMul":const[r,a]=p("fusedOps",t,e,n),o=r==="biasadd",i=a==="prelu",u=p("numArgs",t,e,n),c=p("leakyreluAlpha",t,e,n);if(o){if(i&&u!==2)throw new Error("Fused MatMul with BiasAdd and Prelu must have two extra arguments: bias and alpha.");if(!i&&u!==1)throw new Error("Fused MatMul with BiasAdd must have one extra argument: bias.")}const[h,l]=p("args",t,e,n);return[s.fused.matMul({a:p("a",t,e,n),b:p("b",t,e,n),transposeA:p("transposeA",t,e,n),transposeB:p("transposeB",t,e,n),bias:h,activation:a,preluActivationWeights:l,leakyreluAlpha:c})];case"MatrixBandPart":return[s.linalg.bandPart(p("a",t,e,n),p("numLower",t,e,n),p("numUpper",t,e,n))];default:throw TypeError(`Node type ${t.op} is not implemented`)}};/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const vT=(t,e,n,s=ie)=>{switch(t.op){case"EuclideanNorm":return[s.euclideanNorm(p("x",t,e,n),p("axis",t,e,n),p("keepDims",t,e,n))];case"FusedBatchNorm":case"FusedBatchNormV2":return[s.batchNorm(p("x",t,e,n),p("mean",t,e,n),p("variance",t,e,n),p("offset",t,e,n),p("scale",t,e,n),p("epsilon",t,e,n))];case"FusedBatchNormV3":return[s.batchNorm(p("x",t,e,n),p("mean",t,e,n),p("variance",t,e,n),p("offset",t,e,n),p("scale",t,e,n),p("epsilon",t,e,n))];case"LRN":return[s.localResponseNormalization(p("x",t,e,n),p("radius",t,e,n),p("bias",t,e,n),p("alpha",t,e,n),p("beta",t,e,n))];case"Softmax":return[s.softmax(p("x",t,e,n))];case"LogSoftmax":return[s.logSoftmax(p("x",t,e,n))];default:throw TypeError(`Node type ${t.op} is not implemented`)}};/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const _T=(t,e,n,s=ie)=>{switch(t.op){case"RaggedGather":{const{outputNestedSplits:r,outputDenseValues:a}=s.raggedGather(p("paramsNestedSplits",t,e,n),p("paramsDenseValues",t,e,n),p("indices",t,e,n),p("outputRaggedRank",t,e,n));return r.concat(a)}case"RaggedRange":{const{rtNestedSplits:r,rtDenseValues:a}=s.raggedRange(p("starts",t,e,n),p("limits",t,e,n),p("splits",t,e,n));return[r,a]}case"RaggedTensorToTensor":return[s.raggedTensorToTensor(p("shape",t,e,n),p("values",t,e,n),p("defaultValue",t,e,n),p("rowPartitionTensors",t,e,n),p("rowPartitionTypes",t,e,n))];default:throw TypeError(`Node type ${t.op} is not implemented`)}};/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const IT=(t,e,n,s=ie)=>{switch(t.op){case"Max":{const i=p("axis",t,e,n),u=p("keepDims",t,e,n);return[s.max(p("x",t,e,n),i,u)]}case"Mean":{const i=p("axis",t,e,n),u=p("keepDims",t,e,n);return[s.mean(p("x",t,e,n),i,u)]}case"Min":{const i=p("axis",t,e,n),u=p("keepDims",t,e,n);return[s.min(p("x",t,e,n),i,u)]}case"Sum":{const i=p("axis",t,e,n),u=p("keepDims",t,e,n);return[s.sum(p("x",t,e,n),i,u)]}case"All":{const i=p("axis",t,e,n),u=p("keepDims",t,e,n);return[s.all(p("x",t,e,n),i,u)]}case"Any":{const i=p("axis",t,e,n),u=p("keepDims",t,e,n);return[s.any(p("x",t,e,n),i,u)]}case"ArgMax":{const i=p("axis",t,e,n);return[s.argMax(p("x",t,e,n),i)]}case"ArgMin":{const i=p("axis",t,e,n);return[s.argMin(p("x",t,e,n),i)]}case"Prod":{const i=p("axis",t,e,n),u=p("keepDims",t,e,n);return[s.prod(p("x",t,e,n),i,u)]}case"Cumprod":{const i=p("axis",t,e,n),u=p("exclusive",t,e,n),c=p("reverse",t,e,n);return[s.cumprod(p("x",t,e,n),i,u,c)]}case"Cumsum":{const i=p("axis",t,e,n),u=p("exclusive",t,e,n),c=p("reverse",t,e,n);return[s.cumsum(p("x",t,e,n),i,u,c)]}case"Bincount":const r=p("x",t,e,n),a=p("weights",t,e,n),o=p("size",t,e,n);return[s.bincount(r,a,o)];case"DenseBincount":{const i=p("x",t,e,n),u=p("weights",t,e,n),c=p("size",t,e,n),h=p("binaryOutput",t,e,n);return[s.denseBincount(i,u,c,h)]}default:throw TypeError(`Node type ${t.op} is not implemented`)}};/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const xT=(t,e,n,s=ie)=>{switch(t.op){case"ConcatV2":case"Concat":{const r=p("n",t,e,n),a=p("axis",t,e,n);let o=p("tensors",t,e,n);return o=o.slice(0,r),[s.concat(o,a)]}case"Gather":{const r=p("x",t,e,n),a=p("indices",t,e,n);return[s.gather(r,s.cast(a,"int32"),0)]}case"GatherV2":{const r=p("axis",t,e,n),a=p("batchDims",t,e,n),o=p("x",t,e,n),i=p("indices",t,e,n);return[s.gather(o,s.cast(i,"int32"),r,a)]}case"Reverse":{const r=p("dims",t,e,n),a=[];for(let i=0;i<r.length;i++)r[i]&&a.push(i);const o=p("x",t,e,n);return[s.reverse(o,a)]}case"ReverseV2":{const r=p("axis",t,e,n),a=p("x",t,e,n);return[s.reverse(a,r)]}case"Slice":{const r=p("begin",t,e,n),a=p("size",t,e,n);return[s.slice(p("x",t,e,n),r,a)]}case"StridedSlice":{const r=p("begin",t,e,n),a=p("end",t,e,n),o=p("strides",t,e,n),i=p("beginMask",t,e,n),u=p("endMask",t,e,n),c=p("ellipsisMask",t,e,n),h=p("newAxisMask",t,e,n),l=p("shrinkAxisMask",t,e,n),f=p("x",t,e,n);return[s.stridedSlice(f,r,a,o,i,u,c,h,l)]}case"Pack":return W(()=>{const r=p("axis",t,e,n),a=p("tensors",t,e,n),o=a[0].shape,i=s.squeeze(a[0]).shape,u=a.map(c=>{const h=Re(c.shape,o);if(!h&&!Re(s.squeeze(c).shape,i))throw new Error("the input tensors shape does not match");return h?c:s.reshape(c,o)});return[s.stack(u,r)]});case"Unpack":{const r=p("axis",t,e,n),a=p("tensor",t,e,n);return s.unstack(a,r)}case"Tile":{const r=p("reps",t,e,n);return[s.tile(p("x",t,e,n),r)]}case"Split":case"SplitV":{const r=p("axis",t,e,n),a=p("numOrSizeSplits",t,e,n),o=p("x",t,e,n);return s.split(o,a,r)}case"ScatterNd":{const r=p("indices",t,e,n),a=p("values",t,e,n),o=p("shape",t,e,n);return[s.scatterND(r,a,o)]}case"GatherNd":{const r=p("x",t,e,n),a=p("indices",t,e,n);return[s.gatherND(r,a)]}case"SparseToDense":{const r=p("sparseIndices",t,e,n),a=p("outputShape",t,e,n),o=p("sparseValues",t,e,n),i=p("defaultValue",t,e,n);return[s.sparseToDense(r,o,a,o.dtype===i.dtype?i:s.cast(i,o.dtype))]}case"TensorScatterUpdate":{const r=p("indices",t,e,n),a=p("values",t,e,n),o=p("tensor",t,e,n);return[s.tensorScatterUpdate(o,r,a)]}default:throw TypeError(`Node type ${t.op} is not implemented`)}};/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const AT=(t,e,n,s=ie)=>{switch(t.op){case"SparseFillEmptyRows":{const{outputIndices:r,outputValues:a,emptyRowIndicator:o,reverseIndexMap:i}=s.sparse.sparseFillEmptyRows(p("indices",t,e,n),p("values",t,e,n),p("denseShape",t,e,n),p("defaultValue",t,e,n));return[r,a,o,i]}case"SparseReshape":{const{outputIndices:r,outputShape:a}=s.sparse.sparseReshape(p("inputIndices",t,e,n),p("inputShape",t,e,n),p("newShape",t,e,n));return[r,a]}case"SparseSegmentMean":return[s.sparse.sparseSegmentMean(p("data",t,e,n),p("indices",t,e,n),p("segmentIds",t,e,n))];case"SparseSegmentSum":return[s.sparse.sparseSegmentSum(p("data",t,e,n),p("indices",t,e,n),p("segmentIds",t,e,n))];default:throw TypeError(`Node type ${t.op} is not implemented`)}};/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const OT=(t,e,n,s=ie)=>{switch(t.op){case"FFT":return[s.fft(p("x",t,e,n))];case"IFFT":return[s.ifft(p("x",t,e,n))];case"RFFT":return[s.rfft(p("x",t,e,n))];case"IRFFT":return[s.irfft(p("x",t,e,n))];default:throw TypeError(`Node type ${t.op} is not implemented`)}};/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const DT=(t,e,n,s=ie)=>{switch(t.op){case"StaticRegexReplace":return[s.string.staticRegexReplace(p("input",t,e,n),p("pattern",t,e,n),p("rewrite",t,e,n),p("replaceGlobal",t,e,n))];case"StringNGrams":{const{nGrams:r,nGramsSplits:a}=s.string.stringNGrams(p("data",t,e,n),p("dataSplits",t,e,n),p("separator",t,e,n),p("nGramWidths",t,e,n),p("leftPad",t,e,n),p("rightPad",t,e,n),p("padWidth",t,e,n),p("preserveShortSequences",t,e,n));return[r,a]}case"StringSplit":{const{indices:r,values:a,shape:o}=s.string.stringSplit(p("input",t,e,n),p("delimiter",t,e,n),p("skipEmpty",t,e,n));return[r,a,o]}case"StringToHashBucketFast":return[s.string.stringToHashBucketFast(p("input",t,e,n),p("numBuckets",t,e,n))];default:throw TypeError(`Node type ${t.op} is not implemented`)}};/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const FT=(t,e,n,s=ie)=>{switch(t.op){case"Cast":return[s.cast(p("x",t,e,n),p("dtype",t,e,n))];case"ExpandDims":{const r=p("axis",t,e,n);return[s.expandDims(p("x",t,e,n),r)]}case"Squeeze":{const r=p("axis",t,e,n);return[s.squeeze(p("x",t,e,n),r)]}case"Reshape":return[s.reshape(p("x",t,e,n),p("shape",t,e,n))];case"EnsureShape":return[s.ensureShape(p("x",t,e,n),p("shape",t,e,n))];case"MirrorPad":return[s.mirrorPad(p("x",t,e,n),p("padding",t,e,n),p("mode",t,e,n))];case"PadV2":case"Pad":return[s.pad(p("x",t,e,n),p("padding",t,e,n),p("constantValue",t,e,n))];case"SpaceToBatchND":{const r=p("blockShape",t,e,n),a=p("paddings",t,e,n);return[s.spaceToBatchND(p("x",t,e,n),r,a)]}case"BatchToSpaceND":{const r=p("blockShape",t,e,n),a=p("crops",t,e,n);return[s.batchToSpaceND(p("x",t,e,n),r,a)]}case"DepthToSpace":{const r=p("blockSize",t,e,n),a=p("dataFormat",t,e,n).toUpperCase();return[s.depthToSpace(p("x",t,e,n),r,a)]}case"BroadcastTo":return[s.broadcastTo(p("x",t,e,n),p("shape",t,e,n))];case"BroadcastArgs":return[s.broadcastArgs(p("s0",t,e,n),p("s1",t,e,n))];default:throw TypeError(`Node type ${t.op} is not implemented`)}};/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function no(t,e,n,s,r=W){const a=((o,i,u)=>{switch(o.category){case"arithmetic":return r(()=>uT(o,i,u));case"basic_math":return r(()=>cT(o,i,u));case"control":return mT(o,i,u);case"convolution":return r(()=>gT(o,i,u));case"creation":return r(()=>yT(o,i,u));case"dynamic":return bT(o,i,u);case"evaluation":return r(()=>wT(o,i,u));case"image":return r(()=>$T(o,i,u));case"graph":return r(()=>NT(o,i,u));case"logical":return r(()=>ET(o,i,u));case"matrices":return r(()=>kT(o,i,u));case"normalization":return r(()=>vT(o,i,u));case"ragged":return r(()=>_T(o,i,u));case"reduction":return r(()=>IT(o,i,u));case"slice_join":return r(()=>xT(o,i,u));case"sparse":return r(()=>AT(o,i,u));case"spectral":return r(()=>OT(o,i,u));case"string":return r(()=>DT(o,i,u));case"transformation":return r(()=>FT(o,i,u));case"hash_table":return TT(o,i,u,s);case"custom":const c=Cp(o.op);if(c&&c.customExecutor)return c.customExecutor(new iT(o,i,u));throw TypeError(`Custom op ${o.op} is not registered.`);default:throw TypeError(`Unknown op '${o.op}'. File an issue at https://github.com/tensorflow/tfjs/issues so we can add it, or register a custom execution with tf.registerOp()`)}})(t,e,n);return it(a)?a.then(o=>[].concat(o)):[].concat(a)}class so{constructor(e={},n={},s={},r={},a){this.weightMap=e,this.tensorArrayMap=n,this.tensorListMap=s,this.functionMap=r,this.parseNodeNameCache=a,this.rootContext={id:0,frameName:"",iterationId:0},this.contexts=[this.rootContext],this.lastId=0,this.generateCurrentContextIds()}newFrame(e,n){return{id:e,frameName:n,iterationId:0}}set currentContext(e){this.contexts!==e&&(this.contexts=e,this.generateCurrentContextIds())}get currentContext(){return this.contexts}get currentContextId(){return this._currentContextIds[0]}get currentContextIds(){return this._currentContextIds}generateCurrentContextIds(){const e=[];for(let n=0;n<this.contexts.length-1;n++){const s=this.contexts.slice(0,this.contexts.length-n);e.push(this.contextIdforContexts(s))}e.push(""),this._currentContextIds=e}contextIdforContexts(e){return e?e.map(n=>n.id===0&&n.iterationId===0?"":`${n.frameName}-${n.iterationId}`).join("/"):""}enterFrame(e){this.contexts&&(this.lastId++,this.contexts=this.contexts.slice(),this.contexts.push(this.newFrame(this.lastId,e)),this._currentContextIds.unshift(this.contextIdforContexts(this.contexts)))}exitFrame(){if(this.contexts&&this.contexts.length>1)this.contexts=this.contexts.slice(),this.contexts.splice(-1),this.currentContextIds.shift();else throw new Error("Cannot exit frame, the context is empty")}nextIteration(){if(this.contexts&&this.contexts.length>0){this.contexts=this.contexts.slice(),this.lastId++;const e=Object.assign({},this.contexts[this.contexts.length-1]);e.iterationId+=1,e.id=this.lastId,this.contexts.splice(-1,1,e),this._currentContextIds.splice(0,1,this.contextIdforContexts(this.contexts))}else throw new Error("Cannot increase frame iteration, the context is empty")}getWeight(e){return this.weightMap[e]}addTensorArray(e){this.tensorArrayMap[e.id]=e}getTensorArray(e){return this.tensorArrayMap[e]}addTensorList(e){this.tensorListMap[e.id]=e}getTensorList(e){return this.tensorListMap[e]}dispose(e){for(const n in this.tensorArrayMap)this.tensorArrayMap[n].clearAndClose(e);for(const n in this.tensorListMap)this.tensorListMap[n].clearAndClose(e)}}/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ro(t,e,n,s){const r=new Set,a=[];let o=null,i=null;const u=new Set,c=new Set(Object.keys(t).map(f=>ye(f)[0]));s=s||[];const h=new Set(s.map(f=>ye(f.name)[0])),l=[...e];for(;l.length>0;){const f=l.pop();if((wt(f)||WT(f)||MT(f))&&o==null&&(o=f,i=o.children.map(d=>d.name).filter(d=>r.has(d))),r.add(f.name),n[f.name]==null&&!c.has(f.name)&&!h.has(f.name)){if(f.inputs.length===0){a.push(f.name);continue}f.inputs.forEach(d=>{u.has(d.name)||(u.add(d.name),l.push(d))})}}return{inputs:t,outputs:e,usedNodes:r,missingInputs:a,dynamicNode:o,syncInputs:i}}function CT(t,e){const{usedNodes:n,inputs:s}=e,r=Object.keys(s).map(N=>ye(N)[0]).map(N=>t.nodes[N]),a=t.initNodes||[],o=N=>n.has(typeof N=="string"?N:N.name);function i(N){return[...new Map(N.map(T=>[T.name,T])).values()]}const u=i([...r,...t.weights,...a]).filter(o),c=i([...u,...Object.values(t.nodes)]).filter(o),h=new Map(c.map(N=>[N.name,N])),l={};for(const N of c){l[N.name]=l[N.name]||0;for(const T of N.children)o(T)||(l[T.name]=Number.POSITIVE_INFINITY),l[T.name]=(l[T.name]||0)+1}const f=Object.entries(l).filter(([,N])=>N===0).map(([N])=>N),d=[...f];for(;f.length>0;){const N=f.pop(),T=h.get(N);for(const A of T.children.filter(o))--l[A.name]===0&&(d.push(A.name),f.push(A.name))}const y=d.map(N=>h.get(N)),S=RT(y,u);return LT(S,u),S}function RT(t,e){const n=new Map(t.map(o=>[o.name,o])),s=e.map(o=>o.name),r=new Set(s);for(;s.length>0;){const o=s.pop(),i=n.get(o);for(const u of i.children)!n.has(u.name)||r.has(u.name)||(r.add(u.name),s.push(u.name))}return t.filter(o=>r.has(o.name))}class Vn extends Error{constructor(e){super(`NodesExecutionOrderError: ${e}`)}}function LT(t,e){const n=new Map(t.map((i,u)=>[i.name,u])),s=new Set(e.map(i=>i.name)),r=i=>s.has(typeof i=="string"?i:i.name),a=new Set(t.map(i=>i.name)),o=i=>a.has(typeof i=="string"?i:i.name);for(const i of t){for(const u of i.children.filter(o)){if(!n.has(u.name))throw new Vn(`Child ${u.name} of node ${i.name} is unreachable.`);if(n.get(i.name)>n.get(u.name))throw new Vn(`Node ${i.name} is scheduled to run after its child ${u.name}.`)}if(!r(i))for(const u of i.inputs){if(!n.has(u.name))throw new Vn(`Input ${u.name} of node ${i.name} is unreachable.`);if(n.get(u.name)>n.get(i.name))throw new Vn(`Node ${i.name} is scheduled to run before its input ${u.name}.`)}}}function BT(t){const e=new Map(t.map((i,u)=>[i.name,u])),n=Number.MAX_SAFE_INTEGER,s=t.map((i,u)=>wt(i)?n:u),r=i=>{const u=s[e.get(i.name)];return u??-1},a=t.map((i,u)=>i.children.map(r).reduce((c,h)=>Math.max(c,h),s[u])),o=new Map;for(let i=0;i<t.length;++i){const u=a[i];if(u===n)continue;const c=t[i],h=t[u];o.has(h.name)||o.set(h.name,[]),o.get(h.name).push(c)}return o}const PT=new Set(["Switch","Merge","Enter","Exit","NextIteration","StatelessIf","StatelessWhile","if","While"]),zT=new Set(["NonMaxSuppressionV2","NonMaxSuppressionV3","NonMaxSuppressionV5","Where"]),VT=new Set(["HashTable","HashTableV2","LookupTableImport","LookupTableImportV2","LookupTableFind","LookupTableFindV2","LookupTableSize","LookupTableSizeV2"]);function wt(t){return PT.has(t.op)}function WT(t){return zT.has(t.op)}function MT(t){return VT.has(t.op)}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class as{get weightIds(){return this.parent?this.parent.weightIds:this._weightIds}get functionExecutorMap(){return this.parent?this.parent.functionExecutorMap:this._functionExecutorMap}get weightMap(){return this.parent?this.parent.weightMap:this._weightMap}set weightMap(e){const n=Object.keys(e).map(s=>e[s].map(r=>r.id));this._weightIds=[].concat(...n),this._weightMap=e}set resourceManager(e){this._resourceManager=e}get inputs(){return this._inputs.map(e=>({name:e.name,shape:e.attrParams.shape?e.attrParams.shape.value:void 0,dtype:e.attrParams.dtype?e.attrParams.dtype.value:void 0}))}get outputs(){return this._outputs.map(e=>({name:e.name,shape:e.attrParams.shape?e.attrParams.shape.value:void 0,dtype:e.attrParams.dtype?e.attrParams.dtype.value:void 0}))}get inputNodes(){return this._inputs.map(e=>e.signatureKey||e.name)}get outputNodes(){return this._outputs.map(e=>{const n=e.signatureKey||e.name;return e.defaultOutput?`${n}:${e.defaultOutput}`:n})}get functions(){return Object.keys(this._functions).reduce((e,n)=>(e[n]=this._functions[n].signature,e),{})}constructor(e,n){this.graph=e,this.parent=n,this.compiledMap=new Map,this.parseNodeNameCache=new Map,this._weightMap={},this.SEPARATOR=",",this._functions={},this._functionExecutorMap={},this.keepIntermediateTensors=!1,this._outputs=e.outputs,this._inputs=e.inputs,this._initNodes=e.initNodes,this._signature=e.signature,this._functions=e.functions,e.functions!=null&&Object.keys(e.functions).forEach(s=>{this._functionExecutorMap[s]=new as(e.functions[s],this)})}getCompilationKey(e,n){const s=e.map(a=>a.name).sort(),r=n.map(a=>a.name).sort();return s.join(this.SEPARATOR)+"--"+r.join(this.SEPARATOR)}compile(e,n){const s=ro(e,n,this.weightMap,this._initNodes),{missingInputs:r,dynamicNode:a,syncInputs:o}=s;if(a!=null)throw new Error(`This execution contains the node '${a.name}', which has the dynamic op '${a.op}'. Please use model.executeAsync() instead. Alternatively, to avoid the dynamic ops, specify the inputs [${o}]`);if(r.length>0){const c=n.map(l=>l.name),h=Object.keys(e);throw new Error(`Cannot compute the outputs [${c}] from the provided inputs [${h}]. Missing the following inputs: [${r}]`)}const i=CT(this.graph,s),u=BT(i);return{orderedNodes:i,nodeLiveUntilMap:u}}cloneAndKeepTensor(e){if(e==null)return null;const n=e.clone();return De(n),n}cloneTensorList(e){return e?e.map(s=>this.cloneAndKeepTensor(s)):null}cloneTensorMap(e){return Object.fromEntries(Object.entries(e).map(([n,s])=>[n,this.cloneTensorList(s)]))}execute(e,n){this.disposeIntermediateTensors(),e=this.mapInputs(e);const s=Object.keys(e).sort();this.checkInputs(e),this.checkInputShapeAndType(e),n=this.mapOutputs(n),this.checkOutputs(n);const r=s.map(f=>this.graph.nodes[ye(f)[0]]),a=n.map(f=>ye(f)[0]),o=new Set(a);let i=a.map(f=>this.graph.nodes[f]);i.length===0&&(i=this._outputs);const u=this.getCompilationKey(r,i);let c=this.compiledMap.get(u);c==null&&(c=this.compile(e,i),this.compiledMap.set(u,c));try{this.keepIntermediateTensors=R().getBool("KEEP_INTERMEDIATE_TENSORS")}catch(f){this.keepIntermediateTensors=!1,console.warn(f.message)}const h={},l={};return W(()=>{const f=new so(this.weightMap,h,l,this.functionExecutorMap,this.parseNodeNameCache),d=Object.assign({},this.weightMap);this.keepIntermediateTensors&&(this.clonedTensorsMap=this.cloneTensorMap(this.weightMap)),Object.keys(e).forEach(T=>{const[A,E]=ye(T,f),k=[];k[E]=e[T],d[A]=k,this.keepIntermediateTensors&&(this.clonedTensorsMap[A]=this.cloneTensorList(k))});const y=this.getFrozenTensorIds(d),{orderedNodes:S,nodeLiveUntilMap:N}=c;for(const T of S){if(d[T.name])continue;const A=no(T,d,f,this._resourceManager);if(it(A))throw new Error(`The execution of the op '${T.op}' returned a promise. Please use model.executeAsync() instead.`);d[T.name]=A,this.keepIntermediateTensors&&(this.clonedTensorsMap[T.name]=this.cloneTensorList(A)),this.checkTensorForDisposalWithNodeLiveUntilInfo(T,d,f,y,o,N.get(T.name))}return this.parent==null&&f.dispose(y),n.map(T=>oe(T,d,f))})}getFrozenTensorIds(e){const n=[].concat.apply([],Object.keys(e).map(s=>e[s]).map(s=>s.map(r=>r.id)));return new Set(n)}checkTensorForDisposal(e,n,s,r,a,o,i){if(!(wt(n)||o.has(e))){for(const u of s[e])u!=null&&(i[u.id]=(i[u.id]||0)+n.children.length);for(const u of n.inputs){if(wt(u))continue;const c=Ja(u.name,s,r);if(c!=null)for(const h of c){if(!h||h.kept||a.has(h.id))continue;const l=i[h.id];l===1?(h.dispose(),delete i[h.id]):l!=null&&i[h.id]--}}}}checkTensorForDisposalWithNodeLiveUntilInfo(e,n,s,r,a,o){function i(u){return wt(u)||a.has(u.name)}if(!(wt(e)||o==null))for(const u of o){if(i(u))continue;const c=Ja(u.name,n,s);for(const h of c)!h||h.kept||r.has(h.id)||h.dispose()}}async executeAsync(e,n){return this._executeAsync(e,n)}disposeIntermediateTensors(){this.clonedTensorsMap&&(Object.values(this.clonedTensorsMap).forEach(e=>{for(const n of e)n&&!n.isDisposed&&n.dispose()}),this.clonedTensorsMap=null)}getIntermediateTensors(){return this.clonedTensorsMap}async _executeAsync(e,n,s=!1,r={},a={}){this.disposeIntermediateTensors(),s||(e=this.mapInputs(e),this.checkInputs(e),this.checkInputShapeAndType(e),n=this.mapOutputs(n),this.checkOutputs(n));try{this.keepIntermediateTensors=R().getBool("KEEP_INTERMEDIATE_TENSORS")}catch(f){this.keepIntermediateTensors=!1,console.warn(f.message)}const o=new so(this.weightMap,r,a,this.functionExecutorMap,this.parseNodeNameCache);this.keepIntermediateTensors&&(this.clonedTensorsMap=this.cloneTensorMap(this.weightMap));const i=await this.executeWithControlFlow(e,o,n,s),u=n.map(f=>oe(f,i,o)),c=u.map(f=>f.id),h=Object.keys(e).map(f=>e[f].id),l=new Set([...c,...h,...this.weightIds]);return Object.values(i).forEach(f=>{f.forEach(d=>{d&&!d.isDisposed&&!l.has(d.id)&&d.dispose()})}),this.parent==null&&o.dispose(l),u}async executeFunctionAsync(e,n,s){const r=e.reduce((a,o,i)=>(a[this.inputs[i].name]=o,a),{});return this._executeAsync(r,this.outputNodes,!0,n,s)}async executeWithControlFlow(e,n,s,r){const a=Object.keys(e),o=a.map(k=>this.graph.nodes[ye(k)[0]]),i=s.map(k=>ye(k)[0]),u=new Set(i);let c=i.map(k=>this.graph.nodes[k]);c.length===0&&(c=this._outputs);const{usedNodes:h,missingInputs:l,dynamicNode:f,syncInputs:d}=ro(e,c,this.weightMap,this._initNodes),y=[...o,...this.graph.weights,...this._initNodes||[]].map(k=>({node:k,contexts:n.currentContext})),S=Object.assign({},this.weightMap);Object.keys(e).forEach(k=>{const[v,x]=ye(k),O=[];O[x]=e[k],S[v]=O});const N={},T=this.getFrozenTensorIds(S),A={};for(;y.length>0;){const k=this.processStack(o,y,n,S,A,T,u,N,h);await Promise.all(k)}f==null&&!r&&console.warn("This model execution did not contain any nodes with control flow or dynamic output shapes. You can use model.execute() instead.");const E=c.filter(k=>!wt(k)&&!oe(k.name,S,n)).map(k=>k.name);if(E.length>0){let k="";throw f!=null&&(k=`Alternatively, to avoid the dynamic ops, use model.execute() and specify the inputs [${d}]`),new Error(`Cannot compute the outputs [${E}] from the provided inputs [${a}]. Consider providing the following inputs: [${l}]. ${k}`)}return S}processStack(e,n,s,r,a,o,i,u,c){const h=[];for(;n.length>0;){const l=n.pop();s.currentContext=l.contexts;let f="";if(l.node.op==="Enter"&&p("isConstant",l.node,r,s)&&([f]=Ge(l.node.name,s)),r[l.node.name]==null){const d=no(l.node,r,s,this._resourceManager);f||([f]=Ge(l.node.name,s));const y=s.currentContext;it(d)?h.push(d.then(S=>(r[f]=S,this.keepIntermediateTensors&&(this.clonedTensorsMap[f]=this.cloneTensorList(S)),s.currentContext=y,this.checkTensorForDisposal(f,l.node,r,s,o,i,u),this.processChildNodes(l.node,n,s,r,a,c),S))):(r[f]=d,this.keepIntermediateTensors&&(this.clonedTensorsMap[f]=this.cloneTensorList(d)),this.checkTensorForDisposal(f,l.node,r,s,o,i,u),this.processChildNodes(l.node,n,s,r,a,c))}else this.processChildNodes(l.node,n,s,r,a,c)}return h}processChildNodes(e,n,s,r,a,o){e.children.forEach(i=>{const[u]=Ge(i.name,s);a[u]||!o.has(i.name)||(i.op==="Merge"?i.inputNames.some(c=>!!oe(c,r,s))&&(a[u]=!0,n.push({contexts:s.currentContext,node:i})):i.inputNames.every(c=>!!oe(c,r,s))&&(a[u]=!0,n.push({contexts:s.currentContext,node:i})))})}dispose(){Object.keys(this.weightMap).forEach(e=>this.weightMap[e].forEach(n=>n.dispose()))}checkInputShapeAndType(e){Object.keys(e).forEach(n=>{const s=e[n],[r]=ye(n),a=this.graph.nodes[r];if(a.attrParams.shape&&a.attrParams.shape.value){const o=a.attrParams.shape.value,i=o.length===s.shape.length&&s.shape.every((u,c)=>o[c]===-1||o[c]===u);g(i,()=>`The shape of dict['${a.name}'] provided in model.execute(dict) must be [${o}], but was [${s.shape}]`)}a.attrParams.dtype&&a.attrParams.dtype.value&&g(s.dtype===a.attrParams.dtype.value,()=>`The dtype of dict['${a.name}'] provided in model.execute(dict) must be ${a.attrParams.dtype.value}, but was ${s.dtype}`)})}mapInputs(e){var n,s;const r={};for(const a in e){const o=(s=(n=this._signature)===null||n===void 0?void 0:n.inputs)===null||s===void 0?void 0:s[a];o!=null?r[o.name]=e[a]:r[a]=e[a]}return r}checkInputs(e){const n=Object.keys(e).filter(s=>{const[r]=ye(s);return this.graph.nodes[r]==null});if(n.length>0)throw new Error(`The dict provided in model.execute(dict) has keys: [${n}] that are not part of graph`)}mapOutputs(e){return e.map(n=>{var s,r;const a=(r=(s=this._signature)===null||s===void 0?void 0:s.outputs)===null||r===void 0?void 0:r[n];return a!=null?a.name:n},{})}checkOutputs(e){e.forEach(n=>{const[s]=ye(n);if(!this.graph.nodes[s])throw new Error(`The output '${n}' is not found in the graph`)})}}class jT{constructor(e={},n={}){this.hashTableNameToHandle=e,this.hashTableMap=n}addHashTable(e,n){this.hashTableNameToHandle[e]=n.handle,this.hashTableMap[n.id]=n}getHashTableHandleByName(e){return this.hashTableNameToHandle[e]}getHashTableById(e){return this.hashTableMap[e]}dispose(){for(const e in this.hashTableMap)this.hashTableMap[e].clearAndClose(),delete this.hashTableMap[e];for(const e in this.hashTableNameToHandle)this.hashTableNameToHandle[e].dispose(),delete this.hashTableNameToHandle[e]}}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const UT="?tfjs-format=file",qT="model.json";class Bp{get modelVersion(){return this.version}get inputNodes(){return this.executor.inputNodes}get outputNodes(){return this.executor.outputNodes}get inputs(){return this.executor.inputs}get outputs(){return this.executor.outputs}get weights(){return this.executor.weightMap}get metadata(){return this.artifacts.userDefinedMetadata}get modelSignature(){return this.signature}get modelStructuredOutputKeys(){return this.structuredOutputKeys}constructor(e,n={},s=ka){this.modelUrl=e,this.loadOptions=n,this.version="n/a",this.io=s,n==null&&(this.loadOptions={}),this.resourceManager=new jT}findIOHandler(){const e=this.modelUrl;if(e.load!=null)this.handler=e;else if(this.loadOptions.requestInit!=null)this.handler=this.io.browserHTTPRequest(e,this.loadOptions);else{const n=this.io.getLoadHandlers(e,this.loadOptions);if(n.length===0)n.push(this.io.browserHTTPRequest(e,this.loadOptions));else if(n.length>1)throw new Error(`Found more than one (${n.length}) load handlers for URL '${[e]}'`);this.handler=n[0]}}load(){if(this.findIOHandler(),this.handler.load==null)throw new Error("Cannot proceed with model loading because the IOHandler provided does not have the `load` method implemented.");const e=this.handler.load();return it(e)?e.then(n=>n.getWeightStream==null?this.loadSync(n):this.loadStreaming(n)):this.loadSync(e)}loadSync(e){const n=this.io.decodeWeights(e.weightData,e.weightSpecs);return this.loadWithWeightMap(e,n)}async loadStreaming(e){if(e.getWeightStream==null)throw new Error("Model artifacts missing streamWeights function");const n=await Oc(e.getWeightStream(),e.weightSpecs);return this.loadWithWeightMap(e,n)}loadWithWeightMap(e,n){this.artifacts=e;const s=this.artifacts.modelTopology;let r=this.artifacts.signature;if(this.artifacts.userDefinedMetadata!=null){const a=this.artifacts.userDefinedMetadata;a.signature!=null&&(r=a.signature),a.structuredOutputKeys!=null&&(this.structuredOutputKeys=a.structuredOutputKeys)}if(this.signature=r,this.version=`${s.versions.producer}.${s.versions.minConsumer}`,this.executor=new as(Ya.Instance.transformGraph(s,this.signature)),this.executor.weightMap=this.convertTensorMapToTensorsMap(n),this.executor.resourceManager=this.resourceManager,e.modelInitializer!=null&&e.modelInitializer.node!=null){const a=Ya.Instance.transformGraph(e.modelInitializer);this.initializer=new as(a),this.initializer.weightMap=this.executor.weightMap,this.initializer.resourceManager=this.resourceManager,this.initializerSignature=e.initializerSignature}return!0}async save(e,n){if(typeof e=="string"){const s=this.io.getSaveHandlers(e);if(s.length===0)throw new Error(`Cannot find any save handlers for URL '${e}'`);if(s.length>1)throw new Error(`Found more than one (${s.length}) save handlers for URL '${e}'`);e=s[0]}if(e.save==null)throw new Error("GraphModel.save() cannot proceed because the IOHandler provided does not have the `save` attribute defined.");return e.save(this.artifacts)}addStructuredOutputNames(e){if(this.structuredOutputKeys){const n=e instanceof te?[e]:e,s={};return n.forEach((r,a)=>s[this.structuredOutputKeys[a]]=r),s}return e}predict(e,n){const s=this.execute(e,this.outputNodes);return this.addStructuredOutputNames(s)}async predictAsync(e,n){const s=await this.executeAsync(e,this.outputNodes);return this.addStructuredOutputNames(s)}normalizeInputs(e){var n;if(!(e instanceof te)&&!Array.isArray(e)){const a=(n=this.signature)===null||n===void 0?void 0:n.inputs;if(a!=null)for(const o in a){const i=a[o];i.resourceId!=null&&(e[o]=this.resourceIdToCapturedInput[i.resourceId])}return e}e=Array.isArray(e)?e:[e];const s=Object.keys(this.resourceIdToCapturedInput).length;if(e.length+s!==this.inputNodes.length)throw new Error(`Input tensor count mismatch, the graph model has ${this.inputNodes.length-s} non-resource placeholders, while there are ${e.length} input tensors provided.`);let r=0;return this.inputNodes.reduce((a,o)=>{var i,u,c;const h=(c=(u=(i=this.signature)===null||i===void 0?void 0:i.inputs)===null||u===void 0?void 0:u[o])===null||c===void 0?void 0:c.resourceId;return h!=null?a[o]=this.resourceIdToCapturedInput[h]:a[o]=e[r++],a},{})}normalizeOutputs(e){return e=e||this.outputNodes,Array.isArray(e)?e:[e]}executeInitializerGraph(){return this.initializer==null?[]:this.initializerSignature==null?this.initializer.execute({},[]):this.initializer.execute({},Object.keys(this.initializerSignature.outputs))}async executeInitializerGraphAsync(){return this.initializer==null?[]:this.initializerSignature==null?this.initializer.executeAsync({},[]):this.initializer.executeAsync({},Object.keys(this.initializerSignature.outputs))}setResourceIdToCapturedInput(e){if(this.resourceIdToCapturedInput={},this.initializerSignature){const n=this.initializerSignature.outputs,s=Object.keys(n);for(let r=0;r<s.length;r++){const a=s[r],o=n[a];this.resourceIdToCapturedInput[o.resourceId]=e[r]}}}execute(e,n){this.resourceIdToCapturedInput==null&&this.setResourceIdToCapturedInput(this.executeInitializerGraph()),e=this.normalizeInputs(e),n=this.normalizeOutputs(n);const s=this.executor.execute(e,n);return s.length>1?s:s[0]}async executeAsync(e,n){this.resourceIdToCapturedInput==null&&this.setResourceIdToCapturedInput(await this.executeInitializerGraphAsync()),e=this.normalizeInputs(e),n=this.normalizeOutputs(n);const s=await this.executor.executeAsync(e,n);return s.length>1?s:s[0]}getIntermediateTensors(){return this.executor.getIntermediateTensors()}disposeIntermediateTensors(){this.executor.disposeIntermediateTensors()}convertTensorMapToTensorsMap(e){return Object.keys(e).reduce((n,s)=>(n[s]=[e[s]],n),{})}dispose(){this.executor.dispose(),this.initializer&&(this.initializer.dispose(),this.resourceIdToCapturedInput&&pe(this.resourceIdToCapturedInput)),this.resourceManager.dispose()}}async function JT(t,e={},n=ka){if(t==null)throw new Error("modelUrl in loadGraphModel() cannot be null. Please provide a url or an IOHandler that loads the model");e==null&&(e={}),e.fromTFHub&&typeof t=="string"&&(t=GT(t));const s=new Bp(t,e,n);return await s.load(),s}function YT(t){if(t==null)throw new Error("modelUrl in loadGraphModelSync() cannot be null. Please provide model artifacts or an IOHandler that loads the model");let e;if(t instanceof Array){const[s,r]=t;if(!s)throw new Error("modelJSON must be the first element of the array");if(!r||!(r instanceof ArrayBuffer))throw new Error("An ArrayBuffer of weights must be the second element of the array");if(!("modelTopology"in s))throw new Error("Model JSON is missing 'modelTopology'");if(!("weightsManifest"in s))throw new Error("Model JSON is missing 'weightsManifest'");const a=Yn(s.weightsManifest),o=$r(s,a,r);e=ss(o)}else if("load"in t)e=t;else if("modelTopology"in t&&"weightSpecs"in t&&"weightData"in t)e=ss(t);else throw new Error("Unknown model format");const n=new Bp(e);return n.load(),n}function GT(t){return t.endsWith("/")||(t=t+"/"),`${t}${qT}${UT}`}/** @license See the LICENSE file. */const QT="4.22.0";export{wn as $,wo as A,b as B,m as C,g as D,Ae as E,w as F,df as G,Fo as H,ff as I,Do as J,Co as K,V as L,Ro as M,Kr as N,mf as O,dr as P,zo as Q,Vo as R,Ze as S,Nn as T,Pr as U,ls as V,Mo as W,jo as X,kn as Y,Qt as Z,Uo as _,No as a,Gi as a$,R0 as a0,ml as a1,Go as a2,Dn as a3,gf as a4,Ho as a5,dg as a6,Xo as a7,Ih as a8,Zo as a9,qh as aA,Pg as aB,Ei as aC,gr as aD,_i as aE,Ii as aF,xi as aG,Ai as aH,Rn as aI,Ri as aJ,Ci as aK,Sf as aL,$f as aM,zi as aN,Fn as aO,Dr as aP,Vi as aQ,Wi as aR,ts as aS,vf as aT,ji as aU,kf as aV,Mi as aW,qi as aX,Rg as aY,j as aZ,rt as a_,xh as aa,Yo as ab,Bg as ac,Tl as ad,En as ae,ni as af,Ye as ag,z0 as ah,W0 as ai,oi as aj,bf as ak,yf as al,ci as am,wf as an,li as ao,lt as ap,pi as aq,fi as ar,di as as,bi as at,wi as au,Ni as av,$h as aw,jt as ax,Si as ay,je as az,xe as b,sc as b$,Hi as b0,Ki as b1,q as b2,Xi as b3,Lr as b4,Ji as b5,Yi as b6,ru as b7,xt as b8,su as b9,DN as bA,Fu as bB,Du as bC,Au as bD,wl as bE,Ou as bF,Nl as bG,xu as bH,hN as bI,nn as bJ,zu as bK,Cu as bL,$t as bM,Bu as bN,xr as bO,Pu as bP,ue as bQ,Ru as bR,Af as bS,qu as bT,oc as bU,Ju as bV,Lu as bW,Yu as bX,Qu as bY,yr as bZ,Wn as b_,au as ba,ft as bb,ou as bc,iu as bd,Zt as be,Xt as bf,uu as bg,cu as bh,Sl as bi,ii as bj,mu as bk,Nu as bl,gu as bm,yu as bn,wu as bo,xf as bp,bu as bq,If as br,Su as bs,ht as bt,Tu as bu,$u as bv,_u as bw,jr as bx,Iu as by,ON as bz,X as c,Xr as c$,rc as c0,Gr as c1,Br as c2,qe as c3,ac as c4,Ff as c5,wc as c6,be as c7,Vc as c8,Wc as c9,ds as cA,vr as cB,$n as cC,ca as cD,Ll as cE,Bl as cF,Pl as cG,zr as cH,Vl as cI,Ml as cJ,jl as cK,Mr as cL,Vr as cM,Ur as cN,Ul as cO,qr as cP,Et as cQ,Sn as cR,es as cS,Tn as cT,Xl as cU,Zl as cV,Cn as cW,Hr as cX,ns as cY,eh as cZ,oh as c_,jc as ca,Uc as cb,qc as cc,Gc as cd,Hc as ce,Kc as cf,Xc as cg,Zc as ch,Jc as ci,Ir as cj,On as ck,ln as cl,ul as cm,cl as cn,te as co,dl as cp,gl as cq,El as cr,cs,vl as ct,Il as cu,xl as cv,Fr as cw,Ol as cx,Cl as cy,Rl as cz,We as d,bl as d$,ih as d0,bh as d1,Bn as d2,ia as d3,_w as d4,xw as d5,ms as d6,ua as d7,Eh as d8,kh as d9,Rr as dA,hp as dB,fs as dC,jh as dD,mp as dE,tt as dF,gp as dG,Hh as dH,Re as dI,pe as dJ,R as dK,yN as dL,mo as dM,De as dN,tn as dO,mN as dP,Xe as dQ,dt as dR,oo as dS,Td as dT,qd as dU,Dd as dV,Pd as dW,Gd as dX,z1 as dY,R1 as dZ,xc as d_,_h as da,Ch as db,Wr as dc,la as dd,gs as de,Rh as df,Lh as dg,Qn as dh,Mh as di,Uh as dj,dn as dk,Ic as dl,W as dm,Fh as dn,Dh as dp,Oh as dq,Ah as dr,oa as ds,q0 as dt,$e as du,fl as dv,pl as dw,hl as dx,ll as dy,ep as dz,P as e,nS as e$,lp as e0,B0 as e1,yl as e2,Jl as e3,sl as e4,rl as e5,al as e6,Gl as e7,tl as e8,Fe as e9,Wo as eA,os as eB,du as eC,is as eD,nf as eE,yS as eF,Bo as eG,cr as eH,hi as eI,$i as eJ,Oi as eK,Di as eL,Uf as eM,Qi as eN,us as eO,zg as eP,SN as eQ,TN as eR,Pe as eS,$N as eT,NN as eU,Jn as eV,cN as eW,lN as eX,bS as eY,aN as eZ,tS as e_,Jt as ea,$l as eb,it as ec,ae as ed,Nr as ee,ad as ef,na as eg,Ut as eh,tN as ei,Gf as ej,ao as ek,Up as el,Sd as em,et as en,nt as eo,In as ep,zN as eq,sf as er,Zn as es,Ve as et,Kh as eu,en as ev,co as ew,_l as ex,of as ey,af as ez,z as f,MN as f$,sS as f0,rS as f1,aS as f2,oS as f3,iS as f4,uS as f5,cS as f6,lS as f7,hS as f8,pS as f9,Qo as fA,Jo as fB,lr as fC,ei as fD,ti as fE,si as fF,ri as fG,ai as fH,Om as fI,Tt as fJ,rf as fK,mr as fL,ui as fM,KN as fN,ZN as fO,JN as fP,XN as fQ,YN as fR,PN as fS,BN as fT,LN as fU,RN as fV,CN as fW,FN as fX,jN as fY,VN as fZ,WN as f_,Gu as fa,jf as fb,qn as fc,Ad as fd,tf as fe,Ds as ff,$o as fg,Lg as fh,Eo as fi,Yc as fj,Dm as fk,vN as fl,_N as fm,IN as fn,xN as fo,AN as fp,Lo as fq,Po as fr,vi as fs,bN as ft,wN as fu,el as fv,An as fw,qo as fx,Qc as fy,Ko as fz,K as g,kc as g$,qN as g0,UN as g1,GN as g2,mi as g3,gi as g4,vn as g5,yi as g6,Fs as g7,Cs as g8,Ti as g9,Wu as gA,Mu as gB,ju as gC,Uu as gD,eS as gE,Hu as gF,pN as gG,iN as gH,Ku as gI,Xu as gJ,Zu as gK,ku as gL,ec as gM,tc as gN,hn as gO,nc as gP,uc as gQ,Yp as gR,Gp as gS,uo as gT,cn as gU,pd as gV,wS as gW,ef as gX,ut as gY,Hp as gZ,Gn as g_,$p as ga,mS as gb,ki as gc,Fi as gd,Li as ge,Bi as gf,Pi as gg,Ui as gh,Zi as gi,eu as gj,ap as gk,tu as gl,op as gm,nu as gn,ip as go,fe as gp,lu as gq,hu as gr,pu as gs,fu as gt,ic as gu,kN as gv,Eu as gw,Vh as gx,vu as gy,Vu as gz,So as h,tp as h$,qt as h0,EN as h1,rd as h2,Os as h3,dS as h4,fS as h5,QT as h6,dN as h7,ya as h8,ba as h9,Je as hA,Lf as hB,bs as hC,Me as hD,wd as hE,ZT as hF,fd as hG,kl as hH,bd as hI,Nd as hJ,bt as hK,yd as hL,gd as hM,ma as hN,Al as hO,Id as hP,xd as hQ,np as hR,Qh as hS,sN as hT,_c as hU,Rs as hV,fn as hW,Kn as hX,fy as hY,dy as hZ,Ln as h_,wa as ha,Na as hb,hr as hc,yo as hd,Bp as he,Nf as hf,Tf as hg,Ef as hh,Sa as hi,Sr as hj,Fp as hk,_f as hl,Ta as hm,Ps as hn,he as ho,$s as hp,Of as hq,mn as hr,Mc as hs,nl as ht,Ar as hu,ol as hv,Xh as hw,il as hx,kg as hy,nN as hz,fr as i,gy as i$,ka as i0,NS as i1,zl as i2,JT as i3,YT as i4,pp as i5,ql as i6,G1 as i7,Hl as i8,Kl as i9,Th as iA,Jh as iB,g0 as iC,ps as iD,E1 as iE,kd as iF,Od as iG,vh as iH,cp as iI,Dp as iJ,fp as iK,Yh as iL,up as iM,dp as iN,pa as iO,Bh as iP,Ph as iQ,zh as iR,Wh as iS,id as iT,xb as iU,Ed as iV,Rf as iW,Cf as iX,Gh as iY,Hf as iZ,my as i_,Zh as ia,Yl as ib,Ql as ic,th as id,nh as ie,sh as ig,rh as ih,ah as ii,kr as ij,$d as ik,uh as il,ch as im,lh as io,hh as ip,mh as iq,gh as ir,yh as is,vd as it,Yt as iu,XT as iv,_d as iw,wh as ix,Nh as iy,Sh as iz,ne as j,Wl as j0,da as j1,KT as j2,Or as k,H as l,I as m,Ce as n,To as o,ko as p,vo as q,$ as r,ha as s,_o as t,Io as u,C as v,Oo as w,xo as x,Ao as y,Ne as z};
