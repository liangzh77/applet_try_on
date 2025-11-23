import { View, Text, Button, Image } from '@tarojs/components';
import { useState } from 'react';
import Taro from '@tarojs/taro';
import './index.scss';

export default function Index() {
  const [personImage, setPersonImage] = useState<string>('');
  const [garmentImage, setGarmentImage] = useState<string>('');
  const [resultImage, setResultImage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // 选择人物图片
  const handleChoosePersonImage = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });

      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        setPersonImage(res.tempFilePaths[0]);
      }
    } catch (error) {
      console.error('选择图片失败:', error);
      Taro.showToast({
        title: '选择图片失败',
        icon: 'none'
      });
    }
  };

  // 选择服装图片
  const handleChooseGarmentImage = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });

      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        setGarmentImage(res.tempFilePaths[0]);
      }
    } catch (error) {
      console.error('选择图片失败:', error);
      Taro.showToast({
        title: '选择图片失败',
        icon: 'none'
      });
    }
  };

  // 生成试穿效果
  const handleGenerate = async () => {
    if (!personImage || !garmentImage) {
      Taro.showToast({
        title: '请先选择图片',
        icon: 'none'
      });
      return;
    }

    setIsGenerating(true);
    Taro.showLoading({
      title: '生成中...',
      mask: true
    });

    try {
      // TODO: 调用云函数或后端API进行图像生成
      // 这里暂时使用占位符
      await new Promise(resolve => setTimeout(resolve, 2000));

      Taro.showToast({
        title: '功能开发中',
        icon: 'none'
      });
    } catch (error) {
      console.error('生成失败:', error);
      Taro.showToast({
        title: '生成失败',
        icon: 'none'
      });
    } finally {
      setIsGenerating(false);
      Taro.hideLoading();
    }
  };

  return (
    <View className='index'>
      <View className='header'>
        <Text className='title'>AI霓裳智能换装</Text>
        <Text className='subtitle'>上传您的照片和心仪的服装,即可体验虚拟试穿</Text>
      </View>

      <View className='upload-section'>
        <View className='upload-item'>
          <Text className='label'>1. 选择您的照片</Text>
          {personImage ? (
            <View className='image-preview'>
              <Image src={personImage} mode='aspectFit' className='preview-image' />
              <Button size='mini' onClick={handleChoosePersonImage}>重新选择</Button>
            </View>
          ) : (
            <Button onClick={handleChoosePersonImage} className='upload-btn'>
              点击上传照片
            </Button>
          )}
        </View>

        <View className='upload-item'>
          <Text className='label'>2. 选择服装图片</Text>
          {garmentImage ? (
            <View className='image-preview'>
              <Image src={garmentImage} mode='aspectFit' className='preview-image' />
              <Button size='mini' onClick={handleChooseGarmentImage}>重新选择</Button>
            </View>
          ) : (
            <Button onClick={handleChooseGarmentImage} className='upload-btn'>
              点击上传服装
            </Button>
          )}
        </View>
      </View>

      <View className='action-section'>
        <Button
          type='primary'
          onClick={handleGenerate}
          disabled={!personImage || !garmentImage || isGenerating}
          className='generate-btn'
        >
          {isGenerating ? '生成中...' : '生成试穿效果'}
        </Button>
      </View>

      {resultImage && (
        <View className='result-section'>
          <Text className='label'>试穿效果</Text>
          <Image src={resultImage} mode='aspectFit' className='result-image' />
        </View>
      )}
    </View>
  );
}
