
export interface TActivityLog {
    action: string;
    description: string;
    metadata?: Record<string, unknown>;
    timestamp: Date;
    createdBy?: string;
}
