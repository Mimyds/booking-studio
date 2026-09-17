import { redirect } from "next/navigation"
import { getCurrentAdmin } from "@/lib/admin/auth"
import { getBookingOptions } from "@/lib/bookings/options"
import { BookingForm } from "../booking-form"

export const metadata = { title: "Nouvelle réservation | The Studio" }
export default async function NewBookingPage() {
  if (!(await getCurrentAdmin())) redirect("/admin/login")
  const options = await getBookingOptions()
  return <main className="mx-auto grid max-w-4xl gap-6"><h1 className="text-3xl font-extrabold tracking-tight">Nouvelle réservation</h1><BookingForm options={options} /></main>
}
