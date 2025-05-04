package com.maviniciusdev.back.security.config;

import com.maviniciusdev.back.appuser.AppUserService;
import com.maviniciusdev.back.security.jwt.JwtAuthenticationFilter;
import lombok.AllArgsConstructor;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@AllArgsConstructor
@EnableWebSecurity
public class WebSecurityConfig {

    private final AppUserService          appUserService;
    private final BCryptPasswordEncoder   bCryptPasswordEncoder;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthFilter
    ) throws Exception {
        http
                .sessionManagement(sess ->
                        sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authenticationProvider(daoAuthenticationProvider())
                .authorizeHttpRequests(auth -> auth

                        // recursos públicos estáticos e html
                        .requestMatchers(
                                PathRequest.toStaticResources().atCommonLocations()
                        ).permitAll()
                        .requestMatchers("/pages/**", "/*.html").permitAll()

                        // endpoints abertos de registro/login
                        .requestMatchers(
                                "/api/v*/registration/**",
                                "/api/v1/auth/**"
                        ).permitAll()

                        // verifica existência de usuário
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/exists")
                        .permitAll()

                        // CRUD usuários (só ADMIN)
                        .requestMatchers(HttpMethod.GET,   "/api/v1/users").hasRole("ADMIN")
                        .requestMatchers("/api/v1/users/**").hasRole("ADMIN")

                        // ALLOW GET em academic-spaces para USER e ADMIN
                        .requestMatchers(HttpMethod.GET, "/api/v1/academic-spaces/**")
                        .hasAnyRole("USER","ADMIN")

                        // demais ações em academic-spaces só ADMIN
                        .requestMatchers(
                                "/api/v1/academic-spaces/create",
                                "/api/v1/academic-spaces/update/**",
                                "/api/v1/academic-spaces/update-availability/**",
                                "/api/v1/academic-spaces/delete/**"
                        ).hasRole("ADMIN")

                        // reservas (USER ou ADMIN)
                        .requestMatchers("/api/v1/reservations/**")
                        .hasAnyRole("USER","ADMIN")

                        // todo o resto precisa autenticação
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
        ;

        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setPasswordEncoder(bCryptPasswordEncoder);
        provider.setUserDetailsService(appUserService);
        return provider;
    }
}