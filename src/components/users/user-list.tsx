"use client";

import { AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserX } from "lucide-react";
import { UserItem } from "./user-item";

interface UserListProps {
  users: any[];
  onEditUser: (user: any) => void;
  onDeleteUser: (userId: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function UserList({
  users,
  onEditUser,
  onDeleteUser,
  hasActiveFilters,
  onClearFilters,
}: UserListProps) {
  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <UserX className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No se encontraron usuarios</p>
          <p className="text-sm">
            {hasActiveFilters
              ? "Intenta con otros términos de búsqueda o limpia los filtros"
              : "No hay usuarios registrados en el sistema"}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={onClearFilters} className="mt-2">
              Limpiar filtros
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          <AnimatePresence>
            {users.map((user) => (
              <UserItem
                key={user.id}
                user={user}
                onEdit={onEditUser}
                onDelete={onDeleteUser}
              />
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
