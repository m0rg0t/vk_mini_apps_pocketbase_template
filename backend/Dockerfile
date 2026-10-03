# Use official Node.js image
FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY . .
ARG PORT=3000
ENV PORT=$PORT
ARG POCKETBASE_URL
ENV POCKETBASE_URL=$POCKETBASE_URL
EXPOSE $PORT
CMD ["npm", "start"]
