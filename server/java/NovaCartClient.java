package com.novacart.client;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;

/**
 * NovaCart Java 17+ Client SDK for MERN Stack Interoperability.
 * 
 * Provides Java Spring Boot and enterprise JVM microservices with direct,
 * type-safe access to NovaCart's Node.js Express REST API & MongoDB database.
 */
public class NovaCartClient {

    private final String baseUrl;
    private final HttpClient httpClient;
    private String authToken;

    public NovaCartClient(String baseUrl) {
        this.baseUrl = baseUrl.replaceAll("/$", "");
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .version(HttpClient.Version.HTTP_2)
                .build();
    }

    /**
     * Authenticate with the Node.js Express backend and store the JWT.
     */
    public LoginResponse login(String email, String password) throws IOException, InterruptedException {
        String jsonPayload = String.format("{\"email\":\"%s\",\"password\":\"%s\"}", email, password);
        
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/users/login"))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(10))
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            // Store token for subsequent calls
            this.authToken = extractToken(response.body());
            return new LoginResponse(true, response.body(), this.authToken);
        } else {
            throw new RuntimeException("Login failed with HTTP " + response.statusCode() + ": " + response.body());
        }
    }

    /**
     * Fetch products catalog from Node.js Express REST API.
     */
    public String getProducts() throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/products"))
                .header("Accept", "application/json")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }

    /**
     * Fetch user's wishlist from Node.js backend.
     */
    public String getWishlist() throws IOException, InterruptedException {
        ensureAuthenticated();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/users/wishlist"))
                .header("Authorization", "Bearer " + this.authToken)
                .header("Accept", "application/json")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }

    /**
     * Toggle a product in user's wishlist via Node.js API.
     */
    public String toggleWishlist(String productId) throws IOException, InterruptedException {
        ensureAuthenticated();
        String jsonPayload = String.format("{\"productId\":\"%s\"}", productId);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/users/wishlist/toggle"))
                .header("Authorization", "Bearer " + this.authToken)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }

    private void ensureAuthenticated() {
        if (this.authToken == null || this.authToken.isBlank()) {
            throw new IllegalStateException("Client must be authenticated. Call login() first.");
        }
    }

    private String extractToken(String responseBody) {
        // Minimal parser for "token":"<jwt>"
        int tokenIdx = responseBody.indexOf("\"token\":");
        if (tokenIdx != -1) {
            int start = responseBody.indexOf("\"", tokenIdx + 8) + 1;
            int end = responseBody.indexOf("\"", start);
            if (start > 0 && end > start) {
                return responseBody.substring(start, end);
            }
        }
        return null;
    }

    public record LoginResponse(boolean success, String rawJson, String token) {}
}
