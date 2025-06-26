import { handlers } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

const { GET: authGET, POST: authPOST } = handlers;

export async function GET(request: NextRequest) {
  try {
    console.log("Auth GET request:", request.url);
    console.log("Environment check in auth handler:", {
      AUTH_SECRET: !!process.env.AUTH_SECRET,
      AUTH_URL: process.env.AUTH_URL,
      AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NODE_ENV: process.env.NODE_ENV,
    });
    return await authGET(request);
  } catch (error) {
    console.error("Auth GET error:", error);
    return NextResponse.json(
      { error: "Configuration error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Auth POST request:", request.url);
    return await authPOST(request);
  } catch (error) {
    console.error("Auth POST error:", error);
    return NextResponse.json(
      { error: "Configuration error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
