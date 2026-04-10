-- ============================================
-- SCRIPT DE DIAGNÓSTICO: Sistema de Pagamento
-- ============================================
-- Este script verifica o estado do sistema de pagamento
-- e identifica eventos problemáticos que precisam ser corrigidos

-- 1. ESTATÍSTICAS GERAIS
-- ============================================
SELECT 
    '📊 ESTATÍSTICAS GERAIS' as section,
    COUNT(*) FILTER (WHERE is_trial = true) as eventos_em_trial,
    COUNT(*) FILTER (WHERE is_trial = false) as eventos_pagos,
    COUNT(*) as total_eventos
FROM events;

-- 2. EVENTOS PROBLEMÁTICOS: PAGOS MAS EM TRIAL
-- ============================================
SELECT 
    '🚨 EVENTOS PROBLEMÁTICOS (PAGOS MAS EM TRIAL)' as section,
    e.id as event_id,
    e.name as event_name,
    e.created_at as event_created,
    e.is_trial,
    e.subscription_id as event_subscription_id,
    s.id as subscription_id,
    s.status as subscription_status,
    s.plan_type,
    s.amount,
    s.created_at as subscription_created,
    s.external_subscription_id as stripe_session_id
FROM events e
INNER JOIN subscriptions s ON e.id = s.event_id
WHERE s.status = 'active'
  AND e.is_trial = true
ORDER BY e.created_at DESC;

-- 3. TRANSAÇÕES APROVADAS MAS EVENTO EM TRIAL
-- ============================================
SELECT 
    '💰 PAGAMENTOS APROVADOS MAS EVENTO AINDA EM TRIAL' as section,
    e.id as event_id,
    e.name as event_name,
    e.is_trial,
    pt.id as transaction_id,
    pt.status as payment_status,
    pt.amount,
    pt.approved_at,
    pt.payment_method,
    s.plan_type
FROM events e
INNER JOIN subscriptions s ON e.id = s.event_id
INNER JOIN payment_transactions pt ON s.id = pt.subscription_id
WHERE e.is_trial = true
  AND pt.status = 'approved'
ORDER BY pt.approved_at DESC;

-- 4. SUBSCRIPTIONS PENDENTES (AGUARDANDO PAGAMENTO)
-- ============================================
SELECT 
    '⏳ SUBSCRIPTIONS PENDENTES' as section,
    e.id as event_id,
    e.name as event_name,
    s.id as subscription_id,
    s.status,
    s.plan_type,
    s.amount,
    s.created_at,
    s.external_subscription_id,
    EXTRACT(EPOCH FROM (NOW() - s.created_at))/3600 as hours_pending
FROM events e
INNER JOIN subscriptions s ON e.id = s.event_id
WHERE s.status = 'pending'
ORDER BY s.created_at DESC;

-- 5. EVENTOS SEM SUBSCRIPTION (OK SE EM TRIAL)
-- ============================================
SELECT 
    '📝 EVENTOS SEM SUBSCRIPTION' as section,
    e.id as event_id,
    e.name as event_name,
    e.is_trial,
    e.created_at,
    CASE 
        WHEN e.is_trial = true THEN '✅ OK (Trial normal)'
        ELSE '⚠️ WARNING (Não trial sem subscription)'
    END as status
FROM events e
LEFT JOIN subscriptions s ON e.id = s.event_id
WHERE s.id IS NULL
ORDER BY e.created_at DESC
LIMIT 10;

-- 6. ÚLTIMAS CONVERSÕES BEM-SUCEDIDAS
-- ============================================
SELECT 
    '✅ ÚLTIMAS CONVERSÕES BEM-SUCEDIDAS' as section,
    e.id as event_id,
    e.name as event_name,
    e.is_trial,
    e.subscription_id,
    s.status as subscription_status,
    s.plan_type,
    s.amount,
    s.created_at as subscription_created
FROM events e
INNER JOIN subscriptions s ON e.id = s.event_id AND e.subscription_id = s.id
WHERE e.is_trial = false
  AND s.status = 'active'
ORDER BY s.created_at DESC
LIMIT 5;

-- 7. CONTAGEM DE PROBLEMAS
-- ============================================
WITH problem_counts AS (
    SELECT 
        COUNT(*) FILTER (
            WHERE s.status = 'active' AND e.is_trial = true
        ) as paid_but_trial,
        COUNT(*) FILTER (
            WHERE pt.status = 'approved' AND e.is_trial = true
        ) as approved_but_trial,
        COUNT(*) FILTER (
            WHERE s.status = 'pending' AND 
                  EXTRACT(EPOCH FROM (NOW() - s.created_at))/3600 > 1
        ) as pending_over_1h
    FROM events e
    LEFT JOIN subscriptions s ON e.id = s.event_id
    LEFT JOIN payment_transactions pt ON s.id = pt.subscription_id
)
SELECT 
    '📈 RESUMO DE PROBLEMAS' as section,
    paid_but_trial as eventos_pagos_em_trial,
    approved_but_trial as pagamentos_aprovados_em_trial,
    pending_over_1h as subscriptions_pendentes_1h,
    CASE 
        WHEN paid_but_trial = 0 AND approved_but_trial = 0 
        THEN '✅ Nenhum problema crítico'
        ELSE '🚨 AÇÃO NECESSÁRIA'
    END as status
FROM problem_counts;

-- ============================================
-- INSTRUÇÕES DE CORREÇÃO
-- ============================================

-- Se encontrou eventos problemáticos, você pode:

-- OPÇÃO 1: Usar a função SQL para converter um evento específico
-- SELECT * FROM convert_trial_to_paid(
--     'UUID_DO_EVENTO'::uuid,
--     'UUID_DA_SUBSCRIPTION'::uuid
-- );

-- OPÇÃO 2: Usar a edge function via JavaScript
-- const { data } = await supabase.functions.invoke('fix-trial-conversion', {
--   body: { eventId: 'UUID_DO_EVENTO' }
-- });

-- OPÇÃO 3: Corrigir em massa (cuidado!)
-- DO $$
-- DECLARE
--     rec RECORD;
-- BEGIN
--     FOR rec IN (
--         SELECT e.id as event_id, s.id as subscription_id
--         FROM events e
--         INNER JOIN subscriptions s ON e.id = s.event_id
--         WHERE s.status = 'active' AND e.is_trial = true
--     ) LOOP
--         PERFORM convert_trial_to_paid(rec.event_id, rec.subscription_id);
--     END LOOP;
-- END $$;
