package com.example.springdb.repository;

import com.example.springdb.entity.Users;
import org.springframework.data.repository.CrudRepository;

public interface UserRespository extends CrudRepository<Users, Integer> {
}
