"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function EmployeeMessagesRedirect() {
  return (
    <Link href="/messages">
      <Button>Go to Messages</Button>
    </Link>
  )
}
