/**
 * Type definitions for the Code Metrics Dashboard
 * Following AI Rule #1: Type Safety First
 */

export interface ProjectMetrics {
  id: string;
  overallScore: number;
  codeQuality: QualityBreakdown;
  commitCount: number;
  lastUpdated: Date;
  trends: QualityTrend[];
}

export interface QualityBreakdown {
  readability: number;
  maintainability: number;
  security: number;
  performance: number;
}

export interface QualityTrend {
  date: Date;
  score: number;
  category: keyof QualityBreakdown;
}

export interface CommitStats {
  totalCommits: number;
  commitsByAuthor: Record<string, number>;
  commitsByDay: Record<string, number>;
  averageCommitSize: number;
}

export interface Commit {
  hash: string;
  author: string;
  message: string;
  date: Date;
  filesChanged: number;
  qualityScore?: number;
}

export interface FileStats {
  totalFiles: number;
  filesByType: Record<string, number>;
  averageFileSize: number;
  largestFiles: Array<{name: string, size: number}>;
}

// API Response Types (Following AI Rule #3: Performance Optimization)
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Component Props
export interface MetricsCardProps {
  title: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  color: 'green' | 'yellow' | 'red';
  loading?: boolean;
  onClick?: () => void;
}

export interface QualityChartProps {
  data: QualityTrend[];
  timeRange: '7d' | '30d' | '90d';
  onTimeRangeChange: (range: '7d' | '30d' | '90d') => void;
}

// Service Interfaces
export interface MetricsService {
  getProjectMetrics(): Promise<ApiResponse<ProjectMetrics>>;
  getQualityTrends(days: number): Promise<ApiResponse<QualityTrend[]>>;
  getCommitStats(): Promise<ApiResponse<CommitStats>>;
  subscribeToUpdates(callback: (metrics: ProjectMetrics) => void): void;
}

export interface GitService {
  getRecentCommits(limit: number): Promise<ApiResponse<Commit[]>>;
  getFileChangeStats(): Promise<ApiResponse<FileStats>>;
  getCommitHistory(startDate: Date, endDate: Date): Promise<ApiResponse<Commit[]>>;
}

export interface AuthService {
  authenticate(token: string): Promise<ApiResponse<{userId: string, accessToken: string}>>;
  authorize(userId: string, resource: string): Promise<ApiResponse<boolean>>;
  refreshToken(token: string): Promise<ApiResponse<string>>;
}
