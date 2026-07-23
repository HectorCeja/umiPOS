# Onboarding upload final certification

E2E real llena nombre, categoría, precio, descripción, SKU, código de barras e icono; selecciona un
PNG real, observa el estado busy, confirma preview y vuelve a comparar cada valor. También prueba un
archivo inválido y confirma error local recuperable. El builder mantiene altura mayor a 190 px.

Pruebas: `onboarding-upload-empty-dialog-regression.spec.ts` y
`onboarding-upload-state-preservation.spec.ts`.
