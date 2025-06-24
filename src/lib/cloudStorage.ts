import { supabase } from './supabase';

export interface CloudData {
  id: string;
  user_id: string;
  data_type: string;
  data: any;
  created_at: string;
  updated_at: string;
}

export const cloudStorageService = {
  // Save data to cloud with better conflict resolution
  async saveData(userId: string, dataType: string, data: any): Promise<CloudData> {
    if (!supabase) throw new Error('Supabase not configured');
    
    // Use upsert for better multi-device sync
    const { data: upsertedData, error } = await supabase
      .from('user_data')
      .upsert({
        user_id: userId,
        data_type: dataType,
        data: data
      }, {
        onConflict: 'user_id,data_type',
        ignoreDuplicates: false
      })
      .select()
      .single();
    
    if (error) throw error;
    return upsertedData;
  },

  // Load data from cloud with better error handling
  async loadData(userId: string, dataType: string): Promise<any> {
    if (!supabase) return null;
    
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('data, updated_at')
        .eq('user_id', userId)
        .eq('data_type', dataType)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No data found, return null
          return null;
        }
        throw error;
      }
      
      return data?.data;
    } catch (error) {
      console.error('Error loading cloud data:', error);
      return null;
    }
  },

  // Get all user data with pagination
  async getAllUserData(userId: string, limit: number = 50): Promise<CloudData[]> {
    if (!supabase) return [];
    
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user data:', error);
      return [];
    }
  },

  // Sync local data to cloud with conflict resolution
  async syncToCloud(userId: string, currency: string) {
    try {
      const syncPromises = [];

      // Sync denomination counts
      const counts = localStorage.getItem(`denominationCounts_${currency}`);
      if (counts) {
        syncPromises.push(
          this.saveData(userId, `denominationCounts_${currency}`, JSON.parse(counts))
        );
      }

      // Sync history
      const history = localStorage.getItem(`countNoteHistory_${currency}`);
      if (history) {
        syncPromises.push(
          this.saveData(userId, `countNoteHistory_${currency}`, JSON.parse(history))
        );
      }

      // Sync calculator history
      const calcHistory = localStorage.getItem('calculatorHistory');
      if (calcHistory) {
        syncPromises.push(
          this.saveData(userId, 'calculatorHistory', JSON.parse(calcHistory))
        );
      }

      await Promise.all(syncPromises);
      return true;
    } catch (error) {
      console.error('Error syncing to cloud:', error);
      return false;
    }
  },

  // Sync cloud data to local with merge strategy
  async syncFromCloud(userId: string, currency: string) {
    try {
      // Sync denomination counts
      const counts = await this.loadData(userId, `denominationCounts_${currency}`);
      if (counts) {
        localStorage.setItem(`denominationCounts_${currency}`, JSON.stringify(counts));
      }

      // Sync history with merge
      const cloudHistory = await this.loadData(userId, `countNoteHistory_${currency}`);
      if (cloudHistory) {
        const localHistory = JSON.parse(localStorage.getItem(`countNoteHistory_${currency}`) || '[]');
        
        // Merge histories, avoiding duplicates
        const mergedHistory = this.mergeHistories(localHistory, cloudHistory);
        localStorage.setItem(`countNoteHistory_${currency}`, JSON.stringify(mergedHistory));
      }

      // Sync calculator history with merge
      const cloudCalcHistory = await this.loadData(userId, 'calculatorHistory');
      if (cloudCalcHistory) {
        const localCalcHistory = JSON.parse(localStorage.getItem('calculatorHistory') || '[]');
        
        // Merge calculator histories
        const mergedCalcHistory = this.mergeCalculatorHistories(localCalcHistory, cloudCalcHistory);
        localStorage.setItem('calculatorHistory', JSON.stringify(mergedCalcHistory));
      }

      return true;
    } catch (error) {
      console.error('Error syncing from cloud:', error);
      return false;
    }
  },

  // Merge histories avoiding duplicates
  mergeHistories(local: any[], cloud: any[]): any[] {
    const merged = [...local];
    
    cloud.forEach(cloudItem => {
      const exists = merged.find(localItem => 
        localItem.id === cloudItem.id || 
        (localItem.date === cloudItem.date && localItem.totalAmount === cloudItem.totalAmount)
      );
      
      if (!exists) {
        merged.push(cloudItem);
      }
    });
    
    // Sort by date (newest first) and limit to 100 entries
    return merged
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 100);
  },

  // Merge calculator histories
  mergeCalculatorHistories(local: any[], cloud: any[]): any[] {
    const merged = [...local];
    
    cloud.forEach(cloudItem => {
      const exists = merged.find(localItem => 
        localItem.timestamp === cloudItem.timestamp && 
        localItem.expression === cloudItem.expression
      );
      
      if (!exists) {
        merged.push(cloudItem);
      }
    });
    
    // Sort by timestamp (newest first) and limit to 50 entries
    return merged
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);
  }
};