FROM node:5

WORKDIR /app
COPY ./package.json /app/package.json
RUN npm install

COPY ./ /app

EXPOSE 3000

# Predefine environment variables
ENV SLACK_SLASH_TOKEN
ENV SLACK_BOT_TOKEN
ENV SSE_API_ROOT
ENV SLACK_SECRET
ENV MAILCHIMP_KEY
ENV MAILCHIMP_LIST_ID

CMD npm start

