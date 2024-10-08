import { launchImageLibrary, MediaType } from "react-native-image-picker";
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import data from '../../config.json'
const URL = data['URl']
interface Media {
    uri: string;
    type?: string;
    fileName?: string;
}

const getUserData = async (key: string) => {
    try {
      // 获取存储的UserData
      const userDataString = await AsyncStorage.getItem('UserData');
  
      if (userDataString !== null) {
        // 解析字符串为对象
        const userData = JSON.parse(userDataString);
        const result = userData[key];
        return result;
      } else {
        console.log('UserData not found');
        return null;
      }
    } catch (error) {
      console.error('Failed to retrieve or parse UserData:', error);
      return null;
    }
  };

export const ShowMediaLibrary = async (
    success: (img: Media) => void = () => { },
    fail: () => void = () => { }
) => {
    const option = {
        mediaType: 'mixed' as MediaType,
    };

    await launchImageLibrary(option, (response) => {
        if (response.didCancel) {
            console.log('User cancelled media picker');
            fail();
        } else if (response.errorMessage) {
            console.log('Media picker error: ', response.errorMessage);
            fail();
        } else {
            let selectedMedia = response.assets?.[0];
            if (selectedMedia?.uri) {
                const media: Media = {
                    uri: selectedMedia.uri,
                    type: selectedMedia.type,
                    fileName: selectedMedia.fileName
                };
                success(media);
                showToast("選取成功", "")
            } else {
                fail();
            }
        }
    });
}

export const formReviseData = async(media: any, postID: string,text: string, ) => {
    const formData = new FormData();
    if (media && media.uri) {
        formData.append('reviseMedia',true); // 表示需要更改
        formData.append('media', {
            uri: media.uri,
            type: media.type || 'application/octet-stream',
            name: media.fileName || 'file'
        });
    }
    else{
        formData.append('reviseMedia',false); // 表示不用更改
    }
    formData.append('PostId', postID)
    formData.append('text', text);
    const email = await getUserData('email');
    formData.append('email', email);
    console.log(formData)
    return formData;
}

export const uploadToServer = async (formData: FormData) => {
    try {
        console.log('Uploading');
        const response = await fetch(URL+'forFunRevise', {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        // 可以看後端怎麼定義回傳成功 (屬性名稱) 來更改 (可能為了一致性)，
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        return await response.json();
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
}

export const showToast = (text1: string, text2: string, type = 'success') => {
    Toast.show({
        type: type,
        text1: text1,
        text2: text2,
        topOffset: 65
    });
}
