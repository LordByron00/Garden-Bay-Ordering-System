import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.restaurantName}>Garden Bay</Text>
      </View>
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[styles.optionButton, styles.dineInButton]}
          onPress={() => navigation.navigate('Menu', { orderType: 'dine-in' })}
        >
          <Text style={styles.optionButtonText}>Dine-In</Text>
          <Text style={styles.optionSubText}>Order at your table</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionButton, styles.takeawayButton]}
          onPress={() => navigation.navigate('Menu', { orderType: 'takeaway' })}
        >
          <Text style={styles.optionButtonText}>Takeaway</Text>
          <Text style={styles.optionSubText}>Pick up your order</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.footerText}>Please select your order type to begin</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginBottom: height * 0.05,
    alignItems: 'center',
  },
  title: {
    fontSize: width * 0.04, // Responsive but smaller
    color: '#333',
    fontWeight: '300',
    marginBottom: 5,
  },
  restaurantName: {
    fontSize: width * 0.06, // Reduced from 0.12
    color: '#2c3e50',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  optionsContainer: {
    width: '80%',
    maxWidth: 600,
    marginBottom: 30,
  },
  optionButton: {
    paddingVertical: height * 0.02,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dineInButton: {
    backgroundColor: '#4CAF50', // Green
  },
  takeawayButton: {
    backgroundColor: '#2196F3', // Blue
  },
  optionButtonText: {
    fontSize: width * 0.035, // Reduced from 0.06
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  optionSubText: {
    fontSize: width * 0.025, // Reduced from 0.035
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '300',
  },
  footerText: {
    fontSize: width * 0.025,
    color: '#666',
    marginTop: 20,
  },
});
