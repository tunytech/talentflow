package com.talentflow.controller;

import com.talentflow.model.*;
import com.talentflow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/evaluations")
@CrossOrigin(origins = "*")
public class EvaluationController {

    @Autowired
    private EvaluationCampaignRepository evaluationCampaignRepository;

    @Autowired
    private EvaluationRepository evaluationRepository;

    @Autowired
    private EvaluationSkillRepository evaluationSkillRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SystemNotificationRepository systemNotificationRepository;

    // --- CAMPAIGNS API ---
    @GetMapping("/campaigns")
    public List<EvaluationCampaign> getCampaigns(@RequestParam Long companyId) {
        return evaluationCampaignRepository.findByCompanyId(companyId);
    }

    @PostMapping("/campaigns")
    @Transactional
    public ResponseEntity<EvaluationCampaign> createCampaign(@RequestBody EvaluationCampaign campaign) {
        if (campaign.getCompany() != null && campaign.getCompany().getId() != null) {
            companyRepository.findById(campaign.getCompany().getId()).ifPresent(campaign::setCompany);
        }
        EvaluationCampaign saved = evaluationCampaignRepository.save(campaign);

        if ("EN_COURS".equals(saved.getStatus())) {
            generateEvaluationsForCampaign(saved);
        }
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/campaigns/{id}")
    @Transactional
    public ResponseEntity<EvaluationCampaign> updateCampaign(@PathVariable Long id, @RequestBody EvaluationCampaign details) {
        return evaluationCampaignRepository.findById(id).map(campaign -> {
            String oldStatus = campaign.getStatus();
            campaign.setName(details.getName());
            campaign.setFrequency(details.getFrequency());
            campaign.setStartDate(details.getStartDate());
            campaign.setEndDate(details.getEndDate());
            campaign.setStatus(details.getStatus());

            EvaluationCampaign saved = evaluationCampaignRepository.save(campaign);
            if ("EN_COURS".equals(saved.getStatus()) && !"EN_COURS".equals(oldStatus)) {
                generateEvaluationsForCampaign(saved);
            }
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    private void generateEvaluationsForCampaign(EvaluationCampaign campaign) {
        List<Employee> employees = employeeRepository.findAll().stream()
                .filter(e -> e.isActive() && e.getCompany() != null && e.getCompany().getId().equals(campaign.getCompany().getId()))
                .toList();

        for (Employee emp : employees) {
            List<Evaluation> existing = evaluationRepository.findByCampaignId(campaign.getId()).stream()
                    .filter(ev -> ev.getEmployee().getId().equals(emp.getId()))
                    .toList();
            if (!existing.isEmpty()) {
                continue;
            }

            Evaluation eval = Evaluation.builder()
                    .campaign(campaign)
                    .employee(emp)
                    .status("CREEE")
                    .build();

            Evaluation savedEval = evaluationRepository.save(eval);

            // Generate skill requirements based on active post assignments
            List<EmployeePostAssignment> activeAssignments = emp.getPostAssignments().stream()
                    .filter(EmployeePostAssignment::isActive)
                    .toList();

            for (EmployeePostAssignment assign : activeAssignments) {
                JobProfile jp = assign.getJobProfile();
                if (jp != null) {
                    for (JobProfileSkill jps : jp.getProfileSkills()) {
                        // Check if skill is already added
                        boolean alreadyAdded = savedEval.getEvaluationSkills().stream()
                                .anyMatch(es -> es.getSkill().getId().equals(jps.getSkill().getId()));
                        if (!alreadyAdded) {
                            EvaluationSkill es = EvaluationSkill.builder()
                                    .evaluation(savedEval)
                                    .skill(jps.getSkill())
                                    .expectedLevel(jps.getExpectedLevel())
                                    .mandatory(jps.isMandatory())
                                    .build();
                            evaluationSkillRepository.save(es);
                            savedEval.getEvaluationSkills().add(es);
                        }
                    }
                }
            }
        }
    }

    // --- EVALUATIONS API ---
    @GetMapping("/campaign/{campaignId}")
    public List<Evaluation> getEvaluationsByCampaign(@PathVariable Long campaignId) {
        return evaluationRepository.findByCampaignId(campaignId);
    }

    @GetMapping("/employee/{employeeId}")
    public List<Evaluation> getEvaluationsByEmployee(@PathVariable Long employeeId) {
        return evaluationRepository.findByEmployeeId(employeeId);
    }

    @GetMapping("/manager/{managerId}")
    public List<Evaluation> getEvaluationsByManager(@PathVariable Long managerId) {
        return evaluationRepository.findByEmployeeManagerId(managerId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEvaluationDetails(@PathVariable Long id) {
        return evaluationRepository.findById(id).map(eval -> {
            int totalExpected = 0;
            int totalAcquiredMet = 0;
            boolean hasMajorRisk = false;

            List<java.util.Map<String, Object>> skillsList = new ArrayList<>();

            for (EvaluationSkill es : eval.getEvaluationSkills()) {
                int expected = es.getExpectedLevel();
                Integer self = es.getSelfLevel();
                Integer acquired = es.getAcquiredLevel();

                totalExpected += expected;
                if (acquired != null) {
                    totalAcquiredMet += Math.min(acquired, expected);
                }

                boolean skillRisk = false;
                if (acquired != null && acquired < expected) {
                    if (es.isMandatory() || es.getSkill().getCriticality() == SkillCriticality.HIGH) {
                        skillRisk = true;
                        hasMajorRisk = true;
                    }
                }

                java.util.Map<String, Object> esMap = new java.util.HashMap<>();
                esMap.put("id", es.getId());
                esMap.put("skillId", es.getSkill().getId());
                esMap.put("skillName", es.getSkill().getName());
                esMap.put("skillDescription", es.getSkill().getDescription());
                esMap.put("skillCriticality", es.getSkill().getCriticality());
                esMap.put("expectedLevel", expected);
                esMap.put("selfLevel", self);
                esMap.put("acquiredLevel", acquired);
                esMap.put("managerComment", es.getManagerComment());
                esMap.put("mandatory", es.isMandatory());
                esMap.put("majorRisk", skillRisk);
                skillsList.add(esMap);
            }

            double globalScore = totalExpected > 0
                    ? Math.round(((double) totalAcquiredMet / totalExpected) * 100.0)
                    : 100.0;

            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("id", eval.getId());
            response.put("campaignId", eval.getCampaign().getId());
            response.put("campaignName", eval.getCampaign().getName());
            response.put("campaignStatus", eval.getCampaign().getStatus());
            response.put("employeeId", eval.getEmployee().getId());
            response.put("employeeName", eval.getEmployee().getFirstName() + " " + eval.getEmployee().getLastName());
            response.put("employeeEmail", eval.getEmployee().getEmail());
            response.put("status", eval.getStatus());
            response.put("selfComment", eval.getSelfComment());
            response.put("managerComment", eval.getManagerComment());
            response.put("trainingRequest", eval.getTrainingRequest());
            response.put("trainingRecommendation", eval.getTrainingRecommendation());
            response.put("skills", skillsList);
            response.put("globalScore", globalScore);
            response.put("majorRisk", hasMajorRisk);

            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/self")
    @Transactional
    public ResponseEntity<?> submitSelfEvaluation(@PathVariable Long id, @RequestBody java.util.Map<String, Object> payload) {
        return evaluationRepository.findById(id).map(eval -> {
            eval.setSelfComment((String) payload.get("selfComment"));
            eval.setTrainingRequest((String) payload.get("trainingRequest"));
            eval.setStatus("ARBITRAGE"); // transition to ARBITRAGE

            List<java.util.Map<String, Object>> skillsPayload = (List<java.util.Map<String, Object>>) payload.get("skills");
            if (skillsPayload != null) {
                for (java.util.Map<String, Object> sk : skillsPayload) {
                    Long esId = Long.valueOf(sk.get("id").toString());
                    Integer selfLevel = sk.get("selfLevel") != null ? Integer.valueOf(sk.get("selfLevel").toString()) : null;

                    evaluationSkillRepository.findById(esId).ifPresent(es -> {
                        es.setSelfLevel(selfLevel);
                        evaluationSkillRepository.save(es);
                    });
                }
            }

            Evaluation saved = evaluationRepository.save(eval);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/arbitrage")
    @Transactional
    public ResponseEntity<?> submitArbitrage(@PathVariable Long id, @RequestBody java.util.Map<String, Object> payload) {
        return evaluationRepository.findById(id).map(eval -> {
            eval.setManagerComment((String) payload.get("managerComment"));
            eval.setTrainingRecommendation((String) payload.get("trainingRecommendation"));
            eval.setStatus("TERMINEE"); // transition to TERMINEE

            List<java.util.Map<String, Object>> skillsPayload = (List<java.util.Map<String, Object>>) payload.get("skills");
            if (skillsPayload != null) {
                for (java.util.Map<String, Object> sk : skillsPayload) {
                    Long esId = Long.valueOf(sk.get("id").toString());
                    Integer acquiredLevel = sk.get("acquiredLevel") != null ? Integer.valueOf(sk.get("acquiredLevel").toString()) : null;
                    String managerComment = (String) sk.get("managerComment");

                    evaluationSkillRepository.findById(esId).ifPresent(es -> {
                        es.setAcquiredLevel(acquiredLevel);
                        es.setManagerComment(managerComment);
                        evaluationSkillRepository.save(es);
                    });
                }
            }

            Evaluation saved = evaluationRepository.save(eval);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- ALERTS API (US 03.2) ---
    @PostMapping("/campaigns/check-alerts")
    public ResponseEntity<java.util.Map<String, Object>> checkCampaignAlerts() {
        List<EvaluationCampaign> campaigns = evaluationCampaignRepository.findAll();
        LocalDate now = LocalDate.now();

        int J7Sent = 0;
        int J1Sent = 0;
        int lateSent = 0;

        for (EvaluationCampaign campaign : campaigns) {
            LocalDate start = campaign.getStartDate();
            LocalDate end = campaign.getEndDate();

            // J-7 Alert
            if (start.minusDays(7).equals(now) || (now.isAfter(start.minusDays(7)) && now.isBefore(start))) {
                List<User> companyUsers = userRepository.findByCompanyId(campaign.getCompany().getId());
                for (User u : companyUsers) {
                    sendNotification(u, "Lancement de la campagne d'évaluation \"" + campaign.getName() + "\" dans moins d'une semaine (le " + start + "). Préparez vos auto-évaluations !", false);
                    J7Sent++;
                }
            }

            // J-1 Alert
            if (start.minusDays(1).equals(now)) {
                List<User> companyUsers = userRepository.findByCompanyId(campaign.getCompany().getId());
                for (User u : companyUsers) {
                    sendNotification(u, "Rappel : La campagne d'évaluation \"" + campaign.getName() + "\" démarre demain. Connectez-vous pour commencer !", false);
                    J1Sent++;
                }
            }

            // Relances en retard (Late Reminders)
            if ("EN_COURS".equals(campaign.getStatus()) && now.isAfter(end)) {
                campaign.setStatus("EN_RETARD");
                evaluationCampaignRepository.save(campaign);
            }

            if ("EN_COURS".equals(campaign.getStatus()) || "EN_RETARD".equals(campaign.getStatus())) {
                List<Evaluation> evaluations = evaluationRepository.findByCampaignId(campaign.getId());
                for (Evaluation eval : evaluations) {
                    if (!"TERMINEE".equals(eval.getStatus())) {
                        if (now.isAfter(end)) {
                            // Relance en retard for Employee
                            if ("AUTO_EVALUATION".equals(eval.getStatus()) || "CREEE".equals(eval.getStatus())) {
                                userRepository.findByEmployeeId(eval.getEmployee().getId()).ifPresent(user -> {
                                    sendNotification(user, "⚠️ Votre auto-évaluation pour la campagne \"" + campaign.getName() + "\" est en retard ! Veuillez la compléter.", true);
                                });
                            }

                            // Relance en retard for Manager N+1
                            if ("ARBITRAGE".equals(eval.getStatus())) {
                                Employee manager = eval.getEmployee().getManager();
                                if (manager != null) {
                                    userRepository.findByEmployeeId(manager.getId()).ifPresent(mUser -> {
                                        sendNotification(mUser, "⏳ L'arbitrage de l'évaluation de " + eval.getEmployee().getFirstName() + " " + eval.getEmployee().getLastName() + " est en retard. Veuillez finaliser les notes.", true);
                                    });
                                }
                            }
                            lateSent++;
                        }
                    }
                }
            }
        }

        return ResponseEntity.ok(java.util.Map.of(
                "message", "Alertes vérifiées et notifications générées.",
                "J7Notifications", J7Sent,
                "J1Notifications", J1Sent,
                "lateNotifications", lateSent
        ));
    }

    private void sendNotification(User user, String content, boolean repeated) {
        List<SystemNotification> active = systemNotificationRepository.findAll().stream()
                .filter(n -> n.getUser().getId().equals(user.getId()) && n.getContent().equals(content) && !n.isAcknowledged())
                .toList();
        if (active.isEmpty()) {
            systemNotificationRepository.save(SystemNotification.builder()
                    .user(user)
                    .content(content)
                    .acknowledged(false)
                    .repeated(repeated)
                    .createdAt(java.time.LocalDateTime.now())
                    .build());
            System.out.println("Notification sent to " + user.getUsername() + ": " + content);
        }
    }
}
