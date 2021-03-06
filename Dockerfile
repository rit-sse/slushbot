FROM node:6.4

WORKDIR /app
COPY ./package.json /app/package.json
RUN npm install

COPY ./ /app

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]

CMD ["npm", "start"]
