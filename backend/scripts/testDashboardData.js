import fetch from 'node-fetch';

// Test des données dynamiques du tableau de bord
async function testDashboardData() {
  try {
    console.log('🧪 Test des données dynamiques du tableau de bord...\n');

    // 1. Test connexion professeur
    console.log('=== 1. Test données tableau de bord professeur ===');
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

    // Test données tableau de bord professeur
    const teacherDashboardResponse = await fetch('http://localhost:5000/api/teacher/dashboard-data', {
      headers: {
        'Authorization': `Bearer ${teacherToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!teacherDashboardResponse.ok) {
      const errorData = await teacherDashboardResponse.json();
      console.error('❌ Erreur données tableau de bord professeur:', errorData);
    } else {
      const teacherDashboardData = await teacherDashboardResponse.json();
      console.log('✅ Données tableau de bord professeur récupérées:');
      console.log(`   - Élèves: ${teacherDashboardData.data.totalStudents}`);
      console.log(`   - TP actifs: ${teacherDashboardData.data.activeTPs}`);
      console.log(`   - Rendus: ${teacherDashboardData.data.completedAssignments}`);
      console.log(`   - Moyenne classe: ${teacherDashboardData.data.averageClassScore}%`);
      console.log(`   - Échéances: ${teacherDashboardData.data.upcomingDeadlines.length}`);
      console.log(`   - Activités récentes: ${teacherDashboardData.data.recentActivity.length}`);
      console.log(`   - Performance par thème: ${teacherDashboardData.data.subjectPerformance.length}`);
    }

    console.log('\n=== 2. Test données tableau de bord étudiant ===');
    
    // 2. Test connexion étudiant
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

    // Test données tableau de bord étudiant
    const studentDashboardResponse = await fetch('http://localhost:5000/api/student/dashboard-data', {
      headers: {
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!studentDashboardResponse.ok) {
      const errorData = await studentDashboardResponse.json();
      console.error('❌ Erreur données tableau de bord étudiant:', errorData);
    } else {
      const studentDashboardData = await studentDashboardResponse.json();
      console.log('✅ Données tableau de bord étudiant récupérées:');
      console.log(`   - TP actifs: ${studentDashboardData.data.activeTPs}`);
      console.log(`   - TP terminés: ${studentDashboardData.data.completedTPs}`);
      console.log(`   - Moyenne: ${studentDashboardData.data.averageScore}%`);
      console.log(`   - Progression: ${studentDashboardData.data.progressPercentage}%`);
      console.log(`   - TP à venir: ${studentDashboardData.data.upcomingTPs.length}`);
      console.log(`   - Activités récentes: ${studentDashboardData.data.recentActivity.length}`);
      console.log(`   - Performance par matière: ${studentDashboardData.data.subjectPerformance.length}`);
    }

    console.log('\n🎉 Test des données dynamiques terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testDashboardData(); 