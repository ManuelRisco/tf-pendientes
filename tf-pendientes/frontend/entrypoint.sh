#!/bin/sh
# Reemplazar el puerto en nginx.conf
sed -i "s/listen 80;/listen ${PORT:-80};/g" /etc/nginx/conf.d/default.conf

# Ejecutar el comando original
exec "$@"
