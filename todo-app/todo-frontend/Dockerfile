FROM node:16 AS build-stage

WORKDIR /usr/src/app
COPY . .
ENV REACT_APP_BACKEND_URL=http://localhost:8080/api
RUN npm ci && \
  CI=true npm test && \
  npm run build

FROM nginx:1.20-alpine
COPY --from=build-stage /usr/src/app/build /usr/share/nginx/html