# Feedback and scroll policy

1. Toda mutación usa estado `saving/success/error/conflict`, `aria-live` y prevención de doble submit.
2. Guardar, copiar, crear, editar, archivar o eliminar **nunca** mueve el viewport solo para mostrar feedback.
3. `SaveStatus` es local y no enfocable; toasts no críticos son cerrables y temporales.
4. Solo `ScrollToRelevantContent` puede desplazar: resultado solicitado, panel abierto o primer campo inválido fuera de vista.
5. Caja y Ventas `Actualizar` revelan su resumen porque esa es la intención explícita; errores permanecen junto a la acción.
6. Todo desplazamiento respeta `prefers-reduced-motion`, `scroll-margin` y focus sin segundo scroll.
