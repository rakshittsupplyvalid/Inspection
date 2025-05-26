import { StyleSheet } from 'react-native';

export default StyleSheet.create({

     container: {
        marginVertical: 12,
        paddingHorizontal: 5,
     
      },
      label: {
        fontSize: 14,
    fontWeight: '600',
        marginBottom: 6,
        color: '#1e1e1e',
      },
      pickerWrapper: {
        backgroundColor: '#ffffff',
        // backgroundColor : 'red',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
       
        elevation: 3, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      picker: {
        height: 50,
        color: '#333',
        width: '100%',
      },

    });