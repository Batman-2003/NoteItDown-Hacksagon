package com.example.springdb.entity;

import jakarta.persistence.*;

@Entity
@Table(name="users")
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="idusers")
    private Long idUser;

    @Column(name="username")
    private String username;

    @Column(name="passwordHash")
    private String passwordHash;

    // TODO: add/remove super() to ctor
    public Users() {
        super();
    }

    public Users(Long idUser, String username, String passwordHash) {
        super();
        this.idUser = idUser;
        this.username = username;
        this.passwordHash = passwordHash;
    }

    public Long getIdUser() {
        return idUser;
    }

    public void setIdUser(Long idUser) {
        this.idUser = idUser;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    @Override
    public String toString() {
        return "Users{" +
                "idUser=" + idUser +
                ", username='" + username + '\'' +
                ", passwordHash='" + passwordHash + '\'' +
                '}';
    }
}
