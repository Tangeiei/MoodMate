FROM nodered/node-red:latest

USER root

# Working directory for Node-RED user data
WORKDIR /data

# Install custom dependencies needed for MoodMate API
COPY package.json /data/package.json
RUN npm install --production --no-audit --no-fund

# Copy configuration and flow files
COPY settings.js /data/settings.js
COPY flows.json /data/flows.json

# Ensure correct file permissions
RUN chown -R node-red:node-red /data

USER node-red
WORKDIR /usr/src/node-red

EXPOSE 1880

CMD ["npm", "start", "--cache", "/data/.npm", "--", "--userDir", "/data", "--settings", "/data/settings.js"]
