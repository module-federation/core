import { VERSION } from 'lodash';
// @ts-ignore
import Info from 'MFExpoExampleMini/info';
import React from 'react';
import { View } from 'react-native';

export default function NestedMiniInfo() {
  return (
    <View testID="nested-mini">
      <React.Suspense>
        <Info
          testID="nested-mini-info"
          sections={[
            {
              name: 'lodash version',
              value: VERSION,
              testID: 'nested-mini-lodash',
            },
          ]}
        />
      </React.Suspense>
    </View>
  );
}
