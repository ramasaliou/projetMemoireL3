-- =====================================================
-- SCRIPT DE VÉRIFICATION ET CORRECTION POUR LE PROFESSEUR WEYDEE HECTOR
-- =====================================================

-- 1. VÉRIFICATIONS INITIALES
-- =====================================================

-- Voir tous les professeurs
SELECT '=== PROFESSEURS ===' as info;
SELECT id, name, email, subject, class FROM users WHERE role = 'teacher';

-- Voir toutes les classes
SELECT '=== CLASSES ===' as info;
SELECT id, name, teacherId, subject, level FROM classes;

-- Voir les élèves
SELECT '=== ÉLÈVES ===' as info;
SELECT id, name, email, class FROM users WHERE role = 'student';

-- 2. VÉRIFIER LE PROFESSEUR WEYDEE HECTOR
-- =====================================================
SELECT '=== PROFESSEUR WEYDEE HECTOR ===' as info;
SELECT id, name, email, subject, class FROM users 
WHERE name LIKE '%weydee%' OR name LIKE '%Hector%' AND role = 'teacher';

-- 3. VÉRIFIER LES CLASSES ASSIGNÉES
-- =====================================================
SELECT '=== CLASSES ASSIGNÉES AUX PROFESSEURS ===' as info;
SELECT 
    c.id,
    c.name as classe,
    c.teacherId,
    t.name as professeur,
    t.email as email_prof
FROM classes c
LEFT JOIN users t ON c.teacherId = t.id
ORDER BY c.name;

-- 4. VÉRIFIER LES ÉLÈVES PAR CLASSE
-- =====================================================
SELECT '=== ÉLÈVES PAR CLASSE ===' as info;
SELECT 
    class,
    COUNT(*) as nombre_eleves,
    GROUP_CONCAT(name SEPARATOR ', ') as eleves
FROM users 
WHERE role = 'student' 
GROUP BY class;

-- 5. DIAGNOSTIC DU PROBLÈME
-- =====================================================
SELECT '=== DIAGNOSTIC ===' as info;
SELECT 
    'Professeur weydee Hector a-t-il une classe assignée ?' as question,
    CASE 
        WHEN EXISTS(SELECT 1 FROM classes WHERE teacherId = (SELECT id FROM users WHERE name LIKE '%weydee%' OR name LIKE '%Hector%' AND role = 'teacher'))
        THEN 'OUI'
        ELSE 'NON - C''est le problème !'
    END as reponse;

-- 6. CORRECTION AUTOMATIQUE (à décommenter si nécessaire)
-- =====================================================
/*
-- Créer/assigner la classe 3ème A au professeur weydee Hector
INSERT INTO classes (name, teacherId, subject, level, academic_year, created_at, updated_at)
VALUES (
    '3ème A',
    (SELECT id FROM users WHERE (name LIKE '%weydee%' OR name LIKE '%Hector%') AND role = 'teacher'),
    'Sciences de la Vie et de la Terre',
    '3ème',
    '2024-2025',
    NOW(),
    NOW()
)
ON DUPLICATE KEY UPDATE 
    teacherId = (SELECT id FROM users WHERE (name LIKE '%weydee%' OR name LIKE '%Hector%') AND role = 'teacher');
*/ 