const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Create default workflows
  const workflows = [
    {
      name: 'Credit Dispute Process',
      steps: {
        steps: [
          'Obtain your free annual credit reports from all three bureaus',
          'Review reports for potentially inaccurate items',
          'Generate dispute letter using AI tool',
          'Submit via certified mail and track timeline'
        ]
      },
      enabled: true
    },
    {
      name: 'Follow-Up Letter Process',
      steps: {
        steps: [
          'Check if 30+ days have passed since initial dispute',
          'Generate follow-up correspondence using AI',
          'Document all progress and responses'
        ]
      },
      enabled: true
    },
    {
      name: 'Metro 2 Education',
      steps: {
        steps: [
          'Understand Metro 2 format basics',
          'Learn about data field requirements',
          'Identify potential compliance issues'
        ]
      },
      enabled: true
    },
    {
      name: 'AI Chat Guidance',
      steps: {
        steps: [
          'Ask educational credit questions',
          'Review AI responses for information',
          'Use guidance to make informed decisions'
        ]
      },
      enabled: true
    },
    {
      name: 'Credit Education Resources',
      steps: {
        steps: [
          'Learn credit basics and scoring factors',
          'Understand dispute process and rights',
          'Apply best practices for credit maintenance'
        ]
      },
      enabled: true
    }
  ];

  for (const workflow of workflows) {
    const existing = await prisma.workflow.findFirst({ where: { name: workflow.name } });
    if (!existing) {
      await prisma.workflow.create({ data: workflow });
    }
  }

  // Create default AI prompts
  const aiPrompts = [
    {
      type: 'system',
      content: 'You are an AI assistant that helps create educational credit dispute letters. Always use conditional language and never guarantee outcomes.',
      enabled: true
    },
    {
      type: 'dispute',
      content: 'Create a professional dispute letter that uses conditional language like "if inaccurate" and "may be inconsistent".',
      enabled: true
    },
    {
      type: 'validation',
      content: 'Create a validation letter requesting verification of account details and reporting accuracy.',
      enabled: true
    },
    {
      type: 'goodwill',
      content: 'Create a goodwill letter requesting consideration for removal of accurate but negative information.',
      enabled: true
    }
  ];

  for (const prompt of aiPrompts) {
    const existing = await prisma.aIPrompt.findFirst({ where: { type: prompt.type } });
    if (!existing) {
      await prisma.aIPrompt.create({ data: prompt });
    }
  }

  // Create default disclaimers
  const disclaimers = [
    {
      type: 'letters',
      content: 'This letter is for educational purposes only and does not constitute legal advice. No guaranteed outcomes are implied. User must verify all information before use.',
      enabled: true
    },
    {
      type: 'onboarding',
      content: 'This platform provides educational information only. All tools and content are for learning purposes. Consult qualified professionals for legal matters.',
      enabled: true
    }
  ];

  for (const disclaimer of disclaimers) {
    const existing = await prisma.disclaimer.findFirst({ where: { type: disclaimer.type } });
    if (!existing) {
      await prisma.disclaimer.create({ data: disclaimer });
    }
  }

  // Create default user
  const existingUser = await prisma.user.findUnique({ where: { email: 'demo@example.com' } });
  if (!existingUser) {
    await prisma.user.create({
      data: {
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'USER',
        active: true
      }
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });