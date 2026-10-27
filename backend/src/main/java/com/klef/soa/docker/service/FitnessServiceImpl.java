
package com.klef.soa.docker.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.klef.soa.docker.entity.FitnessEntity;
import com.klef.soa.docker.repository.FitnessRepository;

@Service
public class FitnessServiceImpl implements FitnessService {

    @Autowired
    private FitnessRepository fitnessRepository;

        @Override
    public FitnessEntity addChallenge(FitnessEntity challenge) {
        challenge.setId(null);
        return fitnessRepository.save(challenge);
    }

        @Override
    public List<FitnessEntity> getAllChallenges() {
        return fitnessRepository.findAll();
    }

        @Override
    public FitnessEntity getChallengeById(Long id) {
        return fitnessRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Fitness challenge not found with ID: " + id));
    }

        @Override
    public FitnessEntity updateChallenge(
            Long id, FitnessEntity challenge) {

        FitnessEntity existing = getChallengeById(id);

        existing.setChallengeName(challenge.getChallengeName());
        existing.setDurationDays(challenge.getDurationDays());
        existing.setParticipantCount(challenge.getParticipantCount());
        existing.setActive(challenge.getActive());

        return fitnessRepository.save(existing);
    }

        @Override
    public FitnessEntity partialUpdateChallenge(
            Long id, FitnessEntity challenge) {

        FitnessEntity existing = getChallengeById(id);

        if (challenge.getChallengeName() != null) {
            existing.setChallengeName(challenge.getChallengeName());
        }

        if (challenge.getDurationDays() != null) {
            existing.setDurationDays(challenge.getDurationDays());
        }

        if (challenge.getParticipantCount() != null) {
            existing.setParticipantCount(
                    challenge.getParticipantCount());
        }

        if (challenge.getActive() != null) {
            existing.setActive(challenge.getActive());
        }

        return fitnessRepository.save(existing);
    }

        @Override
    public boolean deleteChallenge(Long id) {
        if (!fitnessRepository.existsById(id)) {
            return false;
        }

        fitnessRepository.deleteById(id);
        return true;
    }

        @Override
    public void deleteAllChallenges() {
        fitnessRepository.deleteAll();
    }

        @Override
    public List<FitnessEntity> searchChallengesByName(String name) {
        return fitnessRepository
                .findByChallengeNameContainingIgnoreCase(name);
    }

        @Override
    public List<FitnessEntity> getChallengesByStatus(Boolean active) {
        return fitnessRepository.findByActive(active);
    }

        @Override
    public List<FitnessEntity> getChallengesByDuration(
            Integer durationDays) {
        return fitnessRepository.findByDurationDays(durationDays);
    }

        @Override
    public List<FitnessEntity> getChallengesByParticipantCount(
            Integer participantCount) {
        return fitnessRepository
                .findByParticipantCount(participantCount);
    }
}
