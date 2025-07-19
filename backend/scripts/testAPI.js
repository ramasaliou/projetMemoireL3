import http from 'http';
import https from 'https';

const makeRequest = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
};

const testTeacherStudentsAPI = async () => {
  try {
    console.log('🧪 Test de l\'API /api/teacher/students...\n');

    // D'abord, on doit se connecter pour obtenir un token
    const loginResponse = await makeRequest('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'saliou.ndiaye@lycee.com',
        password: 'demo123'
      })
    });

    if (loginResponse.status !== 200) {
      console.log('❌ Erreur de connexion:', loginResponse.status);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie, token obtenu');

    // Maintenant, tester l'API des élèves
    const studentsResponse = await makeRequest('http://localhost:5000/api/teacher/students', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (studentsResponse.status !== 200) {
      console.log('❌ Erreur lors de la récupération des élèves:', studentsResponse.status);
      console.log('Erreur:', studentsResponse.data);
      return;
    }

    const studentsData = studentsResponse.data;
    
    console.log('✅ API /api/teacher/students fonctionne !');
    console.log('\n📊 Données reçues:');
    console.log('- Nombre d\'élèves:', studentsData.data.students.length);
    console.log('- Classe du professeur:', studentsData.data.teacherClass);
    
    if (studentsData.data.students.length > 0) {
      console.log('\n👥 Détails des élèves:');
      studentsData.data.students.forEach((student, index) => {
        console.log(`${index + 1}. ${student.name} (${student.email})`);
        console.log(`   Classe: ${student.class}`);
        console.log(`   Nombre de résultats: ${student.results ? student.results.length : 0}`);
        
        if (student.results && student.results.length > 0) {
          console.log('   Résultats:');
          student.results.forEach(result => {
            console.log(`     - TP: ${result.tp?.title || 'N/A'} - Score: ${result.overall_score}%`);
          });
        }
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
};

testTeacherStudentsAPI(); 