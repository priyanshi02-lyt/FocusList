#!/usr/bin/env node
/**
 * FocusList Zero-Dependency Node.js Test Runner
 * Executes automated unit test suites and outputs formatted results.
 */

import assert from 'node:assert';
import { runTaskManagerTests } from './taskManager.test.js';
import { runStorageTests } from './storage.test.js';

console.log('\n========================================');
console.log('🧪 Running FocusList Automated Test Suite');
console.log('========================================\n');

let passed = 0;
let failed = 0;

const allTests = [
  ...runTaskManagerTests(assert),
  ...runStorageTests(assert)
];

for (const test of allTests) {
  try {
    test.fn();
    console.log(`  ✅ PASS: ${test.name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${test.name}`);
    console.error(`     Error: ${err.message}\n`);
    failed++;
  }
}

console.log('\n----------------------------------------');
console.log(`Results: ${passed} passed, ${failed} failed (${allTests.length} total)`);
console.log('----------------------------------------\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 All unit tests passed with 100% success rate!\n');
}
