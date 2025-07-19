import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

// Test de l'utilisateur actuellement connecté
async function testCurrentUser() {
  try {
    console.log('🔍 Test de l\'utilisateur actuellement connecté...\n');

    // 1. Connexion avec l'utilisateur ID 3 (qui semble être connecté d'après les logs)
    console.log('1. Tentative de connexion avec différents utilisateurs...\n');

    // Test avec différents emails possibles
    const testUsers = [
      { email: 'admin@lycee.com', password: 'password123' },
      { email: 'teacher@lycee.com', password: 'password123' },
      { email: 'student@lycee.com', password: 'password123' },
      { email: 'prof@lycee.com', password: 'password123' },
      { email: 'enseignant@lycee.com', password: 'password123' }
    ];

    for (const user of testUsers) {
      console.log(`Tentative avec: ${user.email}`);
      
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      });

      const loginData = await loginResponse.json();
      
      if (loginResponse.ok) {
        console.log('✅ Connexion réussie!');
        console.log('Utilisateur:', loginData.data.user.name);
        console.log('Email:', loginData.data.user.email);
        console.log('Rôle:', loginData.data.user.role);
        console.log('ID:', loginData.data.user.id);
        console.log('Token:', loginData.data.token.substring(0, 50) + '...\n');

        // Test de création de TP avec cet utilisateur
        console.log('2. Test de création de TP...');
        const createTPResponse = await fetch(`${API_BASE_URL}/tps`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${loginData.data.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: 'Test TP - Dynamique',
            description: 'TP de test pour vérifier la création dynamique',
            subject: 'Sciences de la Vie et de la Terre',
            level: '3ème',
            duration: 60
          })
        });

        const createTPData = await createTPResponse.json();
        
        if (createTPResponse.ok) {
          console.log('✅ TP créé avec succès!');
          console.log('TP ID:', createTPData.data.tp.id);
        } else {
          console.log('❌ Erreur création TP:');
          console.log('Status:', createTPResponse.status);
          console.log('Message:', createTPData.message || createTPData.error);
        }

        // Test de récupération des TP
        console.log('\n3. Test de récupération des TP...');
        const getTPsResponse = await fetch(`${API_BASE_URL}/tps`, {
          headers: {
            'Authorization': `Bearer ${loginData.data.token}`
          }
        });

        const getTPsData = await getTPsResponse.json();
        
        if (getTPsResponse.ok) {
          console.log('✅ TP récupérés avec succès!');
          console.log('Nombre de TP:', getTPsData.data.tps.length);
        } else {
          console.log('❌ Erreur récupération TP:', getTPsData);
        }

        break; // Arrêter après la première connexion réussie
      } else {
        console.log('❌ Échec de connexion:', loginData.message);
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter le test
testCurrentUser(); 