# using alpine because its small and fast
FROM node:18-alpine

WORKDIR /usr/src/app

# copy package files first so docker caches this layer
# if code changes but packages dont, npm install wont re-run
COPY package*.json ./

# prod only, no devDependencies needed in container
RUN npm install --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]