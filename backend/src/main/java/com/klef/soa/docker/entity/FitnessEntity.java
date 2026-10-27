
package com.klef.soa.docker.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "fitness")
public class FitnessEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Challenge name is required")
    @Size(max = 150, message = "Challenge name cannot exceed 150 characters")
    @Column(name = "challengename", nullable = false, length = 150)
    private String challengeName;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 day")
    @Column(name = "durationdays", nullable = false)
    private Integer durationDays;

    @NotNull(message = "Participant count is required")
    @Min(value = 0, message = "Participant count cannot be negative")
    @Column(name = "participantcount", nullable = false)
    private Integer participantCount = 0;

    @NotNull(message = "Active status is required")
    @Column(name = "active", nullable = false)
    private Boolean active = true;

    public FitnessEntity() {
    }

    public FitnessEntity(String challengeName, Integer durationDays,
                         Integer participantCount, Boolean active) {
        this.challengeName = challengeName;
        this.durationDays = durationDays;
        this.participantCount =
                (participantCount != null) ? participantCount : 0;
        this.active = (active != null) ? active : true;
    }

    @PrePersist
    protected void onCreate() {
        if (this.participantCount == null) {
            this.participantCount = 0;
        }

        if (this.active == null) {
            this.active = true;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getChallengeName() {
        return challengeName;
    }

    public void setChallengeName(String challengeName) {
        this.challengeName = challengeName;
    }

    public Integer getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(Integer durationDays) {
        this.durationDays = durationDays;
    }

    public Integer getParticipantCount() {
        return participantCount;
    }

    public void setParticipantCount(Integer participantCount) {
        this.participantCount = participantCount;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    @Override
    public String toString() {
        return "FitnessEntity{" +
                "id=" + id +
                ", challengeName='" + challengeName + '\'' +
                ", durationDays=" + durationDays +
                ", participantCount=" + participantCount +
                ", active=" + active +
                '}';
    }
}
