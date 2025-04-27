import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, FlatList, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';


const { width, height } = Dimensions.get('window');
const CARD_SIZE = (width * 0.72) / 3; // Optimized card size

// Temporary Data
const categories = [
  { id: '1', name: 'Main Dishes', icon: '🍲' },
  { id: '2', name: 'Appetizers', icon: '🥗' },
  { id: '3', name: 'Drinks', icon: '🥤' },
  { id: '4', name: 'Desserts', icon: '🍰' },
];

const foodItems = [
  { id: '1', name: 'Grilled Salmon', price: 18.99, category: '1', image: require('../assets/salmon.jpg') },
  { id: '2', name: 'Beef Steak', price: 24.99, category: '1', image: require('../assets/steak.jpg') },
  { id: '3', name: 'Caesar Salad', price: 12.99, category: '2', image: require('../assets/salad.jpg') },
  { id: '4', name: 'Grilled Salmon', price: 18.99, category: '1', image: require('../assets/salmon.jpg') },
  { id: '5', name: 'Beef Steak', price: 24.99, category: '2', image: require('../assets/steak.jpg') },
  { id: '6', name: 'Caesar Salad', price: 12.99, category: '3', image: require('../assets/salad.jpg') },
  { id: '7', name: 'Grilled Salmon', price: 18.99, category: '3', image: require('../assets/salmon.jpg') },
  { id: '8', name: 'Beef Steak', price: 24.99, category: '3', image: require('../assets/steak.jpg') },
  { id: '9', name: 'Caesar Salad', price: 12.99, category: '4', image: require('../assets/salad.jpg') },
  { id: '10', name: 'Grilled Salmon', price: 18.99, category: '4', image: require('../assets/salmon.jpg') },
  { id: '11', name: 'Beef Steak', price: 24.99, category: '4', image: require('../assets/steak.jpg') },
  { id: '12', name: 'Caesar Salad', price: 12.99, category: '3', image: require('../assets/salad.jpg') },
  // Add more items...
];

export default function MenuScreen() {
  const [activeCategory, setActiveCategory] = useState('1');
  const [orderItems, setOrderItems] = useState([]);
  const [showOrderPanel, setShowOrderPanel] = useState(false);

  const handleAddToOrder = (item) => {
    setOrderItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? {...i, qty: i.qty + 1} : i);
      }
      return [...prev, {...item, qty: 1}];
    });
    setShowOrderPanel(true);
  };

  const updateQuantity = (itemId, delta) => {
    setOrderItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = item.qty + delta;
        return newQty > 0 ? {...item, qty: newQty} : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeItem = (itemId) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId));
  };

  return (
    <View style={styles.container}>
      {/* Left Panel - Enhanced Categories */}
      <View style={styles.leftPanel}>
        <Text style={styles.panelTitle}>Categories</Text>
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
              <Text style={styles.categoryText}>{item.name}</Text>
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
          data={foodItems.filter(item => item.category === activeCategory)}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.gridContainer}
          renderItem={({ item }) => (
            <View style={styles.foodCard}>
              <Image source={item.image} style={styles.foodImage} />
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodPrice}>${item.price.toFixed(2)}</Text>
              </View>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => handleAddToOrder(item)}
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      {/* Right Panel - Premium Order Details */}
      {showOrderPanel && (
        <View style={styles.orderPanel}>
          <ScrollView contentContainerStyle={styles.orderContent}>
          <TouchableOpacity 
            // style={styles.quantityButton}
            onPress={() =>  setShowOrderPanel(false)}
          >
            <Text style={styles.deleteText}>≡</Text>
          </TouchableOpacity>
          
            <Text style={styles.orderTitle}>Current Order</Text>
            
            {orderItems.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <Image source={item.image} style={styles.orderImage} />
                
                <View style={styles.orderInfo}>
                  <Text style={styles.orderName}>{item.name}</Text>
                  <Text style={styles.orderPrice}>${item.price.toFixed(2)}</Text>
                  
                  <View style={styles.quantityControls}>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, -1)}
                    >
                      <Text style={styles.quantityText}>-</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.quantityNumber}>{item.qty}</Text>
                    
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
                    <Text style={styles.deleteText}>x</Text>
                  </TouchableOpacity>
                  <Text style={styles.orderPrice}>${(item.price * item.qty).toFixed(2)}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.totalContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>
                ${orderItems.reduce((sum, item) => sum + (item.price * item.qty), 0).toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity style={styles.checkoutButton}>
              <Text style={styles.checkoutText}>Confirm Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Floating Cart Button */}
      {!showOrderPanel && orderItems.length > 0 && (
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => setShowOrderPanel(true)}
        >
          <Text style={styles.cartText}>🛒 {orderItems.reduce((sum, item) => sum + item.qty, 0)}</Text>
          <Icon name="shopping-cart" size={30} color="#040f04" />
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
    backgroundColor: '#4CAF50',
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
    color: '#333',
    marginBottom: 5,
  },
  foodPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  addButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: '#4CAF50',
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
  orderTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    margin: 25,
    marginBottom: 30,
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
    color: '#4CAF50',
    marginBottom: 5,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  quantityButton: {
    backgroundColor: '#4CAF50',
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
    color: '#4CAF50',
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
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
