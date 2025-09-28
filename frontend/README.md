# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

```

RODAMALLORCA/
├─ backend/
│  └─ (contenido no mostrado)
├─ frontend/
│  ├─ node_modules/
│  ├─ public/
│  ├─ src/
│  │  ├─ api/
│  │  │  └─ auth.ts
│  │  ├─ assets/
│  │  │  └─ react.svg
│  │  ├─ components/
│  │  │  └─ layout/
│  │  │     ├─ main-layout.tsx
│  │  │     ├─ public-footer.tsx
│  │  │     ├─ public-header.tsx
│  │  │     ├─ public-layout.tsx
│  │  │     ├─ side-bar.tsx
│  │  │     ├─ top-bar.tsx
│  │  │     ├─ user-profile-menu.tsx
│  │  │     ├─ google-login-button.tsx
│  │  │     ├─ private-ruta.tsx
│  │  │     └─ role-route.tsx
│  │  ├─ constants/
│  │  │  └─ api.ts
│  │  ├─ features/
│  │  │  ├─ auth/
│  │  │  ├─ catalog/
│  │  │  │  ├─ components/
│  │  │  │  ├─ pages/
│  │  │  │  │  └─ Catalog.tsx
│  │  │  │  ├─ services/
│  │  │  │  │  └─ catalog-service.ts
│  │  │  │  └─ types/
│  │  │  │     ├─ catalog.ts
│  │  │  │     └─ index.ts
│  │  │  ├─ dashboard/
│  │  │  │  ├─ components/
│  │  │  │  ├─ pages/
│  │  │  │  ├─ services/
│  │  │  │  └─ index.ts
│  │  │  ├─ media/
│  │  │  │  ├─ components/
│  │  │  │  │  └─ image-downloads.tsx
│  │  │  │  └─ services/
│  │  │  │     └─ media-service.ts
│  │  │  ├─ products/
│  │  │  │  ├─ components/
│  │  │  │  │  ├─ modern-product-layout.tsx
│  │  │  │  │  └─ product-image-galery.tsx
│  │  │  │  ├─ pages/
│  │  │  │  │  ├─ create-product.tsx
│  │  │  │  │  ├─ edit-product.tsx
│  │  │  │  │  ├─ my-products.tsx
│  │  │  │  │  └─ product-details.tsx
│  │  │  │  ├─ services/
│  │  │  │  │  └─ product-service.ts
│  │  │  │  └─ types/
│  │  │  │     └─ index.ts
│  │  │  └─ workshops/
│  │  │     ├─ components/
│  │  │     ├─ pages/
│  │  │     │  ├─ create-workshop.tsx
│  │  │     │  ├─ edit-workshop.tsx
│  │  │     │  ├─ my-work-shops.tsx
│  │  │     │  └─ workshop-detail.tsx
│  │  │     ├─ services/
│  │  │     │  └─ workshop-service.ts
│  │  │     └─ types/
│  │  ├─ pages/
│  │  │  ├─ edit-product.tsx
│  │  │  ├─ HomePage.tsx
│  │  │  ├─ LandingPage.tsx
│  │  │  ├─ login-form.tsx
│  │  │  └─ register-user.tsx
│  │  ├─ providers/
│  │  │  └─ auth-provider.tsx
│  │  ├─ shared/
│  │  │  ├─ components/
│  │  │  │  └─ FilterBar.tsx
│  │  │  ├─ constants/
│  │  │  │  ├─ menu-items.ts
│  │  │  │  ├─ product-filters.ts
│  │  │  │  └─ validation.ts
│  │  │  ├─ hooks/
│  │  │  ├─ services/
│  │  │  ├─ theme/
│  │  │  │  └─ index.ts
│  │  │  ├─ types/
│  │  │  │  ├─ api.ts
│  │  │  │  ├─ layout.ts
│  │  │  │  └─ index.ts
│  │  │  └─ utils/
│  │  │     └─ index.ts
│  │  ├─ utils/
│  │  │  ├─ api-urls.ts
│  │  │  └─ icon-mapper.tsx
│  │  ├─ App.css
│  │  ├─ App.tsx
│  │  ├─ index.css
│  │  ├─ main.tsx
│  │  └─ vite-env.d.ts
│  ├─ .env
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package.json
│  ├─ pnpm-lock.yaml
│  ├─ README.md
│  ├─ reorganize-structure.sh
│  ├─ tsconfig.app.json
│  ├─ tsconfig.json
│  ├─ tsconfig.node.json
│  ├─ update-imports.cjs
│  └─ vite.config.ts
├─ node_modules/
├─ .gitignore
├─ package.json
├─ pnpm-lock.yaml
├─ pnpm-workspace.yaml
└─ README.md
```
