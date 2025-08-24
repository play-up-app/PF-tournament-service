#!/usr/bin/env node

/**
 * 🚀 Script d'aide pour Dependabot - Version Junior-Friendly
 * 
 * Ce script vous aide à gérer les mises à jour de dépendances
 * de manière simple et efficace.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Couleurs pour une meilleure lisibilité
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Fonctions utilitaires
const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

const logSuccess = (message) => log(`✅ ${message}`, colors.green);
const logWarning = (message) => log(`⚠️ ${message}`, colors.yellow);
const logError = (message) => log(`❌ ${message}`, colors.red);
const logInfo = (message) => log(`ℹ️ ${message}`, colors.blue);

/**
 * Vérifie les vulnérabilités de sécurité
 */
function checkSecurityVulnerabilities() {
  logInfo('🔒 Vérification des vulnérabilités de sécurité...');
  
  try {
    const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
    const audit = JSON.parse(auditResult);
    
    if (audit.metadata.vulnerabilities.total === 0) {
      logSuccess('Aucune vulnérabilité détectée !');
      return true;
    }
    
    logWarning(`Vulnérabilités détectées : ${audit.metadata.vulnerabilities.total}`);
    
    // Afficher les vulnérabilités critiques
    if (audit.metadata.vulnerabilities.critical > 0) {
      logError(`Vulnérabilités critiques : ${audit.metadata.vulnerabilities.critical}`);
    }
    
    if (audit.metadata.vulnerabilities.high > 0) {
      logWarning(`Vulnérabilités élevées : ${audit.metadata.vulnerabilities.high}`);
    }
    
    return false;
  } catch (error) {
    logError('Erreur lors de la vérification des vulnérabilités');
    console.error(error.message);
    return false;
  }
}

/**
 * Vérifie les dépendances obsolètes
 */
function checkOutdatedDependencies() {
  logInfo('📦 Vérification des dépendances obsolètes...');
  
  try {
    const outdatedResult = execSync('npm outdated --json', { encoding: 'utf8' });
    const outdated = JSON.parse(outdatedResult);
    
    if (Object.keys(outdated).length === 0) {
      logSuccess('Toutes les dépendances sont à jour !');
      return [];
    }
    
    logWarning(`${Object.keys(outdated).length} dépendances obsolètes détectées`);
    
    // Afficher les dépendances obsolètes
    Object.entries(outdated).forEach(([packageName, info]) => {
      console.log(`  ${packageName}: ${info.current} → ${info.latest}`);
    });
    
    return Object.keys(outdated);
  } catch (error) {
    // npm outdated retourne un code d'erreur si des dépendances sont obsolètes
    if (error.status === 1) {
      logWarning('Des dépendances sont obsolètes');
      return [];
    }
    logError('Erreur lors de la vérification des dépendances obsolètes');
    console.error(error.message);
    return [];
  }
}

/**
 * Lance les tests
 */
function runTests() {
  logInfo('🧪 Lancement des tests...');
  
  try {
    execSync('npm test', { stdio: 'inherit' });
    logSuccess('Tous les tests passent !');
    return true;
  } catch (error) {
    logError('Les tests ont échoué');
    return false;
  }
}

/**
 * Vérifie la couverture de tests
 */
function checkTestCoverage() {
  logInfo('📊 Vérification de la couverture de tests...');
  
  try {
    const coverageResult = execSync('npm run test:coverage', { encoding: 'utf8' });
    
    // Extraire le pourcentage de couverture
    const coverageMatch = coverageResult.match(/All files\s+\|\s+(\d+\.\d+)%/);
    if (coverageMatch) {
      const coverage = parseFloat(coverageMatch[1]);
      if (coverage >= 80) {
        logSuccess(`Couverture de tests : ${coverage}% (objectif atteint)`);
      } else {
        logWarning(`Couverture de tests : ${coverage}% (objectif : 80%)`);
      }
    }
    
    return true;
  } catch (error) {
    logError('Erreur lors de la vérification de la couverture');
    return false;
  }
}

/**
 * Vérifie la taille du bundle
 */
function checkBundleSize() {
  logInfo('📦 Vérification de la taille du bundle...');
  
  try {
    // Vérifier si le script build existe
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (!packageJson.scripts.build) {
      logWarning('Script build non trouvé, impossible de vérifier la taille du bundle');
      return true;
    }
    
    execSync('npm run build', { stdio: 'inherit' });
    logSuccess('Build réussi !');
    return true;
  } catch (error) {
    logError('Erreur lors du build');
    return false;
  }
}

/**
 * Affiche les informations sur une dépendance
 */
function showPackageInfo(packageName) {
  logInfo(`📋 Informations sur ${packageName}...`);
  
  try {
    const info = execSync(`npm view ${packageName} --json`, { encoding: 'utf8' });
    const packageInfo = JSON.parse(info);
    
    console.log(`\n${colors.bold}Informations sur ${packageName}:${colors.reset}`);
    console.log(`  Version actuelle : ${packageInfo.version}`);
    console.log(`  Description : ${packageInfo.description}`);
    console.log(`  Licence : ${packageInfo.license}`);
    console.log(`  Dernière mise à jour : ${packageInfo.time?.modified || 'N/A'}`);
    console.log(`  Dépendances : ${packageInfo.dependencies ? Object.keys(packageInfo.dependencies).length : 0}`);
    
    if (packageInfo.homepage) {
      console.log(`  Page d'accueil : ${packageInfo.homepage}`);
    }
    
    if (packageInfo.repository?.url) {
      console.log(`  Repository : ${packageInfo.repository.url}`);
    }
    
  } catch (error) {
    logError(`Impossible de récupérer les informations sur ${packageName}`);
  }
}

/**
 * Affiche l'aide
 */
function showHelp() {
  console.log(`
${colors.bold}🚀 Script d'aide pour Dependabot - Version Junior-Friendly${colors.reset}

${colors.blue}Utilisation:${colors.reset}
  node scripts/dependabot-helper.js [commande]

${colors.blue}Commandes disponibles:${colors.reset}
  ${colors.green}security${colors.reset}     - Vérifier les vulnérabilités de sécurité
  ${colors.green}outdated${colors.reset}     - Vérifier les dépendances obsolètes
  ${colors.green}test${colors.reset}         - Lancer les tests
  ${colors.green}coverage${colors.reset}     - Vérifier la couverture de tests
  ${colors.green}build${colors.reset}        - Vérifier le build
  ${colors.green}all${colors.reset}          - Exécuter toutes les vérifications
  ${colors.green}info <package>${colors.reset} - Afficher les infos d'un package
  ${colors.green}help${colors.reset}         - Afficher cette aide

${colors.blue}Exemples:${colors.reset}
  node scripts/dependabot-helper.js security
  node scripts/dependabot-helper.js all
  node scripts/dependabot-helper.js info express

${colors.yellow}💡 Conseil:${colors.reset} Utilisez ce script avant de merger une PR Dependabot !
`);
}

/**
 * Fonction principale
 */
function main() {
  const command = process.argv[2];
  const packageName = process.argv[3];
  
  log(`${colors.bold}🚀 Script d'aide pour Dependabot${colors.reset}\n`);
  
  switch (command) {
    case 'security':
      checkSecurityVulnerabilities();
      break;
      
    case 'outdated':
      checkOutdatedDependencies();
      break;
      
    case 'test':
      runTests();
      break;
      
    case 'coverage':
      checkTestCoverage();
      break;
      
    case 'build':
      checkBundleSize();
      break;
      
    case 'all':
      logInfo('🔍 Exécution de toutes les vérifications...\n');
      
      const securityOk = checkSecurityVulnerabilities();
      console.log('');
      
      const outdated = checkOutdatedDependencies();
      console.log('');
      
      const testsOk = runTests();
      console.log('');
      
      const coverageOk = checkTestCoverage();
      console.log('');
      
      const buildOk = checkBundleSize();
      console.log('');
      
      // Résumé
      logInfo('📊 Résumé des vérifications :');
      console.log(`  🔒 Sécurité : ${securityOk ? '✅' : '❌'}`);
      console.log(`  📦 Dépendances : ${outdated.length === 0 ? '✅' : '⚠️'}`);
      console.log(`  🧪 Tests : ${testsOk ? '✅' : '❌'}`);
      console.log(`  📊 Couverture : ${coverageOk ? '✅' : '❌'}`);
      console.log(`  📦 Build : ${buildOk ? '✅' : '❌'}`);
      
      if (securityOk && outdated.length === 0 && testsOk && coverageOk && buildOk) {
        logSuccess('\n🎉 Toutes les vérifications sont passées ! La PR peut être mergée.');
      } else {
        logWarning('\n⚠️ Certaines vérifications ont échoué. Vérifiez avant de merger.');
      }
      break;
      
    case 'info':
      if (!packageName) {
        logError('Veuillez spécifier un nom de package');
        console.log('Exemple: node scripts/dependabot-helper.js info express');
        break;
      }
      showPackageInfo(packageName);
      break;
      
    case 'help':
    default:
      showHelp();
      break;
  }
}

// Exécuter le script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
