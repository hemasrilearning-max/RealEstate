package com.realestate.modules.Broker.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

/**
 * Optional CORS helper for Broker module.
 * Bean names are unique to avoid clash with any BrokerOld package.
 *
 * Prefer deleting the BrokerOld package from the project entirely.
 */
@Configuration("brokerModuleCorsConfiguration")
public class BrokerCorsConfig {

    @Bean(name = "brokerModuleCorsFilter")
    public CorsFilter brokerModuleCorsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/broker/**", config);
        return new CorsFilter(source);
    }
}
