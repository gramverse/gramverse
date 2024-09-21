FROM hub.hamdocker.ir/node:alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm cache clean --force && npm install
COPY . .
RUN npm run build

FROM hub.hamdocker.ir/node:alpine
WORKDIR /app
COPY package*.json ./
RUN npm cache clean --force && npm install --omit=dev
COPY --from=build /app/dist .
EXPOSE 3000
CMD ["node", "./src/main.js"]
