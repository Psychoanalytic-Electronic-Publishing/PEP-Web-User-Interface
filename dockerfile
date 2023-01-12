# pull official base image
FROM node:12.22.0-alpine

# set working directory
WORKDIR /app/pep

# add /app/node_modules/.bin to $PATH
ENV PATH /app/pep/node_modules/.bin:$PATH

# install app dependencies
RUN apk add --no-cache git openssh
RUN apk add g++ make python2 py2-pip
COPY ./pep/package.json ./
COPY ./pep/yarn.lock ./
COPY ./pep/.npmrc ./
RUN yarn install
RUN npm rebuild node-sass

# add app
COPY ./pep/ ./

# add environment variables
COPY .env-development ../

# start ember app
CMD ["yarn", "start", "--ssl=false"]
