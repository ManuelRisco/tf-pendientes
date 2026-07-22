# Etapa 1: Construcción (Build)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Producción (Nginx)
FROM nginx:alpine
# Nginx oficial reemplazará automáticamente ${PORT} por la variable de Railway al arrancar
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
# Copiamos los archivos estáticos generados por Vite
COPY --from=builder /app/dist /usr/share/nginx/html
