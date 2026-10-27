
package com.klef.soa.docker.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.klef.soa.docker.entity.FitnessEntity;

@Repository
public interface FitnessRepository
        extends JpaRepository<FitnessEntity, Long> {

        List<FitnessEntity> findByChallengeNameContainingIgnoreCase(
            String challengeName);

        List<FitnessEntity> findByActive(Boolean active);

        List<FitnessEntity> findByDurationDays(Integer durationDays);

        List<FitnessEntity> findByParticipantCount(Integer participantCount);
}
