/**
 * Script to add default resources to the Resource Center
 * Run this script to populate the database with comprehensive credit education resources
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultResources = [
  {
    title: 'CFPB Credit Reports & Scores',
    url: 'https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/',
    visible: true
  },
  {
    title: 'Annual Credit Report (Official)',
    url: 'https://www.annualcreditreport.com/',
    visible: true
  },
  {
    title: 'FTC Identity Theft',
    url: 'https://www.identitytheft.gov/',
    visible: true
  },
  {
    title: 'FTC Free Credit Reports',
    url: 'https://www.consumer.ftc.gov/articles/0155-free-credit-reports',
    visible: true
  },
  {
    title: 'Experian Credit Education',
    url: 'https://www.experian.com/education/',
    visible: true
  },
  {
    title: 'Equifax Credit Education',
    url: 'https://www.equifax.com/personal/education/',
    visible: true
  },
  {
    title: 'TransUnion Credit Education',
    url: 'https://www.transunion.com/credit-education',
    visible: true
  },
  {
    title: 'CFPB Disputing Errors',
    url: 'https://www.consumerfinance.gov/ask-cfpb/how-do-i-dispute-an-error-on-my-credit-report-en-314/',
    visible: true
  },
  {
    title: 'FTC Credit Repair',
    url: 'https://www.consumer.ftc.gov/articles/0058-credit-repair-how-help-yourself',
    visible: true
  },
  {
    title: 'CFPB Debt Collection',
    url: 'https://www.consumerfinance.gov/consumer-tools/debt-collection/',
    visible: true
  }
];

async function addResources() {
  try {
    console.log('Adding default resources to database...');
    
    for (const resource of defaultResources) {
      // Check if resource already exists
      const existing = await prisma.resourceLink.findFirst({
        where: { url: resource.url }
      });
      
      if (!existing) {
        await prisma.resourceLink.create({
          data: resource
        });
        console.log(`✅ Added: ${resource.title}`);
      } else {
        console.log(`⏭️  Skipped (already exists): ${resource.title}`);
      }
    }
    
    console.log('\n✅ Default resources added successfully!');
  } catch (error) {
    console.error('❌ Error adding resources:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addResources();

