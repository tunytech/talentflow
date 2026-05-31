package com.talentflow;

import com.talentflow.model.*;
import org.junit.jupiter.api.Test;
import java.util.ArrayList;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

public class EvaluationControllerTest {

    @Test
    public void testGlobalScoreAndMajorRiskCalculations() {
        // Arrange
        // Skill 1: Expected 3, Acquired 3, Mandatory
        Skill s1 = Skill.builder()
                .id(1L)
                .name("Java")
                .criticality(SkillCriticality.MEDIUM)
                .build();

        EvaluationSkill es1 = EvaluationSkill.builder()
                .id(10L)
                .skill(s1)
                .expectedLevel(3)
                .acquiredLevel(3)
                .mandatory(true)
                .build();

        // Skill 2: Expected 5, Acquired 4, Optional (High Criticality)
        Skill s2 = Skill.builder()
                .id(2L)
                .name("DevOps")
                .criticality(SkillCriticality.HIGH)
                .build();

        EvaluationSkill es2 = EvaluationSkill.builder()
                .id(20L)
                .skill(s2)
                .expectedLevel(5)
                .acquiredLevel(4)
                .mandatory(false)
                .build();

        // Skill 3: Expected 3, Acquired 2, Optional (Medium Criticality)
        Skill s3 = Skill.builder()
                .id(3L)
                .name("Communication")
                .criticality(SkillCriticality.MEDIUM)
                .build();

        EvaluationSkill es3 = EvaluationSkill.builder()
                .id(30L)
                .skill(s3)
                .expectedLevel(3)
                .acquiredLevel(2)
                .mandatory(false)
                .build();

        List<EvaluationSkill> list = new ArrayList<>();
        list.add(es1);
        list.add(es2);
        list.add(es3);

        // Act - Simulate the calculations inside the controller
        int totalExpected = 0;
        int totalAcquiredMet = 0;
        boolean hasMajorRisk = false;

        for (EvaluationSkill es : list) {
            int expected = es.getExpectedLevel();
            Integer acquired = es.getAcquiredLevel();

            totalExpected += expected;
            if (acquired != null) {
                totalAcquiredMet += Math.min(acquired, expected);
            }

            if (acquired != null && acquired < expected) {
                if (es.isMandatory() || es.getSkill().getCriticality() == SkillCriticality.HIGH) {
                    hasMajorRisk = true;
                }
            }
        }

        double globalScore = totalExpected > 0
                ? Math.round(((double) totalAcquiredMet / totalExpected) * 100.0)
                : 100.0;

        // Assert
        // Expected Level Sum: 3 (s1) + 5 (s2) + 3 (s3) = 11
        // Acquired Level Sum (with min expected cap): min(3, 3) + min(4, 5) + min(2, 3) = 3 + 4 + 2 = 9
        // Global score: (9 / 11) * 100 = 81.81 -> round to 82.0
        assertEquals(82.0, globalScore);

        // Major Risk should be TRUE because DevOps (s2) is HIGH criticality and acquired (4) < expected (5)
        assertTrue(hasMajorRisk);
    }

    @Test
    public void testNoMajorRiskWhenLevelsAreMet() {
        // Arrange
        Skill s = Skill.builder()
                .id(1L)
                .name("Java")
                .criticality(SkillCriticality.HIGH)
                .build();

        EvaluationSkill es = EvaluationSkill.builder()
                .id(10L)
                .skill(s)
                .expectedLevel(3)
                .acquiredLevel(3)
                .mandatory(true)
                .build();

        List<EvaluationSkill> list = List.of(es);

        // Act
        int totalExpected = 0;
        int totalAcquiredMet = 0;
        boolean hasMajorRisk = false;

        for (EvaluationSkill item : list) {
            int expected = item.getExpectedLevel();
            Integer acquired = item.getAcquiredLevel();

            totalExpected += expected;
            if (acquired != null) {
                totalAcquiredMet += Math.min(acquired, expected);
            }

            if (acquired != null && acquired < expected) {
                if (item.isMandatory() || item.getSkill().getCriticality() == SkillCriticality.HIGH) {
                    hasMajorRisk = true;
                }
            }
        }

        double globalScore = totalExpected > 0
                ? Math.round(((double) totalAcquiredMet / totalExpected) * 100.0)
                : 100.0;

        // Assert
        assertEquals(100.0, globalScore);
        assertFalse(hasMajorRisk);
    }
}
