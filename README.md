# Personal Dashboard

- Node.js 18+ and npm
- Docker (optional, for containerized deployment)

Self publishing:
- Pushing to main -> Github actions -> Dockerhub -> watchtower in docker compose -> updated image -> live website

### Development Setup

 **Install dependencies**
   ```bash
   npm install
   ```

 **Environment Configuration**
   
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

 **Start development server**
   ```bash
   npm run dev
   ```

 **Start production server** (optional)
   ```bash
   npm run build
   npm start
   ```
  Server runs on `http://localhost:3000`

## 🧪 Testing


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
- 
### State Management

**Zustand**
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


- Use `logger.debug()` for development-only logs
- Inspect Redux DevTools for Zustand state (with middleware)

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


- Weather data: [YR.no](https://yr.no) (Norwegian Meteorological Institute)
- Crypto data: [CoinGecko API](https://www.coingecko.com/)
- Icons: [Lucide Icons](https://lucide.dev/)
- 3D Globe: [Cobe](https://github.com/shuding/cobe)
