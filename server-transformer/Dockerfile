# Use Maven and Java 21 to build
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Build the jar file
RUN mvn clean package -DskipTests

# Use a lightweight Java 21 runtime (non-Alpine for better networking compatibility)
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
