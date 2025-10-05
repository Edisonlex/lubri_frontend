"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

interface ProfileSidebarProps {
  profile: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  onAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileSidebar({
  profile,
  onAvatarUpload,
}: ProfileSidebarProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={profile.avatar}
              alt={`Foto de perfil de ${profile.name}`}
              className="object-cover"
            />
            <AvatarFallback className="text-lg bg-primary/10">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h3 className="font-semibold">{profile.name}</h3>
            <p className="text-sm text-muted-foreground">{profile.role}</p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Miembro desde {new Date().getFullYear()}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Label htmlFor="avatar-upload" className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              Cambiar Foto
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onAvatarUpload}
              />
            </Label>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
