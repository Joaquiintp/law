# Copilot Instructions for ERP Jurídico

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a comprehensive ERP system for legal firms built with Next.js 15, TypeScript, and Tailwind CSS.

## Key Features
- **Case Management**: Complete CRUD for legal cases with advanced search
- **Calendar & Scheduling**: Shared calendar with automatic alerts for deadlines
- **Document Management**: Centralized repository with versioning and intelligent templates
- **Legal CRM**: Client management with portal access
- **Billing**: Fee tracking, invoicing, and electronic billing integration
- **AI Automation**: Document generation, case summarization, and legal research assistance
- **Analytics**: Dashboard with KPIs and reports

## Architecture Guidelines
- Use Next.js App Router (app directory)
- Follow TypeScript strict mode
- Use Prisma ORM for database operations
- Implement NextAuth.js for authentication
- Use shadcn/ui components with Tailwind CSS
- Follow React Server Components pattern where possible
- Use Zod for data validation
- Implement proper error boundaries and loading states

## Code Standards
- Use descriptive variable names in Spanish for legal terms
- Add proper JSDoc comments for complex functions
- Implement proper TypeScript interfaces for all data models
- Use React Server Components for data fetching when possible
- Implement proper error handling with try-catch blocks
- Use Next.js middleware for route protection
- Follow the principle of least privilege for user permissions

## Database Schema
- Focus on legal entities: Expedientes, Clientes, Documentos, Audiencias
- Implement proper relationships with foreign keys
- Use enums for status fields (Activo, Cerrado, Pendiente, etc.)
- Include audit fields (createdAt, updatedAt, createdBy)

## UI/UX Guidelines
- Use a professional, clean design suitable for legal professionals
- Implement responsive design for mobile and desktop
- Use appropriate colors: blues and grays for professional appearance
- Include proper loading states and error messages
- Implement keyboard shortcuts for power users
- Use proper form validation with clear error messages
