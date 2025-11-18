"use client";

import { AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalItems = users.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIdx = (page - 1) * pageSize;
  const pagedUsers = users.slice(startIdx, startIdx + pageSize);

  useEffect(() => {
    setPage(1);
  }, [users, pageSize]);
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
            {pagedUsers.map((user) => (
              <UserItem
                key={user.id}
                user={user}
                onEdit={onEditUser}
                onDelete={onDeleteUser}
              />
            ))}
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Mostrar</span>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm">por página</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
              Anterior
            </Button>
            <span className="text-sm">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
              Siguiente
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
