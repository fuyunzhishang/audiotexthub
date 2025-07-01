import { NextRequest, NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/auth-db";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.redirect(
        new URL('/auth/signin?error=missing-token', req.url)
      );
    }
    
    const result = await verifyEmailToken(token);
    
    if (result.success) {
      // Redirect to sign in page with success message
      return NextResponse.redirect(
        new URL('/auth/signin?verified=true', req.url)
      );
    } else {
      // Redirect with error
      return NextResponse.redirect(
        new URL(`/auth/signin?error=${result.error}`, req.url)
      );
    }
    
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(
      new URL('/auth/signin?error=verification-failed', req.url)
    );
  }
}