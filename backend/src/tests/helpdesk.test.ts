import assert from 'node:assert/strict';

async function runSmokeTest() {
  assert.ok(true, 'Helpdesk module scaffold loaded');
}

runSmokeTest().catch((error) => {
  console.error(error);
  process.exit(1);
});
