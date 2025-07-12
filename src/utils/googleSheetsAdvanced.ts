import { GoogleSheetsSync } from './googleSheetsSync';

export interface AdvancedGoogleSheetsConfig {
  spreadsheetId: string;
  accessToken: string;
}

export class AdvancedGoogleSheetsManager extends GoogleSheetsSync {
  constructor(config: AdvancedGoogleSheetsConfig) {
    super({
      spreadsheetId: config.spreadsheetId,
      clientSheetName: 'Clients',
      jobsSheetName: 'Jobs', 
      leadsSheetName: 'Leads'
    }, config.accessToken);
  }

  // Create a comprehensive Financial Reports sheet that mirrors the UI
  async createFinancialReportsSheet(data: any) {
    console.log('🔄 Creating advanced spreadsheet...');
    const spreadsheetId = await this.createAdvancedSpreadsheet();
    console.log('✅ Spreadsheet created:', spreadsheetId);
    
    await this.setupAdvancedSheetsStructure(spreadsheetId, data);
    console.log('✅ Sheet structure setup complete');
    
    // Skip complex formatting for now to avoid API errors
    console.log('✅ Advanced Financial Dashboard created successfully');
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
              gridProperties: { rowCount: 100, columnCount: 20 }
            }
          },
          {
            properties: {
              title: 'Revenue Analysis',
              gridProperties: { rowCount: 100, columnCount: 15 }
            }
          },
          {
            properties: {
              title: 'Jobs Data',
              gridProperties: { rowCount: 1000, columnCount: 25 }
            }
          },
          {
            properties: {
              title: 'Leads Data',
              gridProperties: { rowCount: 1000, columnCount: 15 }
            }
          },
          {
            properties: {
              title: 'Clients Data',
              gridProperties: { rowCount: 1000, columnCount: 15 }
            }
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create spreadsheet:', errorText);
      throw new Error(`Failed to create spreadsheet: ${response.statusText}`);
    }

    const result = await response.json();
    return result.spreadsheetId;
  }

  private async setupAdvancedSheetsStructure(spreadsheetId: string, data: any) {
    console.log('🔄 Setting up sheet structure...');
    
    // Create Financial Dashboard Sheet
    await this.createFinancialDashboard(spreadsheetId, data);
    console.log('✅ Financial dashboard created');
    
    // Create Revenue Analysis Sheet  
    await this.createRevenueAnalysisSheet(spreadsheetId, data);
    console.log('✅ Revenue analysis created');
    
    // Create detailed data sheets
    await this.createJobsDataSheet(spreadsheetId, data.jobs || []);
    console.log('✅ Jobs data sheet created');
    
    await this.createLeadsDataSheet(spreadsheetId, data.leads || []);
    console.log('✅ Leads data sheet created');
    
    await this.createClientsDataSheet(spreadsheetId, data.clients || []);
    console.log('✅ Clients data sheet created');

    // Add simple formatting (avoiding complex batch updates that cause errors)
    await this.addBasicFormatting(spreadsheetId);
    console.log('✅ Basic formatting applied');
  }

  private async createFinancialDashboard(spreadsheetId: string, data: any) {
    const dashboardData = [
      ['BANTU MOVERS - FINANCIAL DASHBOARD', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['Time Filter:', 'All Time', '', 'Last Updated:', new Date().toLocaleString(), '', ''],
      ['', '', '', '', '', '', ''],
      ['📊 SUMMARY METRICS', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['Total Revenue', '=SUM(\'Jobs Data\'!N:N)', '💰', 'Completed Jobs', '=COUNTIF(\'Jobs Data\'!F:F,"completed")', '✅', ''],
      ['Paid Revenue', '=SUMIF(\'Jobs Data\'!L:L,TRUE,\'Jobs Data\'!N:N)', '✅', 'Average Job Value', '=AVERAGE(\'Jobs Data\'!N:N)', '📈', ''],
      ['Unpaid Revenue', '=SUM(\'Jobs Data\'!N:N)-SUMIF(\'Jobs Data\'!L:L,TRUE,\'Jobs Data\'!N:N)', '⏳', 'Total Leads', '=COUNTA(\'Leads Data\'!A:A)-1', '🎯', ''],
      ['', '', '', '', '', '', ''],
      ['💼 REVENUE BY SOURCE', '', '', '', '', '', ''],
      ['Source', 'Revenue', 'Jobs', 'Leads', 'Conversion %', 'Performance', ''],
      ['Google Ads', '=SUMIF(\'Leads Data\'!E:E,"google_ads",\'Jobs Data\'!N:N)', '=COUNTIFS(\'Leads Data\'!E:E,"google_ads",\'Jobs Data\'!F:F,"completed")', '=COUNTIF(\'Leads Data\'!E:E,"google_ads")', '=IF(M13>0,L13/M13*100,0)', '=IF(N13>10,"🔥",IF(N13>5,"👍","📈"))', ''],
      ['Facebook', '=SUMIF(\'Leads Data\'!E:E,"facebook",\'Jobs Data\'!N:N)', '=COUNTIFS(\'Leads Data\'!E:E,"facebook",\'Jobs Data\'!F:F,"completed")', '=COUNTIF(\'Leads Data\'!E:E,"facebook")', '=IF(M14>0,L14/M14*100,0)', '=IF(N14>10,"🔥",IF(N14>5,"👍","📈"))', ''],
      ['Referral', '=SUMIF(\'Leads Data\'!E:E,"referral",\'Jobs Data\'!N:N)', '=COUNTIFS(\'Leads Data\'!E:E,"referral",\'Jobs Data\'!F:F,"completed")', '=COUNTIF(\'Leads Data\'!E:E,"referral")', '=IF(M15>0,L15/M15*100,0)', '=IF(N15>10,"🔥",IF(N15>5,"👍","📈"))', ''],
      ['Website', '=SUMIF(\'Leads Data\'!E:E,"website",\'Jobs Data\'!N:N)', '=COUNTIFS(\'Leads Data\'!E:E,"website",\'Jobs Data\'!F:F,"completed")', '=COUNTIF(\'Leads Data\'!E:E,"website")', '=IF(M16>0,L16/M16*100,0)', '=IF(N16>10,"🔥",IF(N16>5,"👍","📈"))', ''],
      ['Other', '=SUMIF(\'Leads Data\'!E:E,"other",\'Jobs Data\'!N:N)', '=COUNTIFS(\'Leads Data\'!E:E,"other",\'Jobs Data\'!F:F,"completed")', '=COUNTIF(\'Leads Data\'!E:E,"other")', '=IF(M17>0,L17/M17*100,0)', '=IF(N17>10,"🔥",IF(N17>5,"👍","📈"))', ''],
      ['', '', '', '', '', '', ''],
      ['💳 PAYMENT STATUS', '', '', '', '', '', ''],
      ['Status', 'Count', 'Amount', 'Percentage', 'Action Needed', '', ''],
      ['Paid Jobs', '=COUNTIF(\'Jobs Data\'!L:L,TRUE)', '=SUMIF(\'Jobs Data\'!L:L,TRUE,\'Jobs Data\'!N:N)', '=IF(J21>0,J21/(J21+J22)*100,0)', '=IF(L21<80,"Follow up needed","✅")', '', ''],
      ['Unpaid Jobs', '=COUNTIF(\'Jobs Data\'!L:L,FALSE)', '=SUMIF(\'Jobs Data\'!L:L,FALSE,\'Jobs Data\'!N:N)', '=IF(J22>0,J22/(J21+J22)*100,0)', '=IF(J22>5,"🚨 Priority","📋")', '', ''],
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
      ['Current Month', '=SUMIF(\'Jobs Data\'!E:E,">="&EOMONTH(TODAY(),-1)+1,\'Jobs Data\'!N:N)', '=COUNTIFS(\'Jobs Data\'!E:E,">="&EOMONTH(TODAY(),-1)+1,\'Jobs Data\'!F:F,"completed")', '=IF(C5>0,B5/C5,0)', '0%', '📈'],
      ['Previous Month', '=SUMIFS(\'Jobs Data\'!N:N,\'Jobs Data\'!E:E,">="&EOMONTH(TODAY(),-2)+1,\'Jobs Data\'!E:E,"<="&EOMONTH(TODAY(),-1))', '=COUNTIFS(\'Jobs Data\'!E:E,">="&EOMONTH(TODAY(),-2)+1,\'Jobs Data\'!E:E,"<="&EOMONTH(TODAY(),-1),\'Jobs Data\'!F:F,"completed")', '=IF(C6>0,B6/C6,0)', '=IF(B5>B6,(B5-B6)/B6,0)', '📊'],
      ['', '', '', '', '', ''],
      ['🎯 Lead Source Performance', '', '', '', '', ''],
      ['Source', 'Cost', 'Revenue', 'ROI', 'Conversion Rate', 'Score'],
      ['Google Ads', '=SUMIF(\'Leads Data\'!E:E,"google_ads",\'Leads Data\'!G:G)', '=SUMIF(\'Leads Data\'!E:E,"google_ads",\'Jobs Data\'!N:N)', '=IF(B10>0,(C10-B10)/B10*100,0)', '=COUNTIFS(\'Leads Data\'!E:E,"google_ads")/COUNTIF(\'Leads Data\'!E:E,"google_ads")*100', '=IF(D10>100,"🔥",IF(D10>50,"👍","📈"))'],
      ['Facebook', '=SUMIF(\'Leads Data\'!E:E,"facebook",\'Leads Data\'!G:G)', '=SUMIF(\'Leads Data\'!E:E,"facebook",\'Jobs Data\'!N:N)', '=IF(B11>0,(C11-B11)/B11*100,0)', '=COUNTIFS(\'Leads Data\'!E:E,"facebook")/COUNTIF(\'Leads Data\'!E:E,"facebook")*100', '=IF(D11>100,"🔥",IF(D11>50,"👍","📈"))'],
      ['', '', '', '', '', ''],
      ['📊 Business Metrics', '', '', '', '', ''],
      ['Metric', 'Current', 'Target', 'Status', 'Action', ''],
      ['Revenue Growth', '=IF(B6>0,(B5-B6)/B6*100,0)', '20%', '=IF(B15>20,"✅","⚠️")', '=IF(B15<20,"Increase marketing","Maintain")', ''],
      ['Customer Acquisition Cost', '=SUM(\'Leads Data\'!G:G)/COUNTA(\'Leads Data\'!A2:A1000)', '$50', '=IF(B16<50,"✅","⚠️")', '=IF(B16>50,"Optimize ads","Good")', ''],
      ['Average Job Value', '=AVERAGE(\'Jobs Data\'!N:N)', '$500', '=IF(B17>500,"✅","⚠️")', '=IF(B17<500,"Upsell services","Good")', ''],
    ];

    await this.updateSheetValues(spreadsheetId, 'Revenue Analysis!A1:F18', analysisData);
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

  private async addBasicFormatting(spreadsheetId: string) {
    try {
      // Simple formatting requests that are less likely to cause errors
      const requests = [
        // Format header row of Financial Dashboard
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
                textFormat: { bold: true, fontSize: 14 }
              }
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat)'
          }
        }
      ];

      await this.batchUpdate(spreadsheetId, requests);
    } catch (error) {
      console.warn('Basic formatting failed, but sheet was created successfully:', error);
      // Don't throw error - the sheet is functional without formatting
    }
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
      const errorText = await response.text();
      console.error('Batch update failed:', errorText);
      throw new Error(`Failed to batch update: ${response.statusText}`);
    }

    return await response.json();
  }
}
