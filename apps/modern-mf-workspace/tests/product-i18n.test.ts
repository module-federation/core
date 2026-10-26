import assert from 'node:assert/strict';
import { test } from 'node:test';
import { products, defaultPreferences } from '../server/data.ts';
import {
  localizePageCopy,
  localizePreferences,
  localizeProduct,
} from '../shared/product-i18n.ts';

test('English products retain identity and commerce data without mutating the source', () => {
  const before = structuredClone(products);
  for (const product of products) {
    const english = localizeProduct(product, 'en');
    assert.doesNotMatch(
      [english.name, english.description, ...english.features].join(' '),
      /\p{Script=Han}/u,
    );
    const {
      name: _name,
      description: _description,
      features: _features,
      ...originalData
    } = product;
    const { name, description, features, ...localizedData } = english;
    assert.deepEqual(localizedData, originalData);
    assert.equal(localizeProduct(product, 'zh'), product);
  }
  assert.deepEqual(products, before);
  assert.equal(
    localizeProduct(products[3], 'en').name,
    'Flow Mechanical Keyboard',
  );
});

test('only sample copy is localized; user preferences and custom deployment copy survive unchanged', () => {
  const english = localizePreferences(defaultPreferences, 'en');
  assert.doesNotMatch(english.notes, /\p{Script=Han}/u);
  const customized = { ...defaultPreferences, customized: true };
  assert.equal(localizePreferences(customized, 'en'), customized);
  const customNotes = { ...defaultPreferences, notes: '我想保留自己写的内容' };
  assert.equal(localizePreferences(customNotes, 'en'), customNotes);
  assert.equal(
    localizePageCopy('一些可能适合你的新发现', 'en'),
    'A few new finds, just for you',
  );
  assert.equal(localizePageCopy('我的自定义欢迎语', 'en'), '我的自定义欢迎语');
});
