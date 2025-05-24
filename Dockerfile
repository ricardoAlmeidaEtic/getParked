FROM node:20-alpine

WORKDIR /app

# Install OpenSSL
RUN apk add --no-cache openssl

COPY package*.json ./

RUN npm install

COPY . .

# Generate Tailwind CSS
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"] 