import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // First check what's at the root
  let rootContent = '';
  try {
    const rootResponse = await fetch(cleanBaseUrl, {
      headers: {
        'User-Agent': 'AudioTextHub/1.0'
      }
    });
    if (rootResponse.ok) {
      rootContent = await rootResponse.text();
      // Limit content to first 500 chars
      rootContent = rootContent.substring(0, 500);
    }
  } catch (e) {
    rootContent = 'Error fetching root content';
  }
  
  const endpoints = [
    '/api/speech/recognize',
    '/speech/recognize',
    '/v1/speech/recognize',
    '/api/v1/speech/recognize',
    '/recognize',
    '/api',
    '/'
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const url = `${cleanBaseUrl}${endpoint}`;
    try {
      // Try both GET and POST methods
      for (const method of ['GET', 'POST']) {
        const headers: HeadersInit = {
          'User-Agent': 'AudioTextHub/1.0'
        };
        if (method === 'POST') {
          headers['Content-Type'] = 'multipart/form-data';
        }
        
        const response = await fetch(url, {
          method,
          headers
        });
        
        let responseBody = '';
        if (response.status !== 404) {
          try {
            responseBody = await response.text();
            responseBody = responseBody.substring(0, 200); // First 200 chars
          } catch (e) {
            responseBody = 'Could not read response body';
          }
        }
        
        results.push({
          endpoint,
          method,
          url,
          status: response.status,
          statusText: response.statusText,
          responsePreview: responseBody,
          headers: Object.fromEntries(response.headers.entries())
        });
      }
    } catch (error) {
      results.push({
        endpoint,
        url,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  return NextResponse.json({
    baseUrl: cleanBaseUrl,
    rootContent,
    results
  });
}