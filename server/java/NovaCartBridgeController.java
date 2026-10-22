package com.novacart.bridge;

import com.novacart.client.NovaCartClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Spring Boot REST Controller bridging Java microservices with NovaCart MERN Stack.
 * Demonstrates enterprise Java backend integration with Node.js Express REST API & React.js frontend.
 */
@RestController
@RequestMapping("/api/java/bridge")
@CrossOrigin(origins = "*")
public class NovaCartBridgeController {

    private final NovaCartClient mernClient;

    public NovaCartBridgeController(@Value("${novacart.mern.api.url:http://localhost:3000}") String mernUrl) {
        this.mernClient = new NovaCartClient(mernUrl);
    }

    /**
     * Java microservice endpoint returning catalog fetched via Node.js Express & MongoDB.
     */
    @GetMapping("/products")
    public ResponseEntity<String> getProductsFromMern() {
        try {
            String catalogJson = mernClient.getProducts();
            return ResponseEntity.ok()
                    .header("Content-Type", "application/json")
                    .body(catalogJson);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("{\"error\":\"Java to MERN connection failed: " + e.getMessage() + "\"}");
        }
    }

    /**
     * Java health check reporting MERN + Java interop status.
     */
    @GetMapping("/status")
    public ResponseEntity<String> getBridgeStatus() {
        return ResponseEntity.ok("""
            {
                "status": "UP",
                "framework": "Spring Boot 3 + Java 21",
                "interop": "MERN Stack (MongoDB, Express.js, React.js, Node.js)",
                "protocols": ["HTTP/2", "REST", "JSON", "JWT Auth"]
            }
        """);
    }
}
