/// <reference path="json-fn.d.ts" />

import jsonfn = require('json-fn');

var obj = { prop1: "value 1", prop2: "value 2" };
var obj2 = jsonfn.clone(obj);
var obj3 = jsonfn.parse(jsonfn.stringify(obj));

var date = new Date();

console.log("Clone object: "+obj2+" : "+jsonfn.stringify(obj2));
console.log("Clone date as string: "+jsonfn.clone(date));
console.log("Clone date as date: "+jsonfn.clone(date, true));
console.log("");

console.log("Parse object: "+obj3+" : "+jsonfn.stringify(obj3));
console.log("Parse date as string: "+jsonfn.parse(jsonfn.stringify(date)));
console.log("Parse date as date: "+jsonfn.parse(jsonfn.stringify(date), true));
console.log("");

console.log("Stringify object: "+jsonfn.stringify(obj));
console.log("Stringify date: "+jsonfn.stringify(date));
console.log("");
