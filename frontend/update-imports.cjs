const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Mapa de rutas antiguas a nuevas
const importMappings = {
  // Auth
  "'../components/google-login-button'": "'features/auth'",
  "'./components/google-login-button'": "'features/auth'",
  "'../hooks/use-auth'": "'features/auth'",
  "'./hooks/use-auth'": "'features/auth'",
  "'../services/auth-service'": "'features/auth/services/auth-service'",
  "'./services/auth-service'": "'features/auth/services/auth-service'",
  "'../contexts/auth-context'": "'features/auth'",
  "'./contexts/auth-context'": "'features/auth'",

  // Products
  "'./pages/create-product'": "'features/products'",
  "'../pages/create-product'": "'features/products'",
  "'./pages/edit-product'": "'features/products'",
  "'../pages/edit-product'": "'features/products'",
  "'./pages/my-products'": "'features/products'",
  "'../pages/my-products'": "'features/products'",
  "'./pages/product-detail'": "'features/products'",
  "'../pages/product-detail'": "'features/products'",

  // Workshops  
  "'./pages/create-workshop'": "'features/workshops'",
  "'../pages/create-workshop'": "'features/workshops'",

  // Catalog
  "'./pages/catalog'": "'features/catalog'",
  "'../pages/catalog'": "'features/catalog'",

  // Dashboard
  "'./pages/dashboard'": "'features/dashboard'",
  "'../pages/dashboard'": "'features/dashboard'",

  // Shared components
  "'../components/common/filter-bar'": "'shared/components'",
  "'./components/common/filter-bar'": "'shared/components'",
  "'../components/common/layout'": "'shared/components'",
  "'./components/common/layout'": "'shared/components'",
  "'../components/common/private-ruta'": "'shared/components'",
  "'./components/common/private-ruta'": "'shared/components'",
  "'../components/common/role-route'": "'shared/components'",
  "'./components/common/role-route'": "'shared/components'",

  // Types
  "'../types/catalog'": "'features/catalog/types/catalog'",
  "'./types/catalog'": "'features/catalog/types/catalog'",
  "'../types/api'": "'shared/types/api'",
  "'./types/api'": "'shared/types/api'",

  // Constants
  "'../constants/validation'": "'shared/constants/validation'",
  "'./constants/validation'": "'shared/constants/validation'",
  "'../config/menu-items'": "'shared/constants/menu-items'",
  "'./config/menu-items'": "'shared/constants/menu-items'",
  "'../config/product-filters'": "'shared/constants/product-filters'",
  "'./config/product-filters'": "'shared/constants/product-filters'",
};

// Mapeo de nombres de componentes (para imports nombrados)
const componentMappings = {
  'LoginForm': 'features/auth',
  'RegisterForm': 'features/auth', 
  'GoogleLoginButton': 'features/auth',
  'useAuth': 'features/auth',
  'AuthProvider': 'features/auth',
  'CreateProduct': 'features/products',
  'EditProduct': 'features/products',
  'MyProducts': 'features/products',
  'ProductDetail': 'features/products',
  'CreateWorkshop': 'features/workshops',
  'Catalog': 'features/catalog',
  'Dashboard': 'features/dashboard',
  'FilterBar': 'shared/components',
  'Layout': 'shared/components',
  'PrivateRoute': 'shared/components',
  'RoleRoute': 'shared/components',
};

function updateImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Actualizar imports por ruta
  Object.entries(importMappings).forEach(([oldPath, newPath]) => {
    const regex = new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    if (content.includes(oldPath)) {
      content = content.replace(regex, newPath);
      changed = true;
      console.log(`  ✓ ${oldPath} → ${newPath}`);
    }
  });

  // Actualizar imports relativos problemáticos
  const relativeImportRegex = /from\s+['"](\.\.\/)+(pages|components|services|types|hooks|contexts|config|constants)\/([^'"]+)['"]/g;
  content = content.replace(relativeImportRegex, (match, dots, folder, file) => {
    // Intentar mapear a la nueva estructura
    const cleanFile = file.replace(/\.(tsx?|ts)$/, '');
    
    if (folder === 'pages') {
      if (cleanFile.includes('login') || cleanFile.includes('register')) {
        changed = true;
        return `from 'features/auth'`;
      }
      if (cleanFile.includes('product')) {
        changed = true;
        return `from 'features/products'`;
      }
      if (cleanFile.includes('workshop')) {
        changed = true;
        return `from 'features/workshops'`;
      }
      if (cleanFile.includes('catalog')) {
        changed = true;
        return `from 'features/catalog'`;
      }
      if (cleanFile.includes('dashboard')) {
        changed = true;
        return `from 'features/dashboard'`;
      }
    }
    
    if (folder === 'components' && file.includes('common/')) {
      changed = true;
      return `from 'shared/components'`;
    }
    
    return match; // No cambio si no se puede mapear
  });

  if (changed) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

async function updateAllImports() {
  console.log('🔍 Buscando archivos TypeScript/React...');
  
  // Buscar todos los archivos .ts y .tsx
  const files = await glob('src/**/*.{ts,tsx}', { ignore: 'node_modules/**' });
  
  console.log(`📝 Encontrados ${files.length} archivos para procesar`);
  
  let totalUpdated = 0;
  
  for (const file of files) {
    console.log(`\n📄 Procesando: ${file}`);
    try {
      const updated = updateImportsInFile(file);
      if (updated) {
        totalUpdated++;
        console.log(`  ✅ Actualizado`);
      } else {
        console.log(`  ⚪ Sin cambios`);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }
  
  console.log(`\n✅ Proceso completado!`);
  console.log(`📊 Archivos actualizados: ${totalUpdated}/${files.length}`);
  console.log(`\n⚠️  Verificar manualmente:`);
  console.log(`- App.tsx (rutas principales)`);
  console.log(`- Archivos con imports complejos`);
  console.log(`- Ejecutar 'npm run type-check' o similar`);
}

// Ejecutar el script
updateAllImports().catch(console.error);