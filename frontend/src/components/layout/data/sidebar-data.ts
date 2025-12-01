import {
  CheckSquare,
  Users,
  Home,
  Image,
  Settings,
  Tv,
  Flame,
  List,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Toofy',
    email: 'toofy@tv',
    avatar: '',
  },
  teams: [
    {
      name: 'Toofy.Tv',
      logo: Tv,
      plan: 'Anime Platform',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Home',
          url: '/home',
          icon: Home,
        },
        {
          title: 'New Release',
          url: '/new-release',
          icon: Flame,
        },
        {
          title: 'Anime List',
          url: '/anime-list',
          icon: List,
        },
      ],
    },
    {
      title: 'Admin Panel',
      items: [
        {
          title: 'Manage',
          icon: Settings,
          items: [
            {
              title: 'Tasks',
              url: '/tasks',
              icon: CheckSquare,
            },
            {
              title: 'Hero Slider',
              url: '/hero-slider',
              icon: Image,
            },
            {
              title: 'Users',
              url: '/users',
              icon: Users,
            },
          ],
        },
      ],
    },
  ],
}
