// CheckoutScreen.js
import React from 'react';
import { View, Text, Button } from 'react-native';
import axios from 'axios';

export default function CheckoutScreen({ route, navigation }) {
  const { cart } = route.params;
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = () => {
    axios.post('http://<YOUR-IP>:8000/api/orders', {
      customer_name: 'Guest',
      total_price: total,
      items: cart.map(item => ({ menu_item_id: item.id, quantity: item.quantity, price: item.price })),
    }).then(() => navigation.navigate('Home'));
  };

  return (
    <View>
      <Text style={{ fontSize: 24 }}>Order Summary</Text>
      {cart.map(item => (
        <Text key={item.id}>{item.name} x{item.quantity} = ${item.price * item.quantity}</Text>
      ))}
      <Text>Total: ${total.toFixed(2)}</Text>
      <Button title="Confirm Order" onPress={handleCheckout} />
    </View>
  );
}
