import { copyFile, mkdir, access } from 'node:fs/promises';

// The asset directory shares the route name. Provide an explicit directory
// index so basic static servers and GitHub Pages can serve /microduck/.
await access('dist/client/microduck.html');
await mkdir('dist/client/microduck', {recursive:true});
await copyFile('dist/client/microduck.html','dist/client/microduck/index.html');
await copyFile('dist/client/microduck.rsc','dist/client/microduck/index.rsc');
await copyFile('public/.nojekyll','dist/client/.nojekyll');
console.log('Verified static Microduck entry point.');
