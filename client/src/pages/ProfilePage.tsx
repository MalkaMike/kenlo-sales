import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, Save, FileText, Calendar, Building2, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch profile data
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = trpc.profile.me.useQuery();
  const { data: proposalHistory, isLoading: historyLoading } = trpc.profile.getProposalHistory.useQuery({ limit: 100 });
  
  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Update form when profile loads
  useState(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setBio(profile.bio || "");
    }
  });
  
  // Mutations
  const updateProfileMutation = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Perfil atualizado", {
        description: "Suas informações foram salvas com sucesso.",
      });
      refetchProfile();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar perfil", {
        description: error.message,
      });
    },
  });
  
  const uploadAvatarMutation = trpc.profile.uploadAvatar.useMutation({
    onSuccess: (data) => {
      toast.success("Avatar atualizado", {
        description: "Sua foto de perfil foi alterada com sucesso.",
      });
      setAvatarPreview(null);
      refetchProfile();
    },
    onError: (error) => {
      toast.error("Erro ao fazer upload", {
        description: error.message,
      });
    },
  });
  
  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      name: name || undefined,
      phone: phone || undefined,
      bio: bio || undefined,
    });
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Arquivo inválido", {
        description: "Por favor, selecione uma imagem.",
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande", {
        description: "O tamanho máximo é 5MB.",
      });
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Upload to server
    const uploadReader = new FileReader();
    uploadReader.onload = (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      uploadAvatarMutation.mutate({
        fileData: base64,
        fileName: file.name,
        mimeType: file.type,
      });
    };
    uploadReader.readAsDataURL(file);
  };
  
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-8">
      <div className="container max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600 mt-2">Gerencie suas informações pessoais e visualize seu histórico de propostas</p>
        </div>
        
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="personal">Informações Pessoais</TabsTrigger>
            <TabsTrigger value="history">Histórico de Propostas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Foto de Perfil</CardTitle>
                <CardDescription>Atualize sua foto de perfil</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={avatarPreview || profile?.avatarUrl || undefined} />
                  <AvatarFallback className="text-2xl bg-primary text-white">
                    {getInitials(profile?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    disabled={uploadAvatarMutation.isPending}
                  >
                    {uploadAvatarMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Escolher Foto
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    JPG, PNG ou GIF. Máximo 5MB.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Atualize seus dados pessoais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile?.email || ""}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-gray-500">
                    O email não pode ser alterado
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Sobre Você</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Conte um pouco sobre você..."
                    rows={4}
                  />
                </div>
                
                <div className="pt-4">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Propostas</CardTitle>
                <CardDescription>
                  Todas as propostas que você gerou ({proposalHistory?.length || 0} total)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : proposalHistory && proposalHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Data
                            </div>
                          </TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4" />
                              Empresa
                            </div>
                          </TableHead>
                          <TableHead>Kombo/Plano</TableHead>
                          <TableHead className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <DollarSign className="w-4 h-4" />
                              Valor Total
                            </div>
                          </TableHead>
                          <TableHead>Ação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {proposalHistory.map((quote) => {
                          const totals = JSON.parse(quote.totals || "{}");
                          const monthlyTotal = totals.monthly || 0;
                          
                          return (
                            <TableRow key={quote.id}>
                              <TableCell className="text-sm">
                                {format(new Date(quote.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                              </TableCell>
                              <TableCell className="font-medium">{quote.clientName || "-"}</TableCell>
                              <TableCell>{quote.agencyName || "-"}</TableCell>
                              <TableCell>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                  {quote.komboName || "Sem Kombo"}
                                </span>
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {formatCurrency(monthlyTotal)}/mês
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-2"
                                  onClick={() => {
                                    toast.info("Em breve", {
                                      description: "Função de visualizar PDF será implementada em breve.",
                                    });
                                  }}
                                >
                                  <FileText className="w-4 h-4" />
                                  Ver PDF
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 font-medium mb-2">Nenhuma proposta gerada ainda</p>
                    <p className="text-gray-500 text-sm">
                      Suas propostas aparecerão aqui quando você começar a usar a calculadora
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
