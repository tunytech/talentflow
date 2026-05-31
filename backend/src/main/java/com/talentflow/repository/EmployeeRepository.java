package com.talentflow.repository;

import com.talentflow.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    List<Employee> findByCompanyId(Long companyId);
    List<Employee> findByActiveTrue();
    Optional<Employee> findByEmail(String email);
}
