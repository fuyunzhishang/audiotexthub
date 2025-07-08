"use client";

import googleOneTap from "google-one-tap";
import { signIn } from "next-auth/react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function () {
  const { data: session, status } = useSession();

  const oneTapLogin = async function () {
    const options = {
      client_id: process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID,
      auto_select: false,
      cancel_on_tap_outside: false,
      context: "signin",
    };

    // console.log("onetap login trigger", options);

    googleOneTap(options, (response: any) => {
      console.log("onetap login ok", response);
      handleLogin(response.credential);
    });
  };

  const handleLogin = async function (credentials: string) {
    const res = await signIn("google-one-tap", {
      credential: credentials,
      redirect: false,
    });
    console.log("signIn ok", res);
  };

  useEffect(() => {
    // console.log("one tap login status", status, session);

    if (status === "unauthenticated") {
      // 只在首次未认证时尝试一次
      oneTapLogin();
      
      // 移除自动重试的定时器，避免频繁请求
      // 如果用户关闭了 One Tap 提示，不应该一直重试
    }
  }, [status]);

  return <></>;
}
