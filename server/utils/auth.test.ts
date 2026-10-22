import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { generateToken, verifyToken } from './jwt';

test('JWT generateToken and verifyToken roundtrip works properly', () => {
  const token = generateToken('user_12345', 'user');
  assert.ok(token);
  assert.equal(typeof token, 'string');

  const decoded = verifyToken(token);
  assert.equal(decoded.id, 'user_12345');
  assert.equal(decoded.role, 'user');
});

test('JWT handles admin role payload correctly', () => {
  const adminToken = generateToken('admin_99999', 'admin');
  const decoded = verifyToken(adminToken);
  assert.equal(decoded.id, 'admin_99999');
  assert.equal(decoded.role, 'admin');
});

test('bcrypt password hashing and comparison verify valid password', async () => {
  const rawPassword = 'secretPassword123';
  const hashed = await bcrypt.hash(rawPassword, 10);
  assert.notEqual(hashed, rawPassword);

  const isMatch = await bcrypt.compare(rawPassword, hashed);
  assert.equal(isMatch, true);

  const isWrongMatch = await bcrypt.compare('wrongPassword', hashed);
  assert.equal(isWrongMatch, false);
});
