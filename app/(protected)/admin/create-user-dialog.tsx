"use client";

import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateUserForm } from "./usuarios/create-user-form";

export function CreateUserDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-auto py-4 flex-col gap-1.5">
          <UserPlus className="h-5 w-5" />
          <span className="font-semibold">Crear usuario</span>
          <span className="text-xs font-normal text-muted-foreground">Añade un paciente o cuenta nueva</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear cuenta</DialogTitle>
        </DialogHeader>
        <CreateUserForm />
      </DialogContent>
    </Dialog>
  );
}
