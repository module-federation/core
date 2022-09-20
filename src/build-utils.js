import {parseRemoteSyntax} from "./internal";
import Template from 'webpack/lib/Template';
export const promiseTemplate = (remote,...otherPromises) => {
  let promises = '';
  if (otherPromises) {
    promises = otherPromises.map((p) => {
      return Template.getFunctionContent(p)
    })
  }
  const allPromises = [
    parseRemoteSyntax(remote),
    ...promises
  ].map((p) => {
    return p + ',';
  })
console.log(Template)
  return Template.asString([
    'promise new Promise(function(resolve, reject) {',
    Template.indent([
      'Promise.all([',
      Template.indent(allPromises),
      ']).then(function(promises) {',
      Template.indent([
        'resolve(promises[0]);',
      ]),
      '})',
    ]),
    '})',
  ])
}
