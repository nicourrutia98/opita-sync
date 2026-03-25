import { renderWebSmokeSnapshot } from './smoke-support.js';

const result = await renderWebSmokeSnapshot();
console.log(JSON.stringify(result, null, 2));
