FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY biblioverse/pom.xml .
COPY biblioverse/src ./src
RUN mvn dependency:go-offline
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE ${BACK_PORT}
ENTRYPOINT ["java","-jar","app.jar"]
