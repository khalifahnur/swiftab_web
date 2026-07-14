import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarDays } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { DateRange } from "react-day-picker" 
import { format } from "date-fns"
import { cn } from "@/lib/utils" // Standard shadcn utility

interface DateRangePickerProps {
  onChange: (range: { start?: string; end?: string }) => void
}

export function DateRangePicker({ onChange }: DateRangePickerProps) {
  const [date, setDate] = useState<DateRange | undefined>()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "w-[260px] justify-start text-left font-normal border-gray-200 transition-all focus:ring-2 focus:ring-[#008080]/20",
            !date && "text-muted-foreground",
            date && "bg-[#008080]/5 border-[#008080]/30 text-[#008080]"
          )}
        >
          <CalendarDays className={cn("mr-2 h-4 w-4", date ? "text-[#008080]" : "text-gray-400")} /> 
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-gray-100 shadow-xl" align="start">
        <Calendar
          mode="range"
          selected={date}
          onSelect={(newDate) => {
            setDate(newDate);

            if (newDate?.from) {
              onChange({
                start: newDate.from.toISOString(),
                end: newDate.to ? newDate.to.toISOString() : newDate.from.toISOString(),
              });
            } else {
              onChange({});
            }
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}