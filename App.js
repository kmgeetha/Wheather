import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Wheather from './src/Wheather';

export default function App() {
  return (
    <View style={styles.container}>
        <Wheather/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
});
