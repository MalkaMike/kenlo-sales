import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Shield, ShieldCheck, ShieldX, Loader2 } from "lucide-react";
import { toast } from "sonner";

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.adminUsers.list.useQuery();
  const updateRole = trpc.adminUsers.updateRole.useMutation({
    onSuccess: () => {
      utils.adminUsers.list.invalidate();
      toast.success("Permissão atualizada com sucesso.");
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao atualizar permissão.");
    },
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId: number;
    userName: string;
    newRole: "user" | "admin";
  }>({ open: false, userId: 0, userName: "", newRole: "user" });

  const handleRoleChange = (userId: number, userName: string, newRole: "user" | "admin") => {
    setConfirmDialog({ open: true, userId, userName, newRole });
  };

  const confirmRoleChange = () => {
    updateRole.mutate({
      userId: confirmDialog.userId,
      role: confirmDialog.newRole,
    });
    setConfirmDialog({ open: false, userId: 0, userName: "", newRole: "user" });
  };

  const adminCount = users?.filter((u) => u.role === "admin").length ?? 0;
  const userCount = users?.filter((u) => u.role === "user").length ?? 0;

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          Gestão de Usuários
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie permissões de acesso dos usuários do portal.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Usuários</CardDescription>
            <CardTitle className="text-2xl">{users?.length ?? "—"}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Administradores
            </CardDescription>
            <CardTitle className="text-2xl text-primary">{adminCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Usuários
            </CardDescription>
            <CardTitle className="text-2xl">{userCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
          <CardDescription>
            Administradores têm acesso a Performance, Pricing Admin e esta página.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !users || users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum usuário encontrado.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Permissão</TableHead>
                  <TableHead>Último Acesso</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  const isAdmin = u.role === "admin";

                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={u.avatarUrl ?? undefined} />
                            <AvatarFallback className="text-xs">
                              {getInitials(u.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">
                              {u.name || "Sem nome"}
                              {isSelf && (
                                <span className="text-xs text-muted-foreground ml-1.5">(você)</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {u.email || "—"}
                      </TableCell>
                      <TableCell>
                        {isAdmin ? (
                          <Badge variant="default" className="gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Shield className="w-3 h-3" />
                            Usuário
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(u.lastSignedIn)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(u.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {isSelf ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : isAdmin ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() =>
                              handleRoleChange(u.id, u.name || u.email || "usuário", "user")
                            }
                            disabled={updateRole.isPending}
                          >
                            <ShieldX className="w-3.5 h-3.5" />
                            Remover
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() =>
                              handleRoleChange(u.id, u.name || u.email || "usuário", "admin")
                            }
                            disabled={updateRole.isPending}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Tornar Admin
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({ ...prev, open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.newRole === "admin"
                ? "Promover a Administrador?"
                : "Remover Administrador?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.newRole === "admin" ? (
                <>
                  <strong>{confirmDialog.userName}</strong> terá acesso a Performance, Pricing Admin
                  e Gestão de Usuários.
                </>
              ) : (
                <>
                  <strong>{confirmDialog.userName}</strong> perderá acesso a Performance, Pricing
                  Admin e Gestão de Usuários.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange}>
              {confirmDialog.newRole === "admin" ? "Promover" : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
