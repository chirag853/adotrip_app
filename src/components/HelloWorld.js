import { StyleSheet, Text, View } from 'react-native';

// Reusable Hello World component
export default function HelloWorld({ message = 'Hello World' }) {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    marginTop: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
