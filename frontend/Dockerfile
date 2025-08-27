FROM node:20

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

ENV PORT=3000
EXPOSE ${PORT}

CMD ["npm", "start"]
