import { describe, expect, it } from '@rstest/core';
import { isolateReactStreamScripts } from './script-isolation.server';

const transform = (html: string, namespace = 'a') =>
  isolateReactStreamScripts(html, namespace, 'remote-');

describe('per-renderer React completion helpers', () => {
  it('isolates definitions, later calls and React 19 deferred helpers with one stable namespace', () => {
    const first = transform(
      '<script nonce="x">function $RC(a,b){var text="$RC";a.$RC();document.getElementById(a)};$RC("remote-B:0","remote-S:0")</script>',
    );
    expect(first).toContain('function $MF_61_RC(a,b)');
    expect(first).toContain('text="$RC";a.$RC()');
    expect(first).toContain('$MF_61_RC("remote-B:0","remote-S:0")');
    expect(first).toContain('nonce="x"');
    expect(
      transform('<script>$RC("remote-B:1","remote-S:1")</script>'),
    ).toContain('$MF_61_RC(');
    expect(
      transform(
        '<script>$RB=[];$RV=function(a){$RT=performance.now()};$RC=function(a,b){$RB.push(a,b);requestAnimationFrame($RV.bind(null,$RB))};$RC("remote-B:0","remote-S:0")</script>',
      ),
    ).toContain(
      '$MF_61_RB.push(a,b);requestAnimationFrame($MF_61_RV.bind(null,$MF_61_RB))',
    );
    expect(
      transform(
        '<script>requestAnimationFrame(function(){$RT=performance.now()});</script>',
      ),
    ).toContain('$MF_61_RT=performance.now()');
    expect(
      transform('<script>$RC("remote-B:1","remote-S:1")</script>', 'b'),
    ).toContain('$MF_62_RC(');
  });

  it('does not rewrite literals, non-instruction business scripts, modules or another producer instructions', () => {
    for (const html of [
      '<script>window.message="$RC";window.$RC="business";</script>',
      '<script>function $RC(){return "business"};window.run=$RC;</script>',
      '<script type="application/json">{"helper":"$RC"}</script>',
      '<script type="module">$RC("remote-B:0","remote-S:0")</script>',
      '<script>$RC("different-B:0","different-S:0")</script>',
      '<p data-script="$RC">$RC</p>',
    ])
      expect(transform(html)).toBe(html);
  });

  it('isolates Host scripts with their own namespace and preserves surrounding complete HTML', () => {
    const html =
      '<section>host</section><script>$RC("host-B:0","host-S:0")</script><p>end</p>';
    const isolated = isolateReactStreamScripts(html, 'host');
    expect(isolated).toBe(
      '<section>host</section><script>$MF_686f7374_RC("host-B:0","host-S:0")</script><p>end</p>',
    );
  });
  it('expands shorthand exactly once and keeps keys, literals and nested member properties unchanged', () => {
    const html =
      '<script>function $RC(a,b){const o={$RC};const {$RV=$RC}=a;return o.$RC["$RC"].$RS+a[$RC]};$RC("remote-B:0","remote-S:0")</script>';
    expect(transform(html)).toBe(
      '<script>function $MF_61_RC(a,b){const o={$RC: $MF_61_RC};const {$RV: $MF_61_RV=$MF_61_RC}=a;return o.$RC["$RC"].$RS+a[$MF_61_RC]};$MF_61_RC("remote-B:0","remote-S:0")</script>',
    );
  });
});
