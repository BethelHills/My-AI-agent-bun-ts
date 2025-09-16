/**
 * Metrics Service for Code Quality Dashboard
 * Following AI Rules: Type Safety, Security, Performance
 */

import { ProjectMetrics, QualityTrend, CommitStats, ApiResponse } from '../types/dashboard.types.js';

export class MetricsService {
  private cache: Map<string, { data: ProjectMetrics | QualityTrend[] | CommitStats; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get project metrics with caching for performance
   * @returns Promise<ApiResponse<ProjectMetrics>>
   */
  async getProjectMetrics(): Promise<ApiResponse<ProjectMetrics>> {
    try {
      const cacheKey = 'project-metrics';
      const cached = this.getFromCache(cacheKey);
      
      if (cached) {
        return { success: true, data: cached as ProjectMetrics, timestamp: new Date().toISOString() };
      }

      // Simulate API call - in real implementation, this would call actual API
      const metrics: ProjectMetrics = {
        id: 'project-1',
        overallScore: 8.5,
        codeQuality: {
          readability: 9.0,
          maintainability: 8.5,
          security: 8.0,
          performance: 8.5
        },
        commitCount: 42,
        lastUpdated: new Date(),
        trends: await this.generateQualityTrends(30)
      };

      this.setCache(cacheKey, metrics);
      return { success: true, data: metrics, timestamp: new Date().toISOString() };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch project metrics',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get quality trends for specified number of days
   * @param days Number of days to fetch trends for
   * @returns Promise<ApiResponse<QualityTrend[]>>
   */
  async getQualityTrends(days: number): Promise<ApiResponse<QualityTrend[]>> {
    try {
      // Input validation (AI Rule #2: Security)
      if (days < 1 || days > 365) {
        throw new Error('Days must be between 1 and 365');
      }

      const cacheKey = `quality-trends-${days}`;
      const cached = this.getFromCache(cacheKey);
      
      if (cached) {
        return { success: true, data: cached as QualityTrend[], timestamp: new Date().toISOString() };
      }

      const trends = await this.generateQualityTrends(days);
      this.setCache(cacheKey, trends);
      
      return { success: true, data: trends, timestamp: new Date().toISOString() };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch quality trends',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get commit statistics
   * @returns Promise<ApiResponse<CommitStats>>
   */
  async getCommitStats(): Promise<ApiResponse<CommitStats>> {
    try {
      const cacheKey = 'commit-stats';
      const cached = this.getFromCache(cacheKey);
      
      if (cached) {
        return { success: true, data: cached as CommitStats, timestamp: new Date().toISOString() };
      }

      // Simulate API call
      const stats: CommitStats = {
        totalCommits: 156,
        commitsByAuthor: {
          'developer1': 89,
          'developer2': 45,
          'ai-agent': 22
        },
        commitsByDay: this.generateCommitHistory(30),
        averageCommitSize: 3.2
      };

      this.setCache(cacheKey, stats);
      return { success: true, data: stats, timestamp: new Date().toISOString() };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch commit stats',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Subscribe to real-time updates
   * @param callback Function to call when metrics update
   * @returns Cleanup function to stop the subscription
   */
  subscribeToUpdates(callback: (metrics: ProjectMetrics) => void): () => void {
    // In real implementation, this would set up WebSocket connection
    const intervalId = setInterval(async () => {
      const response = await this.getProjectMetrics();
      if (response.success && response.data) {
        callback(response.data);
      }
    }, 30000); // Update every 30 seconds

    // Return cleanup function
    return () => {
      clearInterval(intervalId);
    };
  }

  /**
   * Generate quality trends for specified days
   * @private
   */
  private async generateQualityTrends(days: number): Promise<QualityTrend[]> {
    const trends: QualityTrend[] = [];
    const categories: (keyof ProjectMetrics['codeQuality'])[] = ['readability', 'maintainability', 'security', 'performance'];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      for (const category of categories) {
        trends.push({
          date,
          score: 7 + Math.random() * 2, // Simulate score between 7-9
          category
        });
      }
    }
    
    return trends.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Generate commit history for specified days
   * @private
   */
  private generateCommitHistory(days: number): Record<string, number> {
    const history: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      history[dateStr] = Math.floor(Math.random() * 10);
    }
    return history;
  }

  /**
   * Get data from cache if valid
   * @private
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set data in cache
   * @private
   */
  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}
