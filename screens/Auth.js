import React, { useState, useEffect, createContext, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // You'll need to install this package
import axios from 'axios'; // You'll need to install axios

// Define your Laravel API base URL
const API_BASE_URL = 'http://localhost:8000'; // Replace with your actual backend URL

// Create an Auth Context to manage authentication state and token
const AuthContext = createContext(null);

// Custom hook to easily access the AuthContext
export const useAuth = () => useContext(AuthContext);

// Auth Provider component to wrap your app or relevant parts
export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null); // Optional: Store user data

  // Load the token from storage when the app starts
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          setAuthToken(token);
          // Optionally fetch user data here if token is found
          fetchUser(token);
        }
      } catch (error) {
        console.error('Failed to load auth token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []); // Empty dependency array means this runs once on mount

  // Function to handle login
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password,
        // You might send a device_name here if your backend expects it
        // device_name: 'react_native_app',
      });

      const { token, user: userData } = response.data;

      // Store the token
      await AsyncStorage.setItem('authToken', token);
      setAuthToken(token);
      setUser(userData); // Store user data

      return { success: true }; // Indicate success
    } catch (error) {
      console.error('Login failed:', error);
      // Handle specific error responses from backend (e.g., validation errors)
      if (error.response && error.response.data && error.response.data.message) {
         Alert.alert('Login Failed', error.response.data.message);
      } else {
         Alert.alert('Login Failed', 'An unexpected error occurred.');
      }
      setAuthToken(null); // Ensure token is null on failure
      setUser(null);
      return { success: false, error: error.message }; // Indicate failure
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle logout
  const logout = async () => {
    setIsLoading(true);
    try {
      // Make a request to the logout endpoint (requires token)
      await axios.post(`${API_BASE_URL}/logout`, {}, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if the logout API call fails, we should clear the token locally
    } finally {
      // Clear the token from storage and state
      await AsyncStorage.removeItem('authToken');
      setAuthToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  // Optional: Fetch user data after token is loaded or login
  const fetchUser = async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // If fetching user fails with a 401 (Unauthorized), the token might be invalid
      if (error.response && error.response.status === 401) {
         logout(); // Log out the user if token is invalid
      }
      setUser(null); // Clear user data on error
    }
  };


  // Function to make authenticated API requests
  const authenticatedRequest = async (method, url, data = {}) => {
    if (!authToken) {
      // Handle case where token is not available (e.g., redirect to login)
      console.warn('No auth token available. Redirecting to login.');
      // You would typically navigate the user back to the login screen here
      // Example (requires navigation setup): navigation.navigate('Login');
      return Promise.reject(new Error('Not authenticated')); // Reject the promise
    }

    try {
      const response = await axios({
        method: method,
        url: `${API_BASE_URL}${url}`, // Use the base URL and the specific endpoint
        data: data,
        headers: {
          Authorization: `Bearer ${authToken}`, // Include the token in the header
          Accept: 'application/json', // Standard API header
          'Content-Type': 'application/json', // Standard API header for POST/PUT
        },
      });
      return response.data; // Return the response data
    } catch (error) {
      console.error('Authenticated request failed:', error);
       // Handle 401 Unauthorized errors specifically
       if (error.response && error.response.status === 401) {
           console.warn('Authentication failed (401). Token might be invalid. Logging out.');
           logout(); // Log out the user if token is invalid
       }
      throw error; // Re-throw the error for the component to handle
    }
  };

  return (
    <AuthContext.Provider value={{ authToken, user, isLoading, login, logout, authenticatedRequest }}>
      {children}
    </AuthContext.Provider>
  );
};

// Example Login Screen Component
const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth(); // Use the custom hook

  const handleLogin = async () => {
    const result = await login(email, password);
    if (result.success) {
      // Navigate to the protected part of the app
      console.log('Login successful! Navigate to dashboard.');
      // Example: navigation.navigate('Dashboard');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title={isLoading ? "Logging In..." : "Login"} onPress={handleLogin} disabled={isLoading} />
    </View>
  );
};

// Example Protected Screen Component
const ProtectedScreen = () => {
    const { user, logout, authenticatedRequest, isLoading } = useAuth();
    const [protectedData, setProtectedData] = useState(null);
    const [dataLoading, setDataLoading] = useState(false);

    // Example of fetching protected data
    const fetchProtectedData = async () => {
        setDataLoading(true);
        try {
            // Use the authenticatedRequest helper
            const data = await authenticatedRequest('get', '/protected-data'); // Assuming a /api/protected-data endpoint exists
            setProtectedData(data);
        } catch (error) {
            console.error('Error fetching protected data:', error);
            // Error handling is done within authenticatedRequest, but you can add more here
        } finally {
            setDataLoading(false);
        }
    };

    if (isLoading) {
        return <Text>Loading authentication state...</Text>;
    }

    if (!user) {
        // If no user (not authenticated), render the LoginScreen
        return <LoginScreen />;
    }

    // If user is authenticated, render the protected content
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome, {user.name}!</Text>
            <Button title="Fetch Protected Data" onPress={fetchProtectedData} disabled={dataLoading} />
            {dataLoading && <Text>Loading data...</Text>}
            {protectedData && (
                <View style={styles.dataContainer}>
                    <Text style={styles.dataTitle}>Protected Data:</Text>
                    <Text>{JSON.stringify(protectedData, null, 2)}</Text>
                </View>
            )}
            <Button title="Logout" onPress={logout} color="red" />
        </View>
    );
};


// Basic App structure using the AuthProvider
const Auth = () => {
  return (
    <AuthProvider>
      {/* ProtectedScreen will handle rendering LoginScreen if not authenticated */}
      <ProtectedScreen />
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
   dataContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e9e9e9',
    borderRadius: 5,
   },
   dataTitle: {
       fontSize: 18,
       marginBottom: 10,
       fontWeight: 'bold',
   }
});

export default Auth; // Export the main App component
