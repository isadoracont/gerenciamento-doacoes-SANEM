package com.javalovers;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class JavaLoversApplication {

    public static void main(String[] args) {
        SpringApplication.run(JavaLoversApplication.class, args);
    }
}
