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

EXPOSE ${PORT}

CMD ["node", "dist/src/main.js"]