FROM node:20-alpine

WORKDIR /app

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

CMD ["npm", "start"]
