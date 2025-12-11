# 1. Etapa de Construcción (NodeJS) - SOLO PARA REFERENCIA
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Construye la aplicación optimizada para producción
RUN npm run build
# El resultado es el contenido dentro de /app/build