// System validation utilities to ensure all features work correctly

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class SystemValidator {
  static validateJobData(jobData: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!jobData.client_name?.trim()) {
      errors.push('Client name is required');
    }
    
    if (!jobData.client_phone?.trim()) {
      errors.push('Client phone is required');
    }
    
    if (!jobData.origin_address?.trim()) {
      errors.push('Origin address is required');
    }
    
    if (!jobData.destination_address?.trim()) {
      errors.push('Destination address is required');
    }
    
    if (!jobData.job_date) {
      errors.push('Job date is required');
    }
    
    if (!jobData.start_time) {
      errors.push('Start time is required');
    }

    // Numeric validation
    if (!jobData.hourly_rate || jobData.hourly_rate <= 0) {
      errors.push('Hourly rate must be greater than 0');
    }
    
    if (!jobData.movers_needed || jobData.movers_needed <= 0) {
      errors.push('Number of movers must be greater than 0');
    }
    
    if (!jobData.estimated_total || jobData.estimated_total <= 0) {
      errors.push('Estimated total must be greater than 0');
    }

    // Warnings
    if (jobData.client_id === '') {
      warnings.push('client_id should be null, not empty string');
    }
    
    if (jobData.hourly_rate < 15) {
      warnings.push('Hourly rate seems low (below $15/hour)');
    }
    
    if (jobData.estimated_total > 50000) {
      warnings.push('Estimated total is very high (over $50,000)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateTimeEntryData(timeEntryData: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!timeEntryData.employee_id) {
      errors.push('Employee ID is required');
    }
    
    if (!timeEntryData.entry_date) {
      errors.push('Entry date is required');
    }
    
    if (!timeEntryData.clock_in_time) {
      errors.push('Clock in time is required');
    }
    
    if (!timeEntryData.clock_out_time) {
      errors.push('Clock out time is required');
    }
    
    if (!timeEntryData.hourly_rate || timeEntryData.hourly_rate <= 0) {
      errors.push('Hourly rate must be greater than 0');
    }

    // Time validation
    if (timeEntryData.clock_in_time && timeEntryData.clock_out_time) {
      const clockIn = new Date(timeEntryData.clock_in_time);
      const clockOut = new Date(timeEntryData.clock_out_time);
      
      if (clockOut <= clockIn) {
        errors.push('Clock out time must be after clock in time');
      }
      
      const hoursDiff = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
      if (hoursDiff > 24) {
        warnings.push('Time entry spans more than 24 hours');
      }
    }

    // Hours validation
    if (timeEntryData.regular_hours < 0) {
      errors.push('Regular hours cannot be negative');
    }
    
    if (timeEntryData.overtime_hours && timeEntryData.overtime_hours < 0) {
      errors.push('Overtime hours cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateEmployeeData(employeeData: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!employeeData.name?.trim()) {
      errors.push('Employee name is required');
    }
    
    if (!employeeData.phone?.trim()) {
      errors.push('Phone number is required');
    }
    
    if (!employeeData.hourly_wage || employeeData.hourly_wage <= 0) {
      errors.push('Hourly wage must be greater than 0');
    }

    // Validation warnings
    if (employeeData.hourly_wage < 15) {
      warnings.push('Hourly wage is below minimum wage in many areas');
    }
    
    if (employeeData.hourly_wage > 100) {
      warnings.push('Hourly wage is unusually high');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateClientData(clientData: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!clientData.name?.trim()) {
      errors.push('Client name is required');
    }
    
    if (!clientData.phone?.trim()) {
      errors.push('Phone number is required');
    }
    
    if (!clientData.primary_address?.trim()) {
      errors.push('Primary address is required');
    }

    // Email validation
    if (clientData.email && !/\S+@\S+\.\S+/.test(clientData.email)) {
      errors.push('Invalid email format');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Comprehensive system check
  static async runSystemCheck(): Promise<{
    database: boolean;
    authentication: boolean;
    features: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    let database = true;
    let authentication = true;
    let features = true;

    try {
      // Test database connection
      const { supabase } = await import('@/integrations/supabase/client');
      const { error: dbError } = await supabase.from('jobs').select('count').limit(1);
      
      if (dbError) {
        database = false;
        errors.push(`Database connection error: ${dbError.message}`);
      }

      // Test authentication
      const { data: session, error: authError } = await supabase.auth.getSession();
      if (authError) {
        authentication = false;
        errors.push(`Authentication error: ${authError.message}`);
      }

    } catch (error: any) {
      features = false;
      errors.push(`System error: ${error.message}`);
    }

    return {
      database,
      authentication,
      features,
      errors
    };
  }
}

// Utility function to ensure data integrity before database operations
export function sanitizeDataForDatabase(data: any): any {
  const sanitized = { ...data };
  
  // Convert empty strings to null for UUID fields
  if (sanitized.client_id === '') {
    sanitized.client_id = null;
  }
  
  if (sanitized.job_id === '') {
    sanitized.job_id = null;
  }
  
  if (sanitized.lead_id === '') {
    sanitized.lead_id = null;
  }

  // Ensure numeric fields are proper numbers
  if (sanitized.hourly_rate) {
    sanitized.hourly_rate = Number(sanitized.hourly_rate);
  }
  
  if (sanitized.estimated_total) {
    sanitized.estimated_total = Number(sanitized.estimated_total);
  }
  
  if (sanitized.movers_needed) {
    sanitized.movers_needed = Number(sanitized.movers_needed);
  }

  // Clean up empty strings to null for optional text fields
  const textFields = ['truck_size', 'special_requirements', 'notes', 'completion_notes', 'payment_method'];
  textFields.forEach(field => {
    if (sanitized[field] === '') {
      sanitized[field] = null;
    }
  });

  return sanitized;
}