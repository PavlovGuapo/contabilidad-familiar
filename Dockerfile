# Etapa 1: Construcción (Build)
FROM node:18-alpine as build

WORKDIR /app

# Copiamos los archivos de dependencias primero para aprovechar el caché de Docker
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código fuente
COPY . .

# Generamos la versión optimizada para producción
RUN npm run build

# Etapa 2: Servidor Web (Production)
FROM nginx:alpine

# Copiamos los archivos construidos en la etapa anterior a la carpeta de Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Exponemos el puerto 80 (interno del contenedor)
EXPOSE 80

# Comando de arranque (por defecto en la imagen de nginx, pero explícito aquí)
CMD ["nginx", "-g", "daemon off;"]