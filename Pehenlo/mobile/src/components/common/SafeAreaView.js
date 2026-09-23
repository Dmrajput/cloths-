import { StyleSheet } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../../constants/theme';

const { colors } = THEME;

const SafeAreaView = ({ style, edges, ...props }) => (
  <RNSafeAreaView
    style={[styles.container, style]}
    edges={edges}
    {...props}
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export { SafeAreaView };
export default SafeAreaView;
