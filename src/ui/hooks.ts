import { useState } from 'react'

/** One-open-at-a-time toggle: returns the open id and a function to toggle an id. */
export function useToggle(initial: string | null = null): [string | null, (id: string) => void] {
  const [open, setOpen] = useState<string | null>(initial)
  return [open, (id) => setOpen((cur) => (cur === id ? null : id))]
}
