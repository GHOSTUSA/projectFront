FROM node:20-alpine

WORKDIR /app
RUN apk add --no-cache netcat-openbsd

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma Client (Set dummy DATABASE_URL to satisfy Prisma during generation)
RUN DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy" npx prisma generate

# Build TypeScript to JavaScript
RUN npm run build

EXPOSE 8080

ENV HOST=0.0.0.0
ENV PORT=8080

# Wait for MariaDB to be reachable, then run Prisma migrations and start the app
CMD ["sh", "-c", "until nc -z mariadb 3306; do echo 'Waiting for mariadb...'; sleep 1; done; npx prisma migrate deploy && npm start"]
