import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { getHabitsByUserId } from "@/api/supabase"
import type { Habit } from "./Tables/Habits/columns"

const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
]

type ComboboxProps = {
    onSelect: React.Dispatch<React.SetStateAction<string>>
}

export function Combobox({
    onSelect
}: ComboboxProps) {
    const { user } = useAuth();
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [data, setData] = useState<Habit[] | null>([])

  const fetchData = async() => {
    if (!user) return;
    const res = await getHabitsByUserId(user.id);
    setData(res)
  }
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {(value && data)
            ? data.find((habit) => habit.id === value)?.name
            : "Select habit..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput id="habit" placeholder="Search habits..." className="h-9" />
          <CommandList>
            <CommandEmpty>No habit found.</CommandEmpty>
            <CommandGroup>
              {data && data.map((habit) => (
                <CommandItem
                  key={habit.id}
                  value={habit.id}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    onSelect(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  {habit.name}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === habit.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}