# Full-Stack Production Reality Skill

When building any application that will be used by real people, you MUST account for ALL layers below. Never ship a demo that only has Frontend + Backend. Every app must cover every layer before it is considered production-ready.

---

## The Production Stack

### Layer 1: Frontend
- Responsive design (mobile, tablet, desktop)
- Accessibility (WCAG 2.1 AA minimum)
- Performance (Lighthouse score >90)
- SEO (meta tags, Open Graph, structured data)
- Error boundaries — never show blank white screens
- Loading states and skeleton screens
- Offline support where appropriate

### Layer 2: APIs & Backend Logic
- REST or GraphQL endpoints with versioning
- Input validation on every endpoint (never trust the client)
- Proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Rate limiting on public endpoints
- API documentation (OpenAPI/Swagger or similar)
- Graceful error responses — never expose stack traces to clients

### Layer 3: Database & Storage
- Schema design with proper relationships and indexes
- Migrations — never modify production DB manually
- Backups — automated daily at minimum
- Connection pooling
- Query optimization — no N+1 queries
- Data retention policies
- File storage (S3/R2) for user uploads, separate from DB

### Layer 4: Auth & Permissions
- Authentication (JWT, sessions, OAuth)
- Authorization (role-based access control)
- Password hashing (bcrypt, argon2)
- Email verification flow
- Password reset flow
- Session management (refresh tokens, expiry)
- Multi-factor authentication (at least TOTP)
- API key management for programmatic access

### Layer 5: Hosting & Deployment
- CI/CD pipeline (GitHub Actions, GitLab CI)
- Zero-downtime deployments
- Environment variable management (never in code)
- Staging environment that mirrors production
- Rollback capability
- Domain configuration with SSL/TLS

### Layer 6: Cloud & Compute
- Serverless vs container vs VM — pick the right one
- Auto-scaling configuration
- Resource limits and quotas
- Cost monitoring and alerts
- Region selection based on user base

### Layer 7: CI/CD & Version Control
- Branch protection on main
- Pull request reviews required
- Automated testing in CI (unit + integration)
- Linting and formatting enforced
- Commit message conventions
- Dependency scanning for vulnerabilities
- Automated builds and deployments

### Layer 8: Security & RLS
- Row-level security (Supabase/Postgres)
- CORS configuration — never allow all origins
- Content Security Policy headers
- XSS prevention (sanitize all user input)
- SQL injection prevention (parameterized queries)
- CSRF protection
- Secrets management (never commit API keys)
- Dependency vulnerability audits

### Layer 9: Rate Limiting
- Per-user rate limits on all endpoints
- Per-IP rate limits on public/auth endpoints
- Graceful rate limit responses (429 + Retry-After header)
- Abuse detection and automatic blocking
- API key usage tracking

### Layer 10: Caching & CDN
- Static asset caching (Cache-Control headers)
- API response caching where appropriate
- Database query caching (Redis/Memcached)
- CDN for global distribution
- Cache invalidation strategy
- Stale-while-revalidate patterns

### Layer 11: Load Balancing & Scaling
- Horizontal scaling (add more instances)
- Health checks on all services
- Graceful shutdown handling
- Database read replicas for read-heavy workloads
- Queue-based processing for heavy tasks (Bull, SQS)
- WebSocket scaling considerations

### Layer 12: Error Tracking & Logs
- Structured logging (JSON, not console.log)
- Centralized log aggregation (Sentry, Logtail, Axiom)
- Error alerting (Slack/Discord/email)
- Request tracing with correlation IDs
- Performance monitoring (latency, throughput)
- Uptime monitoring (UptimeRobot, Better Stack)

### Layer 13: Availability & Recovery
- Health check endpoints
- Database backups with point-in-time recovery
- Disaster recovery plan
- Incident response runbook
- SLA definition and monitoring
- Circuit breaker pattern for external services
- Retry logic with exponential backoff

---

## Pre-Launch Checklist

Before any app goes live, verify:

```
[ ] All 13 layers are addressed
[ ] Auth flow works end-to-end (signup, login, logout, reset, MFA)
[ ] Every API endpoint has input validation
[ ] Database has backups enabled
[ ] Rate limiting is active on public endpoints
[ ] Error tracking is configured (Sentry/similar)
[ ] SSL/TLS is configured and forced
[ ] CORS is locked down to known origins
[ ] Environment variables are in secrets manager, not in code
[ ] CI/CD pipeline runs tests before deploy
[ ] Staging environment matches production
[ ] Load testing done for expected peak traffic
[ ] Monitoring and alerting configured
[ ] Rollback procedure documented
```

---

## When Building an App

1. Start with the checklist — plan all layers before writing code
2. Build incrementally through the stack, not just frontend first
3. Every feature touches multiple layers — think about all of them
4. Never skip security for speed — it costs more to fix later
5. If you can't check off all 13 layers, the app is not production-ready

---

## Reference

This skill was created based on the production reality that separates "vibe coders" (frontend + backend only) from production engineers (all 13 layers). Every app matters — build it right from the start.

Source: Full-Stack Production Reality concept from @leadgenman (Instagram reel, June 2026)
