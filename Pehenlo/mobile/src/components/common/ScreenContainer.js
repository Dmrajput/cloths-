import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { THEME } from '../../constants/theme';
import SafeAreaView from './SafeAreaView';

const { spacing } = THEME;

const ScreenContainer = ({
  children,
  scroll = false,
  padded = true,
  style,
  contentContainerStyle,
  edges = ['top'],
}) => {
  const paddingStyle = padded ? styles.padded : null;

  const innerContent = scroll ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[paddingStyle, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  ) : (
    <View style={[styles.flex, paddingStyle, contentContainerStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.container, style]} edges={edges}>
      {innerContent}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.lg,
  },
});

export default ScreenContainer;
