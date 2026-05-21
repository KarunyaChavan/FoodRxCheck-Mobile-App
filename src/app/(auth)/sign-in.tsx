/**
 * @file Renders the healthcare professional sign-in screen and starts
 * Supabase email/password authentication.
 */

import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, Alert, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

import Button from '../../components/Button';
import Colors from '../../constant/Colors';
import supabase from '../../lib/supabase';

/**
 * Displays the HCP login form and navigation to password reset/sign-up flows.
 */
const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /**
   * Signs an HCP into Supabase with the entered email and password.
   */
  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTransparent: false,
          title: 'Sign In',
          headerStyle: { backgroundColor: '#0a7ea4' },
          headerTintColor: '#fff',
        }}
      />
      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="jon@gmail.com"
        style={styles.input}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="password"
        style={styles.input}
        secureTextEntry
      />
      <TouchableOpacity onPress={() => router.push('/resetpass')} style={styles.forgotButton}>
        <Text style={{ color: '#0a7ea4' }}>Forgot Password ?</Text>
      </TouchableOpacity>
      <Button
        text={loading ? 'Signing in...' : 'Sign in'}
        onPress={signInWithEmail}
        disabled={loading}
      />

      <TouchableOpacity onPress={() => router.replace('/sign-up')} style={styles.textButton}>
        <Text style={{ color: '#0a7ea4' }}>Create an account</Text>
      </TouchableOpacity>
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
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginTop: 5,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  textButton: {
    alignSelf: 'center',
    fontWeight: 'bold',
    color: Colors.light.tint,
    marginVertical: 10,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    fontWeight: 'bold',
    color: Colors.light.tint,
    marginVertical: 3,
  },
});

export default SignInScreen;
