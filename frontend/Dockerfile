# Imagen base con Node
FROM node:20

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos dependencias
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto del servidor de desarrollo
EXPOSE 3000

# Comando para iniciar React
CMD ["npm", "start"]
