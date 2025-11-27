// 云函数入口文件
const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

/**
 * 生成虚拟试穿图像的云函数
 * 调用Volcengine Seedream 4.0 API
 */
exports.main = async (event, context) => {
  const { personBase64, garmentBase64 } = event;

  // 参数校验
  if (!personBase64 || !garmentBase64) {
    return {
      success: false,
      error: '缺少必需的参数：personBase64 或 garmentBase64'
    };
  }

  try {
    // 从云环境变量中获取API密钥，如果没有则使用默认值（临时测试用）
    const ARK_API_KEY = process.env.ARK_API_KEY || '3ecc5d48-8986-4027-a052-2f63010e2f3d';
    const ARK_BASE_URL = process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
    const ARK_MODEL = process.env.ARK_MODEL || 'doubao-seedream-4-0-250828';

    // 处理base64数据，移除data URI前缀
    const personImageData = personBase64.startsWith('data:')
      ? personBase64.split(',')[1]
      : personBase64;

    const garmentImageData = garmentBase64.startsWith('data:')
      ? garmentBase64.split(',')[1]
      : garmentBase64;

    // 构造API请求
    const prompt = `虚拟试穿任务:将第二张图片中的服装穿到第一张图片中的人物身上。
要求:
1. 保持人物的身份特征、姿势和体型
2. 服装要自然贴合人物身体
3. 高分辨率、专业摄影级质量
4. 保持光影和谐,看起来真实自然`;

    console.log('调用Volcengine API开始');

    const response = await axios.post(
      `${ARK_BASE_URL}/images/generations`,
      {
        model: ARK_MODEL,
        prompt: prompt,
        // 多图输入:人物图+服装图
        image: [
          `data:image/png;base64,${personImageData}`,
          `data:image/png;base64,${garmentImageData}`
        ],
        size: '2K',
        response_format: 'b64_json',
        watermark: false,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ARK_API_KEY}`
        },
        timeout: 120000, // 120秒超时
      }
    );

    console.log('API调用成功:', {
      status: response.status,
      hasData: !!response.data,
    });

    // 解析返回的图像数据
    const imageData = response.data.data?.[0];
    if (!imageData) {
      throw new Error('API未返回图像数据');
    }

    // 获取图片的base64数据
    let imageBase64 = '';
    if (imageData.b64_json) {
      imageBase64 = imageData.b64_json;
    } else if (imageData.b64_image) {
      imageBase64 = imageData.b64_image;
    } else if (imageData.url) {
      // 如果返回URL，直接返回URL
      return {
        success: true,
        resultImage: imageData.url
      };
    } else {
      throw new Error('API返回的图像格式不支持');
    }

    // 将base64图片上传到云存储，避免返回数据超过1MB限制
    console.log('上传图片到云存储...');
    const buffer = Buffer.from(imageBase64, 'base64');
    const fileName = `tryon_results/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;

    const uploadResult = await cloud.uploadFile({
      cloudPath: fileName,
      fileContent: buffer
    });

    console.log('上传成功:', uploadResult.fileID);

    // 获取临时访问链接
    const tempUrlResult = await cloud.getTempFileURL({
      fileList: [uploadResult.fileID]
    });

    const tempUrl = tempUrlResult.fileList[0]?.tempFileURL;
    if (!tempUrl) {
      throw new Error('获取图片临时链接失败');
    }

    return {
      success: true,
      resultImage: tempUrl,
      fileID: uploadResult.fileID
    };

  } catch (error) {
    console.error('生成试穿图像失败:', error);

    // 返回详细的错误信息
    return {
      success: false,
      error: error.message || '生成失败',
      details: error.response?.data || error.toString()
    };
  }
};
