// src/styles/LoginStyles.ts
import { StyleSheet } from 'react-native';



export default StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },

  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#36c898',
    marginBottom: 20,
    textAlign: 'center',
  },

  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 6,
    marginTop: 12,
  },

  dropdownWrapper: {
    borderWidth: 1,
    borderColor: '#36c898',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },

  picker: {
    height: 50,
    color: '#000',
  },

  input: {
    borderWidth: 1,
    borderColor: '#36c898',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
  },

  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
   buttoncontent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,

  }
  
});
