# Online play will be client-side lockstep over Firebase

When online play arrives (phase 2), both players' browsers will run the battle engine themselves and exchange only their turn choices and a shared RNG seed through Firebase Realtime Database; there is no authoritative server. We chose this because Firebase's free Spark plan has no Cloud Functions, and the players are a friend group, so the fact that a player could cheat by modifying their own client is an accepted risk. Switching to server-authoritative battles later would mean moving to the Blaze plan.
