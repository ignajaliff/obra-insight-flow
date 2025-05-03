
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, UserPlus, Edit, Trash2 } from "lucide-react";

// Define the user schema
const userSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  email: z.string().email({ message: "Correo electrónico inválido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  role: z.enum(["admin", "supervisor", "worker"], {
    required_error: "Debes seleccionar un rol",
  }),
});

type UserFormValues = z.infer<typeof userSchema>;

// Mock user data
interface UserData {
  id: string;
  name: string;
  email: string;
  role: "admin" | "supervisor" | "worker";
  createdAt: string;
}

const UsersManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([
    {
      id: "1",
      name: "Administrador Demo",
      email: "demo@sepcon.com",
      role: "admin",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Juan Pérez",
      email: "juan@sepcon.com",
      role: "supervisor",
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Maria López",
      email: "maria@sepcon.com",
      role: "worker",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "worker",
    },
  });

  const handleEditUser = (user: UserData) => {
    setEditingUser(user);
    form.reset({
      name: user.name,
      email: user.email,
      password: "", // Don't set the password for security
      role: user.role,
    });
    setIsOpen(true);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    form.reset({
      name: "",
      email: "",
      password: "",
      role: "worker",
    });
    setIsOpen(true);
  };

  const onSubmit = (data: UserFormValues) => {
    // If we're editing a user
    if (editingUser) {
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, name: data.name, email: data.email, role: data.role }
          : user
      ));
      
      toast({
        title: "Usuario actualizado",
        description: `El usuario ${data.name} ha sido actualizado correctamente`,
      });
    } 
    // If we're adding a new user
    else {
      const newUser: UserData = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        role: data.role,
        createdAt: new Date().toISOString(),
      };
      
      setUsers([...users, newUser]);
      
      toast({
        title: "Usuario creado",
        description: `El usuario ${data.name} ha sido creado correctamente`,
      });
    }
    
    setIsOpen(false);
    form.reset();
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    
    toast({
      title: "Usuario eliminado",
      description: "El usuario ha sido eliminado correctamente",
    });
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "admin": return "Administrador";
      case "supervisor": return "Supervisor";
      case "worker": return "Trabajador";
      default: return role;
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Administra los usuarios que tienen acceso al sistema
          </p>
        </div>
        <Button onClick={handleAddUser} className="flex items-center gap-2">
          <UserPlus size={16} />
          Agregar Usuario
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
          <CardDescription>
            Lista de todos los usuarios registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo electrónico</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Fecha de creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleName(user.role)}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.email === "demo@sepcon.com"} // Prevent deletion of demo user
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {editingUser ? "Editar Usuario" : "Agregar Usuario"}
            </DialogTitle>
            <DialogDescription>
              {editingUser 
                ? "Actualiza la información del usuario" 
                : "Completa el formulario para crear un nuevo usuario"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="correo@sepcon.com"
                        type="email"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Este correo se utilizará para iniciar sesión
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {editingUser ? "Nueva Contraseña (opcional)" : "Contraseña"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={editingUser ? "Dejar en blanco para no cambiar" : "Contraseña"} 
                        type="password" 
                        {...field}
                        required={!editingUser}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="worker">Trabajador</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Define qué puede hacer este usuario en el sistema
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingUser ? "Actualizar" : "Crear Usuario"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManagement;
