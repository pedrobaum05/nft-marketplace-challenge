
import { Outlet } from "@tanstack/react-router"

import { useSocketEvents } from "@/hooks/use-socket-events"

export function RootLayout() {
  useSocketEvents()

  return <Outlet />
}
