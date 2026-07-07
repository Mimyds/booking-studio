import type { Metadata } from "next"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AdminLoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Connexion admin | The Studio",
  description: "Connexion à l’espace d’administration The Studio.",
}

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-6 py-12">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
            The Studio
          </p>
          <CardTitle className="text-4xl">Administration</CardTitle>
          <CardDescription className="leading-6">
            Connectez-vous avec un compte autorisé pour accéder au tableau de
            bord.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <AdminLoginForm />
        </CardContent>
      </Card>
    </main>
  )
}
