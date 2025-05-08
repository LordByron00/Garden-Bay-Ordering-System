import React, { useState, useEffect, createContext, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // You'll need to install this package
import axios from 'axios'; // You'll need to install axios

// Define your Laravel API base URL
const API_BASE_URL = 'http://10.0.2.2:8000/api'; // Replace with your actual backend URL

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
          // This helps verify the token is still valid
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
      console.log(authToken)
      console.log(user)


      return { success: true }; // Indicate success
    } catch (error) {
      console.error('Login failed:', error);
      // Handle specific error responses from backend (e.g., validation errors)
      if (error.response && error.response.data && error.response.data.message) {
         Alert.alert('Login Failed', error.response.data.message);
      } else if (error.response && error.response.data && error.response.data.errors) {
          // Handle Laravel validation errors
          const errors = error.response.data.errors;
          let errorMessage = 'Validation Errors:\n';
          for (const field in errors) {
              errorMessage += `- ${errors[field].join(', ')}\n`;
          }
          Alert.alert('Login Failed', errorMessage);
      }
      else {
         Alert.alert('Login Failed', 'An unexpected error occurred.');
      }
      setAuthToken(null); // Ensure token is null on failure
      setUser(null);
      return { success: false, error: error.message }; // Indicate failure
    } finally {
      setIsLoading(false);
    }
  };

    /**
     * Function to handle user registration.
     * Assumes backend returns token and user data upon successful registration.
     */
    const register = async (name, email, password, passwordConfirmation) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/register`, {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation, // Backend expects password_confirmation
                 // You might send a device_name here too
                // device_name: 'react_native_app',
            });

            const { token, user: userData, message } = response.data;

            // Store the token (assuming backend logs in user upon registration)
            await AsyncStorage.setItem('authToken', token);
            setAuthToken(token);
            setUser(userData); // Store user data

            Alert.alert('Registration Successful', message || 'You have been registered and logged in.');

            return { success: true }; // Indicate success

        } catch (error) {
            console.error('Registration failed:', error);
             // Handle specific error responses from backend (e.g., validation errors)
            if (error.response && error.response.data && error.response.data.message) {
               Alert.alert('Registration Failed', error.response.data.message);
            } else if (error.response && error.response.data && error.response.data.errors) {
                // Handle Laravel validation errors
                const errors = error.response.data.errors;
                let errorMessage = 'Validation Errors:\n';
                for (const field in errors) {
                    errorMessage += `- ${errors[field].join(', ')}\n`;
                }
                Alert.alert('Registration Failed', errorMessage);
            }
            else {
               Alert.alert('Registration Failed', 'An unexpected error occurred.');
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
      // Use authenticatedRequest to ensure token is included
      await authenticatedRequest('post', '/logout', {});
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
         console.warn('Authentication failed (401) during user fetch. Token might be invalid. Logging out.');
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
      // Or throw an error that a parent component can catch to redirect
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
      console.error(`Authenticated ${method} request to ${url} failed:`, error);
       // Handle 401 Unauthorized errors specifically
       if (error.response && error.response.status === 401) {
           console.warn('Authentication failed (401). Token might be invalid. Logging out.');
           logout(); // Log out the user if token is invalid
       }
      throw error; // Re-throw the error for the component to handle
    }
  };

  return (
    <AuthContext.Provider value={{ authToken, user, isLoading, login, register, logout, authenticatedRequest }}>
      {children}
    </AuthContext.Provider>
  );
};

// Example Login Screen Component
const LoginScreen = ({ onNavigateToRegister }) => { // Added prop to navigate
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
        editable={!isLoading} // Disable input while loading
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading} // Disable input while loading
      />
      <Button title={isLoading ? "Logging In..." : "Login"} onPress={handleLogin} disabled={isLoading} />

      {/* Button to navigate to registration screen */}
      <TouchableOpacity onPress={onNavigateToRegister} style={styles.switchButton}>
          <Text style={styles.switchButtonText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

// New Registration Screen Component
const RegisterScreen = ({ onNavigateToLogin }) => { // Added prop to navigate
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const { register, isLoading } = useAuth(); // Use the custom hook

    const handleRegister = async () => {
        const result = await register(name, email, password, passwordConfirmation);
        if (result.success) {
            // Registration successful, AuthProvider should have logged them in
            console.log('Registration successful! User is now logged in.');
            // App will automatically show ProtectedScreen because user state is set
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register</Text>
            <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!isLoading} // Disable input while loading
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading} // Disable input while loading
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading} // Disable input while loading
            />
             <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={passwordConfirmation}
                onChangeText={setPasswordConfirmation}
                secureTextEntry
                editable={!isLoading} // Disable input while loading
            />
            <Button title={isLoading ? "Registering..." : "Register"} onPress={handleRegister} disabled={isLoading} />

            {/* Button to navigate back to login screen */}
            <TouchableOpacity onPress={onNavigateToLogin} style={styles.switchButton}>
                <Text style={styles.switchButtonText}>Already have an account? Login</Text>
            </TouchableOpacity>
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
            const data = await authenticatedRequest('get', '/user'); // Fetch user data again as an example
            setProtectedData(data);
        } catch (error) {
            console.error('Error fetching protected data:', error);
            // Error handling is done within authenticatedRequest, but you can add more here
        } finally {
            setDataLoading(false);
        }
    };

    // Render loading state while checking authentication
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading authentication state...</Text>
            </View>
        );
    }

    // If user is authenticated, render the protected content
    if (user) {
         return (
            <View style={styles.container}>
                <Text style={styles.title}>Welcome, {user.name}!</Text>
                <Button title="Fetch User Data (Protected)" onPress={fetchProtectedData} disabled={dataLoading} />
                {dataLoading && <Text>Loading data...</Text>}
                {protectedData && (
                    <View style={styles.dataContainer}>
                        <Text style={styles.dataTitle}>Fetched User Data:</Text>
                        <Text>{JSON.stringify(protectedData, null, 2)}</Text>
                    </View>
                )}
                <Button title="Logout" onPress={logout} color="red" />
            </View>
        );
    }

    // If not loading and no user, this component won't be rendered directly
    // The parent component (App in this example) will decide which screen to show
    return null; // Should not reach here if App component handles routing
};


// Basic App structure using the AuthProvider and simple screen switching
const App = () => {
  const { user, isLoading } = useAuth(); // Get auth state from provider
  const [isRegistering, setIsRegistering] = useState(false); // State to toggle between login/register

  // Show loading state while AuthProvider is checking storage
  if (isLoading) {
      return (
          <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text>Loading app...</Text>
          </View>
      );
  }

  // If user is authenticated, show the protected screen
  if (user) {
      return <ProtectedScreen />;
  }

  // If not authenticated, show either the Login or Register screen
  if (isRegistering) {
      return <RegisterScreen onNavigateToLogin={() => setIsRegistering(false)} />;
  } else {
      return <LoginScreen onNavigateToRegister={() => setIsRegistering(true)} />;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    fontSize: 16,
  },
   dataContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e9e9e9',
    borderRadius: 8,
   },
   dataTitle: {
       fontSize: 18,
       marginBottom: 10,
       fontWeight: 'bold',
   },
   switchButton: {
       marginTop: 20,
       alignItems: 'center',
   },
   switchButtonText: {
       color: '#007bff',
       fontSize: 16,
   }
});

// Export the main App component wrapped with AuthProvider
const register = () => (
    <AuthProvider>
        <App />
    </AuthProvider>
);

export default register;
