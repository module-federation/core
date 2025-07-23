const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  testSSRLeafReplacement,
  renderToHTML,
  initialData,
  updatedData,
} = require('../examples/ssr-leaf-replacement.js');

describe('SSR Leaf Node Replacement', () => {
  it('should render initial HTML with original text', () => {
    const html = renderToHTML(initialData);

    assert.ok(
      html.includes('Original Text 1'),
      'Should contain Original Text 1',
    );
    assert.ok(
      html.includes('Original Text 2'),
      'Should contain Original Text 2',
    );
    assert.ok(
      html.includes('Original Text 3'),
      'Should contain Original Text 3',
    );
    assert.ok(
      html.includes('data-testid="leaf-leaf2"'),
      'Should have test id for leaf2',
    );
  });

  it('should render updated HTML with replaced leaf node', () => {
    const html = renderToHTML(updatedData);

    assert.ok(
      html.includes('Original Text 1'),
      'Should still contain Original Text 1',
    );
    assert.ok(html.includes('REPLACED TEXT 2'), 'Should contain replaced text');
    assert.ok(
      html.includes('Original Text 3'),
      'Should still contain Original Text 3',
    );
    assert.ok(
      !html.includes('Original Text 2'),
      'Should not contain original text 2',
    );
  });

  it('should verify HTML structure is maintained after replacement', () => {
    const initialHTML = renderToHTML(initialData);
    const updatedHTML = renderToHTML(updatedData);

    // Check that the structure remains the same
    const initialStructure = initialHTML
      .replace(/Original Text \d/g, 'TEXT')
      .replace(/REPLACED TEXT \d/g, 'TEXT');
    const updatedStructure = updatedHTML
      .replace(/Original Text \d/g, 'TEXT')
      .replace(/REPLACED TEXT \d/g, 'TEXT');

    assert.strictEqual(
      initialStructure,
      updatedStructure,
      'HTML structure should remain identical',
    );
  });

  it('should successfully run the complete test suite', () => {
    const result = testSSRLeafReplacement();

    assert.ok(result.testPassed, 'Full test suite should pass');
    assert.ok(result.initialHTML, 'Should return initial HTML');
    assert.ok(result.updatedHTML, 'Should return updated HTML');
    assert.ok(result.details.hasOriginalText, 'Should detect original text');
    assert.ok(result.details.hasReplacedText, 'Should detect replaced text');
    assert.ok(
      !result.details.stillHasOriginalInUpdated,
      'Updated HTML should not have original text',
    );
  });

  it('should correctly identify specific leaf node changes', () => {
    const initialHTML = renderToHTML(initialData);
    const updatedHTML = renderToHTML(updatedData);

    const initialLeaf2Match = initialHTML.match(
      /<span[^>]*data-testid="leaf-leaf2"[^>]*>([^<]*)<\/span>/,
    );
    const updatedLeaf2Match = updatedHTML.match(
      /<span[^>]*data-testid="leaf-leaf2"[^>]*>([^<]*)<\/span>/,
    );

    assert.ok(initialLeaf2Match, 'Should find leaf2 in initial HTML');
    assert.ok(updatedLeaf2Match, 'Should find leaf2 in updated HTML');
    assert.strictEqual(
      initialLeaf2Match[1],
      'Original Text 2',
      'Initial leaf2 should have original text',
    );
    assert.strictEqual(
      updatedLeaf2Match[1],
      'REPLACED TEXT 2',
      'Updated leaf2 should have replaced text',
    );
    assert.notStrictEqual(
      initialLeaf2Match[1],
      updatedLeaf2Match[1],
      'Leaf2 content should be different',
    );
  });

  it('should preserve other leaf nodes during replacement', () => {
    const initialHTML = renderToHTML(initialData);
    const updatedHTML = renderToHTML(updatedData);

    // Check leaf1 remains unchanged
    const initialLeaf1 = initialHTML.match(
      /<span[^>]*data-testid="leaf-leaf1"[^>]*>([^<]*)<\/span>/,
    );
    const updatedLeaf1 = updatedHTML.match(
      /<span[^>]*data-testid="leaf-leaf1"[^>]*>([^<]*)<\/span>/,
    );

    // Check leaf3 remains unchanged
    const initialLeaf3 = initialHTML.match(
      /<span[^>]*data-testid="leaf-leaf3"[^>]*>([^<]*)<\/span>/,
    );
    const updatedLeaf3 = updatedHTML.match(
      /<span[^>]*data-testid="leaf-leaf3"[^>]*>([^<]*)<\/span>/,
    );

    assert.strictEqual(
      initialLeaf1[1],
      updatedLeaf1[1],
      'Leaf1 should remain unchanged',
    );
    assert.strictEqual(
      initialLeaf3[1],
      updatedLeaf3[1],
      'Leaf3 should remain unchanged',
    );
  });
});
