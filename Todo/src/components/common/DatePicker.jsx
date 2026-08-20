
import  React, { useState } from "react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePicker({ date, setDate }) {
  

  return (
    <Field className="mx-auto w-44 gap-0 m-0 ">
      <FieldLabel htmlFor="date-picker-simple" className={"text-stone-400 font-mono px-1 py-0 tracking-[0.2em]"}>Deadline</FieldLabel>
      <Popover className={"p-0"}>
        <PopoverTrigger render={<Button variant="outline" id="date-picker-simple" className="py-0 justify-start font-normal rounded-sm font-mono">{date ? format(date, "PPP") : <span>Pick a date</span>}</Button>} />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            defaultMonth={date}
            
          />
        </PopoverContent>
      </Popover>
    </Field>
  )
}
