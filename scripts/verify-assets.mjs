import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import ts from 'typescript';
const root = path.resolve(import.meta.dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/data.ts'), 'utf8');
const js = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {products,categories,heroSlides} = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const manifest = JSON.parse(fs.readFileSync(path.join(root,'docs/photo-manifest.json')));
assert.equal(manifest.length,22);
assert.deepEqual(categories.map(c=>c.name),['Hair Care','Scalp Care','Home Care']);
assert.equal(heroSlides.length,6);
const references = [...products.flatMap(p=>[p.image,...p.gallery]),...categories.map(c=>c.image),...heroSlides.map(s=>s.image)];
for (const src of references) assert.ok(fs.existsSync(path.join(root,'public',src)),`Missing ${src}`);
for (const img of manifest) {
 assert.ok(img.width<=1600 && img.height<=1600);
 const bytes=fs.readFileSync(path.join(root,'public/assets',img.file));
 assert.equal(bytes[0],0xff); assert.equal(bytes[1],0xd8);
}
assert.ok(!references.some(x=>x.includes('hair-revival')));
assert.ok(!references.some(x=>x.includes('label')));
assert.ok(products.find(p=>p.slug==='maintenance-shampoo'));
assert.ok(products.find(p=>p.slug==='pure-proteins'));
for(const p of products.filter(p=>p.slug.includes('nanoplastia'))) {assert.equal(p.name,'NANOPLASTIA');assert.ok(p.gallery.every(x=>x.includes('nanoplastia')));}
assert.ok(products.find(p=>p.slug==='anti-hairfall-scalp-tonic').categories.includes('Home Care'));
assert.ok(products.find(p=>p.slug==='amreal-scalp-detox-shampoo-1000').categories.includes('Home Care'));
const missing=[];
for(const file of fs.readdirSync(path.join(root,'src')).filter(x=>/\.(tsx?|css)$/.test(x))) {
 const text=fs.readFileSync(path.join(root,'src',file),'utf8');
 for(const match of text.matchAll(/\/assets\/[\w.-]+\.(?:jpg|jpeg|png|svg|webp)/g)) {
  if(!fs.existsSync(path.join(root,'public',match[0]))) missing.push([file,match[0]]);
 }
}
assert.deepEqual(missing,[]);
console.log(`PASS: ${manifest.length} optimized JPEGs; ${products.length} product routes; ${heroSlides.length} slides; 3 categories; all static asset references resolve. PDF-supplied two-month follow-up resolves.`);
