"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, UserCheck, UserX } from "lucide-react";
import {
  convertApiRoleToFormRole,
  convertApiStatusToFormStatus,
} from "./types";

interface UserItemProps {
  user: any;
  onEdit: (user: any) => void;
  onDelete: (userId: string) => void;
}

export function UserItem({ user, onEdit, onDelete }: UserItemProps) {
  const userFormRole = convertApiRoleToFormRole(user.role);
  const userFormStatus = convertApiStatusToFormStatus(user.status);

  const getRoleBadgeVariant = (role: string) => {
    const formRole = convertApiRoleToFormRole(role as any);
    switch (formRole) {
      case "Administrador":
        return "default";
      case "Supervisor":
        return "secondary";
      case "Cajero":
        return "outline";
      case "Técnico":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-center justify-between p-6 hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          {user.status === "active" ? (
            <UserCheck className="h-8 w-8 text-green-600" />
          ) : (
            <UserX className="h-8 w-8 text-gray-400" />
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h4 className="font-medium">{user.name}</h4>
            <Badge variant={getRoleBadgeVariant(user.role)}>
              {userFormRole}
            </Badge>
            <Badge
              variant={userFormStatus === "Activo" ? "default" : "secondary"}
            >
              {userFormStatus}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
          <Edit className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El usuario{" "}
                <strong>{user.name}</strong> será eliminado permanentemente del
                sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(user.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
}
