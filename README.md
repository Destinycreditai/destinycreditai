# Destiny Credit AI - Credit Education Platform

## 📋 Project Overview

**Destiny Credit AI** is a comprehensive Next.js web application designed to provide AI-powered credit education and dispute letter generation. The platform helps users understand credit reporting, generate educational dispute letters, and access guided workflows for credit management—all while maintaining strict compliance with legal requirements.

### Who It's For
- **Consumers** seeking educational resources about credit reports and dispute processes
- **Administrators** managing educational content, workflows, and user data
- **Organizations** providing credit education services

### Core Features
- 🤖 **AI-Powered Letter Generation** - Generate educational dispute letters using OpenAI GPT-4
- 📚 **Guided Workflows** - Step-by-step educational processes for credit management
- 📄 **Document Upload & Analysis** - Upload credit reports for AI-assisted analysis
- 👥 **User Management** - Role-based access control (Admin/User)
- 🎛️ **Admin Control Panel** - Complete CRUD operations for all platform content
- 🔗 **Resource Center** - Curated links to credit education resources
- 📊 **Follow-up Letters** - Automated follow-up letter generation (15, 30, 45-day intervals)
- ⚖️ **Compliance-First Design** - Built-in legal guardrails and educational disclaimers

---

## 🛠 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **jsPDF** - PDF generation for letter downloads

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Node.js** - Runtime environment

### Database
- **PostgreSQL** - Primary database
- **Prisma ORM** - Database toolkit and query builder
- **Connection Pooling** - Optimized database connections

### AI Services
- **OpenAI GPT-4** - AI letter generation and analysis
- **Document Processing** - AI-assisted document analysis (credit reports, statements)

### Hosting / Tunnel Usage
- **Development**: Local development server (`npm run dev`)
- **Tunneling**: Use tools like **localtunnel** or **ngrok** to expose local server:
  ```bash
  # Using localtunnel
  npx localtunnel --port 3000
  
  # Using ngrok
  ngrok http 3000
  ```
- **Production**: Deploy to Vercel, AWS, or any Node.js hosting platform

---

## 🏗 Application Architecture

### App Router Structure
```
app/
├── layout.tsx          # Root layout with navigation
├── page.tsx            # Home page
├── dashboard/          # User dashboard
│   └── page.tsx        # Main dashboard with letter generation
├── admin/              # Admin control panel
│   └── page.tsx        # Admin management interface
├── disclaimer/         # Disclaimer acceptance page
├── resources/          # Resources page
└── api/                # API routes
    ├── generate-letter/      # AI letter generation
    ├── generate-followup/    # Follow-up letter generation
    ├── credit-letters/      # Credit letter CRUD
    ├── followup-letters/    # Follow-up letter CRUD
    ├── workflows/           # Workflow management
    ├── users/               # User management
    └── admin/               # Admin-specific APIs
        ├── users/           # Admin user management
        ├── ai-prompts/      # AI prompt configuration
        ├── letter-templates/# Letter template management
        ├── disclaimers/     # Disclaimer management
        ├── resources/        # Resource link management
        └── uploads/         # File upload management
```

### API Routes Overview

#### Public APIs
- `POST /api/generate-letter` - Generate AI-powered dispute letters
- `POST /api/generate-followup` - Generate follow-up letters
- `GET /api/credit-letters` - List credit letters
- `GET /api/followup-letters` - List follow-up letters
- `GET /api/workflows` - List enabled workflows
- `GET /api/admin/resources` - List visible resources

#### Admin APIs
- `GET/POST/PUT/DELETE /api/admin/users` - User management
- `GET/POST/PUT/DELETE /api/admin/ai-prompts` - AI prompt configuration
- `GET/POST/PUT/DELETE /api/admin/letter-templates` - Template management
- `GET/POST/PUT/DELETE /api/admin/disclaimers` - Disclaimer management
- `GET/POST/PUT/DELETE /api/admin/resources` - Resource management
- `GET/POST/DELETE /api/admin/uploads` - File upload management

### Admin Panel vs User Dashboard

**User Dashboard** (`/dashboard`):
- AI Letter Generator form
- Guided Workflows browser
- Resource Center
- Follow-up Letter generation
- Metro 2 Education module

**Admin Panel** (`/admin`):
- User management (CRUD)
- Credit Letters management
- Follow-up Letters management
- Workflow creation/editing
- AI Prompt configuration
- Letter Template management
- Disclaimer management
- Resource Link management
- File Upload management

### Role-Based Access Control

- **USER Role**: Access to dashboard, letter generation, workflows
- **ADMIN Role**: Full access including admin panel
- **Authentication**: Simple session-based auth (admin/admin123)
- **Future**: Can be extended with NextAuth.js or similar

---

## 🎯 Core Features

### 1. User Management
- Create, read, update, delete users
- Role assignment (ADMIN/USER)
- User activity tracking
- Active/inactive status management

### 2. Admin Control Panel
- **9 Management Sections**:
  - 👥 Users
  - 📄 Credit Letters
  - 📮 Follow-Up Letters
  - 🔄 Workflows
  - 🤖 AI Prompts
  - 📝 Letter Templates
  - ⚖️ Disclaimers
  - 🔗 Resource Links
  - 📁 Uploaded Files
- Real-time database integration
- Full CRUD operations
- Status toggles (enable/disable)

### 3. AI Letter Generation
- **OpenAI GPT-4 Integration**
- **Document-Aware**: Can reference uploaded credit reports
- **Compliance-First**: Built-in legal guardrails
- **Letter Types**: Dispute, Validation, Goodwill
- **Bureaus**: Experian, Equifax, TransUnion
- **Auto-Save**: All generated letters saved to database
- **Document Analysis**: Identifies missing/inconsistent information

### 4. Guided Workflows
- Database-driven workflow system
- Step-by-step educational processes
- Admin-configurable workflows
- Categories:
  - Credit Dispute Process
  - Follow-Up Letter Process
  - Metro 2 Education
  - AI Chat Guidance
  - Credit Education Resources

### 5. Document Upload
- Upload credit reports, statements, PDFs
- Document metadata storage
- AI document analysis integration
- Reference documents when generating letters
- File type support: PDF, images, documents

### 6. Resource Center
- Curated credit education links
- Database-managed resources
- Default resources included:
  - CFPB (Consumer Financial Protection Bureau)
  - Annual Credit Report (Official)
  - FTC Identity Theft resources
  - Credit bureau education pages
  - Credit repair information

### 7. Follow-up Letters
- AI-powered follow-up generation
- Timeline tracking (15, 30, 45 days)
- Links to original letters
- Template-based options
- Automated content generation

### 8. Feature Toggles
- Enable/disable features
- Admin-configurable toggles
- Real-time feature management

---

## 🗄 Database

### Prisma + PostgreSQL

The application uses **Prisma ORM** with **PostgreSQL** for data persistence.

### Key Models

#### User
```prisma
- id: String (UUID)
- name: String?
- email: String (unique)
- role: Role (ADMIN/USER)
- active: Boolean
- lastLogin: DateTime?
- createdAt, updatedAt
```

#### CreditLetter
```prisma
- id: String (UUID)
- userId: String (FK → User)
- bureau: String (Experian/Equifax/TransUnion)
- creditorName: String
- accountNumber: String?
- letterType: String (dispute/validation/goodwill)
- tone: String
- content: String
- createdAt
```

#### FollowUpLetter
```prisma
- id: String (UUID)
- userId: String (FK → User)
- day: Int (15/30/45)
- content: String
- createdAt
```

#### Workflow
```prisma
- id: String (UUID)
- name: String
- steps: Json (array of step objects)
- enabled: Boolean
- createdAt
```

#### UploadedFile
```prisma
- id: String (UUID)
- filename: String
- filepath: String
- fileType: String
- uploadedBy: String (FK → User)
- createdAt
```

#### AIPrompt
```prisma
- id: String (UUID)
- type: String (system/dispute/validation/goodwill)
- content: String
- enabled: Boolean
```

#### LetterTemplate
```prisma
- id: String (UUID)
- category: String
- content: String
- disclaimer: String?
- enabled: Boolean
```

#### Disclaimer
```prisma
- id: String (UUID)
- type: String (onboarding/letters/footer)
- content: String
- enabled: Boolean
```

#### ResourceLink
```prisma
- id: String (UUID)
- title: String
- url: String
- visible: Boolean
```

### Relationships Overview

- **User** → **CreditLetter** (one-to-many, cascade delete)
- **User** → **FollowUpLetter** (one-to-many, cascade delete)
- **User** → **UploadedFile** (one-to-many, cascade delete)

All relationships use cascade delete for data integrity.

---

## 🔐 Environment Variables

### Required Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/destinycreditai"

# OpenAI API
OPENAI_API_KEY="sk-your-openai-api-key-here"

# Node Environment
NODE_ENV="development"  # or "production"
```

### Environment Variable Details

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes | `postgresql://user:pass@localhost:5432/dbname` |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4 | ✅ Yes | `sk-...` |
| `NODE_ENV` | Environment mode | ⚠️ Optional | `development` or `production` |

### Production Considerations

For production, also consider:
- `NEXTAUTH_SECRET` - If implementing NextAuth.js
- `NEXTAUTH_URL` - Production URL
- Database SSL configuration
- API rate limiting keys

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key

### Step 1: Clone and Install
```bash
# Clone the repository
git clone <repository-url>
cd destinycreditai

# Install dependencies
npm install
```

### Step 2: Database Setup
```bash
# Create PostgreSQL database
createdb destinycreditai

# Or using psql
psql -U postgres
CREATE DATABASE destinycreditai;
\q

# Run Prisma migrations
npx prisma migrate dev

# Seed the database (optional)
npm run db:seed
# Or manually:
node prisma/seed.js
```

### Step 3: Environment Configuration
```bash
# Create .env.local file
cp .env.example .env.local  # If example exists
# Or create manually:

# Add to .env.local:
DATABASE_URL="postgresql://username:password@localhost:5432/destinycreditai"
OPENAI_API_KEY="sk-your-openai-api-key"
NODE_ENV="development"
```

### Step 4: Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Step 5: Expose via Tunnel (Optional)

#### Using localtunnel:
```bash
# Install globally (one time)
npm install -g localtunnel

# Expose port 3000
lt --port 3000

# You'll get a URL like: https://random-name.loca.lt
```

#### Using ngrok:
```bash
# Install ngrok from https://ngrok.com
# Then run:
ngrok http 3000

# You'll get a URL like: https://random-id.ngrok.io
```

### Step 6: Client Access
- **Local**: `http://localhost:3000`
- **Tunnel**: Use the URL provided by localtunnel/ngrok
- Share the tunnel URL with clients for remote access

---

## 🎛️ Admin Panel Usage

### Access
- **URL**: `http://localhost:3000/admin`
- **Username**: `admin`
- **Password**: `admin123`

### What Admin Can Control

#### 1. Users Management
- Create new users
- Edit user details (name, email, role)
- Activate/deactivate users
- Delete users
- View user activity (letters, follow-ups count)

#### 2. Workflows Management
- Create custom workflows with JSON steps
- Edit existing workflows
- Enable/disable workflows
- Delete workflows
- Format: `{"steps": ["Step 1", "Step 2", ...]}`

#### 3. AI Prompts Configuration
- Configure system prompts
- Set dispute/validation/goodwill prompts
- Enable/disable prompts
- Customize AI behavior

#### 4. Letter Templates
- Create letter templates by category
- Add disclaimers to templates
- Enable/disable templates

#### 5. Disclaimers
- Manage onboarding disclaimers
- Configure letter disclaimers
- Set footer disclaimers
- Enable/disable disclaimers

#### 6. Resource Links
- Add credit education resources
- Set visibility (visible/hidden)
- Edit/delete resources
- Resources appear in dashboard Resource Center

#### 7. File Uploads
- View all uploaded files
- Delete uploaded files
- Files can be referenced in AI letter generation

#### 8. Credit & Follow-up Letters
- View all generated letters
- Delete letters
- Monitor user activity

---

## ⚠️ Known Limitations

### Technical Limitations
1. **Document Processing**: Currently uses placeholder for document text extraction. For production, integrate:
   - PDF text extraction (pdf-parse, pdf.js)
   - OCR for images (Tesseract.js, Google Vision API)
   - Document storage (AWS S3, Cloudinary)

2. **Authentication**: Simple username/password. For production, implement:
   - NextAuth.js
   - OAuth providers
   - JWT tokens
   - Session management

3. **File Storage**: Files stored locally. For production:
   - Use cloud storage (S3, Cloudinary)
   - Implement file size limits
   - Add virus scanning

4. **Rate Limiting**: No API rate limiting. Consider:
   - Upstash Redis
   - Vercel Edge Config
   - Custom middleware

5. **Error Monitoring**: No error tracking. Consider:
   - Sentry
   - LogRocket
   - Custom logging service

### Feature Limitations
- No email notifications
- No user registration (admin-created only)
- No password reset functionality
- No multi-tenant support
- No audit logging

---

## 🚢 Production Readiness

### ✅ Ready for Production
- Database schema and migrations
- API endpoints with error handling
- Admin panel functionality
- AI letter generation
- Document upload infrastructure
- Resource management
- Responsive UI design
- Compliance guardrails

### ⚠️ Requires Configuration
1. **Environment Variables**: Set production values
2. **Database**: Configure production PostgreSQL with SSL
3. **File Storage**: Implement cloud storage (S3, etc.)
4. **Authentication**: Replace simple auth with NextAuth.js
5. **Document Processing**: Integrate PDF/OCR libraries
6. **Error Monitoring**: Add error tracking service
7. **Rate Limiting**: Implement API rate limiting
8. **SSL/HTTPS**: Configure SSL certificates
9. **Backup Strategy**: Set up database backups
10. **Monitoring**: Add application monitoring

### Deployment Steps
```bash
# 1. Build the application
npm run build

# 2. Set production environment variables
# DATABASE_URL, OPENAI_API_KEY, etc.

# 3. Run database migrations
npx prisma migrate deploy

# 4. Seed production database (if needed)
npm run db:seed

# 5. Start production server
npm start
```

### Recommended Hosting
- **Vercel** - Optimal for Next.js (recommended)
- **AWS** - Full control, scalable
- **Railway** - Easy PostgreSQL + Node.js
- **Render** - Simple deployment
- **DigitalOcean** - VPS with Docker

---

## 📝 Additional Scripts

### Database Seeding
```bash
# Seed database with default data
npm run db:seed
# Or:
node prisma/seed.js
```

### Add Default Resources
```bash
# Add default resource links to database
node scripts/add-default-resources.js
```

### Prisma Commands
```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio
```

---

## 🔒 Compliance & Legal

### Educational Focus
- All content is **educational only**
- No legal advice provided
- No guaranteed outcomes
- User verification required

### AI Compliance
- Conditional language only ("if inaccurate", "may be inconsistent")
- No deletion guarantees
- No legal strategy advice
- Automatic disclaimer inclusion

### Data Privacy
- User data stored securely
- Cascade deletes for data integrity
- No third-party data sharing (except OpenAI API)
- Consider GDPR compliance for production

---

## 📞 Support & Maintenance

### Development
- TypeScript for type safety
- ESLint for code quality
- Prisma for database management
- Tailwind CSS for styling

### Troubleshooting
1. **Database Connection Issues**: Check `DATABASE_URL` in `.env.local`
2. **OpenAI API Errors**: Verify `OPENAI_API_KEY` is valid
3. **Build Errors**: Run `npx prisma generate` to regenerate Prisma Client
4. **Migration Issues**: Run `npx prisma migrate reset` (⚠️ deletes data)

---

## 📄 License

[Add your license information here]

---

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Next.js team for the framework
- Prisma for the ORM
- Tailwind CSS for styling utilities

---

**Built with ❤️ for credit education**
