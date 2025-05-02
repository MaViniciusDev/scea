package com.maviniciusdev.back.security.jwt;

import com.maviniciusdev.back.appuser.AppUserService;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final AppUserService appUserService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            // nada pra fazer se não veio token
            chain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);
        String email = null;
        try {
            email = jwtService.extractUsername(token);
        } catch (JwtException | IllegalArgumentException ex) {
            // token malformado ou expirado: ignora autenticação
        }

        // se extraiu um email e ninguém autenticado ainda
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                var userDetails = appUserService.loadUserByUsername(email);
                if (jwtService.isTokenValid(token, userDetails.getUsername())) {
                    var authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities()
                    );
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (UsernameNotFoundException notFound) {
                // usuário não existe mais: ignora e segue sem autenticar
            } catch (JwtException ex) {
                // token válido sintaticamente mas inválido na lógica de validação interna
            }
        }

        chain.doFilter(request, response);
    }
}
