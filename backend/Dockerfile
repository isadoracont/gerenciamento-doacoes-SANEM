FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

RUN mvn clean package -DskipTests

EXPOSE 8080

CMD ["java", "-jar", "target/javalovers-backend-1.0.0.jar"]
