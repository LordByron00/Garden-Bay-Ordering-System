import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, FlatList, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import PaymentPopup from '../components/payment';
import axios from 'axios';
import CookieManager from '@react-native-cookies/cookies';




const { width, height } = Dimensions.get('window');
const CARD_SIZE = (width * 0.72) / 3; // Optimized card size

// Temporary Data
const categories = [
  { id: 'main', name: 'Main Dishes', icon: '🍲' },
  { id: 'side', name: 'Appetizers', icon: '🥗' },
  { id: 'drinks', name: 'Drinks', icon: '🥤' },
  { id: 'dessert', name: 'Desserts', icon: '🍰' },
];

const foodItems = [
  { id: '1', name: 'Grilled Salmon', price: 18.99, category: '1', image: require('../assets/salmon.jpg') },
  { id: '2', name: 'Truffle mushroom Pasta', price: 24.99, category: '1', image: require('../assets/truffle.jpg') },
  { id: '4', name: 'Shrimp Shrimp Pasta', price: 18.99, category: '1', image: require('../assets/peto-shrimp.jpg') },
  { id: '3', name: 'Chicken Adobo', price: 12.99, category: '2', image: require('../assets/chickenAdobo.jpg') },
  { id: '5', name: 'Beef Steak', price: 24.99, category: '2', image: require('../assets/steak.png') },
  { id: '13', name: 'Arroz Caldo', price: 24.99, category: '2', image: require('../assets/Arroz-Caldo-with-Chicken.jpg') },
  { id: '6', name: 'San Miguel', price: 12.99, category: '3', image: require('../assets/sanmiguel.jpg') },
  { id: '7', name: 'Heineken', price: 18.99, category: '3', image: require('../assets/Heineken.jpg') },
  { id: '8', name: 'Asahi ', price: 24.99, category: '3', image: require('../assets/Asahi.jpg') },
  { id: '9', name: 'Redhorse', price: 12.99, category: '3', image: require('../assets/redhorse2.jpg') },
  { id: '10', name: 'Caramel Ice Cream', price: 18.99, category: '4', image: require('../assets/ice-cream.jpg') },
  { id: '11', name: 'Banana Peanut Butter', price: 24.99, category: '4', image: require('../assets/banana-peanut-butter-smoothie-recipe-5.jpg') },
  { id: '12', name: 'Caesar Salad', price: 12.99, category: '4', image: require('../assets/Caesar-Salad-9.jpg') },
  // Add more items...
];

export default function MenuScreen() {
  const [activeCategory, setActiveCategory] = useState('main');
  const [orderItems, setOrderItems] = useState([]);
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [total, setTotal] = useState(0);
  const [menuData, setMenuData] = useState([]);


  useEffect(() => {
    const newTotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
    setTotal(newTotal);
    console.log('orderItems: ');
    console.log(orderItems);
    if (orderItems.length <= 0) {
      setShowOrderPanel(false);
    }
  }, [orderItems]); 

  useEffect(() => {
    console.log('MenuData updated:', menuData); 
  }, [menuData]); 

  const getMenu = () => {
    fetch('http://10.0.2.2:8000/menu')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setMenuData(data);
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setError(error.message);
      });
  };


  const convertImageUrl = (url) => {
    let corrected = url.replace('localhost:8000', '10.0.2.2:8000');
    if (!corrected.startsWith('http')) {
      corrected = `http://${corrected}`;
    }
    console.log(corrected);
    return corrected;
  };

  useEffect(() => {
    const abortController = new AbortController();
    getMenu();
    // fetchCsrfToken();
    return () => {
      abortController.abort();
    };
  }, []); 

  const handleAddToOrder = (item) => {
    setOrderItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? {...i, quantity: i.quantity + 1} : i);
      }
      return [...prev, {...item, quantity: 1}];
    });
    // console.log(orderItems);
    setShowOrderPanel(true);
  };

  
  // const api = axios.create({
  //   baseURL: 'http://10.0.2.2:8000',
  //   withCredentials: true,
  //   headers: {
  //     'Accept': 'application/json',
  //     'Content-Type': 'application/json'
  //   }
  // });

  // const fetchCsrfToken = async () => {
  //   console.log('[1/4] Getting CSRF token...');
  //   console.log('API Base URL:', api.defaults.baseURL);

  //   await api.get('/sanctum/csrf-cookie', { timeout: 10000 });
  //   console.log('CSRF token call completed.');
  // };


  //   const sendDataToLaravel = async () => {
  //     try {
  //       // await api.post('api/login', {
  //       //   email: 'Justbayr@gmail.com',
  //       //   password: 'Justine@123'
  //       // });
  //       const cookies = await CookieManager.get('http://10.0.2.2:8000');
  //       console.log('Cookies:', cookies);
    
  //       // 🔥 Extract XSRF-TOKEN and manually set it
  //       const xsrfToken = cookies['XSRF-TOKEN']?.value;
  //       if (xsrfToken) {
  //         api.defaults.headers.common['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
  //         console.log('Set X-XSRF-TOKEN header manually:', decodeURIComponent(xsrfToken));
  //       } else {
  //         console.warn('XSRF-TOKEN not found in cookies!');
  //       }
    
  //       console.log('[3/4] Sending order data...');
  //       console.log(orderItems);
    
  //       const response = await api.post('/order', {
  //         order_items: orderItems
  //       }, { timeout: 20000 });
    
  //       console.log('[4/4] Order created:', response.data);
  //       return response.data;
    
  //     } catch (error) {
  //       console.error('Full error debug:');
  //       console.log('Message:', error.message);
  //       if (error.response) {
  //         console.log('Status:', error.response.status);
  //         console.log('Data:', error.response.data);
  //       } else {
  //         console.log('No response from server');
  //       }
  //       throw error;
  //     }
  //   };
    
  const updateQuantity = (itemId, delta) => {
    setOrderItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newquantity = item.quantity + delta;
        return newquantity > 0 ? {...item, quantity: newquantity} : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeItem = (itemId) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId));
  };

  const cancelItem = () => {
    setOrderItems(prev => []);
    setShowOrderPanel(false);
  }

  const handleSuccessfulPayment = () => {
    cancelItem(); // Clear the orders list
  };

  return (
    <View style={styles.container}>

        <PaymentPopup
          visible={showPayment}
          onClose={() => setShowPayment(false)}
          totalAmount={total}
          orderItems ={orderItems}
          onPaymentSuccess = {handleSuccessfulPayment}
        />

      {/* Left Panel - Enhanced Categories */}
      <View style={styles.leftPanel}>
        {/* <img src={'../assets/bruschetta copy.jpg'} alt="Logo" /> */}
        <Image 
          source={require('../assets/gardenlogo.png')}
          style={[styles.headerImage, {width: 150, height: 150}]} // Adjust values as needed
          resizeMode="contain"
        />
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                activeCategory === item.id && styles.activeCategory
              ]}
              onPress={() => setActiveCategory(item.id)}
            >
              <Text style={styles.categoryIcon}>{item.icon}</Text>
              <Text style={activeCategory === item.id ? styles.activeCategoryText : styles.categoryText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Center Panel - Food Grid with Header */}
      
      <View style={styles.centerPanel}>
         {/* Add this overlay component */}
        {showOrderPanel}
        
        <Image 
          source={require('../assets/header-banner.png')}
          style={styles.headerImage}
          resizeMode="cover"
        />
        <FlatList
          data={menuData.filter(item => item.category === activeCategory && !item.archived)}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.gridContainer}
          renderItem={({ item }) => (
            <View style={styles.foodCard}>
              {/* <Image source={convertImageUrl(item.image_url)} style={styles.foodImage} /> */}

              <Image
                source={{ 
                  uri: convertImageUrl(item.image_url),
                  headers: {
                    Connection: 'keep-alive',
                    'Cache-Control': 'no-cache'
                  }
                }}
                style={styles.foodImage}
                // resizeMode="contain"
                onError={(e) => console.log('Error loading image:', e.nativeEvent.error)}
              />
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodPrice}>₱{item.price.toFixed(2)}</Text>
              </View>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => {
                  handleAddToOrder(item);
                }}
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      {/* Right Panel - Premium Order Details */}
      {showOrderPanel && orderItems.length > 0 && (
        <View style={styles.orderPanel}>
          <ScrollView contentContainerStyle={styles.orderContent}>

          <View style={styles.curOrderHeader}>
            <TouchableOpacity 
                style={styles.menuButton}
                onPress={() =>  setShowOrderPanel(false)}
              >
              <Icon name="bars" size={33} color="black."/>
            </TouchableOpacity>

            <Text style={styles.orderTitle}>Cart</Text>
          </View>
          
            
            {orderItems.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <Image
                  source={{ 
                    uri: convertImageUrl(item.image_url),
                    headers: {
                      Connection: 'keep-alive',
                      'Cache-Control': 'no-cache'
                    }
                  }}
                  style={styles.orderImage}
                  // resizeMode="contain"
                  onError={(e) => console.log('Error loading image:', e.nativeEvent.error)}
                />

                {/* Order details */}
                <View style={styles.orderInfo}>
                  <Text style={styles.orderName}>{item.name}</Text>
                  <Text style={styles.orderPrice}>₱{item.price.toFixed(2)}</Text>
                  
                  <View style={styles.quantityControls}>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, -1)}
                    >
                      <Text style={styles.quantityText}>-</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.quantityNumber}>{item.quantity}</Text>
                    
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, 1)}
                    >
                      <Text style={styles.quantityText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.orderdeltol}>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => removeItem(item.id)}
                  >
                    <Icon name="trash-o" size={27} color="#b3071b" />
                  </TouchableOpacity>
                  <Text style={styles.orderPrice}>₱{(item.price * item.quantity).toFixed(2)}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Total container  */}
          <View style={styles.totalContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>
                ₱{total}
              </Text>
            </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelButton}
                  onPress={() => cancelItem()}
                >
                <Text style={styles.checkoutText}>Cancel Order</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.checkoutButton}
                  onPress={async () => {setShowPayment(true)
                  }}
                >
                  <Text style={styles.checkoutText}>Confirm Order</Text>
                </TouchableOpacity>

              </View>
    
          </View>
        </View>
      )}

      {/* Floating Cart Button */}
      {!showOrderPanel && orderItems.length > 0 && (
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => setShowOrderPanel(true)}
        >
          <Icon name="shopping-cart" size={30} color="#040f04" />
          <Text style={styles.cartText}>{orderItems.reduce((sum, item) => sum + item.quantity, 0)}</Text>
        </TouchableOpacity>
      )}

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
  },
  leftPanel: {
    width: width * 0.2,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  panelTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 30,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 22,
    borderRadius: 15,
    marginBottom: 15,
    backgroundColor: '#F8F9FA',
  },
  activeCategory: {
    backgroundColor: '#1e3138',
    color: '#f7f7f7',
  },
  activeCategoryText: {
      fontSize: 24,
  fontWeight: '600',
  color: '#f7f7f7',
  },
  categoryIcon: {
    fontSize: 40,
    marginRight: 20,
  },
  categoryText: {
    fontSize: 24,
    color: '#2C3E50',
    fontWeight: '600',
  },
  centerPanel: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerImage: {
    width: '100%',
    height: 180,
    marginBottom: 20,
    resizeMode: 'cover',
    position: 'relative', // Ensure proper stacking
    zIndex: 1,
    alignSelf: 'center',
  },
  gridContainer: {
    paddingHorizontal: 8,
  },
  foodCard: {
    width: CARD_SIZE,
    height: CARD_SIZE + 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  foodImage: {
    width: '100%',
    height: CARD_SIZE * 0.8,
    resizeMode: 'cover',
  },
  foodInfo: {
    padding: 15,
  },
  orderdeltol: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 5,
  },
  foodName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 5,
  },
  foodPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#444',
  },
  addButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: '#1e3138',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 32,
  },
  orderPanel: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
    zIndex: 2,
    width: width * 0.27,
    justifyContent: 'space-between',
  },
  curOrderHeader: {
    flexDirection: 'row',
    backgroundColor: '#50636b',
    alignContent: 'center',
    padding: 18,
  },
  orderTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 160,
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
  },
  orderImage: {
    width: 100,
    height: 100,
    borderRadius: 15,
    marginRight: 20,
  },
  orderInfo: {
    flex: 1,
    marginLeft: 15,
  },
  orderName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 5,
  },
  orderPrice: {
    fontSize: 20,
    color: '#424242',
    marginBottom: 5,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  menuButton: {
    marginLeft: 5,
    marginTop: 3,
  },
  quantityButton: {
    backgroundColor: '#1e3138',
    width: 32,
    height: 32,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 28,
  },
  quantityNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center',
  },
  deleteButton: {
    padding: 10,
    marginLeft: 15,
  },
  deleteText: {
    fontSize: 36,
    color: '#FF4444',
    lineHeight: 36,
  },
  totalContainer: {
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 25,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  totalLabel: {
    fontSize: 28,
    fontWeight: '600',
    color: '#2C3E50',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#424242',
  },
  cancelButton: {
    backgroundColor: '#b30b0b',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    width: 220
  },
  checkoutButton: {
    backgroundColor: '#1e3138',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    width: 220,
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  cartButton: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    backgroundColor: '#4CAF50',
    borderRadius: 35,
    padding: 25,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  cartText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
});
