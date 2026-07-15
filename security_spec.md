# Security Specification: TreinoPro Zero-Trust ABAC & RBAC

This specification outlines the data invariants, threat model payloads, and test coverage designed to guarantee absolute data isolation and role-based validation for the TreinoPro application.

## 1. Data Invariants
- **Coach Supremacy**: A user identified as the Coach (whose email matches the `email` stored in `settings/global_settings`) has complete read and write access to all documents in all collections to manage the gym.
- **Student Isolation**: A student user can only read and write their own profile (`students/{studentId}`), workouts (`workouts/{id}`), diets (`diets/{id}`), payments (`payments/{id}`), chat histories (`chat_histories/{id}`), and gamification records (`students_gamification/{id}`).
- **Cross-User Leakage Blocked**: A student is strictly forbidden from reading or modifying another student's profile, training routine, diet sheets, or financial details.
- **Reference Integrity**: Any creation or update of workouts, diets, or payments must reference a valid student ID belonging to the authenticated student, or be performed by the verified Coach.

---

## 2. The "Dirty Dozen" Threat Payloads
Here are 12 specific JSON payloads designed to test and potentially break the laws of Identity, Integrity, and State in the system. Our rules must reject all of these.

1. **Identity Spoofing (Student Profile Hijacking)**: A student attempts to read or write a profile document `/students/stud-different` which does not match their verified email.
2. **Workout Exfiltration**: Student A attempts to read Student B's workouts via `/workouts/workout-studentB`.
3. **Diet Injection**: Student A attempts to overwrite Student B's diet `/diets/diet-studentB` to malicious high-calorie targets.
4. **Payment Modification**: Student A attempts to mark their own pending payment as paid (`status: "paid"`) without Coach authorization.
5. **Unauthorized Configuration Modification**: A student attempts to write or update `/plans/plan-1` to reduce the price to zero.
6. **AI settings Injection**: An unauthenticated user or student attempts to write/update `/settings/global_settings` to change the AI tone or API provider.
7. **Cross-Student Chat Peeking**: Student A attempts to read Student B's `/chat_histories/chat-studentB`.
8. **Gamification Score Inflation**: Student A attempts to increment their points to 1,000,000 in `/students_gamification/stud-A`.
9. **Challenge Tampering**: A student attempts to delete or alter a global challenge `/challenges/challenge-1`.
10. **Ghost Field Mutation**: Student A tries to update a workout but injects extra unmapped fields (`attackerProperty: "malicious"`) to break schema limits.
11. **Anonymized Coach Spoofing**: An anonymous user attempts to access `/students` list.
12. **Null-ID Poisoning**: An attacker tries to write to `/students/` using a 1MB junk ID string to flood database storage.

---

## 3. The Test Runner Configuration

To execute these tests, we mock Firestore rules using the Firebase local emulator. All the above "Dirty Dozen" payloads must be verified to return `PERMISSION_DENIED` under our rule set.
