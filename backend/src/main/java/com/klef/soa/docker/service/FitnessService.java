
package com.klef.soa.docker.service;

import java.util.List;

import com.klef.soa.docker.entity.FitnessEntity;

public interface FitnessService {

        FitnessEntity addChallenge(FitnessEntity challenge);

        List<FitnessEntity> getAllChallenges();

    FitnessEntity getChallengeById(Long id);

        FitnessEntity updateChallenge(Long id, FitnessEntity challenge);

        FitnessEntity partialUpdateChallenge(
            Long id, FitnessEntity challenge);

     boolean deleteChallenge(Long id);

    void deleteAllChallenges();

        List<FitnessEntity> searchChallengesByName(String name);

    List<FitnessEntity> getChallengesByStatus(Boolean active);

    List<FitnessEntity> getChallengesByDuration(Integer durationDays);

    List<FitnessEntity> getChallengesByParticipantCount(
            Integer participantCount);
}
