// src/styles/LoginStyles.ts
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#ffffff', 
   
  },

  heading: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '700',
    color: '#2d3748',
    letterSpacing: 0.5,
  } ,
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 15,
    marginBottom: 20,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    backgroundColor: '#FF9500',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    color: '#e53e3e',
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
  },
  forgotPassword: {
    marginTop: 15,
    textAlign: 'center',
    color: '#FF9500',
    fontSize: 14,
    fontWeight: '500',
  },
  footerText: {
    marginTop: 30,
    textAlign: 'center',
    color: '#718096',
    fontSize: 14,
  },
  linkText: {
    color: '#36c898',
    fontWeight: '600',
  },
});