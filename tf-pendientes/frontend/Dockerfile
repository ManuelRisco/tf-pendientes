# Etapa 1: Construcción (Build)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Producción (Nginx)
FROM nginx:alpine
# Copiamos la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copiamos los archivos estáticos generados por Vite
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
# Reemplazamos el puerto de Nginx por el que provee Railway dinámicamente
CMD sed -i "s/listen 80;/listen ${PORT:-80};/g" /etc/nginx/conf.d/default.conf && nginx -g "daemon off;"
