import { NextRequest, NextResponse } from 'next/server';
import { getActiveAnnouncements } from '@/models/announcement';

export async function GET(request: NextRequest) {
  try {
    // Get locale from query parameter or header
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 
                  request.headers.get('accept-language')?.split(',')[0].split('-')[0] || 
                  'en';
    
    const announcements = await getActiveAnnouncements(locale);
    
    return NextResponse.json({
      success: true,
      announcements
    });
  } catch (error) {
    console.error('Error fetching active announcements:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch announcements'
      },
      { status: 500 }
    );
  }
}