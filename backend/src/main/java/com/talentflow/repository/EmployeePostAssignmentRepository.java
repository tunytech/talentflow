package com.talentflow.repository;

import com.talentflow.model.EmployeePostAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * =========================================================================
 * LE CLASSEUR DE CASQUETTES (EMPLOYEE POST ASSIGNMENT REPOSITORY)
 * =========================================================================
 * C'est comme un tiroir magique où on range et retrouve toutes les fiches
 * de casquettes portées par nos amis les collaborateurs.
 */
@Repository
public interface EmployeePostAssignmentRepository extends JpaRepository<EmployeePostAssignment, Long> {
    
    // Pour retrouver toutes les casquettes d'un collaborateur particulier !
    List<EmployeePostAssignment> findByEmployeeId(Long employeeId);
}
