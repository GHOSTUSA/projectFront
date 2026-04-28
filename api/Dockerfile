### --- Build Stage --- ###
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache netcat-openbsd

COPY package*.json ./
RUN npm ci

# Copier tout le code et .env (pour Prisma et runtime)
COPY . .
COPY .env ./
# Générer Prisma Client (dummy DATABASE_URL pour la génération)
RUN DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy" npx prisma generate
# Build TypeScript
RUN npm run build

### --- Runtime Stage --- ###
FROM node:20-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache netcat-openbsd

# Copie uniquement le nécessaire depuis le build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated
# Copier .env pour Prisma et l'app (racine et dossier prisma)
COPY --from=builder /app/.env ./
COPY --from=builder /app/.env ./prisma/.env
COPY --from=builder /app/prisma.config.ts ./
# COPY --from=builder /app/public ./public

EXPOSE 8080
ENV HOST=0.0.0.0
ENV PORT=8080

# Attendre MariaDB, migrer, puis lancer l'app
# Remplacer la dernière ligne par celle-ci :
CMD ["sh", "-c", "until nc -z mariadb 3306; do echo 'Waiting for mariadb...'; sleep 1; done; npx prisma migrate deploy && npm start"]