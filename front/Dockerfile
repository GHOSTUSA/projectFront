FROM node:20-alpine AS builder

WORKDIR /app

# Enable corepack for modern package manager support if needed
RUN corepack enable

COPY package*.json ./
RUN npm install

COPY . .
# Building Nuxt project generates the `.output` directory
RUN npm run build

# Output stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/.output ./.output

EXPOSE 3000

ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

# The start command for Nuxt 3 built applications
CMD ["node", ".output/server/index.mjs"]
