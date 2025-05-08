import api from './apiClient';
import { fetchCsrfToken } from './csrfService';
import { setXsrfToken } from './apiClient';

export const createOrder = async (orderItems) => {
  try {
    await fetchCsrfToken();
    await setXsrfToken();

    console.log('[3/4] Sending order data...');
    console.log(orderItems);

    const response = await api.post('/order', {
      order_items: orderItems
    }, { timeout: 20000 });

    console.log('[4/4] Order created:', response.data);
    return response.data;

  } catch (error) {
    console.error('Order creation error:');
    console.log('Message:', error.message);
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('No response from server');
    }
    
    throw error;
  }
};