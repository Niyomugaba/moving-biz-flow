export interface GoogleSheetsConfig {
  spreadsheetId: string;
  clientSheetName: string;
  jobsSheetName: string;
  leadsSheetName: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  conflicts?: any[];
}

export class GoogleSheetsSync {
  private config: GoogleSheetsConfig;
  protected accessToken: string;

  constructor(config: GoogleSheetsConfig, accessToken: string) {
    this.config = config;
    this.accessToken = accessToken;
  }

  // Create initial Google Sheet with all data
  async createInitialSheet(): Promise<string> {
    const spreadsheet = await this.createSpreadsheet();
    await this.setupSheetsStructure(spreadsheet.spreadsheetId);
    await this.exportAllDataToSheets(spreadsheet.spreadsheetId);
    return spreadsheet.spreadsheetId;
  }

  // Export current platform data to Google Sheets
  async exportAllDataToSheets(spreadsheetId: string) {
    console.log('🔄 Exporting all data to Google Sheets...');
    
    // Get current data from localStorage (offline data)
    const offlineData = JSON.parse(localStorage.getItem('bantu_movers_offline_data') || '{}');
    
    if (!offlineData.clients) {
      throw new Error('No offline data available. Please sync data first.');
    }

    // Export clients
    await this.exportClientsToSheet(spreadsheetId, offlineData.clients);
    
    // Export jobs
    await this.exportJobsToSheet(spreadsheetId, offlineData.jobs);
    
    // Export leads
    await this.exportLeadsToSheet(spreadsheetId, offlineData.leads);

    console.log('✅ Data exported to Google Sheets successfully');
  }

  // Import changes from Google Sheets back to platform
  async importChangesFromSheets(spreadsheetId: string): Promise<SyncResult> {
    try {
      console.log('📥 Importing changes from Google Sheets...');
      
      const clientsFromSheet = await this.getClientsFromSheet(spreadsheetId);
      const jobsFromSheet = await this.getJobsFromSheet(spreadsheetId);
      const leadsFromSheet = await this.getLeadsFromSheet(spreadsheetId);

      // Apply changes to local storage first
      const offlineData = JSON.parse(localStorage.getItem('bantu_movers_offline_data') || '{}');
      
      // Update offline storage with sheet data
      const updatedData = {
        ...offlineData,
        clients: clientsFromSheet,
        jobs: jobsFromSheet,
        leads: leadsFromSheet,
        lastSync: new Date().toISOString(),
        dataVersion: 1
      };

      localStorage.setItem('bantu_movers_offline_data', JSON.stringify(updatedData));

      return {
        success: true,
        message: `Successfully synced ${clientsFromSheet.length} clients, ${jobsFromSheet.length} jobs, and ${leadsFromSheet.length} leads from Google Sheets`
      };

    } catch (error) {
      console.error('❌ Error importing from Google Sheets:', error);
      return {
        success: false,
        message: `Failed to sync from Google Sheets: ${error.message}`
      };
    }
  }

  // Two-way sync: export to sheets, then import changes
  async performTwoWaySync(spreadsheetId: string): Promise<SyncResult> {
    try {
      // First export current data to sheets
      await this.exportAllDataToSheets(spreadsheetId);
      
      // Wait a moment for the export to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Then import any changes from sheets
      return await this.importChangesFromSheets(spreadsheetId);
    } catch (error) {
      return {
        success: false,
        message: `Sync failed: ${error.message}`
      };
    }
  }

  private async createSpreadsheet() {
    const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          title: `Bantu Movers Data - ${new Date().toLocaleDateString()}`
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create spreadsheet: ${response.statusText}`);
    }

    return await response.json();
  }

  private async setupSheetsStructure(spreadsheetId: string) {
    // Create sheets for Clients, Jobs, and Leads
    const requests = [
      {
        addSheet: {
          properties: {
            title: 'Clients',
            gridProperties: { rowCount: 1000, columnCount: 15 }
          }
        }
      },
      {
        addSheet: {
          properties: {
            title: 'Jobs',
            gridProperties: { rowCount: 1000, columnCount: 20 }
          }
        }
      },
      {
        addSheet: {
          properties: {
            title: 'Leads',
            gridProperties: { rowCount: 1000, columnCount: 12 }
          }
        }
      }
    ];

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests })
    });
  }

  private async exportClientsToSheet(spreadsheetId: string, clients: any[]) {
    const headers = [
      'ID', 'Name', 'Phone', 'Email', 'Company', 'Primary Address', 
      'Total Jobs', 'Total Revenue', 'Rating', 'Created Date', 'Notes'
    ];

    const values = [
      headers,
      ...clients.map(client => [
        client.id,
        client.name,
        client.phone,
        client.email || '',
        client.company_name || '',
        client.primary_address,
        client.total_jobs_completed || 0,
        client.total_revenue || 0,
        client.rating || '',
        client.created_at,
        client.notes || ''
      ])
    ];

    await this.updateSheetValues(spreadsheetId, 'Clients!A1:K' + (clients.length + 1), values);
  }

  private async exportJobsToSheet(spreadsheetId: string, jobs: any[]) {
    const headers = [
      'ID', 'Job Number', 'Client Name', 'Client Phone', 'Job Date', 
      'Status', 'Origin Address', 'Destination Address', 'Estimated Total', 
      'Actual Total', 'Is Paid', 'Payment Method', 'Created Date'
    ];

    const values = [
      headers,
      ...jobs.map(job => [
        job.id,
        job.job_number,
        job.client_name,
        job.client_phone,
        job.job_date,
        job.status,
        job.origin_address,
        job.destination_address,
        job.estimated_total || 0,
        job.actual_total || 0,
        job.is_paid ? 'Yes' : 'No',
        job.payment_method || '',
        job.created_at
      ])
    ];

    await this.updateSheetValues(spreadsheetId, 'Jobs!A1:M' + (jobs.length + 1), values);
  }

  private async exportLeadsToSheet(spreadsheetId: string, leads: any[]) {
    const headers = [
      'ID', 'Name', 'Phone', 'Email', 'Source', 'Status', 
      'Lead Cost', 'Estimated Value', 'Follow Up Date', 'Notes', 'Created Date'
    ];

    const values = [
      headers,
      ...leads.map(lead => [
        lead.id,
        lead.name,
        lead.phone,
        lead.email || '',
        lead.source,
        lead.status,
        lead.lead_cost || 0,
        lead.estimated_value || 0,
        lead.follow_up_date || '',
        lead.notes || '',
        lead.created_at
      ])
    ];

    await this.updateSheetValues(spreadsheetId, 'Leads!A1:K' + (leads.length + 1), values);
  }

  private async getClientsFromSheet(spreadsheetId: string): Promise<any[]> {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Clients!A2:K1000`,
      {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      }
    );

    const data = await response.json();
    if (!data.values) return [];

    return data.values.map((row: any[]) => ({
      id: row[0],
      name: row[1],
      phone: row[2],
      email: row[3] || null,
      company_name: row[4] || null,
      primary_address: row[5],
      total_jobs_completed: parseInt(row[6]) || 0,
      total_revenue: parseFloat(row[7]) || 0,
      rating: row[8] ? parseInt(row[8]) : null,
      created_at: row[9],
      notes: row[10] || null
    })).filter(client => client.id && client.name);
  }

  private async getJobsFromSheet(spreadsheetId: string): Promise<any[]> {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Jobs!A2:M1000`,
      {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      }
    );

    const data = await response.json();
    if (!data.values) return [];

    return data.values.map((row: any[]) => ({
      id: row[0],
      job_number: row[1],
      client_name: row[2],
      client_phone: row[3],
      job_date: row[4],
      status: row[5],
      origin_address: row[6],
      destination_address: row[7],
      estimated_total: parseFloat(row[8]) || 0,
      actual_total: parseFloat(row[9]) || 0,
      is_paid: row[10] === 'Yes',
      payment_method: row[11] || null,
      created_at: row[12]
    })).filter(job => job.id && job.job_number);
  }

  private async getLeadsFromSheet(spreadsheetId: string): Promise<any[]> {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Leads!A2:K1000`,
      {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      }
    );

    const data = await response.json();
    if (!data.values) return [];

    return data.values.map((row: any[]) => ({
      id: row[0],
      name: row[1],
      phone: row[2],
      email: row[3] || null,
      source: row[4],
      status: row[5],
      lead_cost: parseFloat(row[6]) || 0,
      estimated_value: parseFloat(row[7]) || 0,
      follow_up_date: row[8] || null,
      notes: row[9] || null,
      created_at: row[10]
    })).filter(lead => lead.id && lead.name);
  }

  protected async updateSheetValues(spreadsheetId: string, range: string, values: any[][]) {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values })
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update sheet: ${response.statusText}`);
    }
  }
}
