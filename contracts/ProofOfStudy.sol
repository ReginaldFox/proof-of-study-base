// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ProofOfStudy {
    struct StudyProfile {
        uint256 totalCheckIns;
        uint256 currentStreak;
        uint256 longestStreak;
        uint256 lastCheckInDay;
    }

    mapping(address => StudyProfile) public profiles;
    address[] public users;
    mapping(address => bool) public isUser;
    uint256 public totalCheckInsGlobal;

    event StudyCheckedIn(
        address indexed user,
        uint256 indexed day,
        uint256 totalCheckIns,
        uint256 currentStreak
    );

    function checkIn() external {
        uint256 today = block.timestamp / 1 days;
        StudyProfile storage profile = profiles[msg.sender];

        require(profile.lastCheckInDay != today, "Already checked in today");

        if (profile.lastCheckInDay + 1 == today) {
            profile.currentStreak += 1;
        } else {
            profile.currentStreak = 1;
        }

        profile.totalCheckIns += 1;

        if (profile.currentStreak > profile.longestStreak) {
            profile.longestStreak = profile.currentStreak;
        }

        profile.lastCheckInDay = today;

        if (!isUser[msg.sender]) {
            isUser[msg.sender] = true;
            users.push(msg.sender);
        }

        totalCheckInsGlobal += 1;

        emit StudyCheckedIn(
            msg.sender,
            today,
            profile.totalCheckIns,
            profile.currentStreak
        );
    }

    function getProfile(address user) external view returns (StudyProfile memory) {
        return profiles[user];
    }

    function hasCheckedInToday(address user) public view returns (bool) {
        return profiles[user].lastCheckInDay == block.timestamp / 1 days;
    }

    function getTotalCheckIns(address user) external view returns (uint256) {
        return profiles[user].totalCheckIns;
    }

    function getCurrentStreak(address user) external view returns (uint256) {
        return profiles[user].currentStreak;
    }

    function getLongestStreak(address user) external view returns (uint256) {
        return profiles[user].longestStreak;
    }

    function getLastCheckInDay(address user) external view returns (uint256) {
        return profiles[user].lastCheckInDay;
    }

    function totalUsers() external view returns (uint256) {
        return users.length;
    }

    function getUserAt(uint256 index) external view returns (address) {
        return users[index];
    }
}
