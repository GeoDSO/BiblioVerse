# BiblioVerse – Trabajo de Fin de Ciclo (TFC)

BiblioVerse es una aplicación web **fullstack** desarrollada como **Trabajo de Fin de Ciclo**, cuyo objetivo es ofrecer una plataforma para la **gestión, organización y compartición de libros digitales en formato PDF**, permitiendo diferenciar entre contenidos públicos y privados.

El proyecto aborda el desarrollo completo de una aplicación moderna, incluyendo **frontend, backend, seguridad, persistencia de datos y despliegue en la nube**.
---

## Objetivo del proyecto

El objetivo principal de BiblioVerse es:

- Facilitar la **gestión personal de libros digitales**
- Permitir la **publicación de libros públicos**
- Ofrecer un sistema de **bibliotecas privadas**
- Implementar un backend seguro y escalable
- Desplegar la aplicación en un entorno real de producción

---

## Funcionalidades principales

-  Sistema de autenticación y autorización mediante **JWT**
-  Gestión de usuarios
-  Subida de libros en formato PDF
-  Subida de portadas en formato imagen
-  Libros públicos accesibles desde un explorador
-  Libros privados asociados a bibliotecas personales
-  Creación y gestión de bibliotecas
-  Búsqueda de libros por título y autor
-  Almacenamiento de archivos en la nube mediante **Cloudinary**

---

## Tecnologías utilizadas

### Backend
- **Java 17**
- **Spring Boot**
- **Spring Security**
- **JWT (JSON Web Tokens)**
- **Spring Data JPA / Hibernate**
- **PostgreSQL**
- **Cloudinary**

### Frontend
- **React**
- **JavaScript**
- **Fetch API**
- **CSS personalizado**

### Infraestructura y despliegue
- **Docker** (Dockerfile para el backend)
- **Render** (despliegue del backend y base de datos)
- **Cloudinary** (almacenamiento de PDFs e imágenes)
- **Vercel** (despliegue de frontend)

---

## Docker y despliegue

El backend de la aplicación incluye un **Dockerfile**, utilizado para facilitar el despliegue en **Render**.

- El **Dockerfile se encuentra únicamente en el backend**
- Permite construir una imagen del servicio backend basada en Spring Boot
- Facilita la portabilidad y el despliegue en entornos cloud
- El frontend se despliega de forma independiente

Este enfoque permite separar responsabilidades y simplificar la infraestructura del proyecto.

---

## Configuración mediante variables de entorno

Para garantizar la seguridad y flexibilidad del sistema, el proyecto utiliza **variables de entorno** para la configuración de credenciales y servicios externos.

Variables principales:

```env
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx

JWT_SECRET=xxxx

SPRING_DATASOURCE_URL=xxxx
SPRING_DATASOURCE_USERNAME=xxxx
SPRING_DATASOURCE_PASSWORD=xxxx
