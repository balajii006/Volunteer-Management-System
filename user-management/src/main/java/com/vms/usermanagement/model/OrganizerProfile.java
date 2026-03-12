package com.vms.usermanagement.model;

import jakarta.persistence.*;

@Entity
@Table(name = "organizer_profiles")
public class OrganizerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String organizationName;
    private String bio;
    private String website;
    private String address;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}