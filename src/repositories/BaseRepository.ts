import { supabase } from "@/lib/supabase";
import { PostgrestError } from "@supabase/supabase-js";

export interface RepositoryResult<T> {
  data: T | null;
  error: PostgrestError | Error | null;
}

export interface RepositoryListResult<T> {
  data: T[];
  error: PostgrestError | Error | null;
}

export abstract class BaseRepository<T> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async findById(id: string): Promise<RepositoryResult<T>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("id", id)
        .single();

      return { data: data as T, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async findAll(
    filters?: Record<string, any>
  ): Promise<RepositoryListResult<T>> {
    try {
      let query = supabase.from(this.tableName).select("*");

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query;
      return { data: (data as T[]) || [], error };
    } catch (error) {
      return { data: [], error: error as Error };
    }
  }

  async create(item: Partial<T>): Promise<RepositoryResult<T>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([item])
        .select()
        .single();

      return { data: data as T, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async update(id: string, updates: Partial<T>): Promise<RepositoryResult<T>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      return { data: data as T, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async delete(id: string): Promise<RepositoryResult<void>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq("id", id);

      return { data: null, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async upsert(item: Partial<T>): Promise<RepositoryResult<T>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .upsert(item)
        .select()
        .single();

      return { data: data as T, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}
