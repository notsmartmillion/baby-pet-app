FROM node:20-alpine

WORKDIR /app

# Copy workspace files
COPY package*.json ./
COPY tsconfig.json ./

# Copy shared packages
COPY packages/ ./packages/

# Copy API service
COPY services/api/ ./services/api/

# Install dependencies
RUN npm install

# Build types package
WORKDIR /app/packages/types
RUN npm run build

# Build API
WORKDIR /app/services/api
RUN npm run build

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "start"]

