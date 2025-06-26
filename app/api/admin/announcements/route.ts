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
    const { title, content, type, priority, is_active, start_time, end_time } = body;

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

    const announcement = await createAnnouncement({
      title,
      content,
      type: type || 'info',
      priority: priority || 0,
      is_active: is_active !== false,
      start_time: start_time || new Date().toISOString(),
      end_time: end_time || null
    });

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
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}