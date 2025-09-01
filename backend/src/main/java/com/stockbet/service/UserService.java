package com.stockbet.service;

import com.stockbet.domain.User;
import com.stockbet.domain.Wallet;
import com.stockbet.repository.UserRepository;
import com.stockbet.repository.WalletRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class UserService implements UserDetailsService {
    private final UserRepository users;
    private final WalletRepository wallets;
    private final PasswordEncoder encoder;

    public UserService(UserRepository users, WalletRepository wallets, PasswordEncoder encoder) {
        this.users = users; this.wallets = wallets; this.encoder = encoder;
    }

    @Transactional
    public User register(String email, String password) {
        if (users.findByEmail(email).isPresent()) throw new IllegalArgumentException("Email already in use");
        User u = new User();
        u.setEmail(email);
        u.setPasswordHash(encoder.encode(password));
        users.save(u);
        Wallet w = new Wallet();
        w.setUser(u);
        wallets.save(w);
        return u;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User u = users.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("Not found"));
        List<GrantedAuthority> auth = List.of(new SimpleGrantedAuthority("ROLE_" + u.getRole()));
        return new org.springframework.security.core.userdetails.User(u.getEmail(), u.getPasswordHash(), auth);
    }

    public User byEmail(String email) { return users.findByEmail(email).orElseThrow(); }
    public Wallet walletOf(User u) { return wallets.findByUser(u).orElseThrow(); }
    public User byId(UUID id) { return users.findById(id).orElseThrow(); }
}
