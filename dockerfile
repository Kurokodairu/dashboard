# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
ARG VITE_TWITCH_CLIENT_ID
ARG VITE_TWITCH_REDIRECT_URI
ENV VITE_TWITCH_CLIENT_ID=$VITE_TWITCH_CLIENT_ID
ENV VITE_TWITCH_REDIRECT_URI=$VITE_TWITCH_REDIRECT_URI
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Runtime stage with Node to serve APIs and static files
FROM node:22-alpine AS runner
WORKDIR /app

# Copy only what's needed to run
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/api ./api
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.js ./

RUN npm ci --omit=dev || npm i --omit=dev

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["npm", "start"]
