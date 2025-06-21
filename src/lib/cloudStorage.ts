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
  // Save data to cloud
  async saveData(userId: string, dataType: string, data: any): Promise<CloudData> {
    if (!supabase) throw new Error('Supabase not configured');
    
    // Check if data already exists
    const { data: existingData } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', userId)
      .eq('data_type', dataType)
      .single();
    
    if (existingData) {
      // Update existing data
      const { data: updatedData, error } = await supabase
        .from('user_data')
        .update({ data })
        .eq('id', existingData.id)
        .select()
        .single();
      
      if (error) throw error;
      return updatedData;
    } else {
      // Insert new data
      const { data: newData, error } = await supabase
        .from('user_data')
        .insert({
          user_id: userId,
          data_type: dataType,
          data
        })
        .select()
        .single();
      
      if (error) throw error;
      return newData;
    }
  },

  // Load data from cloud
  async loadData(userId: string, dataType: string): Promise<any> {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('user_data')
      .select('data')
      .eq('user_id', userId)
      .eq('data_type', dataType)
      .single();
    
    if (error) {
      console.error('Error loading cloud data:', error);
      return null;
    }
    
    return data?.data;
  },

  // Get all user data
  async getAllUserData(userId: string): Promise<CloudData[]> {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user data:', error);
      return [];
    }
    
    return data || [];
  },

  // Sync local data to cloud
  async syncToCloud(userId: string, currency: string) {
    try {
      // Sync denomination counts
      const counts = localStorage.getItem(`denominationCounts_${currency}`);
      if (counts) {
        await this.saveData(userId, `denominationCounts_${currency}`, JSON.parse(counts));
      }

      // Sync history
      const history = localStorage.getItem(`countNoteHistory_${currency}`);
      if (history) {
        await this.saveData(userId, `countNoteHistory_${currency}`, JSON.parse(history));
      }

      // Sync calculator history
      const calcHistory = localStorage.getItem('calculatorHistory');
      if (calcHistory) {
        await this.saveData(userId, 'calculatorHistory', JSON.parse(calcHistory));
      }

      return true;
    } catch (error) {
      console.error('Error syncing to cloud:', error);
      return false;
    }
  },

  // Sync cloud data to local
  async syncFromCloud(userId: string, currency: string) {
    try {
      // Sync denomination counts
      const counts = await this.loadData(userId, `denominationCounts_${currency}`);
      if (counts) {
        localStorage.setItem(`denominationCounts_${currency}`, JSON.stringify(counts));
      }

      // Sync history
      const history = await this.loadData(userId, `countNoteHistory_${currency}`);
      if (history) {
        localStorage.setItem(`countNoteHistory_${currency}`, JSON.stringify(history));
      }

      // Sync calculator history
      const calcHistory = await this.loadData(userId, 'calculatorHistory');
      if (calcHistory) {
        localStorage.setItem('calculatorHistory', JSON.stringify(calcHistory));
      }

      return true;
    } catch (error) {
      console.error('Error syncing from cloud:', error);
      return false;
    }
  }
};