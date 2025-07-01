import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createUserCredentials, getUserByEmail, createEmailVerificationToken, verifyPassword } from "@/lib/auth-db";
import { sendVerificationEmail } from "@/lib/email";
import { saveUser } from "@/services/user";
import { getUuid } from "@/lib/hash";
import { getIsoTimestr } from "@/lib/time";
import { getClientIp } from "@/lib/ip";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  name: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: validationResult.error.errors[0].message 
        },
        { status: 400 }
      );
    }
    
    const { email, password, name } = validationResult.data;
    
    // Check if email already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      // Check if email is not verified
      if (!existingUser.email_verified) {
        // Allow resending verification email
        // Check if password matches
        const isPasswordValid = await verifyPassword(password, existingUser.password_hash);
        if (!isPasswordValid) {
          return NextResponse.json(
            { 
              success: false, 
              error: "Email already registered with different password" 
            },
            { status: 400 }
          );
        }
        
        // Create new verification token and resend email
        const verificationToken = await createEmailVerificationToken(email);
        if (verificationToken && verificationToken.token) {
          const emailResult = await sendVerificationEmail(email, verificationToken.token);
          if (!emailResult.success) {
            console.error("Failed to resend verification email:", emailResult.error);
          }
        }
        
        return NextResponse.json({
          success: true,
          message: "Verification email resent! Please check your email."
        });
      }
      
      // Email is already verified
      return NextResponse.json(
        { 
          success: false, 
          error: "Email already registered and verified" 
        },
        { status: 400 }
      );
    }
    
    // Create user in users table first
    const newUser = {
      uuid: getUuid(),
      email,
      nickname: name || email.split('@')[0],
      avatar_url: '',
      signin_type: 'credentials',
      signin_provider: 'email',
      signin_openid: email,
      created_at: getIsoTimestr(),
      signin_ip: await getClientIp()
    };
    
    const savedUser = await saveUser(newUser);
    
    if (!savedUser.uuid) {
      return NextResponse.json({
        success: false,
        error: "Failed to create user"
      }, { status: 500 });
    }
    
    // Create user credentials
    await createUserCredentials(savedUser.uuid, email, password);
    
    // Create verification token
    const verificationToken = await createEmailVerificationToken(email);
    
    // Send verification email
    if (verificationToken && verificationToken.token) {
      const emailResult = await sendVerificationEmail(email, verificationToken.token);
      
      if (!emailResult.success) {
        console.error("Failed to send verification email:", emailResult.error);
        // Continue anyway - user can request resend
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "Registration successful! Please check your email to verify your account."
    });
    
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Registration failed. Please try again." 
      },
      { status: 500 }
    );
  }
}