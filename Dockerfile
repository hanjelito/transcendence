# Multistage Dockerfile
# docker build -t node_bull .
# docker run -it -v /Users/dperez-z/back:/backend -p 3000:3000 node_bull
# git checkout -b feature/game   
# git branch
# git pull origin feature/game 
# git add .
# git commit -m "mm"
# git push origin feature/game

#docker run -p 5050:80 -e "PGADMIN_DEFAULT_EMAIL=user@domain.com" -e "PGADMIN_DEFAULT_PASSWORD=SuperSecret" -d dpage/pgadmin4

###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:18-bullseye
#FROM node:16-alpine3.11 As development

# RUN apt-get update && \
# 	apt-get -y --no-install-recommends install tzdata && \
# 	ln -sf /usr/share/zoneinfo/Europe/Madrid /etc/localtime && \
# 	echo "Europe/Madrid" > /etc/timezone && \
# 	dpkg-reconfigure -f noninteractive tzdata && \
# 	apt-get autoremove -y && \
# 	apt-get clean && \
# 	rm -rf /var/lib/apt/lists/*

WORKDIR /backend
COPY *.json .
COPY *.js .
COPY . .
#RUN npm i -g vue @vue/cli @vue/cli-service

#RUN npm ci 
#RUN npm install --non-interactive


EXPOSE 3000

#ENTRYPOINT ["/bin/sh", "-c", "npm install --non-interactive &&  npm run serve"]
#CMD ["npm", "run", "serve"]
# Dependencies from package.json and start the server
#ENTRYPOINT ["/entrypoint.sh"]
#ENTRYPOINT  ["/bin/sh", "-c", "npm install --non-interactive &&  npm run serve"]

ENTRYPOINT  ["/bin/sh", "-c", "yarn install && yarn run start"]

# # install simple http server for serving static content
# #RUN npm install -g http-server

# # make the 'app' folder the current working directory
# WORKDIR  /usr/transcende/frontend

# # Copy application dependency manifests to the container image.
# # A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# # Copying this first prevents re-running npm install on every code change.
# COPY package*.json .

# RUN npm i -g @vue/cli
# RUN npm i -g @vue/cli-service
# # Install app dependencies using the `npm ci` command instead of `RUN npm install'
# RUN npm ci --include=dev

# RUN chmod -R 777 node_modules

# # copy project files and folders to the current working directory (i.e. 'app' folder)
# COPY --chown=node:node . .

# # build app for production with minification
# #RUN npm run build

# # Use the node user from the image (instead of the root user)
# USER node

# EXPOSE 8080

# #CMD ["npm", "run", "start"]
# CMD ["npm", "run", "serve:development"]
# #CMD [ "http-server", "dist" ]

# ###################
# # BUILD FOR PRODUCTION
# ###################
# FROM node:18-alpine As build
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build

# ###################
# # PRODUCTION
# ###################

# FROM nginx:stable-alpine As production
# COPY --from=build-stage /app/dist /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]