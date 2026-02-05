import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function EjerciciosPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis Ejercicios</CardTitle>
        <CardDescription>
          Aquí encontrarás tus ejercicios asignados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          No tienes ejercicios asignados todavía.
        </p>
      </CardContent>
    </Card>
  );
}
