import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require=createRequire(new URL('../frontend/package.json',import.meta.url));
const parser=require('@babel/parser');const traverse=require('@babel/traverse').default;
const en=JSON.parse(fs.readFileSync(new URL('../frontend/src/locales/en.json',import.meta.url),'utf8'));
const missing=new Set();const collisions=[];let checked=0;
function scan(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())scan(file);else if(/\.(js|jsx)$/.test(file)){const ast=parser.parse(fs.readFileSync(file,'utf8'),{sourceType:'module',plugins:['jsx']});traverse(ast,{CallExpression(p){if(p.node.callee.name!=='t')return;if(p.scope.getBinding('t')?.kind!=='module')collisions.push(`${file}:${p.node.loc.start.line}`);if(p.node.arguments[0]?.type!=='StringLiteral')return;const key=p.node.arguments[0].value.trim();if(/[À-ỹ]/u.test(key)){checked++;if(!en[key])missing.add(key);}}});}}}
scan(fileURLToPath(new URL('../frontend/src',import.meta.url)));
if(missing.size||collisions.length){console.error('Thiếu bản dịch:',[...missing], 'Trùng tên hàm dịch:',collisions);process.exitCode=1;}else console.log(`Đã kiểm tra ${checked} vị trí dịch; ${Object.keys(en).length} bản dịch tiếng Anh.`);
