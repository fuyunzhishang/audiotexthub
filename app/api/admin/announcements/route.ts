import { NextRequest, NextResponse } from 'next/server';
import { getAllAnnouncements, createAnnouncement } from '@/models/announcement';

// Get all announcements (admin only)
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    // const session = await auth();
    // if (!session?.user || !isAdmin(session.user)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const announcements = await getAllAnnouncements();
    
    return NextResponse.json({
      success: true,
      announcements
    });
  } catch (error) {
    console.error('Error fetching all announcements:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch announcements',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// Create new announcement (admin only)
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    // const session = await auth();
    // if (!session?.user || !isAdmin(session.user)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const { 
      title, 
      content, 
      title_zh, 
      content_zh, 
      title_en, 
      content_en, 
      default_language,
      type, 
      priority, 
      is_active, 
      start_time, 
      end_time 
    } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title and content are required'
        },
        { status: 400 }
      );
    }

    console.log('Creating announcement with multilingual content:', {
      title_zh,
      content_zh,
      title_en,
      content_en,
      default_language
    });

    // Build announcement object, filtering out undefined values
    const announcementData: any = {
      title,
      content,
      type: type || 'info',
      priority: priority || 0,
      is_active: is_active !== false,
      start_time: start_time || new Date().toISOString(),
      default_language: default_language || 'en'
    };

    // Only add optional fields if they have values
    if (title_zh) announcementData.title_zh = title_zh;
    if (content_zh) announcementData.content_zh = content_zh;
    if (title_en) announcementData.title_en = title_en;
    if (content_en) announcementData.content_en = content_en;
    if (end_time) announcementData.end_time = end_time;

    const announcement = await createAnnouncement(announcementData);

    return NextResponse.json({
      success: true,
      announcement
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create announcement',
        details: error instanceof Error ? error.message : JSON.stringify(error)
      },
      { status: 500 }
    );
  }
}