import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserByEmail, createEmailVerificationToken } from "@/lib/auth-db";
import { sendVerificationEmail } from "@/lib/email";

const resendSchema = z.object({
  email: z.string().email("Invalid email address")
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validationResult = resendSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: validationResult.error.errors[0].message 
        },
        { status: 400 }
      );
    }
    
    const { email } = validationResult.data;
    
    // Check if user exists
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Email not found" 
        },
        { status: 404 }
      );
    }
    
    // Check if already verified
    if (user.email_verified) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Email already verified" 
        },
        { status: 400 }
      );
    }
    
    // Create new verification token
    const verificationToken = await createEmailVerificationToken(email);
    
    // Send verification email
    if (verificationToken && verificationToken.token) {
      const emailResult = await sendVerificationEmail(email, verificationToken.token);
      
      if (!emailResult.success) {
        console.error("Failed to send verification email:", emailResult.error);
        return NextResponse.json(
          { 
            success: false, 
            error: "Failed to send email. Please try again later." 
          },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "Verification email sent! Please check your inbox."
    });
    
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to resend verification email" 
      },
      { status: 500 }
    );
  }
}