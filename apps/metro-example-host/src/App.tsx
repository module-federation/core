import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// @ts-ignore
import NestedMiniInfo from 'nestedMini/nestedMiniInfo';
import Card from './Card';

// @ts-ignore
const Info = React.lazy(() => import('mini/info'));

function App(): React.JSX.Element {
  const [shouldLoadMini, setShouldLoadMini] = useState(false);
  const [lodashVersion, setLodashVersion] = useState<string>();

  useEffect(() => {
    import('lodash').then(lodash => {
      setLodashVersion(lodash.VERSION);
    });
  }, []);

  return (
    <View style={styles.backgroundStyle}>
      <SafeAreaView />
      <View style={styles.contentContainer}>
        <Card title="Host Info" description="Host app info">
          <React.Suspense
            fallback={
              <View>
                <ActivityIndicator size="large" color="#8b5cf6" />
              </View>
            }>
            <Info
              testID="host-app-info"
              sections={[
                {
                  name: 'lodash version',
                  value: lodashVersion,
                  testID: 'host-lodash',
                },
              ]}
            />
          </React.Suspense>
        </Card>
        <Card title="Federated Remote" description="Dynamically loaded module">
          {!shouldLoadMini ? (
            <Pressable
              testID="load-mini-button"
              accessibilityRole="button"
              style={styles.defaultButton}
              onPress={() => setShouldLoadMini(true)}>
              <Text style={styles.defaultButtonText}>
                Load Remote Component
              </Text>
            </Pressable>
          ) : (
            <React.Suspense
              fallback={
                <View>
                  <ActivityIndicator size="large" color="#8b5cf6" />
                </View>
              }>
              <Info />
            </React.Suspense>
          )}
        </Card>
        <Card
          title="Nested Federated Remote"
          description="Dynamically loaded nested module">
          <NestedMiniInfo />
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundStyle: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  defaultButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  defaultButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default App;
