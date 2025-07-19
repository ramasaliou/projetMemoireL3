import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

// Test de connexion et vérification du rôle
async function testAuth() {
  try {
    console.log('🔐 Test d\'authentification...\n');

    // 1. Connexion avec un professeur
    console.log('1. Connexion avec un professeur...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'rama.niang@lycee.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.error('❌ Erreur de connexion:', loginData);
      return;
    }

    console.log('✅ Connexion réussie');
    console.log('Token:', loginData.data.token.substring(0, 50) + '...');
    console.log('Utilisateur:', loginData.data.user.name);
    console.log('Rôle:', loginData.data.user.role);
    console.log('ID:', loginData.data.user.id);
    console.log('');

    // 2. Test de création de TP
    console.log('2. Test de création de TP...');
    const createTPResponse = await fetch(`${API_BASE_URL}/tps`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loginData.data.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test TP - Fermentation',
        description: 'TP de test pour vérifier l\'authentification',
        subject: 'Sciences de la Vie et de la Terre',
        level: '3ème',
        duration: 60,
        objectives: ['Comprendre la fermentation', 'Observer les réactions'],
        materials: ['Levure', 'Sucre', 'Eau'],
        instructions: 'Instructions de test'
      })
    });

    const createTPData = await createTPResponse.json();
    
    if (!createTPResponse.ok) {
      console.error('❌ Erreur création TP:', createTPData);
      console.error('Status:', createTPResponse.status);
    } else {
      console.log('✅ TP créé avec succès');
      console.log('TP ID:', createTPData.data.tp.id);
    }

    // 3. Test de récupération des TP
    console.log('\n3. Test de récupération des TP...');
    const getTPsResponse = await fetch(`${API_BASE_URL}/tps`, {
      headers: {
        'Authorization': `Bearer ${loginData.data.token}`
      }
    });

    const getTPsData = await getTPsResponse.json();
    
    if (!getTPsResponse.ok) {
      console.error('❌ Erreur récupération TP:', getTPsData);
    } else {
      console.log('✅ TP récupérés avec succès');
      console.log('Nombre de TP:', getTPsData.data.tps.length);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter le test
testAuth(); 