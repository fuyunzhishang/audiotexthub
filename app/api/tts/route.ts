import { NextRequest, NextResponse } from 'next/server';
import { decryptAes } from './utils';

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    const { key, text, voiceRate = 0, voiceVolume = 100 } = body;
    
    if (!key || !text) {
      return NextResponse.json(
        { error: '参数不完整' },
        { status: 400 }
      );
    }
    
    // 构建 FormData
    const formData = new FormData();
    formData.append('voice_key', key);
    formData.append('voice_text', text);
    formData.append('voice_rate', voiceRate.toString());
    formData.append('voice_volume', voiceVolume.toString());
    formData.append('is_sync', '1');
    formData.append('user_key', 'xiaohui_800A7DB58EE8CD323AC3FEA9547B5EEE');
    
    // 调用外部API
    const response = await fetch('https://ps.aifun3.com/v10/tts_create_task', {
      method: 'POST',
      body: formData, // 直接发送 FormData
    });
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }
    
    // 解析响应数据
    const responseText = await response.text();
    console.log('API响应:', responseText); // 添加日志
    
    // 解密响应
    const deAesText = decryptAes(responseText, "qq1920520460qqxx");
    console.log('解密后:', deAesText); // 添加日志
    
    const deAesObject = JSON.parse(deAesText);
    
    // 检查API返回状态
    if (deAesObject.status === 'failed') {
      console.error('API错误:', deAesObject.msg);
      return NextResponse.json(
        { error: deAesObject.msg || '语音合成失败' },
        { status: 400 }
      );
    }
    
    const data = deAesObject.result;
    if (!data || !data.task_id) {
      throw new Error('未获取到任务ID');
    }
    
    const taskId = data.task_id;
    
    // 返回下载URL
    const downloadUrl = `https://ps.aifun3.com/v10/tts_down?task_id=${taskId}`;
    
    return NextResponse.json({ url: downloadUrl });
  } catch (error) {
    console.error('语音合成失败:', error instanceof Error ? error.message : '未知错误');
    return NextResponse.json(
      { error: '语音合成请求失败' },
      { status: 500 }
    );
  }
}