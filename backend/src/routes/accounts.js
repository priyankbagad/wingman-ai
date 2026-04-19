import { Router } from 'express';
import { supabase } from '../services/supabase.js';

const router = Router();

router.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('accounts')
    .select('id, name, industry, contract_value, renewal_date, health_score')
    .order('health_score', { ascending: true });

  if (error) {
    console.error('Supabase accounts fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch accounts' });
  }

  res.json({ accounts: data });
});

export default router;
