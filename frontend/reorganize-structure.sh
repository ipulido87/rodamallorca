#!/bin/bash

# Script para reorganizar la estructura del proyecto RODAMALLORCA
# Ejecutar desde la carpeta raíz del proyecto frontend

echo "🚀 Iniciando reorganización de la estructura de archivos..."

# Crear la nueva estructura de carpetas
echo "📁 Creando estructura de features..."

# Shared (código compartido)
mkdir -p src/shared/{components,hooks,services,types,constants,utils}

# Features
mkdir -p src/features/auth/{components,hooks,services,types,providers}
mkdir -p src/features/products/{components,pages,services,types}
mkdir -p src/features/workshops/{components,pages,services,types}
mkdir -p src/features/catalog/{components,pages,services,types}
mkdir -p src/features/dashboard/{components,pages,services}

# Pages solo para routing
mkdir -p src/pages

echo "📦 Moviendo archivos de autenticación..."
# Mover archivos de autenticación
if [ -f "src/pages/login-form.tsx" ]; then
    mv src/pages/login-form.tsx src/features/auth/components/LoginForm.tsx
fi

if [ -f "src/pages/register-user.tsx" ]; then
    mv src/pages/register-user.tsx src/features/auth/components/RegisterForm.tsx
fi

if [ -f "src/components/common/google-login-button.tsx" ]; then
    mv src/components/common/google-login-button.tsx src/features/auth/components/GoogleLoginButton.tsx
fi

if [ -f "src/hooks/use-auth.ts" ]; then
    mv src/hooks/use-auth.ts src/features/auth/hooks/useAuth.ts
fi

if [ -f "src/services/auth-service.ts" ]; then
    mv src/services/auth-service.ts src/features/auth/services/auth-service.ts
fi

if [ -f "src/contexts/auth-context.tsx" ]; then
    mv src/contexts/auth-context.tsx src/features/auth/providers/AuthProvider.tsx
fi

echo "🛍️ Moviendo archivos de productos..."
# Mover archivos de productos
if [ -f "src/pages/create-product.tsx" ]; then
    mv src/pages/create-product.tsx src/features/products/pages/CreateProduct.tsx
fi

if [ -f "src/pages/edit-product.tsx" ]; then
    mv src/pages/edit-product.tsx src/features/products/pages/EditProduct.tsx
fi

if [ -f "src/pages/my-products.tsx" ]; then
    mv src/pages/my-products.tsx src/features/products/pages/MyProducts.tsx
fi

if [ -f "src/pages/product-detail.tsx" ]; then
    mv src/pages/product-detail.tsx src/features/products/pages/ProductDetail.tsx
fi

if [ -f "src/services/product-service.ts" ]; then
    mv src/services/product-service.ts src/features/products/services/product-service.ts
fi

echo "🔧 Moviendo archivos de workshops..."
# Mover archivos de workshops
if [ -f "src/pages/create-workshop.tsx" ]; then
    mv src/pages/create-workshop.tsx src/features/workshops/pages/CreateWorkshop.tsx
fi

if [ -f "src/services/workshop-service.ts" ]; then
    mv src/services/workshop-service.ts src/features/workshops/services/workshop-service.ts
fi

echo "📋 Moviendo archivos de catálogo..."
# Mover archivos de catálogo
if [ -f "src/pages/catalog.tsx" ]; then
    mv src/pages/catalog.tsx src/features/catalog/pages/Catalog.tsx
fi

if [ -f "src/services/catalog-service.ts" ]; then
    mv src/services/catalog-service.ts src/features/catalog/services/catalog-service.ts
fi

echo "📊 Moviendo archivos de dashboard..."
# Mover archivos de dashboard
if [ -f "src/pages/dashboard.tsx" ]; then
    mv src/pages/dashboard.tsx src/features/dashboard/pages/Dashboard.tsx
fi

echo "🏠 Moviendo páginas principales..."
# Mover páginas principales que quedan en pages/
if [ -f "src/pages/home.tsx" ]; then
    mv src/pages/home.tsx src/pages/HomePage.tsx
fi

if [ -f "src/pages/landing-page.tsx" ]; then
    mv src/pages/landing-page.tsx src/pages/LandingPage.tsx
fi

echo "🔧 Moviendo componentes compartidos..."
# Mover componentes realmente compartidos a shared
if [ -f "src/components/common/filter-bar.tsx" ]; then
    mv src/components/common/filter-bar.tsx src/shared/components/FilterBar.tsx
fi

if [ -f "src/components/common/layout.tsx" ]; then
    mv src/components/common/layout.tsx src/shared/components/Layout.tsx
fi

if [ -f "src/components/common/private-ruta.tsx" ]; then
    mv src/components/common/private-ruta.tsx src/shared/components/PrivateRoute.tsx
fi

if [ -f "src/components/common/role-route.tsx" ]; then
    mv src/components/common/role-route.tsx src/shared/components/RoleRoute.tsx
fi

echo "📝 Moviendo tipos y configuración..."
# Mover archivos de tipos que son compartidos
if [ -f "src/types/api.ts" ]; then
    mv src/types/api.ts src/shared/types/api.ts
fi

if [ -f "src/types/layout.ts" ]; then
    mv src/types/layout.ts src/shared/types/layout.ts
fi

# Mover tipos específicos
if [ -f "src/types/catalog.ts" ]; then
    mv src/types/catalog.ts src/features/catalog/types/catalog.ts
fi

# Mover configuración a shared
if [ -f "src/config/menu-items.ts" ]; then
    mv src/config/menu-items.ts src/shared/constants/menu-items.ts
fi

if [ -f "src/config/product-filters.ts" ]; then
    mv src/config/product-filters.ts src/shared/constants/product-filters.ts
fi

if [ -f "src/constants/validation.ts" ]; then
    mv src/constants/validation.ts src/shared/constants/validation.ts
fi

echo "🎨 Moviendo archivos de tema..."
# Mover archivos de tema a shared
if [ -d "src/theme" ]; then
    mv src/theme src/shared/theme
fi

echo "🧹 Limpiando carpetas vacías..."
# Limpiar carpetas vacías
find src/components -type d -empty -delete 2>/dev/null || true
find src/services -type d -empty -delete 2>/dev/null || true
find src/types -type d -empty -delete 2>/dev/null || true
find src/config -type d -empty -delete 2>/dev/null || true
find src/constants -type d -empty -delete 2>/dev/null || true
find src/hooks -type d -empty -delete 2>/dev/null || true
find src/contexts -type d -empty -delete 2>/dev/null || true

echo "📋 Creando archivos index para barrel exports..."
# Crear archivos index para exports
cat > src/features/auth/index.ts << 'EOF'
// Auth feature exports
export { LoginForm } from './components/LoginForm'
export { RegisterForm } from './components/RegisterForm'
export { GoogleLoginButton } from './components/GoogleLoginButton'
export { useAuth } from './hooks/useAuth'
export { AuthProvider } from './providers/AuthProvider'
EOF

cat > src/features/products/index.ts << 'EOF'
// Products feature exports
export { CreateProduct } from './pages/CreateProduct'
export { EditProduct } from './pages/EditProduct'
export { MyProducts } from './pages/MyProducts'
export { ProductDetail } from './pages/ProductDetail'
EOF

cat > src/features/catalog/index.ts << 'EOF'
// Catalog feature exports
export { Catalog } from './pages/Catalog'
EOF

cat > src/features/dashboard/index.ts << 'EOF'
// Dashboard feature exports
export { Dashboard } from './pages/Dashboard'
EOF

cat > src/shared/index.ts << 'EOF'
// Shared exports
export { FilterBar } from './components/FilterBar'
export { Layout } from './components/Layout'
export { PrivateRoute } from './components/PrivateRoute'
export { RoleRoute } from './components/RoleRoute'
EOF

echo "✅ Reorganización completada!"
echo ""
echo "⚠️  SIGUIENTE PASO: Actualizar imports en los archivos"
echo "Necesitarás actualizar los imports en:"
echo "- App.tsx"
echo "- Archivos que importan componentes movidos"
echo ""
echo "Ejemplo de nuevos imports:"
echo "import { LoginForm } from 'features/auth'"
echo "import { CreateProduct } from 'features/products'"
echo "import { FilterBar } from 'shared/components'"