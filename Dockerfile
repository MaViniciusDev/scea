# Stage 1: Build
FROM maven:3.9.9 AS build
WORKDIR /app

# Copia apenas o pom para aproveitar o cache do Maven
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copia o restante do código
COPY src ./src

# Realiza o build do projeto ignorando os testes
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copia o artefato gerado pelo build
COPY --from=build /app/target/*.jar app.jar

# Expõe a porta padrão do Spring Boot
EXPOSE 8080

# Inicia a aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]