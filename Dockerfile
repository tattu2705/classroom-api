FROM node:20-alpine AS build
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine AS production

ENV PORT=3000
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install --only=production --omit=dev

COPY --from=build /usr/src/app/dist ./dist

COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]

EXPOSE ${PORT}

CMD ["node", "dist/main.js"]