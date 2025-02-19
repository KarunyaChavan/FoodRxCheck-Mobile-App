import { View, Text, Alert, TextInput, StyleSheet } from 'react-native';
import supabase from '../lib/supabase';
import React, { useState } from 'react';
import Button from '../components/Button';
import { useRouter,Stack } from 'expo-router';
import { useAuth } from '../provider/AuthProvider';

const ResetPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setResetPending } = useAuth();

  // Handle password update
  async function updatePassword() {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
  
    // Attempt to update password
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      console.error('Error updating password:', error);
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Password updated successfully! Please log in again.');
      setResetPending(false);
      await supabase.auth.signOut();
      router.replace('/sign-in');
    }

    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
              options={{
                headerTransparent: false,
                title: "Update Password",
                headerStyle: { backgroundColor: "#0a7ea4" },
                headerTintColor: "#fff",
              }}
            />
      <Text style={styles.label}>New Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Enter new password"
        style={styles.input}
        secureTextEntry
      />
      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm new password"
        style={styles.input}
        secureTextEntry
      />
      <Button text={loading ? 'Updating...' : 'Update Password'} onPress={updatePassword} disabled={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
    flex: 1,
  },
  label: {
    color: 'gray',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 5,
  },
});

export default ResetPasswordScreen;
