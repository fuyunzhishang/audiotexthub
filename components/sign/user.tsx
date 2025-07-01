"use client";

import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Link } from "@/i18n/routing";
import { User } from "@/types/user";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { NavItem } from "@/types/blocks/base";

export default function SignUser({ user }: { user: User }) {
  const t = useTranslations();
  
  // Get user initials from nickname or email
  const getUserInitials = (user: User) => {
    const name = user.nickname || user.email;
    if (!name) return "U";
    
    // If it's an email, use the part before @
    const displayName = name.includes('@') ? name.split('@')[0] : name;
    
    // Get first letter and capitalize
    return displayName.charAt(0).toUpperCase();
  };

  const dropdownItems: NavItem[] = [
    {
      title: user.nickname,
    },
    {
      title: t("user.user_center"),
      url: "/my-orders",
    },
    {
      title: t("user.admin_system"),
      url: "/admin/users",
    },
    {
      title: t("user.sign_out"),
      onClick: () => signOut(),
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={user.avatar_url} alt={user.nickname} />
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
            {getUserInitials(user)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mx-4 bg-background">
        {dropdownItems.map((item, index) => (
          <React.Fragment key={index}>
            <DropdownMenuItem
              key={index}
              className="flex justify-center cursor-pointer"
            >
              {item.url ? (
                <Link href={(item.url || "#") as any} target={item.target}>
                  {item.title}
                </Link>
              ) : (
                <button onClick={item.onClick}>{item.title}</button>
              )}
            </DropdownMenuItem>
            {index !== dropdownItems.length - 1 && <DropdownMenuSeparator />}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
