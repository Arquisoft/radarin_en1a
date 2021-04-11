FROM node:12.14.1
COPY . /app
WORKDIR /app
#Install the dependencies
RUN npm install --production
#Create an optimized version of the webapp
RUN npm run build
#Install software neccesary for generating the doc
RUN apt-get update && apt-get -y install ruby openjdk-8-jre
RUN gem install asciidoctor asciidoctor-diagram
RUN npm install shx --save-dev
#Generate the doc
RUN npm run docs
CMD [ "node", "server.js" ]