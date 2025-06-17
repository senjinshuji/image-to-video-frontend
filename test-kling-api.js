const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testKlingAPI() {
  const API_BASE = 'http://localhost:3000';
  
  try {
    // テスト用の画像を読み込んでBase64に変換
    const imagePath = path.join(__dirname, '..', '..', 'image-to-video', 'generated-image-2025-06-16T15-49-35-139Z.png');
    if (!fs.existsSync(imagePath)) {
      console.error('Test image not found at:', imagePath);
      return;
    }
    
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    console.log('1. Testing video generation endpoint...');
    const generateResponse = await axios.post(`${API_BASE}/api/generate-video`, {
      imageUrl: base64Image, // 純粋なBase64文字列を送信
      prompt: 'Camera slowly pans from left to right',
      duration: 5
    });
    
    console.log('Generate response:', generateResponse.data);
    const taskId = generateResponse.data.taskId;
    
    console.log('Image size:', imageBuffer.length, 'bytes');
    console.log('Base64 length:', base64Image.length, 'characters');
    
    if (!taskId) {
      console.error('No task ID returned');
      return;
    }
    
    console.log('\n2. Checking video status...');
    await new Promise(resolve => setTimeout(resolve, 5000)); // 5秒待機
    
    const statusResponse = await axios.get(`${API_BASE}/api/video-status/${taskId}`);
    console.log('Status response:', statusResponse.data);
    
    // ステータスを定期的にチェック
    let attempts = 0;
    const maxAttempts = 30; // 最大5分間チェック
    
    while (attempts < maxAttempts) {
      const checkResponse = await axios.get(`${API_BASE}/api/video-status/${taskId}`);
      console.log(`\nAttempt ${attempts + 1}:`, checkResponse.data);
      
      if (checkResponse.data.status === 'completed') {
        console.log('\n✅ Video generation completed!');
        console.log('Video URL:', checkResponse.data.videoUrl);
        break;
      } else if (checkResponse.data.status === 'failed') {
        console.error('\n❌ Video generation failed:', checkResponse.data.error);
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10秒待機
      attempts++;
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testKlingAPI();