import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';

const { width } = Dimensions.get('window');

// Temporary food data - this would normally come from your database
const menuData = {
  'Main Courses': [
    {
      id: 1,
      name: 'Grilled Salmon',
      description: 'Fresh Atlantic salmon with lemon butter sauce',
      price: 18.99,
      image: require('../assets/salmon.jpg'), // Replace with actual image
    },
    {
      id: 2,
      name: 'Beef Steak',
      description: 'Premium cut with roasted vegetables',
      price: 22.99,
      image: require('../assets/steak.jpg'), // Replace with actual image
    },
    {
      id: 3,
      name: 'Vegetable Pasta',
      description: 'Penne with seasonal vegetables in tomato sauce',
      price: 14.99,
      image: require('../assets/pasta.jpg'), // Replace with actual image
    },
  ],
  'Appetizers': [
    {
      id: 4,
      name: 'Bruschetta',
      description: 'Toasted bread with tomatoes, garlic and basil',
      price: 7.99,
      image: require('../assets/bruschetta.jpg'), // Replace with actual image
    },
    {
      id: 5,
      name: 'Spring Rolls',
      description: 'Crispy vegetable spring rolls with sweet chili sauce',
      price: 6.99,
      image: require('../assets/springrolls.jpg'), // Replace with actual image
    },
  ],
  'Drinks': [
    {
      id: 6,
      name: 'Fresh Lemonade',
      description: 'Homemade with fresh lemons and mint',
      price: 4.99,
      image: require('../assets/lemonade.jpg'), // Replace with actual image
    },
    {
      id: 7,
      name: 'Iced Coffee',
      description: 'Cold brew with milk and vanilla syrup',
      price: 5.99,
      image: require('../assets/coffee.jpg'), // Replace with actual image
    },
  ],
  'Desserts': [
    {
      id: 8,
      name: 'Chocolate Cake',
      description: 'Rich chocolate cake with raspberry sauce',
      price: 8.99,
      image: require('../assets/cake.jpg'), // Replace with actual image
    },
    {
      id: 9,
      name: 'Tiramisu',
      description: 'Classic Italian dessert with coffee flavor',
      price: 9.99,
      image: require('../assets/tiramisu.jpg'), // Replace with actual image
    },
  ],
};

const FoodCard = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.foodCard} onPress={onPress}>
      <Image source={item.image} style={styles.foodImage} />
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodDescription}>{item.description}</Text>
        <Text style={styles.foodPrice}>${item.price.toFixed(2)}</Text>
      </View>
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function MenuScreen({ route }) {
  const { orderType } = route.params;
  const [activeCategory, setActiveCategory] = useState('Main Courses');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu - {orderType}</Text>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {Object.keys(menuData).map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              activeCategory === category && styles.activeCategoryButton,
            ]}
            onPress={() => setActiveCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              activeCategory === category && styles.activeCategoryText,
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Food Items */}
      <ScrollView style={styles.menuContainer}>
        {menuData[activeCategory].map((item) => (
          <FoodCard
            key={item.id}
            item={item}
            onPress={() => console.log('Selected:', item.name)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 20,
    backgroundColor: '#2c3e50',
  },
  headerTitle: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  categoryContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryContent: {
    paddingHorizontal: 15,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginRight: 10,
  },
  activeCategoryButton: {
    borderBottomWidth: 3,
    borderBottomColor: '#4CAF50',
  },
  categoryText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeCategoryText: {
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  menuContainer: {
    flex: 1,
    padding: 15,
  },
  foodCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  foodImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  foodInfo: {
    flex: 1,
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  foodDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  foodPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  addButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    lineHeight: 24,
  },
});
