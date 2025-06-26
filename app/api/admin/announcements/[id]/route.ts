import { NextRequest, NextResponse } from 'next/server';
import { updateAnnouncement, deleteAnnouncement, hardDeleteAnnouncement } from '@/models/announcement';

// Update announcement (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  // In Next.js 13+, params might be a Promise
  const { id } = await params;
  try {
    // TODO: Add authentication check here
    // const session = await auth();
    // if (!session?.user || !isAdmin(session.user)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const announcement = await updateAnnouncement(id, body);

    return NextResponse.json({
      success: true,
      announcement
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update announcement'
      },
      { status: 500 }
    );
  }
}

// Delete announcement (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  // In Next.js 13+, params might be a Promise
  const { id } = await params;
  try {
    // TODO: Add authentication check here
    // const session = await auth();
    // if (!session?.user || !isAdmin(session.user)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Check if hard delete is requested
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';

    if (hardDelete) {
      await hardDeleteAnnouncement(id);
    } else {
      await deleteAnnouncement(id);
    }

    return NextResponse.json({
      success: true,
      message: hardDelete ? 'Announcement permanently deleted' : 'Announcement deactivated'
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete announcement'
      },
      { status: 500 }
    );
  }
}