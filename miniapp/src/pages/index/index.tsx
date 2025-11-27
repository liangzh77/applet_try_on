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

  // 将图片路径转换为base64
  const imageToBase64 = async (filePath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      Taro.getFileSystemManager().readFile({
        filePath: filePath,
        encoding: 'base64',
        success: (res) => {
          resolve(res.data as string);
        },
        fail: reject
      });
    });
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
      title: '生成中，请稍候...',
      mask: true
    });

    try {
      // 将图片转换为base64
      console.log('开始转换图片为base64...');
      const personBase64 = await imageToBase64(personImage);
      const garmentBase64 = await imageToBase64(garmentImage);

      console.log('调用云函数开始...');
      // 直接使用微信原生API调用云函数，确保timeout参数生效
      const result = await new Promise<any>((resolve, reject) => {
        wx.cloud.callFunction({
          name: 'generateTryOn',
          data: {
            personBase64: `data:image/png;base64,${personBase64}`,
            garmentBase64: `data:image/png;base64,${garmentBase64}`
          },
          timeout: 120000,  // 120秒超时
          success: resolve,
          fail: reject
        });
      });

      console.log('云函数返回结果:', result);

      // 先隐藏loading
      Taro.hideLoading();

      // 检查返回结果
      if (result.result && result.result.success) {
        setResultImage(result.result.resultImage);
        Taro.showToast({
          title: '生成成功！',
          icon: 'success'
        });
      } else {
        const errorMsg = result.result?.error || '生成失败';
        console.error('生成失败详情:', result.result);
        Taro.showModal({
          title: '生成失败',
          content: errorMsg,
          showCancel: false
        });
      }
    } catch (error) {
      console.error('生成失败:', error);
      // 先隐藏loading再显示toast
      Taro.hideLoading();
      Taro.showModal({
        title: '生成失败',
        content: error.errMsg || '请检查网络连接或稍后重试',
        showCancel: false
      });
    } finally {
      setIsGenerating(false);
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
