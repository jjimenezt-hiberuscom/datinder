import { MockDatasource } from './mock/MockDatasource';
import { SupabaseDatasource } from './supabase/SupabaseDatasource';
import type { Datasource } from './Datasource';

const useMock = import.meta.env.VITE_USE_MOCK !== 'false';

export const db: Datasource = useMock ? new MockDatasource() : new SupabaseDatasource();
