import * as React from "react"
import {
  GalleryVerticalEnd,
  Home,
  BarChart3,
  Settings2,
  Target,
} from "lucide-react"

import { NavMain } from "../components/nav-main"
import { NavUser } from "../components/nav-user"
import { TeamSwitcher } from "../components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "../components/ui/sidebar"
import { useAuth } from "../context/AuthContext"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: true,
      showItems: false,
      items: [],
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChart3,
      isActive: true,
      showItems: false,
      items: [],
    },
    {
      title: "Habits",
      url: "/dashboard/habits",
      icon: Target,
      isActive: true,
      showItems: false,
      items: [],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      isActive: true,
      showItems: false,
      items: [
        {
          title: "Profile",
          url: "#",
        },
        {
          title: "Preferences",
          url: "#",
        },
        {
          title: "Notifications",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      name: "Habits",
      url: "/dashboard/habits",
      icon: Target,
    },
  ],
}

const teams = [
    {
      name: "Habit Tracker",
      logo: GalleryVerticalEnd,
      plan: "Individual",
    },
  ]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        {/* <NavProjects projects={data.projects} /> */}
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
