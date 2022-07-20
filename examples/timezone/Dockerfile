FROM ubuntu:18.04

ADD . /src
WORKDIR "/src"
USER root

EXPOSE 0.0.0.0:8080:8080


RUN apt-get update

RUN apt-get install curl -y
RUN apt-get install sudo -y
RUN curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash - # comes with prepackaged npm
RUN apt-get install nodejs -y

RUN apt-get install git -y
RUN npm install --global yarn -y

RUN yarn install

CMD yarn dev

