# 🧪 Testing & Coverage Guide

## 📊 Ver Cobertura de Tests

### Opción 1: Jest Coverage (Local - Recomendado)

```bash
cd backend

# Ver cobertura en terminal
npm run test:coverage

# Generar reporte HTML
npm run test:coverage
open coverage/index.html  # Se abre el reporte visual en el navegador
```

**Ubicación del reporte**: `backend/coverage/index.html`

### Opción 2: SonarCloud (Cloud - Opcional)

**¿Es gratuito?**
- ✅ **SÍ** para repositorios públicos en GitHub
- ✅ **SÍ** para proyectos open source
- ❌ **NO** para repositorios privados (requiere plan de pago)

**Configuración**:
1. Crear cuenta en https://sonarcloud.io (login con GitHub)
2. Importar el repositorio `rodamallorca`
3. Añadir `sonar-project.properties` en la raíz
4. Configurar GitHub Action para análisis automático

**Beneficios de SonarCloud**:
- ✅ Análisis de calidad de código (bugs, code smells, vulnerabilidades)
- ✅ Coverage tracking histórico
- ✅ Pull Request decoration (comentarios automáticos)
- ✅ Métricas de deuda técnica
- ✅ Dashboard visual

## 🐕 Git Hooks con Husky

### Hooks Configurados

#### 1. Pre-commit Hook
Se ejecuta **antes de cada commit**

```bash
# Ubicación: .husky/pre-commit
```

**Qué hace:**
- ✅ Ejecuta tests solo para archivos modificados (rápido)
- ✅ Bloquea el commit si algún test falla
- ⚡ Ejecución rápida: ~5-10 segundos

**Ejemplo:**
```bash
git add src/__tests__/payments/payment-service.test.ts
git commit -m "feat: add payment tests"
# 🔍 Running pre-commit checks...
# ✅ Tests passed! Commit allowed.
```

#### 2. Pre-push Hook
Se ejecuta **antes de cada push**

```bash
# Ubicación: .husky/pre-push
```

**Qué hace:**
- ✅ Ejecuta TODOS los tests del backend
- ✅ Bloquea el push si algún test falla
- 🕐 Ejecución completa: ~30-60 segundos

**Ejemplo:**
```bash
git push origin feature/new-payment-flow
# 🧪 Running all tests before push...
# Test Suites: 20 passed, 20 total
# Tests: 100 passed, 100 total
# ✅ All tests passed! Safe to push.
```

### Desactivar Hooks (si es necesario)

```bash
# Saltarse pre-commit (NO RECOMENDADO)
git commit --no-verify -m "WIP: work in progress"

# Saltarse pre-push (NO RECOMENDADO)
git push --no-verify
```

⚠️ **Advertencia**: Solo usa `--no-verify` en casos excepcionales (WIP, hotfix urgente). Los hooks están para proteger la calidad del código.

## 📈 Metas de Cobertura

### Por Tipo de Código

| Tipo | Cobertura Mínima | Prioridad |
|------|-----------------|-----------|
| **Servicios críticos** (payment, subscription, webhook) | **>80%** | 🔴 Alta |
| **Repositorios** (infrastructure) | **>70%** | 🟠 Media |
| **Controllers** (interfaces) | **>50%** | 🟡 Media-Baja |
| **Routes/Schemas** | **>30%** | 🟢 Baja |
| **Scripts/Utils** | Sin requisito | ℹ️ Opcional |

### Estado Actual (después de este PR)

```
✅ payment-service.ts: 12 tests (100% critical paths)
✅ subscription-service.ts: 18 tests (100% critical paths)
✅ webhook-handler.ts: 12 tests (100% critical paths)
✅ order-repository.ts: Updated with payment fields tests
```

## 🚀 Comandos Útiles

```bash
# Ver tests en modo watch (desarrollo)
cd backend && npm run test:watch

# Ejecutar solo tests de un módulo específico
cd backend && npm test -- payment-service.test.ts

# Ver cobertura de un módulo específico
cd backend && npm test -- --coverage payment-service.test.ts

# Ejecutar tests en modo verbose (más información)
cd backend && npm test -- --verbose

# Ver solo tests que fallaron en la última ejecución
cd backend && npm test -- --onlyFailures
```

## 🔧 Integración Continua (CI)

### GitHub Actions (Recomendado)

Crear `.github/workflows/backend-tests.yml`:

```yaml
name: Backend Tests

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        run: cd backend && npm ci

      - name: Run tests with coverage
        run: cd backend && npm run test:coverage

      - name: Upload coverage to Codecov (opcional)
        uses: codecov/codecov-action@v4
        with:
          directory: ./backend/coverage
```

## 📚 Recursos Adicionales

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Husky Documentation](https://typicode.github.io/husky/)
- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🆘 Troubleshooting

### "Tests tardan mucho en pre-commit"
- Los hooks solo ejecutan tests de archivos modificados
- Si es muy lento, considera ajustar el hook a solo lint

### "Husky no se ejecuta"
- Verifica que ejecutaste `npm install` en la raíz después de clonar
- Verifica permisos: `chmod +x .husky/pre-commit .husky/pre-push`

### "Tests pasan local pero fallan en CI"
- Verifica variables de entorno (`.env.test`)
- Verifica versión de Node.js
- Revisa logs de GitHub Actions para detalles
