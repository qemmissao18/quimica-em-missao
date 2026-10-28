import test from 'node:test';
import assert from 'node:assert/strict';
import { createSnapshotGate } from '../battle2/portal/demo/snapshot-order.mjs';
const snapshot = (match_id, revision, seconds, extra = {}) => ({match_id, revision, server_now: new Date(seconds * 1000).toISOString(), ...extra});
test('a delayed poll cannot undo a confirmed answer in the same round', () => {
  const accept = createSnapshotGate();
  assert.equal(accept(snapshot('a', 1, 10)), true);
  assert.equal(accept(snapshot('a', 1, 12, {can_answer: false})), true);
  assert.equal(accept(snapshot('a', 1, 11, {can_answer: true})), false);
  assert.equal(accept(snapshot('a', 1, 13)), true);
});
test('an earlier round cannot replace an advanced round', () => {
  const accept = createSnapshotGate();
  accept(snapshot('a', 2, 20));
  assert.equal(accept(snapshot('a', 1, 21)), false);
  assert.equal(accept(snapshot('a', 3, 22)), true);
});
test('a late response from the finished match cannot undo replay', () => {
  const accept = createSnapshotGate();
  accept(snapshot('a', 15, 30, {settled: true}));
  assert.equal(accept(snapshot('b', 1, 31)), true);
  assert.equal(accept(snapshot('a', 15, 32, {settled: true})), false);
  assert.equal(accept(snapshot('b', 2, 33)), true);
});
test('equal timestamps and absent optional timestamps do not block progress', () => {
  const accept = createSnapshotGate();
  assert.equal(accept(null), false);
  assert.equal(accept(snapshot('a', 1, 10)), true);
  assert.equal(accept(snapshot('a', 1, 10)), true);
  assert.equal(accept({match_id: 'a', revision: 2}), true);
});
