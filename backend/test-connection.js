import fetch from 'node-fetch';

const testConnection = async () => {
  try {
    console.log('🧪 Test de connexion à l\'API...\n');

    // Test 1: Vérifier que le serveur répond
    console.log('1️⃣ Test de santé du serveur...');
    const healthResponse = await fetch('http://localhost:5000/api/health');
    if (healthResponse.ok) {
      console.log('✅ Serveur en ligne');
    } else {
      console.log('❌ Serveur hors ligne');
      return;
    }

    // Test 2: Test de connexion avec un compte de démonstration
    console.log('\n2️⃣ Test de connexion...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'lewis.diatta@lycee.com',
        password: 'demo123'
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Connexion réussie !');
      console.log(`   Utilisateur: ${loginData.data.user.name}`);
      console.log(`   Rôle: ${loginData.data.user.role}`);
      console.log(`   Token: ${loginData.data.token.substring(0, 20)}...`);
    } else {
      const errorData = await loginResponse.json();
      console.log('❌ Échec de la connexion');
      console.log(`   Erreur: ${errorData.error}`);
      console.log(`   Message: ${errorData.message}`);
    }

    // Test 3: Test des simulations (avec token)
    console.log('\n3️⃣ Test des simulations...');
    const simulationsResponse = await fetch('http://localhost:5000/api/simulations');
    if (simulationsResponse.ok) {
      const simulationsData = await simulationsResponse.json();
      console.log(`✅ ${simulationsData.data.simulations.length} simulations trouvées`);
    } else {
      console.log('❌ Erreur lors de la récupération des simulations');
    }

    console.log('\n🎉 Tests terminés !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
};

testConnection(); 