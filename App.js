import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.emoji}>📱</Text>
        <Text style={styles.title}>Namaste! MyMobileApp</Text>
        <Text style={styles.subtitle}>
          Ye aapka pehla React Native (Expo) app hai. Ye mobile par bhi chalega!
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Counter Demo</Text>
          <Text style={styles.counter}>{count}</Text>
          <TouchableOpacity style={styles.button} onPress={() => setCount(count + 1)}>
            <Text style={styles.buttonText}>+1 Dabao</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={() => setCount(0)}
          >
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          App.js ko edit karo aur save karte hi mobile par changes dikhenge.
        </Text>
        <StatusBar style="auto" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f2f6ff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f2f6ff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 12,
    color: '#111',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#555',
    marginTop: 8,
    lineHeight: 22,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  counter: {
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#2563eb',
  },
  button: {
    width: '100%',
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  resetButton: {
    backgroundColor: '#6b7280',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    marginTop: 20,
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
  },
});
