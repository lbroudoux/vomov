FROM node:argon

MAINTAINER Laurent Broudoux <laurent.broudoux@gmail.com>

# Define working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy files and install dependencies
COPY /dist/package.json /usr/src/app
RUN npm install --production
COPY dist /usr/src/app

# Set the running environment as production
ENV NODE_ENV production

# Expose on specified network port
EXPOSE 8080

# Executing defaults
CMD ["node", "server/app.js"]
