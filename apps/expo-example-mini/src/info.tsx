import { VERSION } from 'lodash';
import { Platform, StyleSheet, Text, View } from 'react-native';

type Props = {
  testID?: string;
  sections?: Array<{ name: string; value: string; testID: string }>;
};

const SECTIONS = [
  {
    name: 'lodash version',
    value: VERSION,
    testID: 'mini-lodash',
  },
];

export default function Info({
  testID = 'mini-info',
  sections = SECTIONS,
}: Props) {
  return (
    <View style={styles.container} testID={testID}>
      {sections.map((section) => (
        <View key={section.name} style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, styles.monospace]}>
            {section.name}
          </Text>
          <Text testID={section.testID} style={[styles.monospace]}>
            {section.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  monospace: {
    fontFamily: Platform.select({
      ios: 'Menlo',
      default: 'monospace',
    }),
  },
  sectionContainer: {
    flexDirection: 'row',
  },
  sectionTitle: {
    marginRight: 8,
  },
});
