# Backend Folder Structure

Rules:
- Each domain module must live under src/modules/<domain-name>
- Each domain module should contain:
  - dto/
  - entities/
  - <domain>.controller.ts
  - <domain>.service.ts
  - <domain>.module.ts
- Shared guards, decorators, interfaces and helpers must live under src/common
- Database migrations and seeds must live under src/database
- Do not invent alternative folder layouts unless explicitly requested