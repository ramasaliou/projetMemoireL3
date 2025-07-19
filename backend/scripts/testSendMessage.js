import fetch from 'node-fetch';

// Test d'envoi de message
async function testSendMessage() {
  try {
    // D'abord, se connecter pour obtenir un token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'diatta.lewis@lycee.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      console.error('Erreur de connexion:', errorData);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.token;

    console.log('✅ Connexion réussie, token obtenu');

    // Envoyer un message
    const messageData = {
      receiver_id: 2, // ID du professeur
      subject: 'Test de message',
      content: 'Ceci est un test d\'envoi de message',
      message_type: 'question',
      priority: 'normal'
    };

    console.log('📤 Tentative d\'envoi de message avec les données:', messageData);

    const sendResponse = await fetch('http://localhost:5000/api/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    });

    console.log('📊 Statut de la réponse:', sendResponse.status);
    console.log('📊 Headers de la réponse:', Object.fromEntries(sendResponse.headers.entries()));

    if (sendResponse.ok) {
      const responseData = await sendResponse.json();
      console.log('✅ Message envoyé avec succès:', responseData);
    } else {
      const errorData = await sendResponse.text();
      console.error('❌ Erreur lors de l\'envoi:', errorData);
      
      try {
        const errorJson = JSON.parse(errorData);
        console.error('❌ Détails de l\'erreur:', errorJson);
      } catch (e) {
        console.error('❌ Erreur non-JSON:', errorData);
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Test de récupération des utilisateurs disponibles
async function testGetUsers() {
  try {
    // D'abord, se connecter pour obtenir un token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'diatta.lewis@lycee.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      console.error('Erreur de connexion:', errorData);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.token;

    console.log('✅ Connexion réussie pour test utilisateurs');

    // Récupérer les utilisateurs disponibles
    const usersResponse = await fetch('http://localhost:5000/api/messages/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Statut de la réponse utilisateurs:', usersResponse.status);

    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('✅ Utilisateurs récupérés:', usersData);
    } else {
      const errorData = await usersResponse.text();
      console.error('❌ Erreur lors de la récupération des utilisateurs:', errorData);
    }

  } catch (error) {
    console.error('❌ Erreur générale pour utilisateurs:', error);
  }
}

// Exécuter les tests
console.log('🧪 Début des tests de messagerie...\n');

console.log('=== Test 1: Récupération des utilisateurs ===');
await testGetUsers();

console.log('\n=== Test 2: Envoi de message ===');
await testSendMessage();

console.log('\n✅ Tests terminés'); 