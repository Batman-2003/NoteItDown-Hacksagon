package com.example.springdb.controller;

import com.example.springdb.entity.Users;
import com.example.springdb.service.UserService;
import com.example.springdb.service.impl.UserServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping("/")
    public ResponseEntity<Users> getHome() {
        Users user = userService.getUserById(1);

        System.out.println("");
        System.out.println(user);
        System.out.println("");

//        Users user = new Users(1, "gaurav2", "gaurav2Hashed");
        return new ResponseEntity<Users> (user, HttpStatus.OK);

    }

    @GetMapping("/allUsers")
    public ResponseEntity<List<Users>> getAllUsers() {
        List<Users> users;
        try {
            users = userService.getAllUsers();
        } catch (Exception ex) {
            users = null;
            ex.getMessage();
        }

//        Users dummyUser = new Users(0, "def", "defHash");
//        if (users == null) {
//            users.add(dummyUser);
//        }

        return new ResponseEntity<List<Users>>(users, HttpStatus.OK);
    }
}
