import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    // Basic mapping logic - this should be adjusted based on the actual Excel column names
    // For this task, we'll try to map common names or just insert as is if they match
    
    const results = await prisma.$transaction(async (tx) => {
      const createdCompanies = [];
      
      for (const row of data) {
        // Example mapping: 'Company Name' -> name, 'Company ID' -> id, etc.
        // We'll use a flexible approach or assume keys match the schema for now
        const companyId = row.id || row.ID || row['Company ID'] || `comp-${Math.random().toString(36).slice(2, 7)}`;
        const companyName = row.name || row.Name || row['Company Name'] || 'Unknown Company';
        const country = row.country || row.Country || 'Unknown';

        const company = await tx.company.upsert({
          where: { id: String(companyId) },
          update: {
            name: String(companyName),
            country: String(country),
          },
          create: {
            id: String(companyId),
            name: String(companyName),
            country: String(country),
          },
        });
        createdCompanies.push(company);

        // If there's emission data in the same row
        const emissions = row.emissions || row.Emissions || row['Total Emissions'];
        const yearMonth = row.yearMonth || row['Year Month'] || '2024-01';
        
        if (emissions !== undefined) {
          await tx.ghgEmission.create({
            data: {
              yearMonth: String(yearMonth),
              emissions: parseFloat(emissions),
              companyId: company.id,
              source: row.source || row.Source || 'Excel Import',
            }
          });
        }
      }
      return createdCompanies;
    });

    return NextResponse.json({ success: true, count: results.length });
  } catch (error: any) {
    console.error('Import Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to sync data' }, { status: 500 });
  }
}
