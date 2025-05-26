import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Image, ActivityIndicator, FlatList } from 'react-native';
import CommonPicker from '../../CommonCompoent/CommonPicker';
import useForm from '../../Common/UseForm';
import { launchCamera, ImagePickerResponse } from 'react-native-image-picker';
import * as Location from 'expo-location';
import ViewShot from 'react-native-view-shot';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { PermissionsAndroid } from 'react-native';

type ImageAsset = {
  uri: string;
  fileName: string;
  type: string;
};

type Chawl = {
  length: string;
  breadth: string;
  height: string;
};

const ReviewForm = () => {
  const { state, updateState } = useForm();
  const [currentStep, setCurrentStep] = useState(1);
  const [imageUri, setImageUri] = useState<ImageAsset[]>([]);
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [screenshoturi, setscreenshoturi] = useState<ImageAsset[]>([]);
  const [address, setAddress] = useState<Location.LocationGeocodedAddress | null>(null);
  const [formattedAddress, setFormattedAddress] = useState('');

  const [noOfChawls, setNoOfChawls] = useState('');
  const [chawlList, setChawlList] = useState<Chawl[]>([]);


  const viewShotRef = useRef<ViewShot>(null);
  const totalSteps = 6;

  const pickerItems1 = [
    { label: 'Federation Name', value: '' },
    { label: 'Krishi Mitra Federation', value: 'fedone' },
    { label: 'AgroVikas Mahasangh', value: 'fedtwo' },
  ];

  const pickerItems2 = [
    { label: 'FPO/FPC', value: '' },
    { label: 'Green Harvest FPO', value: 'fpcone' },
    { label: 'Kisan Uday Producer Company', value: 'fpctwo' },
  ];

  const pickerItems3 = [
    { label: 'Storage location', value: '' },
    { label: 'Godown A - Sector 12', value: 'godownA' },
    { label: 'Rural Storage - Village X', value: 'villageX' },
  ];

  const qualityOptions = [
    { label: 'Select Quality', value: '' },
    { label: 'Excellent', value: 'excellent' },
    { label: 'Good', value: 'good' },
    { label: 'Average', value: 'average' },
    { label: 'Poor', value: 'poor' },
  ];

  const staffBehaviorOptions = [
    { label: 'Select Behavior Rating', value: '' },
    { label: 'Excellent', value: 'excellent' },
    { label: 'Good', value: 'good' },
    { label: 'Satisfactory', value: 'satisfactory' },
    { label: 'Poor', value: 'poor' },
  ];

  const fetchLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Location permission denied');
      return;
    }

    let locationData = await Location.getCurrentPositionAsync({});
    setLocation(locationData.coords);

    // Reverse Geocoding (Convert Lat/Lng to Address)
    let reverseGeocode = await Location.reverseGeocodeAsync({
      latitude: locationData.coords.latitude,
      longitude: locationData.coords.longitude,
    });

    if (reverseGeocode.length > 0) {
      setAddress(reverseGeocode[0] || null);
      const address = `${reverseGeocode[0].name}, ${reverseGeocode[0].city}, ${reverseGeocode[0].region}, ${reverseGeocode[0].country}`;
      setFormattedAddress(address);
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Camera permission granted');
          openCamera();
        } else {
          console.log('Camera permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      openCamera(); // iOS me direct open
    }
  };

  const openCamera = async () => {
    launchCamera(
      {
        mediaType: 'photo',
        includeBase64: false,
        cameraType: 'back',
        quality: 0.4,
        maxWidth: 700,
        maxHeight: 700,
      },
      async (response: ImagePickerResponse) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorMessage) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const capturedImage = response.assets[0];

          const image = {
            uri: capturedImage.uri ?? '',
            fileName: capturedImage.fileName || `photo_${Date.now()}.jpg`,
            type: capturedImage.type || 'image/jpeg',
          };

          // Save captured image in state
          setImageUri((prevImages) => [...prevImages, image]);

          await fetchLocation();

          // Delay screenshot by 1 second
          setTimeout(async () => {
            try {
              if (viewShotRef.current) {
                console.log('Capturing screenshot...');
                let screenshot: string | undefined;
                if (viewShotRef.current && typeof viewShotRef.current.capture === 'function') {
                  screenshot = await viewShotRef.current.capture();
                }

                if (screenshot) {
                  console.log('Screenshot 1234:', screenshot);

                  const screenshotImage = {
                    uri: screenshot,
                    fileName: `screenshot_${Date.now()}.jpg`,
                    type: 'image/jpeg',
                  };

                  setscreenshoturi((prevImages) => [...prevImages, screenshotImage]);
                } else {
                  console.log('Screenshot capture failed.');
                }
              } else {
                console.log('viewShotRef is null.');
              }
            } catch (error) {
              console.error('Error capturing screenshot:', error);
            }
          }, 1000);
        }
      }
    );
  };

const handleChawlCountChange = (val: string) => {
  const numericValue = val.replace(/[^0-9]/g, '');

  updateState({
    form: {
      ...state.form,
      noOfChawls: numericValue,
    },
  });

  let num = parseInt(numericValue);
  if (isNaN(num) || num < 1) {
    // User cleared the input or entered 0 — show 1 default chawl
    setChawlList([{ length: '', breadth: '', height: '' }]);
    return;
  }

  // Build or trim the list to match count
  const updatedList: Chawl[] = Array.from({ length: num }, (_, index) => {
    return chawlList[index] || { length: '', breadth: '', height: '' };
  });
  setChawlList(updatedList);
};



  const handleChawlDimensionChange = (index: number, field: keyof Chawl, value: string) => {
    const updatedList = [...chawlList];
    updatedList[index] = {
      ...updatedList[index],
      [field]: value
    };
    setChawlList(updatedList);
    updateState({
      form: {
        ...state.form,
        chawlDimensions: updatedList
      }
    });
  };










  const handleSubmit = () => {
    console.log('Form Data:', state.form);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.card}>
            <Text style={styles.stepIndicator}>Step {currentStep} of {totalSteps}</Text>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <CommonPicker
              selectedValue={state.form.option1 || ''}
              onValueChange={(value) =>
                updateState({ form: { ...state.form, option1: value } })
              }
              items={pickerItems1}
              label="FEDERATION NAME"
            />

            <CommonPicker
              selectedValue={state.form.option2 || ''}
              onValueChange={(value) =>
                updateState({ form: { ...state.form, option2: value } })
              }
              items={pickerItems2}
              label="FPC/FPO"
            />

            <CommonPicker
              selectedValue={state.form.option3 || ''}
              onValueChange={(value) =>
                updateState({ form: { ...state.form, option3: value } })
              }
              items={pickerItems3}
              label="STORAGE LOCATION"
            />
          </View>
        );
      case 2:
        return (
          <View style={styles.card}>
            <Text style={styles.stepIndicator}>Step {currentStep} of {totalSteps}</Text>
            <Text style={styles.sectionTitle}>Stock Details</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>No of Chawls:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter number of chawls"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={4}
                value={state.form.noOfChawls || ''}
                onChangeText={handleChawlCountChange}
              />
            </View>

            <FlatList
              data={chawlList}
              keyExtractor={(_, index) => `chawl-${index}`}
               scrollEnabled={false}  
              renderItem={({ item, index }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Size of Chawls (L x B x H in meters):</Text>
                  <View style={styles.dimensionsContainer}>
                    <TextInput
                      style={[styles.input, styles.dimensionInput]}
                      placeholder="Length"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      value={item.length}
                      onChangeText={(val) => handleChawlDimensionChange(index, 'length', val)}
                    />
                    <Text style={styles.dimensionSeparator}>×</Text>
                    <TextInput
                      style={[styles.input, styles.dimensionInput]}
                      placeholder="Breadth"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      value={item.breadth}
                      onChangeText={(val) => handleChawlDimensionChange(index, 'breadth', val)}
                    />
                    <Text style={styles.dimensionSeparator}>×</Text>
                    <TextInput
                      style={[styles.input, styles.dimensionInput]}
                      placeholder="Height"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      value={item.height}
                      onChangeText={(val) => handleChawlDimensionChange(index, 'height', val)}
                    />
                  </View>
                </View>
              )}
            />


            <View style={styles.inputContainer}>
              <Text style={styles.label}>No of Bins</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter number of bins"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={state.form.noofbins || ''}
                onChangeText={(val) =>
                  updateState({ form: { ...state.form, noofbins: val } })
                }
              />
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.card}>
            <Text style={styles.stepIndicator}>Step {currentStep} of {totalSteps}</Text>
            <Text style={styles.sectionTitle}>Quantity Information</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Total Quantity Found</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Total Quantity Found"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={state.form.quanityfound || ''}
                onChangeText={(val) =>
                  updateState({ form: { ...state.form, quanityfound: val } })
                }
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Deposited Quantity</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Total Deposited Quantity"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={state.form.Depositedfound || ''}
                onChangeText={(val) =>
                  updateState({ form: { ...state.form, Depositedfound: val } })
                }
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Quantity of Assaying Completed</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter quantity"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={state.form.assayingDone || ''}
                onChangeText={(val) =>
                  updateState({ form: { ...state.form, assayingDone: val } })
                }
              />
            </View>
          </View>
        );
      case 4:
        return (
          <View style={styles.card}>
            <Text style={styles.stepIndicator}>Step {currentStep} of {totalSteps}</Text>
            <Text style={styles.sectionTitle}>Documentation</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Number of Farmers</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Number of Farmers"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={state.form.Farmers || ''}
                onChangeText={(val) =>
                  updateState({ form: { ...state.form, Farmers: val } })
                }
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Number of Weighment Slip</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Number Weighment Slip"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={state.form.Weighmentslip || ''}
                onChangeText={(val) =>
                  updateState({ form: { ...state.form, Weighmentslip: val } })
                }
                 editable={state.form.laborRegister !== 'NO'}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Labor Register Available</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    state.form.laborRegister === 'YES' && styles.radioButtonSelected,
                  ]}
                  onPress={() =>
                    updateState({ form: { ...state.form, laborRegister: 'YES' } })
                  }
                >
                  <Text style={[
                    styles.radioLabel,
                    state.form.laborRegister === 'YES' && styles.radioLabelSelected
                  ]}>YES</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    state.form.laborRegister === 'NO' && styles.radioButtonSelected,
                  ]}
                  onPress={() =>
                    updateState({ form: { ...state.form, laborRegister: 'NO', Weighmentslip: '' } })
                  }
                >
                  <Text style={[
                    styles.radioLabel,
                    state.form.laborRegister === 'NO' && styles.radioLabelSelected
                  ]}>NO</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      case 5:
        return (
          <View style={styles.card}>
            <Text style={styles.stepIndicator}>Step {currentStep} of {totalSteps}</Text>
            <Text style={styles.sectionTitle}>Quality Assessment</Text>

            <CommonPicker
              selectedValue={state.form.stockQuality || ''}
              onValueChange={(value) =>
                updateState({ form: { ...state.form, stockQuality: value } })
              }
              items={qualityOptions}
              label="How is the quality of Stock"
            />

            <CommonPicker
              selectedValue={state.form.staffBehavior || ''}
              onValueChange={(value) =>
                updateState({ form: { ...state.form, staffBehavior: value } })
              }
              items={staffBehaviorOptions}
              label="Staff Behavior"
            />
          </View>
        );
      case 6:
        return (
          <View style={styles.card}>
            <Text style={styles.stepIndicator}>Step {currentStep} of {totalSteps}</Text>
            <Text style={styles.sectionTitle}>Additional Information</Text>

            <View style={styles.buttoncontent}>
              <TouchableOpacity style={styles.camerabutton} onPress={requestCameraPermission}>
                <MaterialIcons name="add-a-photo" size={30} color="white" />
                <Text style={styles.buttonText}>Pick from Camera</Text>
              </TouchableOpacity>



            </View>

            <View>
              {imageUri.map((img, index) => (
                <TouchableOpacity key={index}>
                  <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.8 }}>
                    <View style={styles.imageContainer}>
                      <Image source={{ uri: img.uri }} style={styles.image} />


                      {/* Overlay for Location & Address */}
                      <View style={styles.overlay}>
                        {location && address ? (
                          <>
                            <Text style={styles.overlayText}>
                              Latitude: {location.latitude}, Longitude: {location.longitude}
                            </Text>
                            <Text style={styles.overlayText}>{formattedAddress}</Text>
                          </>
                        ) : (
                          <ActivityIndicator size="small" color="#ffffff" />
                        )}
                      </View>
                    </View>
                  </ViewShot>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Additional Comments</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter any remarks or observations here"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                value={state.form.additionalComments || ''}
                onChangeText={(val) =>
                  updateState({ form: { ...state.form, additionalComments: val } })
                }
              />
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {renderStep()}

        <View style={styles.navigationButtons}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.prevButton} onPress={prevStep}>
              <Text style={styles.navButtonpreviousText}>Previous</Text>
            </TouchableOpacity>
          )}

          {currentStep < totalSteps ? (
            <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
              <Text style={styles.navButtonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ReviewForm;

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    paddingVertical: 16,
    paddingHorizontal: 4,
    backgroundColor: '#fff',
    position: 'relative',
    top: 30
  },
  header: {
    backgroundColor: '#070738',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  headerText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },





  dimensionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dimensionInput: {
    flex: 1,
    marginRight: 5,
    textAlign: 'center',
  },
  dimensionSeparator: {
    color: '#666',
    fontSize: 16,
    marginHorizontal: 5,
  },
  radioGroup: {
    flexDirection: 'row',
    marginTop: 5,
  },
  radioButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
    backgroundColor: '#f9f9f9',
  },
  radioButtonSelected: {
    backgroundColor: '#FF9500',
    borderColor: '#FF9500',
  },
  radioLabel: {
    fontSize: 15,
    color: '#666',
  },
  radioLabelSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },

  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
   
    paddingHorizontal : 25
  },
  prevButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#070738',
    borderRadius: 8,
    padding: 16,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#FF9500',
    borderRadius: 8,
    padding: 16,
    flex: 1,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navButtonpreviousText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#FF9500',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    flex: 1,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },


  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
  
    padding: 24,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepIndicator: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 24,
  },
  buttoncontent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    width: '70%',

    alignSelf: 'center',
  },
  camerabutton: {
    backgroundColor: '#FF9500',
    borderRadius: 8,
    padding: 9,


    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 4,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
  },
  overlayText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 4,
  },
  inputContainer: {
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },

});