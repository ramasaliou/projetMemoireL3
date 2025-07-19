import { connectDB, sequelize } from '../config/database.js';
import { Simulation } from '../models/index.js';

const testSimulations = async () => {
  try {
    await connectDB();
    console.log('🧪 Test des simulations...\n');

    // Récupérer toutes les simulations
    const simulations = await Simulation.findAll();
    console.log(`📊 Simulations dans la base: ${simulations.length}`);

    if (simulations.length > 0) {
      console.log('\nSimulations trouvées:');
      simulations.forEach(sim => {
        console.log(`  - ${sim.title} (${sim.type}) - ${sim.difficulty}`);
        console.log(`    Vues: ${sim.stats?.views || 0}`);
        console.log(`    Complétions: ${sim.stats?.completions || 0}`);
        console.log(`    Note moyenne: ${sim.stats?.average_score || 0}`);
      });
    } else {
      console.log('❌ Aucune simulation trouvée');
    }

    console.log('\n✅ Test terminé');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await sequelize.close();
  }
};

testSimulations(); 