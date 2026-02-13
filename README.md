# Personal Dashboard

A modern, customizable dashboard with glassmorphic design and transparent background, optimized for Zen browser. Features real-time widgets for weather, crypto, GitHub, Twitch, news, calendar, bookmarks, and more.

## ✨ Features

### Core Widgets
- **🌤️ Weather** - Real-time weather from YR.no (Norwegian Meteorological Institute)
- **💰 Crypto Tracker** - Live cryptocurrency prices (BTC, ETH, XMR, XRP) from CoinGecko
- **📰 VG News** - Norwegian news with AI-powered summaries
- **🎮 Twitch** - Live followed streams with viewer counts
- **👨‍💻 GitHub** - Profile stats, top repositories, and contribution graph
- **💻 Linux Commands** - Random command tips from 10K+ command database
- **⏱️ Focus Timer** - Pomodoro-style timer with notifications
- **🔖 Bookmarks** - Organized bookmark management with folders (NEW)
- **📅 Calendar** - Google Calendar integration showing upcoming events (NEW)
- **🌍 Interactive Globe** - 3D globe visualization
- **🔍 Smart Search** - Google/Perplexity search with autocomplete

### UI/UX Features
- Glassmorphic design with backdrop blur effects
- Customizable widget layout (drag & drop in settings)
- Dark theme optimized for transparency
- Responsive design
- Keyboard shortcuts (ESC for settings, Tab to switch search engines)
- Auto-refresh for real-time data
- Error boundaries for fault tolerance
- Smooth animations with Framer Motion

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker (optional, for containerized deployment)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env.local` file in the project root:
   ```env
   # Twitch API (optional - for Twitch widget)
   VITE_TWITCH_CLIENT_ID=your_twitch_client_id
   VITE_TWITCH_REDIRECT_URI=http://localhost:5173

  # Google Calendar API (optional - only needed for API fallback)
  # If user provides a public Google Calendar link/ID in Settings,
  # the app can read events through ICS without this key.
   GOOGLE_CALENDAR_API_KEY=your_google_api_key
   GOOGLE_CALENDAR_ID=your_calendar_id@gmail.com

   # OpenAI API (optional - for VG news summaries)
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   The dashboard will be available at `http://localhost:5173`

5. **Start production server** (optional)
   ```bash
   npm run build
   npm start
   ```
  Server runs on `http://localhost:3000`

## 🧪 Testing

The project includes comprehensive testing with Vitest and React Testing Library.

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Test Coverage
- Error boundary component tests
- Custom hooks tests (useLocalStorage, useApiCall)
- Utility function tests (logger)
- More tests can be added in `src/test/`

## 🏗️ Architecture

### Project Structure
```
dashboard/
├── api/                    # Backend API handlers
│   ├── weather.js         # YR.no weather API
│   ├── crypto.js          # CoinGecko crypto prices
│   ├── github.js          # GitHub user/repo data
│   ├── twitch.js          # Twitch streams
│   ├── vg-summary.js      # VG news with AI summaries
│   ├── command.js         # Linux command tips
│   ├── calendar.js        # Google Calendar integration
│   └── suggest.js         # Search suggestions
├── public/
│   ├── cheats.json        # 10K+ Linux commands database
│   └── icons/
├── src/
│   ├── components/        # React components
│   │   ├── ErrorBoundary.jsx      # Error handling
│   │   ├── BookmarksCard.tsx      # Bookmarks widget (TypeScript)
│   │   ├── CalendarCard.tsx       # Calendar widget (TypeScript)
│   │   ├── WeatherCard.jsx
│   │   ├── CryptoCard.jsx
│   │   ├── GithubCard.jsx
│   │   ├── TwitchCard.jsx
│   │   ├── VGCard.jsx
│   │   ├── FocusTimer.jsx
│   │   ├── SmartSearchBar.jsx
│   │   ├── Globe.jsx
│   │   └── SettingsPanel.jsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useApiCall.js         # Standardized fetch wrapper
│   │   ├── useLocalStorage.js    # LocalStorage with validation
│   │   └── AutoRefresh.js        # Auto-refresh hook
│   ├── stores/            # Zustand state management
│   │   ├── settingsStore.js      # App settings & layout
│   │   └── timerStore.js         # Focus timer state
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/
│   │   └── logger.js      # Centralized logging
│   ├── test/              # Test files
│   │   ├── setup.js
│   │   ├── ErrorBoundary.test.jsx
│   │   ├── useLocalStorage.test.js
│   │   └── logger.test.js
│   ├── App.jsx            # Main application
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── server.js              # Express backend
├── vite.config.js         # Vite configuration
├── vitest.config.js       # Vitest test configuration
├── tsconfig.json          # TypeScript configuration
├── package.json
└── Dockerfile             # Docker container config
```

### Tech Stack
- **Frontend**: React 18.2, Vite 7.3
- **State Management**: Zustand (with persistence)
- **Styling**: Custom CSS with glassmorphism
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **3D**: Cobe (WebGL globe)
- **Backend**: Express.js, Node.js
- **Testing**: Vitest, React Testing Library
- **Type Safety**: TypeScript (incremental adoption)
- **Container**: Docker with multi-stage build

### State Management

The app uses **Zustand** for centralized state management:

- `settingsStore` - City coordinates, GitHub username, widget layout, UI state
- `timerStore` - Focus timer state (not persisted)

Settings are automatically persisted to localStorage and synced across components.

### API Architecture

All API endpoints follow a consistent pattern:
- Mounted at `/api/*` routes
- CORS enabled for all origins (development convenience)
- Caching headers for appropriate endpoints
- Centralized error handling
- Rate limiting ready (add `express-rate-limit` if needed)

## 🔧 Configuration

### Widget Customization

1. Press **ESC** to open settings panel
2. Toggle widget visibility
3. Drag widgets to reorder
4. Set location for weather
5. Configure GitHub username
6. Enable/disable focus timer

### Adding New Widgets

1. Create component in `src/components/YourWidget.jsx` or `.tsx`
2. Add widget ID to `settingsStore.js` default layout
3. Import and add to `widgetMap` in `App.jsx`
4. (Optional) Create API handler in `api/your-widget.js`
5. (Optional) Add route in `server.js`

Example:
```javascript
// In App.jsx
import YourWidget from './components/YourWidget.jsx'

const widgetMap = {
  ...existing,
  yourwidget: { component: <YourWidget />, name: 'Your Widget' }
}
```

## 🐳 Docker Deployment

### Build and run with Docker

```bash
# Build the image
docker build -t dashboard .

# Run container
docker run -p 3000:3000 \
  -e TWITCH_CLIENT_ID=your_id \
  -e GOOGLE_CALENDAR_API_KEY=your_key \
  dashboard
```

### Docker Compose (example)

```yaml
version: '3.8'
services:
  dashboard:
    build: .
    ports:
      - "3000:3000"
    environment:
      - TWITCH_CLIENT_ID=${TWITCH_CLIENT_ID}
      - GOOGLE_CALENDAR_API_KEY=${GOOGLE_CALENDAR_API_KEY}
      - GOOGLE_CALENDAR_ID=${GOOGLE_CALENDAR_ID}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    restart: unless-stopped
```

## 📝 Recent Improvements (February 2026)

### Critical Fixes
- ✅ **Fixed localhost API proxy** - Development mode now works correctly
- ✅ **Added error boundaries** - Widgets fail gracefully without crashing the app
- ✅ **CORS middleware** - Centralized CORS handling across all API routes
- ✅ **Security improvements** - Better token handling, input validation

### Code Quality
- ✅ **Logger utility** - Replaced 30+ console.log statements with centralized logger
- ✅ **Custom hooks** - `useApiCall` and `useLocalStorage` for consistent data handling
- ✅ **State management** - Migrated to Zustand from prop drilling
- ✅ **Testing infrastructure** - Vitest setup with example tests

### New Features
- ✅ **Bookmarks widget** - Organize links with folders, favicon support
- ✅ **Calendar widget** - Google Calendar integration with upcoming events
- ✅ **TypeScript support** - Incremental adoption started (new widgets in TS)

### Performance
- ✅ **Code splitting ready** - React.lazy support for dynamic imports
- ✅ **Optimized bundle** - Removed duplicate code, centralized utilities
- ✅ **Better caching** - Improved cache headers on API responses

## 🛠️ Development Tips

### Debugging
- Use `logger.debug()` for development-only logs
- Check browser console for error boundary details
- Inspect Redux DevTools for Zustand state (with middleware)

### TypeScript Migration
- New files should be written in `.tsx`/`.ts`
- Existing `.jsx` files can be gradually converted
- Run `npx tsc --noEmit` to check for type errors

### Testing Best Practices
- Write tests for new features
- Mock API calls in tests
- Use `screen.getByRole()` for accessibility-friendly selectors

## 📜 API Reference

### Weather API
```
GET /api/weather?lat=59.9&lon=10.75
```

### Crypto API
```
GET /api/crypto
```

### GitHub API
```
GET /api/github?username=kurokodairu
```

### Twitch API
```
GET /api/twitch?access_token=...
```

### VG News API
```
GET /api/vg-summary
```

### Calendar API
```
GET /api/calendar
```

### Search Suggestions
```
GET /api/suggest?q=search+query
```

### Linux Commands
```
GET /api/command
```

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for new features
4. Follow existing code style
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 👤 Author

**Kurokodairu**
- GitHub: [@Kurokodairu](https://github.com/Kurokodairu)
- Email: kurokodairuwu@proton.me

## 🙏 Acknowledgments

- Weather data: [YR.no](https://yr.no) (Norwegian Meteorological Institute)
- Crypto data: [CoinGecko API](https://www.coingecko.com/)
- Design inspiration: Glassmorphism UI trends
- Icons: [Lucide Icons](https://lucide.dev/)
- 3D Globe: [Cobe](https://github.com/shuding/cobe)

---

**Enjoy your personalized dashboard! 🚀**
