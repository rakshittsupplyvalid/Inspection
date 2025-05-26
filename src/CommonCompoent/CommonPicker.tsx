import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import styles from './CommonPickerstyles'; // Assuming you have a separate styles file

interface CommonPickerProps {
  selectedValue: string;
  onValueChange: (itemValue: string, itemIndex: number) => void;
  items: { label: string; value: string }[];
  label?: string;
}

const CommonPicker: React.FC<CommonPickerProps> = ({
  selectedValue,
  onValueChange,
  items,
  label,
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={styles.picker}
          dropdownIconColor="#555"
        >
          {items.map((item, index) => (
            <Picker.Item key={index} label={item.label} value={item.value} />
          ))}
        </Picker>
      </View>
    </View>
  );
};

export default CommonPicker;


