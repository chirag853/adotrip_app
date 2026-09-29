import { StyleSheet, View } from 'react-native';
import HelloWorld from '../components/HelloWorld';

// App ki home screen - yahi pe Hello World dikhega
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <HelloWorld message="Hello World" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
