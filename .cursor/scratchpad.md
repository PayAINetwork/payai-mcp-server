# Background and Motivation
PayAI is a platform where humans and AI Agents can hire other AI agents for any task. The PayAI MCP server acts as a bridge, allowing MCP clients (both human and agent) to interact with the PayAI backend via a standardized protocol. The main goal is to expose PayAI's core marketplace and job management features as MCP tools/resources, enabling seamless integration with MCP hosts (e.g., Claude Desktop, Cursor IDE).

# Key Challenges and Analysis
- Mapping PayAI's RESTful API endpoints to MCP tools/resources in a user-friendly and secure way.
- Handling authentication for both human and agent users (via environment variables for private keys or access tokens).
- Managing sensitive data (e.g., Solana private keys) securely.
- Ensuring robust error handling and clear feedback for all MCP tool invocations.
- Supporting both read (view/browse) and write (hire, fund, deliver, review, etc.) operations.
- Providing a paginated interface for listing jobs/agents.
- Testability: Ensuring each tool/resource is independently testable.

# High-level Task Breakdown
- [x] Project setup: Packages installed, initial MCP server created, basic tools scaffolded.
- [ ] Define and document the RESTful PayAI API endpoints required for each MCP tool.
- [ ] Implement MCP tool: Hire an AI Agent (make offer)
- [ ] Implement MCP tool: Browse available agents
- [ ] Implement MCP tool: Fund a job offer
- [ ] Implement MCP tool: Start a job
- [ ] Implement MCP tool: Deliver a job
- [ ] Implement MCP tool: Release payment for a job
- [ ] Implement MCP tool: Leave a review
- [ ] Implement MCP resource: View a job
- [ ] Implement MCP resource: View all jobs (paginated)
- [ ] Implement MCP resource: View all agents (paginated)
- [ ] Add authentication handling for tools/resources that require it
- [ ] Add robust error handling and user feedback for all tools/resources
- [ ] Write tests for each MCP tool/resource (TDD where possible)
- [ ] Document usage and environment variable requirements in README

# RESTful PayAI API Endpoint Specification (Finalized)

## 3.1. Hire an AI Agent
- Route: POST /agents/:handle/offers
- Input: { amount, currency, task }
- Action: Calls PayAI POST /offers with { handle, amount, currency, task }. Returns offerId + status.
- Auth: Public (no authentication required initially)

## 3.2. Browse Available Agents
- Route: GET /agents
- Query: ?page=&limit= (default: 10, max: 100)
- Action: Calls PayAI GET /agents. Returns list + pagination.

## 3.3. Fund a Job Offer
- Route: This bypasses the PayAI API and interacts with the Solana blockchain instead
- Env: SOLANA_PRIVATE_KEY (required), SOLANA_RPC_URL (optional, defaults to mainnet-beta)
- Action: Client signs Solana tx, sends funds to escrow, and returns tx signature.

## 3.4. Start a Job
- Route: POST /jobs/:jobId/start
- Auth: PAYAI_ACCESS_TOKEN (provided in MCP config)
- Action: Calls PayAI POST /jobs/:jobId/start.

## 3.5. Deliver a Job
- Route: POST /jobs/:jobId/deliver
- Auth: PAYAI_ACCESS_TOKEN (provided in MCP config)
- Input: { url }
- Action: Calls PayAI POST /jobs/:jobId/deliver.

## 3.6. Release Payment for a Job
- Route: POST /jobs/:jobId/release
- Auth: PAYAI_ACCESS_TOKEN (provided in MCP config)
- Action: Calls PayAI POST /jobs/:jobId/release.

## 3.7. Leave a Review
- Route: POST /jobs/:jobId/review
- Auth: PAYAI_ACCESS_TOKEN (provided in MCP config)
- Input: { stars, text }
- Action: Calls PayAI POST /jobs/:jobId/review.

## 3.8. View a Job
- Route: GET /jobs/:jobId
- Action: Calls PayAI GET /jobs/:jobId.

## 3.9. View All Jobs
- Route: GET /jobs
- Query: ?page=&limit= (default: 10, max: 100)
- Action: Calls PayAI GET /jobs.

## 3.10. View All Agents
- Route: GET /agents
- (Same as 3.2)

## 3.11. Supported Currencies
- Route: GET /supported-currencies
- Action: Returns list of supported tokens (e.g., SOL, PAYAI)

# Standardized Error Response Format (Suggested)
All endpoints should return errors in the following format for consistency with MCP clients:

```json
{
  "error": true,
  "code": "<error_code>",
  "message": "<human_readable_message>",
  "details": { /* optional, endpoint-specific */ }
}
```
- `error`: always true for errors
- `code`: a short, machine-readable error code (e.g., "INVALID_INPUT", "NOT_FOUND", "AUTH_REQUIRED")
- `message`: a human-readable error message
- `details`: optional, for additional context (e.g., validation errors, stack traces in dev)

# Endpoint Clarifications (Resolved)
- POST /offers is public (no auth required)
- Escrow account address is returned by backend
- PAYAI_ACCESS_TOKEN is provided in MCP config file
- Standardized error format to be used (see above)
- Pagination: default 10, max 100
- Supported currencies: SOL, PAYAI (can be fetched from /supported-currencies)

# Project Status Board
- [x] Project setup complete
- [x] Define/document required PayAI API endpoints (finalized)
- [x] Implement 'Hire an AI Agent' tool (awaiting user review, refactored, backend logic modularized)
- [ ] Implement 'Browse available agents' tool
- [ ] Implement 'Fund a job offer' tool
- [ ] Implement 'Start a job' tool
- [ ] Implement 'Deliver a job' tool
- [ ] Implement 'Release payment for a job' tool
- [ ] Implement 'Leave a review' tool
- [ ] Implement 'View a job' resource
- [ ] Implement 'View all jobs' resource
- [ ] Implement 'View all agents' resource
- [ ] Add authentication handling
- [ ] Add error handling/feedback
- [ ] Write tests for all tools/resources
- [ ] Update README with usage and env requirements

# Current Status / Progress Tracking
- Project setup is complete. Endpoint documentation finalized.
- 'Hire an AI Agent' tool implemented, refactored for separation of concerns, backend logic modularized, and ready for review/testing.

# Executor's Feedback or Assistance Requests
- 'Hire an AI Agent' tool is implemented and now refactored to separate backend communication from MCP logic. Please manually test and confirm if it works as expected before marking this task complete. Ready to proceed to the next tool upon confirmation.

# Lessons
- Separate backend communication logic from MCP tool logic for maintainability and testability.
- Use a dedicated module for backend API calls with connection pooling for extensibility and performance.
- Include info useful for debugging in the program output.
- Read the file before you try to edit it.
- If there are vulnerabilities that appear in the terminal, run npm audit before proceeding
- Always ask before using the -force git command
