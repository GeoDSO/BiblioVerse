# =========================================================
# Etapa 1: CONSTRUCCIÓN (Build Stage)
# =========================================================
# =========================================================
# Etapa 1: CONSTRUCCIÓN (Build Stage)
# =========================================================
FROM node:20 AS build
WORKDIR /app

# [CRÍTICO 1]: Copiar y ejecutar npm install en la misma capa 
# Esto asegura que los binarios estén disponibles
COPY package.json package-lock.json ./ 
RUN npm install 

# [CRÍTICO 2]: Copiar el resto del código SOLO después de la instalación
COPY . .

# [CRÍTICO 3]: Usar npx para forzar el path de react-scripts (Solución de última instancia)
# Cambia 'RUN npm run build' por esta línea:
RUN npx react-scripts build 

# El resultado de la compilación estará en /app/build

# =========================================================
# Etapa 2: SERVICIO (Runtime Stage - Nginx o lo que uses)
# ...

# =========================================================
# Etapa 2: SERVICIO (Runtime Stage - Nginx)
# (Si decides usar el Web Service de Render)
# =========================================================
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]