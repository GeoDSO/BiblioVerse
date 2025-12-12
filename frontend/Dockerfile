# =========================================================
# Etapa 1: CONSTRUCCIÓN (Build Stage)
# =========================================================
FROM node:20 AS build
WORKDIR /app

# 1. Copiar SOLO archivos de dependencia
# Esto asegura que el npm install se cachee si solo cambian las dependencias
COPY package.json package-lock.json ./ 

# 2. Instalar dependencias
# El comando 'npm install' descarga 'react-scripts' en node_modules
RUN npm install 

# 3. Copiar el resto del código
COPY . .

# 4. Ejecutar la construcción
# El 'npm run build' ejecuta 'react-scripts build' y crea la carpeta /app/build
RUN npm run build 
# El resultado es el contenido dentro de /app/build

# =========================================================
# Etapa 2: SERVICIO (Runtime Stage - Nginx)
# (Si decides usar el Web Service de Render)
# =========================================================
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]