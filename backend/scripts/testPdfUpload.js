import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testPdfUpload = async () => {
  try {
    console.log('🧪 Test de l\'upload de PDF...\n');

    // Créer un fichier PDF de test
    const testPdfPath = path.join(__dirname, 'test.pdf');
    const testContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Test PDF) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF';
    
    fs.writeFileSync(testPdfPath, testContent);
    console.log('✅ Fichier PDF de test créé');

    // Simuler une requête avec FormData
    const { default: FormData } = await import('form-data');
    const form = new FormData();
    
    form.append('name', 'Test Cours avec PDF');
    form.append('description', 'Description du cours de test avec PDF');
    form.append('subject', 'SVT');
    form.append('level', '3ème');
    form.append('maxStudents', '30');
    form.append('room', 'Labo 101');
    form.append('academicYear', '2023-2024');
    form.append('teacherId', '3');
    form.append('pdf', fs.createReadStream(testPdfPath), {
      filename: 'test.pdf',
      contentType: 'application/pdf'
    });

    console.log('📄 FormData créé avec PDF');

    // Faire la requête
    const response = await fetch('http://localhost:5000/api/classes', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJ3ZXlkZXByb2ZAdmlydHVhbC1sYWIuY29tIiwicm9sZSI6InRlYWNoZXIiLCJpYXQiOjE3NTI1MjcwMzAsImV4cCI6MTc1MzEzMTgzMH0.6_5qIijU-6NJRbd3rviUW-9OUWbVnaTqxo8a49RzQWs'
      },
      body: form
    });

    console.log('📡 Réponse du serveur:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Cours créé avec succès !');
      console.log('📄 Données du cours:', JSON.stringify(data, null, 2));
      
      // Vérifier si le PDF est bien stocké
      if (data.data.class.resources) {
        const resources = JSON.parse(data.data.class.resources);
        console.log('📄 Resources du cours:', resources);
        
        // Vérifier si le fichier existe
        const filePath = path.join(__dirname, '..', resources.pdfUrl);
        if (fs.existsSync(filePath)) {
          console.log('✅ Fichier PDF existe sur le serveur');
        } else {
          console.log('❌ Fichier PDF non trouvé sur le serveur');
        }
      } else {
        console.log('❌ Aucune ressource trouvée dans le cours');
      }
    } else {
      const errorData = await response.json();
      console.log('❌ Erreur lors de la création:', errorData);
    }

    // Nettoyer le fichier de test
    fs.unlinkSync(testPdfPath);
    console.log('🧹 Fichier de test supprimé');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
};

testPdfUpload(); 