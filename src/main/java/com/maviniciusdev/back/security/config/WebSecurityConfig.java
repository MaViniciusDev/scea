package com.maviniciusdev.back.security.config;

import com.maviniciusdev.back.appuser.AppUserService;
import com.maviniciusdev.back.security.jwt.JwtAuthenticationFilter;
import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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

    private final AppUserService appUserService;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   JwtAuthenticationFilter jwtAuthFilter)
            throws Exception {
        http
                .sessionManagement(sess ->
                        sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authenticationProvider(daoAuthenticationProvider())
                .authorizeHttpRequests(auth -> auth
                        // registro, check e login seguem abertos
                        .requestMatchers(
                                "/api/v*/registration/**",
                                "/api/v1/users/exists",
                                "/api/v1/auth/login"
                        ).permitAll()

                        // rotas só para ADMIN
                        .requestMatchers(
                                "/api/v1/academic-spaces/create",
                                "/api/v1/academic-spaces/update/**",
                                "/api/v1/academic-spaces/update-availability/**",
                                "/api/v1/academic-spaces/delete/**",
                                "/api/v1/users/**"      // exemplo de endpoints de gestão de usuários
                        ).hasRole("ADMIN")

                        // rotas acessíveis a USER e ADMIN
                        .requestMatchers(
                                "/api/v1/reservations/**",
                                "/api/v1/academic-spaces/available",
                                "/api/v1/academic-spaces/active",
                                "/api/v1/academic-spaces/by-code/**"
                        ).hasAnyRole("USER", "ADMIN")

                        // todo o resto precisa de autenticação
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

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
