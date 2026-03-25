import { runApiSmokeSuite } from './smoke-support.js';

const result = await runApiSmokeSuite();
console.log(JSON.stringify(result, null, 2));
