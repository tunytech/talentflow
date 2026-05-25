package com.talentflow.repository;

import com.talentflow.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    List<Company> findByParentId(Long parentId);
    List<Company> findByParentIsNull();
}
