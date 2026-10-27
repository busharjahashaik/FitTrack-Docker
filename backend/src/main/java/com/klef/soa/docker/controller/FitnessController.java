
package com.klef.soa.docker.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.klef.soa.docker.dto.FitnessRequest;
import com.klef.soa.docker.entity.FitnessEntity;
import com.klef.soa.docker.service.FitnessService;
import com.klef.soa.docker.repository.FitnessRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/fitness")
@CrossOrigin(origins = "*")
public class FitnessController {

    @Autowired
    private FitnessService fitnessService;
    @Autowired
    private FitnessRepository fitnessRepository;

    @PostMapping("/add")
    public FitnessEntity addFitness(@RequestBody FitnessRequest request) {
        FitnessEntity fitness = new FitnessEntity();

        fitness.setChallengeName(request.getChallengeName());
        fitness.setDurationDays(request.getDurationDays());
        fitness.setParticipantCount(request.getParticipantCount());
        fitness.setActive(request.isActive());

        return fitnessRepository.save(fitness);
    }

        @GetMapping({"/displayall"})
    public ResponseEntity<List<FitnessEntity>> getAllChallenges() {

        return ResponseEntity.ok(fitnessService.getAllChallenges());
    }

        @GetMapping("/{id}")
    public ResponseEntity<FitnessEntity> getChallengeById(
            @PathVariable Long id) {

        return ResponseEntity.ok(fitnessService.getChallengeById(id));
    }

        @PutMapping("/{id}")
    public ResponseEntity<FitnessEntity> updateChallenge(
            @PathVariable Long id,
            @Valid @RequestBody FitnessEntity challenge) {

        return ResponseEntity.ok(
                fitnessService.updateChallenge(id, challenge));
    }


        @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteChallenge(
            @PathVariable Long id) {

        boolean deleted = fitnessService.deleteChallenge(id);

        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Fitness challenge not found with ID: " + id);
        }

        return ResponseEntity.ok(
                "Fitness challenge deleted successfully with ID: " + id);
    }

        @DeleteMapping("/deleteall")
    public ResponseEntity<String> deleteAllChallenges() {

        fitnessService.deleteAllChallenges();

        return ResponseEntity.ok(
                "All fitness challenges deleted successfully");
    }

        @GetMapping("/searchByChallengeName")
    public ResponseEntity<List<FitnessEntity>> searchChallenges(
            @RequestParam String name) {

        return ResponseEntity.ok(
                fitnessService.searchChallengesByName(name));
    }

        @GetMapping("/active/{active}")
    public ResponseEntity<List<FitnessEntity>> getByStatus(
            @PathVariable Boolean active) {

        return ResponseEntity.ok(
                fitnessService.getChallengesByStatus(active));
    }

        @GetMapping("/duration/{days}")
    public ResponseEntity<List<FitnessEntity>> getByDuration(
            @PathVariable("days") Integer durationDays) {

        return ResponseEntity.ok(
                fitnessService.getChallengesByDuration(durationDays));
    }

        @GetMapping("/participants/{count}")
    public ResponseEntity<List<FitnessEntity>> getByParticipantCount(
            @PathVariable("count") Integer participantCount) {

        return ResponseEntity.ok(
                fitnessService.getChallengesByParticipantCount(
                        participantCount));
    }
}
