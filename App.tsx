import { useState } from 'react';
import { Button, Image, PermissionsAndroid, Platform, StyleSheet, Text, View } from 'react-native';
import { ImagePickerResponse, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { downloadAsync, writeAsStringAsync, StorageAccessFramework, EncodingType } from "expo-file-system";

export default function App() {
  const [uri, setUri] = useState<string | null>();
  const [imageBytes, setImageBytes] = useState<string | undefined>();
  const [fileName, setFileName] = useState<string | undefined>();
  const [fileType, setFileType] = useState<string | undefined>();

  function openImagePicker(){
    launchImageLibrary(
      {
        mediaType: "photo",
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
      },
      handleResponse
    );
  }

  function handleCameraLaunch(){
    launchCamera(
      {
        mediaType: "photo",
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
      },
      handleResponse
    );
  }

  async function requestCameraPermission(){
    try{
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
          message: "App needs access to your camera",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );

      if(granted === PermissionsAndroid.RESULTS.GRANTED){
        console.log("Camera Permission Granted");
        handleCameraLaunch();
      }
      else{
        console.log("Camera Permission Denied");
      }
    }
    catch(e){
      console.warn(e);
    }
  }

  function handleResponse(response: ImagePickerResponse){
    if(response.didCancel){
      console.log("User cancelled image picker");
    }
    else if(response.errorCode && response.errorMessage){
      console.log(`ImagePicker Error: ${response.errorCode} - ${response.errorMessage}`);
    }
    else if(response.assets && response.assets.length > 0){
      const imageUri = response.assets[0].uri;
      const data = response.assets[0].base64;
      const fileName = response.assets[0].fileName;
      const fileType = response.assets[0].type;

      setFileName(fileName);
      setImageBytes(data);
      setUri(imageUri);
      setFileType(fileType);
    }
    else
      console.log("No assets found in the response");
  }

  async function saveFile(){
    const permission = await StorageAccessFramework.requestDirectoryPermissionsAsync();

    if(!permission.granted)
      return;

    try{
      if(fileName === undefined || fileType === undefined || imageBytes === undefined)
        return;

      const res = await StorageAccessFramework.createFileAsync(permission.directoryUri, fileName, fileType);

      await writeAsStringAsync(res, imageBytes, {encoding: EncodingType.Base64});
    }
    catch(e){
      console.log(e);
    }
  }

  return (
    <View style={styles.container}>
      <Button title="OPEN CAMERA" onPress={requestCameraPermission} />
      <Button title="OPEN GALLERY" onPress={openImagePicker} />
      <Button title="CREATE FILE" onPress={saveFile} />
      {
        uri && <Image source={{uri: uri}} style={{width: 200, height: 200}} />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
});
