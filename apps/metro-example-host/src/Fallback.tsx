import React from 'react';
import {ActivityIndicator, LayoutAnimation, Text, View} from 'react-native';

export default function Fallback() {
  React.useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut, () =>
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut),
    );
  });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <ActivityIndicator size="large" color="#fff" />
      <Text style={{color: '#fff', marginTop: 20}}>
        Async Startup in progress...
      </Text>
    </View>
  );
}
