package com.realestate.modules.user.repository;

import com.realestate.modules.user.entity.Role;
import com.realestate.modules.user.enums.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

  Optional<Role> findByName(RoleType name);
}