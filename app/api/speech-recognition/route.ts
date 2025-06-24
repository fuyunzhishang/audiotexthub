import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('=== Speech Recognition API Called ===');
  
  try {
    const formData = await request.formData();
    console.log('FormData entries:', Array.from(formData.entries()).map(([key, value]) => {
      if (value instanceof File) {
        return { key, value: { name: value.name, size: value.size, type: value.type } };
      }
      return { key, value };
    }));
    
    const audio = formData.get('audio') as File;
    const engineType = formData.get('engineType') as string || '16k_zh';
    
    console.log('Audio file details:', audio ? {
      name: audio.name,
      size: audio.size,
      type: audio.type,
      sizeInMB: (audio.size / (1024 * 1024)).toFixed(2) + 'MB'
    } : 'No audio file');
    console.log('Engine type:', engineType);

    if (!audio) {
      console.error('Error: No audio file provided');
      return NextResponse.json(
        { success: false, error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Check file size (100MB limit)
    if (audio.size > 100 * 1024 * 1024) {
      console.error('Error: File size exceeds 100MB:', audio.size);
      return NextResponse.json(
        { success: false, error: 'File size exceeds 100MB' },
        { status: 400 }
      );
    }

    // Note: Files larger than 5MB will be automatically uploaded to COS by the API
    console.log('File size check:', {
      sizeInMB: (audio.size / (1024 * 1024)).toFixed(2),
      willUploadToCOS: audio.size > 5 * 1024 * 1024
    });

    // Create form data for the external API
    const apiFormData = new FormData();
    apiFormData.append('audio', audio);
    apiFormData.append('engineType', engineType);
    
    console.log('Preparing to call external API...');
    console.log('Environment API URL:', process.env.NEXT_PUBLIC_API_URL);
    
    // Call the speech recognition API
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) {
      throw new Error('NEXT_PUBLIC_API_URL is not configured');
    }
    // Ensure no double slashes and correct path
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const apiUrl = `${cleanBaseUrl}/api/speech/recognize`;
    
    console.log('Base URL:', cleanBaseUrl);
    console.log('Full API URL:', apiUrl);
    
    // Call the speech recognition API
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: apiFormData,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AudioTextHub/1.0'
      }
    });

    console.log('API Response Status:', response.status);
    console.log('API Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response Data:', data);
    
    return NextResponse.json({
      success: true,
      data: {
        text: data.recognitionResult?.text || '',
        duration: data.recognitionResult?.duration || 0,
        words: data.recognitionResult?.words || []
      }
    });


  } catch (error) {
    console.error('=== Speech Recognition Error ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Full error object:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Speech recognition failed',
        details: process.env.NODE_ENV === 'development' ? {
          type: error?.constructor?.name,
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        } : undefined
      },
      { status: 500 }
    );
  }
}