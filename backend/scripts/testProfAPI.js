import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

async function testProfAPI() {
  try {
    console.log('🧪 Test de l\'API /classes/prof...');
    
    // D'abord, connecter un élève pour obtenir un token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'elhadjeleve@virtual-lab.com',
        password: 'password123'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Erreur de connexion:', loginResponse.status);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Connexion réussie pour:', loginData.user.name);
    
    // Tester l'API /classes/prof
    const profResponse = await fetch('http://localhost:5000/api/classes/prof', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!profResponse.ok) {
      console.log('❌ Erreur API /classes/prof:', profResponse.status);
      const errorText = await profResponse.text();
      console.log('Erreur détail:', errorText);
      return;
    }
    
    const profData = await profResponse.json();
    console.log('✅ Réponse API /classes/prof:', profData);
    
    if (profData.success && profData.data && profData.data.classes) {
      console.log(`📚 ${profData.data.classes.length} cours trouvés:`);
      profData.data.classes.forEach(course => {
        console.log(`- ${course.name} (ID: ${course.id})`);
        if (course.resources) {
          try {
            const resources = JSON.parse(course.resources);
            console.log(`  📄 PDF: ${resources.originalName || 'Document'}`);
          } catch (e) {
            console.log(`  📄 Pas de PDF`);
          }
        }
      });
    } else {
      console.log('❌ Format de réponse inattendu');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testProfAPI(); 