"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  email: string;
  role: string;
  avatar?: string;
  onAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileHeader({ name, email, role, avatar, onAvatarUpload }: ProfileHeaderProps) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <Avatar className="h-14 w-14 sm:h-20 sm:w-20">
            <AvatarImage src={avatar} alt={`Foto de perfil de ${name}`} className="object-cover" />
            <AvatarFallback className="bg-primary/10">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-semibold truncate">{name}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{email}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{role}</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <label htmlFor="header-avatar-upload" className="cursor-pointer inline-flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Cambiar Foto</span>
                  <input id="header-avatar-upload" type="file" accept="image/*" className="hidden" onChange={onAvatarUpload} />
                </label>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}