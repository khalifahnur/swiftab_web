import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CalendarDays, Activity } from "lucide-react"

interface Reservation {
  id: string
  name: string
  email: string
  phoneNumber: string
  start: string
  end: string
  guests: number
  table: string
  floor: string
  status: string
}

interface ReservationStatsProps {
  reservations: Reservation[]
}

export function ReservationStats({ reservations }: ReservationStatsProps) {
  const totalReservations = reservations.length
  const totalGuests = reservations.reduce((sum, res) => sum + res.guests, 0)
  
  const activeReservations = reservations.filter(
    (res) => res.status.toLowerCase() === "active" || res.status.toLowerCase() === "confirmed"
  ).length

  return (
    <div className="grid gap-4 lg:grid-cols-3 bodyfont">
      <Card className="border-gray-100 shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Total Reservations</CardTitle>
          <div className="h-10 w-10 rounded-full bg-[#008080]/10 flex items-center justify-center">
            <CalendarDays className="h-5 w-5 text-[#008080]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{totalReservations}</div>
        </CardContent>
      </Card>

      <Card className="border-gray-100 shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Total Guests</CardTitle>
          <div className="h-10 w-10 rounded-full bg-[#008080]/10 flex items-center justify-center">
             <Users className="h-5 w-5 text-[#008080]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{totalGuests}</div>
        </CardContent>
      </Card>

      <Card className="border-teal/50 shadow-sm bg-teal/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-teal/10 rounded-bl-full -mr-4 -mt-4"></div>
        <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-teal">Active & Confirmed</CardTitle>
          <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
             <Activity className="h-5 w-5 text-teal" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-teal">{activeReservations}</div>
        </CardContent>
      </Card>
    </div>
  )
}