FROM node:10-alpine

ARG VCS_REF

LABEL org.label-schema.vcs-ref=$VCS_REF \
          org.label-schema.vcs-url="https://github.com/chatopera/chatopera.fmc"

RUN mkdir -p /app
WORKDIR /app

COPY ./app/package.json /app/
RUN npm install --registry https://registry.npm.taobao.org

COPY ./app /app

ENV NODE_ENV production

EXPOSE 8555

CMD npm start
