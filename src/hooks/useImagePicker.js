import { useState } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';

export const useImagePicker = () => {
  const [images, setImages] = useState({
    mainPhoto: null,
    sidePhoto: null,
    backPhoto: null,
    detailPhoto: null,
  });

  const pickImage = async (photoKey) => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (!result.didCancel && result.assets && result.assets.length > 0) {
      setImages((prev) => ({
        ...prev,
        [photoKey]: result.assets[0],
      }));
    }
  };

  const clearImages = () => {
    setImages({ mainPhoto: null, sidePhoto: null, backPhoto: null, detailPhoto: null });
  };

  const getImageCount = () => {
    return (images.mainPhoto ? 1 : 0) + 
           (images.sidePhoto ? 1 : 0) + 
           (images.backPhoto ? 1 : 0) + 
           (images.detailPhoto ? 1 : 0);
  };

  return { images, pickImage, clearImages, getImageCount };
};
