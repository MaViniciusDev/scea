package com.maviniciusdev.back.appuser;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
public class AppUserController {

    private final AppUserService appUserService;

    public AppUserController(AppUserService appUserService) {
        this.appUserService = appUserService;
    }

    @GetMapping("/api/v1/users/exists")
    public Map<String, Object> checkUser(@RequestParam String email) {
        Map<String, Object> response = new HashMap<>();

        Optional<AppUser> userOpt = appUserService.findByEmail(email);

        if (userOpt.isPresent()) {
            AppUser user = userOpt.get();
            response.put("exists", true);
            response.put("confirmed", user.isEnabled());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
        } else {
            response.put("exists", false);
            response.put("confirmed", false);
        }

        return response;
    }
}