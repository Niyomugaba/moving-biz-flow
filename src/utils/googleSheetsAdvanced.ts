
import { GoogleSheetsSync } from './googleSheetsSync';

export interface AdvancedGoogleSheetsConfig {
  spreadsheetId: string;
  accessToken: string;
}

export class AdvancedGoogleSheetsManager extends GoogleSheetsSync {
  private accessToken: string;

  constructor(config: AdvancedGoogleSheetsConfig) {
    super({
      spreadsheetId: config.spreadsheetId,
      clientSheetName: 'Clients',
      jobsSheetName: 'Jobs', 
      leadsSheetName: 'Leads'
    }, config.accessToken);
    this.accessToken = config.accessToken;
  }

  // Create a comprehensive Financial Reports sheet that mirrors the UI
  async createFinancialReportsSheet(data: any) {
    const spreadsheetId = await this.createAdvancedSpreadsheet();
    await this.setupAdvancedSheetsStructure(spreadsheetId, data);
    await this.addGoogleAppsScript(spreadsheetId);
    return spreadsheetId;
  }

  private async createAdvancedSpreadsheet() {
    const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          title: `Bantu Movers - Financial Dashboard - ${new Date().toLocaleDateString()}`,
          locale: 'en_US',
          timeZone: 'America/New_York'
        },
        sheets: [
          {
            properties: {
              title: 'Financial Dashboard',
              gridProperties: { rowCount: 100, columnCount: 20 },
              tabColor: { red: 0.2, green: 0.6, blue: 0.9 }
            }
          },
          {
            properties: {
              title: 'Revenue Analysis',
              gridProperties: { rowCount: 100, columnCount: 15 },
              tabColor: { red: 0.3, green: 0.7, blue: 0.3 }
            }
          },
          {
            properties: {
              title: 'Jobs Data',
              gridProperties: { rowCount: 1000, columnCount: 25 },
              tabColor: { red: 0.9, green: 0.6, blue: 0.2 }
            }
          },
          {
            properties: {
              title: 'Leads Data',
              gridProperties: { rowCount: 1000, columnCount: 15 },
              tabColor: { red: 0.7, green: 0.3, blue: 0.9 }
            }
          },
          {
            properties: {
              title: 'Clients Data',
              gridProperties: { rowCount: 1000, columnCount: 15 },
              tabColor: { red: 0.9, green: 0.3, blue: 0.3 }
            }
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create spreadsheet: ${response.statusText}`);
    }

    const result = await response.json();
    return result.spreadsheetId;
  }

  private async setupAdvancedSheetsStructure(spreadsheetId: string, data: any) {
    // Create Financial Dashboard Sheet
    await this.createFinancialDashboard(spreadsheetId, data);
    
    // Create Revenue Analysis Sheet  
    await this.createRevenueAnalysisSheet(spreadsheetId, data);
    
    // Create detailed data sheets
    await this.createJobsDataSheet(spreadsheetId, data.jobs);
    await this.createLeadsDataSheet(spreadsheetId, data.leads);
    await this.createClientsDataSheet(spreadsheetId, data.clients);

    // Add data validation and formatting
    await this.addDataValidationAndFormatting(spreadsheetId);
  }

  private async createFinancialDashboard(spreadsheetId: string, data: any) {
    const dashboardData = [
      ['BANTU MOVERS - FINANCIAL DASHBOARD', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['Time Filter:', '=INDIRECT("TimeFilter")', '', 'Last Updated:', new Date().toLocaleString(), '', ''],
      ['', '', '', '', '', '', ''],
      ['📊 SUMMARY METRICS', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['Total Revenue', '=SUM(JobsData!M:M)', '💰', 'Completed Jobs', '=COUNTIF(JobsData!F:F,"completed")', '✅', ''],
      ['Paid Revenue', '=SUMIF(JobsData!K:K,TRUE,JobsData!M:M)', '✅', 'Average Job Value', '=AVERAGE(JobsData!M:M)', '📈', ''],
      ['Unpaid Revenue', '=SUM(JobsData!M:M)-SUMIF(JobsData!K:K,TRUE,JobsData!M:M)', '⏳', 'Total Leads', '=COUNTA(LeadsData!A:A)-1', '🎯', ''],
      ['', '', '', '', '', '', ''],
      ['💼 REVENUE BY SOURCE', '', '', '', '', '', ''],
      ['Source', 'Revenue', 'Jobs', 'Leads', 'Conversion %', 'Performance', ''],
      ['Google Ads', '=SUMIF(LeadsData!E:E,"google_ads",JobsData!M:M)', '=COUNTIFS(LeadsData!E:E,"google_ads",JobsData!F:F,"completed")', '=COUNTIF(LeadsData!E:E,"google_ads")', '=IF(M13>0,L13/M13*100,0)', '=IF(N13>10,"🔥",IF(N13>5,"👍","📈"))', ''],
      ['Facebook', '=SUMIF(LeadsData!E:E,"facebook",JobsData!M:M)', '=COUNTIFS(LeadsData!E:E,"facebook",JobsData!F:F,"completed")', '=COUNTIF(LeadsData!E:E,"facebook")', '=IF(M14>0,L14/M14*100,0)', '=IF(N14>10,"🔥",IF(N14>5,"👍","📈"))', ''],
      ['Referral', '=SUMIF(LeadsData!E:E,"referral",JobsData!M:M)', '=COUNTIFS(LeadsData!E:E,"referral",JobsData!F:F,"completed")', '=COUNTIF(LeadsData!E:E,"referral")', '=IF(M15>0,L15/M15*100,0)', '=IF(N15>10,"🔥",IF(N15>5,"👍","📈"))', ''],
      ['Website', '=SUMIF(LeadsData!E:E,"website",JobsData!M:M)', '=COUNTIFS(LeadsData!E:E,"website",JobsData!F:F,"completed")', '=COUNTIF(LeadsData!E:E,"website")', '=IF(M16>0,L16/M16*100,0)', '=IF(N16>10,"🔥",IF(N16>5,"👍","📈"))', ''],
      ['Other', '=SUMIF(LeadsData!E:E,"other",JobsData!M:M)', '=COUNTIFS(LeadsData!E:E,"other",JobsData!F:F,"completed")', '=COUNTIF(LeadsData!E:E,"other")', '=IF(M17>0,L17/M17*100,0)', '=IF(N17>10,"🔥",IF(N17>5,"👍","📈"))', ''],
      ['', '', '', '', '', '', ''],
      ['💳 PAYMENT STATUS', '', '', '', '', '', ''],
      ['Status', 'Count', 'Amount', 'Percentage', 'Action Needed', '', ''],
      ['Paid Jobs', '=COUNTIF(JobsData!K:K,TRUE)', '=SUMIF(JobsData!K:K,TRUE,JobsData!M:M)', '=IF(J21>0,J21/(J21+J22)*100,0)', '=IF(L21<80,"Follow up needed","✅")', '', ''],
      ['Unpaid Jobs', '=COUNTIF(JobsData!K:K,FALSE)', '=SUMIF(JobsData!K:K,FALSE,JobsData!M:M)', '=IF(J22>0,J22/(J21+J22)*100,0)', '=IF(J22>5,"🚨 Priority","📋")', '', ''],
      ['', '', '', '', '', '', ''],
      ['🏆 TOP CLIENTS', '', '', '', '', '', ''],
      ['Client Name', 'Total Revenue', 'Jobs Count', 'Last Job', 'Status', '', ''],
    ];

    await this.updateSheetValues(spreadsheetId, 'Financial Dashboard!A1:G26', dashboardData);
  }

  private async createRevenueAnalysisSheet(spreadsheetId: string, data: any) {
    const analysisData = [
      ['REVENUE ANALYSIS DASHBOARD', '', '', '', '', ''],
      ['', '', '', '', '', ''],
      ['📈 Monthly Revenue Trend', '', '', '', '', ''],
      ['Month', 'Revenue', 'Jobs', 'Avg Job Value', 'Growth %', 'Trend'],
      // Add monthly data calculations here
      ['', '', '', '', '', ''],
      ['🎯 Lead Source Performance', '', '', '', '', ''],
      ['Source', 'Cost', 'Revenue', 'ROI', 'Conversion Rate', 'Score'],
      // Add lead source performance data
      ['', '', '', '', '', ''],
      ['📊 Business Metrics', '', '', '', '', ''],
      ['Metric', 'Current', 'Target', 'Status', 'Action', ''],
      ['Revenue Growth', '=B4/B3-1', '20%', '=IF(B10>0.2,"✅","⚠️")', '=IF(B10<0.2,"Increase marketing","Maintain")', ''],
      ['Customer Acquisition Cost', '=LeadsData!G2/LeadsData!A2', '$50', '=IF(B11<50,"✅","⚠️")', '=IF(B11>50,"Optimize ads","Good")', ''],
      ['Average Job Value', '=AVERAGE(JobsData!M:M)', '$500', '=IF(B12>500,"✅","⚠️")', '=IF(B12<500,"Upsell services","Good")', ''],
    ];

    await this.updateSheetValues(spreadsheetId, 'Revenue Analysis!A1:F15', analysisData);
  }

  private async createJobsDataSheet(spreadsheetId: string, jobs: any[]) {
    const headers = [
      'ID', 'Job Number', 'Client Name', 'Client Phone', 'Job Date', 
      'Status', 'Origin Address', 'Destination Address', 'Movers Needed',
      'Estimated Hours', 'Actual Hours', 'Is Paid', 'Hourly Rate', 'Actual Total',
      'Payment Method', 'Lead Source', 'Created Date', 'Notes'
    ];

    const jobsData = [
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
        job.movers_needed,
        job.estimated_duration_hours,
        job.actual_duration_hours || '',
        job.is_paid ? 'TRUE' : 'FALSE',
        job.hourly_rate,
        job.actual_total || job.estimated_total,
        job.payment_method || '',
        '', // Lead source will be looked up
        job.created_at,
        job.completion_notes || ''
      ])
    ];

    await this.updateSheetValues(spreadsheetId, 'Jobs Data!A1:R' + (jobs.length + 1), jobsData);
  }

  private async createLeadsDataSheet(spreadsheetId: string, leads: any[]) {
    const headers = [
      'ID', 'Name', 'Phone', 'Email', 'Source', 'Status', 
      'Lead Cost', 'Estimated Value', 'Follow Up Date', 'Notes', 'Created Date'
    ];

    const leadsData = [
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

    await this.updateSheetValues(spreadsheetId, 'Leads Data!A1:K' + (leads.length + 1), leadsData);
  }

  private async createClientsDataSheet(spreadsheetId: string, clients: any[]) {
    const headers = [
      'ID', 'Name', 'Phone', 'Email', 'Company', 'Primary Address', 
      'Total Jobs', 'Total Revenue', 'Rating', 'Created Date', 'Notes'
    ];

    const clientsData = [
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

    await this.updateSheetValues(spreadsheetId, 'Clients Data!A1:K' + (clients.length + 1), clientsData);
  }

  private async addDataValidationAndFormatting(spreadsheetId: string) {
    const requests = [
      // Format Financial Dashboard
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: 7
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.2, green: 0.6, blue: 0.9 },
              textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontSize: 16 }
            }
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat)'
        }
      },
      // Add dropdown for time filter
      {
        setDataValidation: {
          range: {
            sheetId: 0,
            startRowIndex: 2,
            endRowIndex: 3,
            startColumnIndex: 1,
            endColumnIndex: 2
          },
          rule: {
            condition: {
              type: 'ONE_OF_LIST',
              values: [
                { userEnteredValue: 'All Time' },
                { userEnteredValue: 'This Month' },
                { userEnteredValue: 'Last 3 Months' },
                { userEnteredValue: 'This Year' }
              ]
            },
            showCustomUi: true
          }
        }
      },
      // Format currency columns
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: 6,
            endRowIndex: 9,
            startColumnIndex: 1,
            endColumnIndex: 2
          },
          cell: {
            userEnteredFormat: {
              numberFormat: { type: 'CURRENCY', pattern: '$#,##0.00' }
            }
          },
          fields: 'userEnteredFormat.numberFormat'
        }
      }
    ];

    await this.batchUpdate(spreadsheetId, requests);
  }

  private async addGoogleAppsScript(spreadsheetId: string) {
    // This would require Google Apps Script API to add custom functions
    // For now, we'll add comments about the functionality
    const scriptContent = `
    // Custom Google Apps Script functions for Bantu Movers
    function onEdit(e) {
      // Auto-refresh calculations when time filter changes
      var range = e.range;
      if (range.getSheet().getName() === 'Financial Dashboard' && range.getA1Notation() === 'B3') {
        refreshDashboard();
      }
    }
    
    function refreshDashboard() {
      // Refresh all calculated values based on time filter
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Financial Dashboard');
      var timeFilter = sheet.getRange('B3').getValue();
      
      // Apply date filtering logic here
      // This would filter the data based on the selected time period
    }
    
    function syncWithPlatform() {
      // Function to sync changes back to the platform
      // This would be called when user wants to push changes back
    }
    `;

    // Note: Actual Google Apps Script deployment would require additional API calls
    console.log('Google Apps Script template created:', scriptContent);
  }

  private async batchUpdate(spreadsheetId: string, requests: any[]) {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests })
    });

    if (!response.ok) {
      throw new Error(`Failed to batch update: ${response.statusText}`);
    }
  }

  private async updateSheetValues(spreadsheetId: string, range: string, values: any[][]) {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
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
