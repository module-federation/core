const { JSDOM } = require('jsdom');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

// Mock DOM environment for SSR
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;

// Leaf component that will be replaced
function LeafComponent({ text, id }) {
  return React.createElement('span', { 
    id: id,
    'data-testid': `leaf-${id}`
  }, text);
}

// Container component with multiple leaf nodes
function App({ leafData }) {
  return React.createElement('div', { 
    id: 'app',
    className: 'container'
  }, [
    React.createElement('h1', { key: 'title' }, 'SSR Leaf Replacement Test'),
    React.createElement('div', { key: 'content', className: 'content' }, 
      leafData.map(item => 
        React.createElement(LeafComponent, {
          key: item.id,
          id: item.id,
          text: item.text
        })
      )
    )
  ]);
}

// Initial data
const initialData = [
  { id: 'leaf1', text: 'Original Text 1' },
  { id: 'leaf2', text: 'Original Text 2' },
  { id: 'leaf3', text: 'Original Text 3' }
];

// Updated data with one leaf replaced
const updatedData = [
  { id: 'leaf1', text: 'Original Text 1' },
  { id: 'leaf2', text: 'REPLACED TEXT 2' }, // This leaf is replaced
  { id: 'leaf3', text: 'Original Text 3' }
];

function renderToHTML(data) {
  const appElement = React.createElement(App, { leafData: data });
  return ReactDOMServer.renderToString(appElement);
}

function testSSRLeafReplacement() {
  console.log('Starting SSR Leaf Replacement Test...\n');
  
  // Render initial HTML
  const initialHTML = renderToHTML(initialData);
  console.log('Initial HTML:');
  console.log(initialHTML);
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Render updated HTML with replaced leaf
  const updatedHTML = renderToHTML(updatedData);
  console.log('Updated HTML (after leaf replacement):');
  console.log(updatedHTML);
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Verify the replacement
  const hasOriginalText = initialHTML.includes('Original Text 2');
  const hasReplacedText = updatedHTML.includes('REPLACED TEXT 2');
  const stillHasOriginalInUpdated = updatedHTML.includes('Original Text 2');
  
  console.log('Verification Results:');
  console.log(`✓ Initial HTML contains original text: ${hasOriginalText}`);
  console.log(`✓ Updated HTML contains replaced text: ${hasReplacedText}`);
  console.log(`✓ Updated HTML no longer has original text: ${!stillHasOriginalInUpdated}`);
  
  // Additional verification - check specific leaf node
  const initialLeaf2 = initialHTML.match(/<span[^>]*data-testid="leaf-leaf2"[^>]*>([^<]*)<\/span>/);
  const updatedLeaf2 = updatedHTML.match(/<span[^>]*data-testid="leaf-leaf2"[^>]*>([^<]*)<\/span>/);
  
  console.log('\nDetailed Leaf Node Analysis:');
  console.log(`Original leaf2 content: "${initialLeaf2 ? initialLeaf2[1] : 'NOT FOUND'}"`);
  console.log(`Updated leaf2 content: "${updatedLeaf2 ? updatedLeaf2[1] : 'NOT FOUND'}"`);
  
  const testPassed = hasOriginalText && hasReplacedText && !stillHasOriginalInUpdated && 
                     initialLeaf2 && updatedLeaf2 && 
                     initialLeaf2[1] !== updatedLeaf2[1];
  
  console.log(`\n${testPassed ? '✅ TEST PASSED' : '❌ TEST FAILED'}: Leaf node replacement verified in SSR`);
  
  return {
    initialHTML,
    updatedHTML,
    testPassed,
    details: {
      hasOriginalText,
      hasReplacedText,
      stillHasOriginalInUpdated,
      originalLeafContent: initialLeaf2 ? initialLeaf2[1] : null,
      updatedLeafContent: updatedLeaf2 ? updatedLeaf2[1] : null
    }
  };
}

// Export for use in tests
module.exports = {
  App,
  LeafComponent,
  renderToHTML,
  testSSRLeafReplacement,
  initialData,
  updatedData
};

// Run the test if this file is executed directly
if (require.main === module) {
  testSSRLeafReplacement();
}