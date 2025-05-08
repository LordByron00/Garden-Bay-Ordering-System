import React, { useState } from 'react';
import { Dimensions, View, Text, Modal, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { createOrder } from '../api/orderService';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const PaymentPopup = ({ totalAmount, onClose, visible, orderItems, onPaymentSuccess}) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  const paymentMethods = [
    { id: 'credit', name: 'Credit Card', icon: 'credit-card' },
    { id: 'GCash', name: 'GCash', icon: 'mobile' },
    { id: 'google', name: 'Google Pay', icon: 'google' },
    { id: 'cash', name: 'Cash', icon: 'money' },
  ];



  // In a component
  const handleOrder = async () => {
    try {
      // Then create order
      const result = await createOrder(orderItems);
      console.log('Order result:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handlePayment = async () => {

    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    setError('');
    setIsProcessing(true);

    // Simulate payment processing for 3 seconds
    setTimeout(() => {
      setIsProcessing(false);
      setShowReceipt(true);
      handleOrder();
    }, 2500);

  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    onClose(); // Close the entire modal

    onPaymentSuccess();
    // Here you would typically save the transaction to your database/state
    console.log('Transaction completed:', {
      amount: totalAmount,
      method: selectedMethod,
      date: new Date().toISOString()
    });
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString();
  };

  const ReceiptView = () => (
    <View style={styles.receiptContainer}>
      <Text style={styles.receiptHeader}>Payment Receipt</Text>
      <Text style={styles.receiptDate}>{getCurrentDateTime()}</Text>
      
      <View style={styles.receiptDivider} />
      
      {orderItems.map((item) => (
        <View key={item.id} style={styles.receiptRow}>
          <Text style={styles.receiptLabel}>{item.name}</Text>
          <Text style={styles.receiptValue}>₱{item.price.toFixed(2)} {item.qty}x</Text>
        </View>
      ))}
      
      <View style={styles.receiptDivider} />

      <View style={styles.receiptRow}>
        <Text style={styles.receiptLabel}>Total:</Text>
        <Text style={styles.receiptValue}>₱{totalAmount}</Text>
      </View>
      
      <View style={styles.receiptRow}>
        <Text style={styles.receiptLabel}>Payment Method:</Text>
        <Text style={styles.receiptValue}>
          {paymentMethods.find(m => m.id === selectedMethod)?.name}
        </Text>
      </View>
      
      <View style={styles.receiptDivider} />
      
      <Text style={styles.receiptThankYou}>Thank you for your purchase!</Text>
      
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={handleCloseReceipt}
      >
        <Text style={styles.closeButtonText}>Close Receipt</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal transparent visible={visible} animationType="slide">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.overlay}>
          <View style={styles.popup}>
            {showReceipt ? (
              <ReceiptView />
            ) : isProcessing ? (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color="#2ecc71" />
                <Text style={styles.processingText}>Processing Payment...</Text>
              </View>
            ) : (
              <>
                <View style={styles.header}>
                  <Text style={styles.title}>Payment</Text>
                  <TouchableOpacity onPress={onClose}>
                    <Icon name="times" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                  <Text style={styles.total}>Total: ₱{totalAmount}</Text>

                  <Text style={styles.sectionTitle}>Select Payment Method</Text>
                  {paymentMethods.map((method) => (
                    <TouchableOpacity
                      key={method.id}
                      style={[
                        styles.methodButton,
                        selectedMethod === method.id && styles.selectedMethod
                      ]}
                      onPress={() => setSelectedMethod(method.id)}
                    >
                      <Icon 
                        name={method.icon} 
                        size={24} 
                        color={selectedMethod === method.id ? '#2ecc71' : '#666'} 
                      />
                      <Text style={styles.methodText}>{method.name}</Text>
                      {selectedMethod === method.id && (
                        <Icon name="check" size={18} color="#2ecc71" style={styles.checkIcon} />
                      )}
                    </TouchableOpacity>
                  ))}

                  {error ? <Text style={styles.error}>{error}</Text> : null}

                  <TouchableOpacity 
                    style={styles.payButton} 
                    onPress={handlePayment}
                    disabled={isProcessing}
                  >
                    <Text style={styles.payButtonText}>Confirm Payment</Text>
                    <Icon name="lock" size={18} color="white" />
                  </TouchableOpacity>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  popup: {
    backgroundColor: 'white',
    borderRadius: 20,
    maxHeight: '80%',
    zIndex: 999,
    width: windowWidth * 0.9,
    maxWidth: '35%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 20,
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedMethod: {
    borderColor: '#2ecc71',
    backgroundColor: '#f8fff8',
  },
  methodText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  checkIcon: {
    marginLeft: 'auto',
  },
  payButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 10,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  processingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#333',
  },
  receiptViewShot: {
    padding: 30,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',

  },
  receiptContainer: {
    alignItems: 'center',
    padding: 30,

  },
  receiptHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  receiptDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  receiptDivider: {
    height: 1,
    width: '100%',
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  receiptLabel: {
    fontSize: 16,
    color: '#666',
  },
  receiptValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  receiptThankYou: {
    marginTop: 20,
    fontSize: 16,
    fontStyle: 'italic',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PaymentPopup;