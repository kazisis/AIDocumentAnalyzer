# replit.md

## Overview

Auto-Insight Engine (AIE) is an AI-powered content automation system designed for automotive market analysis. The system enables users to efficiently create and distribute professional content across multiple platforms (Korean/English blogs, social media) with minimal time investment (approximately 30 minutes per day). The application follows a semi-automated workflow where user approval is required at each critical step.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: Shadcn/UI components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and Korean font support (Noto Sans KR)
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design
- **File Structure**: Modular separation with dedicated route handlers and storage abstractions

### Database Architecture
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Migration Strategy**: Drizzle Kit for schema management
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Database Schema
The system uses three main entities:
- **Users**: Basic user authentication and management
- **Tasks**: Core workflow entities containing analysis requests and status tracking
- **Content**: Generated content storage with type classification and approval status

### API Integration
- **OpenAI Integration**: GPT-4 for content generation with structured prompts
- **Content Types**: Supports Korean blog, English blog, Twitter threads, and tweet generation
- **Error Handling**: Comprehensive error handling with structured responses

### User Interface Components
- **Dashboard**: Main interface with tabbed navigation for different workflow stages
- **Task Creation**: Form-based input for analysis parameters
- **Content Review**: Rich text editor for content approval and modification
- **Content Distribution**: Multi-platform content management and copying utilities
- **Task History**: Performance tracking and historical analysis

### Workflow Management
The system implements a three-phase workflow:
1. **Task Creation**: User inputs analysis parameters
2. **Content Review**: AI generates initial content for user approval
3. **Content Distribution**: Derivative content generation and platform distribution

## Data Flow

### Content Generation Pipeline
1. User submits analysis request through task creation form
2. System validates input and creates task record with "processing" status
3. OpenAI API generates Korean blog content based on user parameters
4. Content is stored and task status updates to "review_pending"
5. User reviews and approves content through rich text editor
6. Upon approval, system generates derivative content (English blog, threads, tweets)
7. All content becomes available for distribution across platforms

### State Management
- Client-side state managed through TanStack Query with automatic caching
- Real-time status updates through polling mechanisms
- Form state handled by React Hook Form with Zod validation schemas
- UI state managed through React hooks and context providers

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection management
- **OpenAI**: Content generation API
- **Drizzle ORM**: Database operations and schema management
- **React Query**: Server state management and caching
- **Shadcn/UI**: Pre-built accessible UI components

### Development Tools
- **Vite**: Development server and build optimization
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first styling framework
- **ESBuild**: Fast JavaScript bundling for production

### Authentication & Session Management
- Currently configured with placeholder user ID (1)
- Session management through connect-pg-simple for production scaling
- Ready for future authentication system integration

## Deployment Strategy

### Development Environment
- **Development Server**: Vite dev server with hot module replacement
- **API Development**: Express server with TypeScript compilation via tsx
- **Database**: Local or cloud PostgreSQL instance via DATABASE_URL

### Production Build
- **Frontend**: Static asset generation through Vite build process
- **Backend**: ESBuild compilation to optimized JavaScript modules
- **Deployment**: Node.js application with static file serving
- **Environment**: Production mode with optimized asset delivery

### Environment Configuration
- Database connection via DATABASE_URL environment variable
- OpenAI API key configuration for content generation
- Build-time optimization for production deployment

## Changelog

```
Changelog:
- July 08, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```