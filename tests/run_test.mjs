import { runVerification } from './verify-runner.mjs';

const res = await runVerification({
  file: '/home/antigravity/bard0228/3dsushi/index.html',
  width: 412,
  height: 915,
  isMobile: true,
  customScript: '/home/antigravity/bard0228/3dsushi/tests/verify_external_browser.mjs'
});

console.log('Automated Verification Success:', res);
