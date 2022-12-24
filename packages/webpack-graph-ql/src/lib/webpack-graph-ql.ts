import graphql from 'graphql';
import resolvers from './resolvers';

const query = `
  query {
    stats {
      assets {
        name
        size
      }
      chunks {
        ids
        names
      }
    }
  }
`;


export function webpackGraphQl(): string {
  return graphql(resolvers, query, null, { statsFile: 'path/to/stats.json' }).then((result) => {
    console.log(result);
  });
}


//example query
// query {
//   webpackStats {
//     modules {
//       name
//       size
//     }
//   }
// }
// query {
//   webpackStats {
//     entrypoints(name: "main") {
//       name
//       assets
//     }
//   }
// }

//query {
//   assets {
//     name
//     size
//   }
//   chunks {
//     id
//     size
//   }
//   modules {
//     id
//     identifier
//     name
//     size
//     cacheable
//     built
//     optional
//     prefetched
//     chunkIds
//     children {
//       id
//       identifier
//       name
//     }
//     issuer {
//       identifier
//       name
//     }
//     chunks {
//       id
//       size
//     }
//   }
// }
//query {
//   modules(chunkId: "0") {
//     identifier
//     name
//     size
//   }
// }
