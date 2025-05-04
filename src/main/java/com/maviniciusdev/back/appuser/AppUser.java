package com.maviniciusdev.back.appuser;

import com.maviniciusdev.back.registration.token.ConfirmationToken;
import com.maviniciusdev.back.reservation.Reservation;
import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;

@Getter
@Setter
@EqualsAndHashCode
@NoArgsConstructor
@Entity
public class AppUser implements UserDetails {

    @SequenceGenerator(
            name = "professor_sequence",
            sequenceName = "professor_sequence",
            allocationSize = 1
    )
    @Id
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "professor_sequence"
    )
    private Long id;

    private String firstName;
    private String lastName;
    private String email;
    private String password;

    @Enumerated(EnumType.STRING)
    private AppUserRole appUserRole;

    private Boolean locked = false;
    private Boolean enabled = false;


    @OneToMany(
            mappedBy = "appUser",
            cascade = CascadeType.REMOVE,
            orphanRemoval = true
    )
    private List<ConfirmationToken> confirmationTokens = new ArrayList<>();
    @OneToMany(
            mappedBy = "professor",
            cascade = CascadeType.REMOVE,
            orphanRemoval = true
    )
    private List<Reservation> reservations = new ArrayList<>();



    public AppUser(String firstName,
                   String lastName,
                   String email,
                   String password,
                   AppUserRole appUserRole) {
        this.firstName   = firstName;
        this.lastName    = lastName;
        this.email       = email;
        this.password    = password;
        this.appUserRole = appUserRole;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        SimpleGrantedAuthority authority =
                new SimpleGrantedAuthority("ROLE_" + appUserRole.name());
        return Collections.singletonList(authority);
    }

    @Override public String getPassword()                 {
        return password;
    }
    @Override public String getUsername()                 {
        return email;
    }
    @Override public boolean isAccountNonExpired()        {
        return true;
    }
    @Override public boolean isAccountNonLocked()         {
        return !locked;
    }
    @Override public boolean isCredentialsNonExpired()    {
        return true;
    }
    @Override public boolean isEnabled()                  {
        return enabled;
    }
}
