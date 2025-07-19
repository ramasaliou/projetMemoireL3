import fetch from 'node-fetch';

async function testQuizzesAPI() {
  try {
    console.log('🧪 Test de l\'API /api/quizzes...');
    
    // Token d'authentification pour Aida (étudiante)
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiZW1haWwiOiJhaWRhZWxldmVAdmlydHVhbC1sYWIuY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3NTI5MjIzNDcsImV4cCI6MTc1MzUyNzE0N30.LeOXc1pe1PVV_l6nsvFhbJG75F_crGxdi2_ufBBaPjw';
    
    const response = await fetch('http://localhost:5000/api/quizzes', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`📊 Statut de la réponse: ${response.status}`);
    console.log(`📋 Headers:`, Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Réponse reçue:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.success && data.data && data.data.quizzes) {
        console.log(`\n📝 Nombre de quiz trouvés: ${data.data.quizzes.length}`);
        data.data.quizzes.forEach((quiz, index) => {
          console.log(`${index + 1}. ${quiz.title} (${quiz.subject}) - Créé par: ${quiz.creator?.name || 'Inconnu'}`);
        });
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Erreur:', errorText);
    }

  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  }
}

testQuizzesAPI(); 