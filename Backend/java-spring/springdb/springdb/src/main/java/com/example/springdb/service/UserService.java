package com.example.springdb.service;

import com.example.springdb.entity.Users;

import java.util.List;

public interface UserService {
    public List<Users> getAllUsers();
    Users getUserById(int _id);
//    public Users addOrUpdateUser(Users _user);
//    public Users deleteUser(int userId) throws Exception;

}
