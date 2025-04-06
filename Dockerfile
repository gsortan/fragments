# Dockerfile for setting up node.js fragments microservice environment 
# Creating a new build from a base image using node and specific version: https://docs.docker.com/reference/dockerfile/#from 

# Stage 1 - Build

FROM node:22.13.0-alpine3.21@sha256:f2dc6eea95f787e25f173ba9904c9d0647ab2506178c7b5b7c5a3d02bc4af145 AS build

LABEL maintainer="Gordon Tan <gtan16@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Option 2: relative path - Copy the package.json and package-lock.json
# files into the working dir (/app).  NOTE: this requires that we have
# already set our WORKDIR in a previous step.
COPY --chown=node:node package*.json ./

# Install node dependencies defined in package-lock.json
RUN npm ci --only=production

# Copy src to /app/src/
COPY --chown=node:node ./src ./src

# Copy tests to /app/test/
COPY --chown=node:node ./tests/.htpasswd /app/tests/.htpasswd


######################################################################
# Stage 2 - Production

FROM node@sha256:f2dc6eea95f787e25f173ba9904c9d0647ab2506178c7b5b7c5a3d02bc4af145 AS production

WORKDIR /app

# Add tini here
RUN apk add --no-cache tini=0.19.0-r3

COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/src ./src
COPY --from=build --chown=node:node /app/package.json ./
COPY --from=build --chown=node:node /app/tests/.htpasswd /app/tests/.htpasswd

# Use tini as the init system
ENTRYPOINT ["/sbin/tini", "--"]

# Automated Health Check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl --f http://localhost:${PORT} || exit 1

    

# Start the container by running our server
CMD ["node", "src/index.js"]

# We run our service on port 8080
EXPOSE ${PORT}
