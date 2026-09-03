export interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  userRole: string;
  action: string;
  details: string;
}

class AuditLogger {
  private logs: AuditLog[] = [];

  log(userEmail: string, userRole: string, action: string, details: string) {
    const newLog: AuditLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userEmail,
      userRole,
      action,
      details,
    };
    
    this.logs.push(newLog);
    
    // In a real app, this would be an API call to Supabase or similar
    console.log(`[AUDIT] ${newLog.timestamp} | ${userEmail} (${userRole}) | ${action}: ${details}`);
  }

  getLogs(): AuditLog[] {
    return [...this.logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export const auditLogger = new AuditLogger();
