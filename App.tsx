import React from 'react';
import {StyleSheet, View} from 'react-native';
import {AppNavigator} from './app/navigators/app-navigator';
import {colors} from './app/theme/colors';

const App = () => {
  return (
    <View style={styles.container}>
      <AppNavigator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
});

export default App;
