FROM node:18-alpine

# Setting working directory. All the path will be relative to WORKDIR
WORKDIR /usr/src/app

# Installing dependencies
COPY package*.json ./
RUN yarn install

# Copying source files
COPY . .
RUN chmod -R 777 /usr/src/app

# We are not building the app for a development setup
# RUN yarn build

# Expose the listening port
EXPOSE 3000

# This is a production CMD. You'll override this in your docker-compose for development.
CMD ["yarn", "start"]
