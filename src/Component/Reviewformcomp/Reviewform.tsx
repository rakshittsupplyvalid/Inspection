import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Image, ActivityIndicator, FlatList, Button, Linking } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import CommonPicker from '../../CommonCompoent/CommonPicker';
import useForm from '../../Common/UseForm';
import { launchCamera, ImagePickerResponse } from 'react-native-image-picker';
import * as Location from 'expo-location';
import ViewShot from 'react-native-view-shot';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { PermissionsAndroid } from 'react-native';
import apiClient from '../../service/api/apiInterceptors';


type ImageAsset = {
  uri: string;
  fileName: string;
  type: string;
};

type Chawl = {
  isCopiedFromFirst: boolean | undefined;
  isCopiedFromPrevious?: boolean; // Added property
  length: string;
  breadth: string;
  height: string;
  originalValues?: {
    length: string;
    breadth: string;
    height: string;
  };
};

const ReviewForm = () => {
  const { state, updateState } = useForm();
  const [currentStep, setCurrentStep] = useState(1);
  const [imageUri, setImageUri] = useState<ImageAsset[]>([]);
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [screenshoturi, setscreenshoturi] = useState<ImageAsset[]>([]);
  const [address, setAddress] = useState<Location.LocationGeocodedAddress | null>(null);
  const [formattedAddress, setFormattedAddress] = useState('');
  const [chawlList, setChawlList] = useState<Chawl[]>([]);
  const [binList, setBinList] = useState<Chawl[]>([{ isCopiedFromFirst: false, length: '', breadth: '', height: '' }]);

  const viewShotRef = useRef<ViewShot>(null);
  const totalSteps = 6;

  const openInGoogleMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url);
  };


  useEffect(() => {
    federationDropdown();
  }, []);

  useEffect(() => {
    if (state.form.option1) { // Only call if option1 has a value
      fpoDropdown(state.form.option1);
    } else {
      // Clear FPO data if no federation is selected
      updateState({
        fielddata: {
          ...state.fielddata,
          FpoFpcdata: null
        }
      });
    }
  }, [state.form.option1]);
  useEffect(() => {
    if (state.form.option2) { // Only call if option1 has a value
      Storage();
    } else {
      // Clear FPO data if no federation is selected
      updateState({
        fielddata: {
          ...state.fielddata,
          Storage: null
        }
      });
    }
  }, [state.form.option2]);

  const federationDropdown = () => {
    const url = `/api/group?FederationType=FEDERATION`;
    apiClient.get(url).then((res) => {
      if (res?.data) {
        // console.log("API Response Data:", res.data);
        updateState({
          fielddata: {
            ...state.fielddata,
            Federation: res.data,
            FpoFpcdata: null // Clear FPO data when loading new federations
          }
        });
      } else {
        console.log("No data found in API response.");
      }
    }).catch((error) => {
      console.log("Error fetching data:", error);
    });
  };

  const fpoDropdown = (federationId: string) => {
    const url = `/api/group?VendorType=FPC&VendorType=FPO&FederationId=${federationId}`;
    apiClient.get(url).then((res) => {
      if (res?.data) {
        // console.log("fpo fpc Data:", res.data);
        updateState({
          fielddata: {
            ...state.fielddata,
            FpoFpcdata: res.data
          }
        });
      } else {
        console.log("No data found in API response.");
      }
    }).catch((error) => {
      console.log("Error fetching data:", error);
    });
  };

  const Storage = () => {
    const url = `/api/storagelocation?StorageType=NORMAL&LocationType=STORAGELOCATION&ApprovalStatus=PENDING&ApprovalStatus=APPROVED&ApprovalStatus=REJECTED`;
    apiClient.get(url).then((res) => {
      if (res?.data) {
        // console.log("Storage api", res.data);
        updateState({
          fielddata: {
            ...state.fielddata,
            Storage: res.data
          }
        });
      } else {
        console.log("No data found in API response.");
      }
    }).catch((error) => {
      console.log("Error fetching data:", error);
    });
  };


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
      setChawlList([{ isCopiedFromFirst: false, length: '', breadth: '', height: '' }]);
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


  const handleBinCountChange = (val: string) => {
    const numericValue = val.replace(/[^0-9]/g, '');

    updateState({
      form: {
        ...state.form,
        noofbins: numericValue,
      },
    });

    let num = parseInt(numericValue);
    if (isNaN(num) || num < 1) {
      setBinList([{ isCopiedFromFirst: false, length: '', breadth: '', height: '' }]);
      return;
    }

    const updatedList: Chawl[] = Array.from({ length: num }, (_, index) => {
      return binList[index] || { length: '', breadth: '', height: '' };
    });
    setBinList(updatedList);
  };

  const handleBinDimensionChange = (index: number, field: keyof Chawl, value: string) => {
    const updatedList = [...binList];
    updatedList[index] = {
      ...updatedList[index],
      [field]: value,
    };
    setBinList(updatedList);
    updateState({
      form: {
        ...state.form,
        binDimensions: updatedList,
        noofbins: updatedList.length.toString(), // Add this to keep count in sync
      },
    });
  };

  const handleSubmit = async () => {
    try {

      const formData = new FormData();

      // Add text fields
      formData.append('NoOfFarmers', state.form.Farmers);
      formData.append('TotalPhysicalQuantity', state.form.quanityfound);
      formData.append('TotalProcuerQuantity', state.form.Depositedfound);
      formData.append('NoOfWeighmentSlip', state.form.Weighmentslip);
      formData.append('QualityOfStock', state.form.stockQuality);
      formData.append('StaffBehavior', state.form.staffBehavior);
      formData.append('AdditionalComments', state.form.additionalComments);


      const chawlSizes = chawlList.map(chawl => ({
        chawlType: "Chawl",
        length: chawl.length,
        breadth: chawl.breadth,
        height: chawl.height,
        quantity: Math.max(
          1,
          (Number(chawl.height) * Number(chawl.breadth) * Number(chawl.length) * 20) / 1000
        )
      }));

      const binSizes = binList.map(bin => ({
        chawlType: "Bin",
        length: bin.length,
        breadth: bin.breadth,
        height: bin.height,
        quantity: Math.max(
          1,
          (Number(bin.height) * Number(bin.breadth) * Number(bin.length) * 20) / 1000
        )
      }));

      const allSizes = [...chawlSizes, ...binSizes];

      allSizes.forEach((item, index) => {
        formData.append(`ChawlSizes[${index}][chawlType]`, item.chawlType);
        formData.append(`ChawlSizes[${index}][lenght]`, item.length);
        formData.append(`ChawlSizes[${index}][breadth]`, item.breadth);
        formData.append(`ChawlSizes[${index}][height]`, item.height);
        formData.append(`ChawlSizes[${index}][quantity]`, item.quantity.toString());
      });



      imageUri.forEach((image, index) => {
        formData.append('Files', {
          uri: image.uri,
          name: image.fileName || `image_${index}.jpg`,
          type: image.type || 'image/jpeg'
        } as any);
      });


      if (location) {
        formData.append('location', `LOC${new Date().toISOString().replace(/[-:.]/g, '').slice(0, -5)}`);
      }


      console.log('--- Form Data Being Submitted ---');
      console.log('Text Fields:');
      console.log('NoOfFarmers:', state.form.Farmers);
      console.log('TotalPhysicalQuantity:', state.form.quanityfound);
      console.log('TotalProcuerQuantity:', state.form.Depositedfound);
      console.log('NoOfWeighmentSlip:', state.form.Weighmentslip);
      console.log('QualityOfStock:', state.form.stockQuality);
      console.log('StaffBehavior:', state.form.staffBehavior);
      console.log('AdditionalComments:', state.form.additionalComments);

      console.log('\nChawl Sizes:');
      console.log(JSON.stringify(chawlSizes, null, 2));
      console.log('\nBin Sizes:');
      console.log(JSON.stringify(binSizes, null, 2));

      console.log('\nImages:');
      imageUri.forEach((image, index) => {
        console.log(`Image ${index}:`, {
          uri: image.uri,
          name: image.fileName || `image_${index}.jpg`,
          type: image.type || 'image/jpeg'
        });
      });


      const url = `/api/InspectionReport?location=${state.form.option3}`;
      console.log('\nFinal Request URL:', url);


      const response = await apiClient.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('\nResponse:', response.data);
      alert('Form submitted successfully!');

      updateState({
        form: {
          option1: '',
          option2: '',
          option3: '',
          Farmers: '',
          quanityfound: '',
          Depositedfound: '',
          Weighmentslip: '',
          stockQuality: '',
          staffBehavior: '',
          additionalComments: '',
        }
      });


      setChawlList([]);
      setImageUri([]);
      setCurrentStep(1);


    }
    catch (error) {
      console.error('Error submitting form:', error);

      // // If error is an Axios error (common in API calls)
      // if (typeof error === 'object' && error !== null && 'response' in error) {
      //   // Server responded with a status other than 2xx
      //   const err = error as { response: any };
      //   console.error('Response data:', err.response.data);
      //   console.error('Response status:', err.response.status);
      //   console.error('Response headers:', err.response.headers);
      //   alert(`Server Error: ${err.response.data?.message || 'Check console for more details.'}`);
      // } else if (typeof error === 'object' && error !== null && 'request' in error) {
      //   // Request was made but no response received
      //   const err = error as { request: any };
      //   console.error('No response received:', err.request);
      //   alert('No response from server. Please check your internet connection.');
      // } else if (typeof error === 'object' && error !== null && 'message' in error) {
      //   // Something else caused the error
      //   const err = error as { message: string };
      //   console.error('Error message:', err.message);
      //   alert(`Unexpected Error: ${err.message}`);
      // } else {
      //   // Unknown error type
      //   console.error('Unknown error:', error);
      //   alert('An unknown error occurred.');
      // }

      // // Optional: full stack trace
      // if (typeof error === 'object' && error !== null && 'config' in error) {
      //   const err = error as { config: any };
      //   console.error('Error config:', err.config);
      // }
    }

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
              label="FEDERATION NAME"
              selectedValue={state.form.option1 || ''}
              onValueChange={(value) => {
                console.log('Selected Federation ID:', value);
                updateState({
                  form: {
                    ...state.form,
                    option1: value,
                    option2: '', // Reset FPO selection when Federation changes
                    option3: '' // Reset Storage selection when Federation changes
                  },
                });
              }}
              items={[
                { label: 'Select Federation Name', value: '' }, // Empty value for default option
                ...(state.fielddata.Federation?.map((item: { name: string; id: string }) => ({
                  label: item.name,
                  value: item.id,
                })) || [])
              ]}
            />

            <CommonPicker
              label="Fpo/FPC Name"
              selectedValue={state.form.option2 || ''}
              onValueChange={(value) => {
                console.log('Selected FPO/FPC ID:', value);
                updateState({
                  form: { ...state.form, option2: value }, // Only update option2
                });
              }}
              items={[
                { label: 'Select FPO/FPC Name', value: '' }, // Empty value for default option
                ...(state.fielddata.FpoFpcdata?.map((item: { name: string; id: string }) => ({
                  label: item.name,
                  value: item.id,
                })) || [])
              ]}
            />



            <CommonPicker
              label="Storage Location"
              selectedValue={state.form.option3 || ''}
              onValueChange={(value) => {
                console.log('Storage location:', value);
                updateState({
                  form: { ...state.form, option3: value },
                });
              }}
              items={[
                { label: 'Select Storage location', value: '' },
                ...(state.fielddata.Storage?.map((item: { name: string; id: string }) => ({
                  label: item.name,
                  value: item.id,
                })) || []),
              ]}
            />

            {state.form.option3 && (
              (() => {
                interface StorageItem {
                  id: string;
                  name: string;
                  location?: string;
                  latitude: number;
                  longitude: number;
                  // Add any other properties as needed
                }

                const selectedStorage: StorageItem | undefined = (state.fielddata.Storage as StorageItem[] | undefined)?.find(
                  (item: StorageItem) => item.id === state.form.option3
                );

                return selectedStorage ? (
                  <View style={styles.storageContainer}>
                    <View style={styles.storageHeader}>
                      <MaterialIcons name="warehouse" size={24} color="#FF9500" />
                      <Text style={styles.storageName}>{selectedStorage.name}</Text>
                    </View>

                    {selectedStorage.location && (
                      <View style={styles.infoRow}>
                        <MaterialIcons name="location-on" size={20} color="#666" />
                        <Text style={styles.infoText}>{selectedStorage.location}</Text>
                      </View>
                    )}

                    {/* 
        <View style={styles.coordinatesRow}>
          <Text style={styles.coordinateText}>
            <Text style={styles.coordinateLabel}>Lat: </Text>
            {selectedStorage.latitude.toFixed(6)}
          </Text>
          <Text style={styles.coordinateText}>
            <Text style={styles.coordinateLabel}>Lng: </Text>
            {selectedStorage.longitude.toFixed(6)}
          </Text>
        </View>  */}


                    <TouchableOpacity
                      style={styles.navigateButton}
                      onPress={() => openInGoogleMaps(selectedStorage.latitude, selectedStorage.longitude)}
                    >
                      <MaterialIcons name="directions" size={25} color="black" />
                      <Text style={styles.navigateButtonText}>Navigate with Google Maps</Text>
                    </TouchableOpacity>
                  </View>
                ) : null;
              })()
            )}




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
                  <Text style={styles.label}>Size of Chawls (L x B x H)</Text>
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


                  {index === 1 && chawlList.length > 1 && (
                    <View style={styles.checkboxContainer}>
                      <CheckBox
                        value={chawlList[index].isCopiedFromFirst}
                        onValueChange={(newValue) => {
                          const updatedList = [...chawlList];

                          if (newValue) {
                            // When checked: copy from index 0 and store original values
                            updatedList[index] = {
                              ...updatedList[index],
                              originalValues: {  // Store the current values before copying
                                length: updatedList[index].length,
                                breadth: updatedList[index].breadth,
                                height: updatedList[index].height,
                                // include any other fields you want to preserve
                              },
                              ...chawlList[0],  // Copy all properties from first item
                              isCopiedFromFirst: true
                            };
                          } else {
                            // When unchecked: restore original values or reset to default
                            if (updatedList[index].originalValues) {
                              // Restore the original values
                              updatedList[index] = {
                                ...updatedList[index],
                                ...updatedList[index].originalValues,
                                isCopiedFromFirst: false,
                                originalValues: undefined  // Clear the stored values
                              };
                            } else {
                              // Reset to default values if no originals were stored
                              updatedList[index] = {
                                ...updatedList[index],
                                length: '',  // or your default value
                                breadth: '',
                                height: '',
                                isCopiedFromFirst: false
                              };
                            }
                          }

                          setChawlList(updatedList);
                          updateState({
                            form: {
                              ...state.form,
                              chawlDimensions: updatedList
                            }
                          });
                        }}
                      />
                      <Text style={styles.checkboxLabel}>Copy from the Above</Text>

                    </View>
                  )}

                  {index > 0 && (
                    <View style={styles.buttonRow}>
                      {index > 1 && (
                        <View style={styles.checkboxContainer}>
                          <CheckBox
                            value={chawlList[index].isCopiedFromPrevious || false}
                            onValueChange={(newValue) => {
                              const updatedList = [...chawlList];

                              if (newValue) {
                                // When checked: copy from previous item and store original values
                                updatedList[index] = {
                                  ...updatedList[index],
                                  originalValues: {
                                    length: updatedList[index].length,
                                    breadth: updatedList[index].breadth,
                                    height: updatedList[index].height,
                                    // include other fields as needed
                                  },
                                  ...updatedList[index - 1],  // Copy from previous item
                                  isCopiedFromPrevious: true
                                };
                              } else {
                                // When unchecked: restore original values or reset to default
                                if (updatedList[index].originalValues) {
                                  updatedList[index] = {
                                    ...updatedList[index],
                                    ...updatedList[index].originalValues,
                                    isCopiedFromPrevious: false,
                                    originalValues: undefined
                                  };
                                } else {
                                  // Reset to default values
                                  updatedList[index] = {
                                    ...updatedList[index],
                                    length: '',
                                    breadth: '',
                                    height: '',
                                    isCopiedFromPrevious: false
                                  };
                                }
                              }

                              setChawlList(updatedList);
                              updateState({
                                form: {
                                  ...state.form,
                                  chawlDimensions: updatedList
                                }
                              });
                            }}
                          />
                          <Text style={styles.checkboxLabel}>Copy from the Above</Text>
                        </View>
                      )}
                    </View>
                  )}


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
                onChangeText={handleBinCountChange}
              />

              <FlatList
                data={binList}
                keyExtractor={(_, index) => `bin-${index}`}
                scrollEnabled={false}
                renderItem={({ item, index }) => (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Size of Bins (L x B x H)</Text>
                    <View style={styles.dimensionsContainer}>
                      <TextInput
                        style={[styles.input, styles.dimensionInput]}
                        placeholder="Length"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={item.length}
                        onChangeText={(val) => handleBinDimensionChange(index, 'length', val)}
                      />
                      <Text style={styles.dimensionSeparator}>×</Text>
                      <TextInput
                        style={[styles.input, styles.dimensionInput]}
                        placeholder="Breadth"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={item.breadth}
                        onChangeText={(val) => handleBinDimensionChange(index, 'breadth', val)}
                      />
                      <Text style={styles.dimensionSeparator}>×</Text>
                      <TextInput
                        style={[styles.input, styles.dimensionInput]}
                        placeholder="Height"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={item.height}
                        onChangeText={(val) => handleBinDimensionChange(index, 'height', val)}
                      />
                    </View>

                    {index === 1 && binList.length > 1 && (
                      <View style={styles.checkboxContainer}>
                        <CheckBox
                          value={binList[index].isCopiedFromFirst}
                          onValueChange={(newValue) => {
                            const updatedList = [...binList];
                            if (newValue) {
                              updatedList[index] = {
                                ...updatedList[index],
                                originalValues: {
                                  length: updatedList[index].length,
                                  breadth: updatedList[index].breadth,
                                  height: updatedList[index].height,
                                },
                                ...binList[0],
                                isCopiedFromFirst: true,
                              };
                            } else {
                              if (updatedList[index].originalValues) {
                                updatedList[index] = {
                                  ...updatedList[index],
                                  ...updatedList[index].originalValues,
                                  isCopiedFromFirst: false,
                                  originalValues: undefined,
                                };
                              } else {
                                updatedList[index] = {
                                  ...updatedList[index],
                                  length: '',
                                  breadth: '',
                                  height: '',
                                  isCopiedFromFirst: false,
                                };
                              }
                            }
                            setBinList(updatedList);
                            updateState({
                              form: {
                                ...state.form,
                                binDimensions: updatedList,
                              },
                            });
                          }}
                        />
                        <Text style={styles.checkboxLabel}>Copy from the Above</Text>
                      </View>
                    )}

                    {index > 0 && (
                      <View style={styles.buttonRow}>
                        {index > 1 && (
                          <View style={styles.checkboxContainer}>
                            <CheckBox
                              value={binList[index].isCopiedFromPrevious || false}
                              onValueChange={(newValue) => {
                                const updatedList = [...binList];
                                if (newValue) {
                                  updatedList[index] = {
                                    ...updatedList[index],
                                    originalValues: {
                                      length: updatedList[index].length,
                                      breadth: updatedList[index].breadth,
                                      height: updatedList[index].height,
                                    },
                                    ...updatedList[index - 1],
                                    isCopiedFromPrevious: true,
                                  };
                                } else {
                                  if (updatedList[index].originalValues) {
                                    updatedList[index] = {
                                      ...updatedList[index],
                                      ...updatedList[index].originalValues,
                                      isCopiedFromPrevious: false,
                                      originalValues: undefined,
                                    };
                                  } else {
                                    updatedList[index] = {
                                      ...updatedList[index],
                                      length: '',
                                      breadth: '',
                                      height: '',
                                      isCopiedFromPrevious: false,
                                    };
                                  }
                                }

                                setBinList(updatedList);
                                updateState({
                                  form: {
                                    ...state.form,
                                    binDimensions: updatedList,
                                  },
                                });
                              }}
                            />
                            <Text style={styles.checkboxLabel}>Copy from the Above</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                )}
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
              <Text style={styles.label}>Stock Deterioration</Text>


              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <CheckBox
                  value={state.form.deterioration === 'Fast'}
                  onValueChange={() =>
                    updateState({ form: { ...state.form, deterioration: 'Fast' } })
                  }
                />
                <Text style={{ marginRight: 20 }}>Fast</Text>

                <CheckBox
                  value={state.form.deterioration === 'Normal'}
                  onValueChange={() =>
                    updateState({ form: { ...state.form, deterioration: 'Normal' } })
                  }
                />
                <Text>Normal</Text>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Total Quantity Found (Physical)</Text>
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
              <Text style={styles.label}>Total Quantity Found as per System</Text>
              <TextInput
                style={styles.input}
                placeholder="Total Quantity Found"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={state.form.quanityfoundsystem || ''}
                onChangeText={(val) =>
                  updateState({ form: { ...state.form, quanityfound: val } })
                }
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Deposited Quantity in Chawls and Bins</Text>

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
            {/* 
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Inspection Status</Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() =>
                    updateState({ form: { ...state.form, inspectionStatus: 'Green' } })
                  }
                >
                  <View
                    style={[
                      styles.radioCircle,
                      state.form.inspectionStatus === 'Green' && styles.selectedRadio,
                      { borderColor: 'green' },
                    ]}
                  />
                  <Text style={{ marginLeft: 8 }}>Green</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.radioOption, { marginLeft: 20 }]}
                  onPress={() =>
                    updateState({ form: { ...state.form, inspectionStatus: 'Red' } })
                  }
                >
                  <View
                    style={[
                      styles.radioCircle,
                      state.form.inspectionStatus === 'Red' && styles.selectedRadio,
                      { borderColor: 'red' },
                    ]}
                  />
                  <Text style={{ marginLeft: 8 }}>Red </Text>
                </TouchableOpacity>
              </View>
            </View> */}

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
                value={state.form.additionalComments}
                onChangeText={(val) => {
                  console.log('Additional Comments:', val);
                  updateState({ form: { ...state.form, additionalComments: val } });
                  console.log('Stored Value:', state.form.additionalComments);
                }}

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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',

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

    paddingHorizontal: 25
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
    padding: 14,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 8,
  },
  overlayText: {
    color: '#FFFFFF',
    fontSize: 10,
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
  buttonRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  copyButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  copyButtonText: {
    color: '#333',
    fontSize: 12,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },

  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedRadio: {
    backgroundColor: '#4CAF50', // green highlight if selected (can change for red too)
  },


  storageContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  storageName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
  },
  coordinatesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#edf2f7',
    borderRadius: 8,
  },
  coordinateText: {
    fontSize: 13,
    fontFamily: 'monospace',
  },
  coordinateLabel: {
    fontWeight: '500',
    color: '#4a5568',
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dce6fc',
    opacity: 1,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  navigateButtonText: {
    color: 'black',
    fontWeight: '500',
    marginLeft: 8,
  },


});