import { NextRequest, NextResponse } from 'next/server';
import { getUserUuid } from '@/services/user';
import { checkTtsUsageLimit } from '@/models/tts-usage';

export async function GET(request: NextRequest) {
  try {
    const userUuid = await getUserUuid();
    
    if (!userUuid) {
      return NextResponse.json({
        isLoggedIn: false,
        usage: {
          allowed: false,
          remaining: 0,
          used: 0,
          limit: 20
        }
      });
    }
    
    // 检查Google语音的使用限制
    const usageLimit = await checkTtsUsageLimit(userUuid, 'google', 20);
    
    return NextResponse.json({
      isLoggedIn: true,
      usage: {
        ...usageLimit,
        limit: 20
      }
    });
  } catch (error) {
    console.error('Error checking usage limit:', error);
    return NextResponse.json(
      { error: 'Failed to check usage limit' },
      { status: 500 }
    );
  }
}