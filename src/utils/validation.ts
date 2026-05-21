/**
 * @file Helper utilities for client-side form validation.
 */

/**
 * Validates whether the given string is a properly formatted email.
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength (minimum 6 characters as required by default Supabase setup).
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};
