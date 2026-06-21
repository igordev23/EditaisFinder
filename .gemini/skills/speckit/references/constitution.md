# Speckit Constitution

## Core Purpose
The Constitution is the "immutable system prompt" for the EditaisFinder project. It defines the technical standards, architectural patterns, and quality mandates that every feature must adhere to.

## Technical Mandates
1. **Language & Runtime:** Use **TypeScript** for all backend (Node.js/Express) and frontend code.
2. **Architecture:** Follow **Clean Architecture** principles. Decouple business logic from external frameworks and data sources.
3. **Testing:** 
   - **TDD Requirement:** Tests must be written before implementation.
   - **Coverage:** Aim for 90%+ coverage on domain logic.
   - **Framework:** Use **Jest** for unit and integration tests.
4. **Code Quality:**
   - Strict typing (no `any`).
   - Use ESLint and Prettier for formatting.
   - Commits must follow Conventional Commits.

## Design Principles
1. **Simplicity:** Favor explicit code over "clever" abstractions.
2. **Accessibility:** All UI components must comply with WCAG 2.1 AA.
3. **Security:** No secrets in source control. Use environment variables for all sensitive configuration.

## Standard Workflow
1. `/speckit.constitution`: Reference this document.
2. `/speckit.specify`: Define the feature.
3. `/speckit.clarify`: Resolve spec ambiguities.
4. `/speckit.plan`: Architect the solution.
5. `/speckit.tasks`: Break down into atomic steps.
6. `/speckit.implement`: Execute with TDD.
