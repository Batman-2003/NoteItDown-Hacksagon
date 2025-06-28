package com.example.springdb.service.impl;

import com.example.springdb.entity.Users;
import com.example.springdb.service.UserService;
import com.example.springdb.repository.UserRespository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRespository userRepository;

    @Override
    public List<Users> getAllUsers() {
        return (List<Users>) userRepository.findAll();
    }

    @Override
    public Users getUserById(int _userId) {
        return userRepository.findById(_userId).orElse(null);
    }
//
//    @Override
//    public Users addOrUpdateUser(Users _user) {
//        return userRepository.save(_user);
//    }
//
//    @Override
//    public Users deleteUser(int _userId) throws Exception {
//        Users deletedUser = null;
//        try {
//            deletedUser = userRepository.findById(_userId).orElse(null);
//            if (deletedUser == null) {
//                throw new Exception("user not available");
//            } else {
//                userRepository.deleteById(_userId);
//            }
//        } catch (Exception ex) {
//            throw ex;
//        }
//        return deletedUser;
//    }


}
