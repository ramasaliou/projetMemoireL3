import fetch from 'node-fetch';

// Test des permissions des professeurs
async function testTeacherPermissions() {
  try {
    console.log('🧪 Test des permissions des professeurs...\n');

    // 1. Connexion en tant que professeur
    console.log('=== 1. Connexion en tant que professeur ===');
    const teacherLoginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'rama.niang@lycee.com',
        password: 'password123'
      })
    });

    if (!teacherLoginResponse.ok) {
      const errorData = await teacherLoginResponse.json();
      console.error('❌ Erreur de connexion professeur:', errorData);
      return;
    }

    const teacherLoginData = await teacherLoginResponse.json();
    const teacherToken = teacherLoginData.data.token;
    console.log('✅ Connexion professeur réussie');

    // 2. Test des TP du professeur
    console.log('\n=== 2. Test des TP du professeur ===');
    const teacherTPsResponse = await fetch('http://localhost:5000/api/tps', {
      headers: {
        'Authorization': `Bearer ${teacherToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (teacherTPsResponse.ok) {
      const teacherTPsData = await teacherTPsResponse.json();
      console.log('✅ TP du professeur récupérés:', teacherTPsData.data.tps.length, 'TP trouvés');
      teacherTPsData.data.tps.forEach(tp => {
        console.log(`   - ${tp.title} (créé par: ${tp.creator?.name || 'Inconnu'})`);
      });
    } else {
      console.error('❌ Erreur récupération TP professeur:', teacherTPsResponse.status);
    }

    // 3. Test des simulations du professeur
    console.log('\n=== 3. Test des simulations du professeur ===');
    const teacherSimulationsResponse = await fetch('http://localhost:5000/api/simulations', {
      headers: {
        'Authorization': `Bearer ${teacherToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (teacherSimulationsResponse.ok) {
      const teacherSimulationsData = await teacherSimulationsResponse.json();
      console.log('✅ Simulations du professeur récupérées:', teacherSimulationsData.data.simulations.length, 'simulations trouvées');
      teacherSimulationsData.data.simulations.forEach(sim => {
        console.log(`   - ${sim.title} (créée par: ID ${sim.created_by})`);
      });
    } else {
      console.error('❌ Erreur récupération simulations professeur:', teacherSimulationsResponse.status);
    }

    // 4. Test des ressources du professeur
    console.log('\n=== 4. Test des ressources du professeur ===');
    const teacherResourcesResponse = await fetch('http://localhost:5000/api/resources', {
      headers: {
        'Authorization': `Bearer ${teacherToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (teacherResourcesResponse.ok) {
      const teacherResourcesData = await teacherResourcesResponse.json();
      console.log('✅ Ressources du professeur récupérées:', teacherResourcesData.data.resources.length, 'ressources trouvées');
      teacherResourcesData.data.resources.forEach(resource => {
        console.log(`   - ${resource.title} (créée par: ${resource.creator?.name || 'Inconnu'})`);
      });
    } else {
      console.error('❌ Erreur récupération ressources professeur:', teacherResourcesResponse.status);
    }

    // 5. Test des classes du professeur
    console.log('\n=== 5. Test des classes du professeur ===');
    const teacherClassesResponse = await fetch('http://localhost:5000/api/classes', {
      headers: {
        'Authorization': `Bearer ${teacherToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (teacherClassesResponse.ok) {
      const teacherClassesData = await teacherClassesResponse.json();
      console.log('✅ Classes du professeur récupérées:', teacherClassesData.data.classes.length, 'classes trouvées');
      teacherClassesData.data.classes.forEach(classe => {
        console.log(`   - ${classe.name} (professeur: ${classe.teacher?.name || 'Inconnu'})`);
      });
    } else {
      console.error('❌ Erreur récupération classes professeur:', teacherClassesResponse.status);
    }

    // 6. Test du tableau de bord du professeur
    console.log('\n=== 6. Test du tableau de bord du professeur ===');
    const teacherDashboardResponse = await fetch('http://localhost:5000/api/teacher/dashboard', {
      headers: {
        'Authorization': `Bearer ${teacherToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (teacherDashboardResponse.ok) {
      const teacherDashboardData = await teacherDashboardResponse.json();
      console.log('✅ Tableau de bord professeur récupéré');
      console.log(`   - Total TP: ${teacherDashboardData.data.totalTPs}`);
      console.log(`   - Total étudiants: ${teacherDashboardData.data.totalStudents}`);
      console.log(`   - TP récents: ${teacherDashboardData.data.recentTPs.length}`);
    } else {
      console.error('❌ Erreur récupération tableau de bord professeur:', teacherDashboardResponse.status);
    }

    console.log('\n✅ Tests des permissions professeur terminés');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Test des permissions des étudiants
async function testStudentPermissions() {
  try {
    console.log('\n🧪 Test des permissions des étudiants...\n');

    // 1. Connexion en tant qu'étudiant
    console.log('=== 1. Connexion en tant qu\'étudiant ===');
    const studentLoginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'diatta.lewis@lycee.com',
        password: 'password123'
      })
    });

    if (!studentLoginResponse.ok) {
      const errorData = await studentLoginResponse.json();
      console.error('❌ Erreur de connexion étudiant:', errorData);
      return;
    }

    const studentLoginData = await studentLoginResponse.json();
    const studentToken = studentLoginData.data.token;
    console.log('✅ Connexion étudiant réussie');

    // 2. Test des simulations pour étudiants
    console.log('\n=== 2. Test des simulations pour étudiants ===');
    const studentSimulationsResponse = await fetch('http://localhost:5000/api/simulations', {
      headers: {
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (studentSimulationsResponse.ok) {
      const studentSimulationsData = await studentSimulationsResponse.json();
      console.log('✅ Simulations pour étudiants récupérées:', studentSimulationsData.data.simulations.length, 'simulations trouvées');
      studentSimulationsData.data.simulations.forEach(sim => {
        console.log(`   - ${sim.title} (statut: ${sim.status})`);
      });
    } else {
      console.error('❌ Erreur récupération simulations étudiant:', studentSimulationsResponse.status);
    }

    // 3. Test des ressources pour étudiants
    console.log('\n=== 3. Test des ressources pour étudiants ===');
    const studentResourcesResponse = await fetch('http://localhost:5000/api/resources', {
      headers: {
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (studentResourcesResponse.ok) {
      const studentResourcesData = await studentResourcesResponse.json();
      console.log('✅ Ressources pour étudiants récupérées:', studentResourcesData.data.resources.length, 'ressources trouvées');
      studentResourcesData.data.resources.forEach(resource => {
        console.log(`   - ${resource.title} (statut: ${resource.status})`);
      });
    } else {
      console.error('❌ Erreur récupération ressources étudiant:', studentResourcesResponse.status);
    }

    console.log('\n✅ Tests des permissions étudiant terminés');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter les tests
console.log('🧪 Début des tests de permissions...\n');

await testTeacherPermissions();
await testStudentPermissions();

console.log('\n✅ Tous les tests terminés'); 