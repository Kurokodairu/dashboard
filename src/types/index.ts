// Type definitions for the dashboard application

export interface CityCoords {
  name: string
  country: string
  lat: number
  lon: number
  state?: string
}

export interface WidgetLayoutItem {
  id: string
  column: 'left' | 'right'
  order: number
  visible: boolean
}

export interface WeatherData {
  temperature: number
  symbol: string
  windSpeed: number
  precipitation: number
  humidity?: number
  // Add more as needed
}

export interface CryptoData {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap?: number
}

export interface GithubRepo {
  name: string
  description: string
  html_url: string
  stargazers_count: number
  language: string
  updated_at: string
}

export interface GithubUser {
  login: string
  name: string
  avatar_url: string
  bio: string
  public_repos: number
  followers: number
}

export interface TwitchStream {
  user_name: string
  user_login: string
  title: string
  game_name: string
  viewer_count: number
  started_at: string
  thumbnail_url: string
}

export interface TwitchUser {
  id: string
  login: string
  display_name: string
  profile_image_url: string
}

export interface VGArticle {
  title: string
  link: string
  pubDate: string
  summary?: string
}

export interface LinuxCommand {
  command: string
  description: string
  example?: string
}

export interface Bookmark {
  id: string
  title: string
  url: string
  folder?: string
  icon?: string
  createdAt: string
}

export interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone?: string
  }
  end: {
    dateTime: string
    timeZone?: string
  }
  htmlLink?: string
}

export interface TimerMode {
  mode: 'focus' | 'shortBreak' | 'longBreak'
  duration: number
}

export interface SettingsState {
  cityCoords: CityCoords | null
  githubUsername: string
  widgetLayout: WidgetLayoutItem[]
  showFocusTimer: boolean
  showSettings: boolean
}
