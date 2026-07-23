# Causa raíz — posición del upload de onboarding

El formulario nunca se desmontaba: el navegador activaba el `<input type="file">` oculto mediante el
`label`, trasladaba el foco al control de 1 px y ajustaba el `scrollTop` del contenedor antes de devolver
el archivo. El DOM y los valores sobrevivían, pero el owner quedaba mirando otra zona del panel.

La solución autoritativa ancla el input al uploader, captura página y ancestros desplazables antes de
abrir el selector, evita la navegación nativa del label y abre el input de forma controlada. La posición
se restaura al recibir el archivo, en el siguiente frame y después de estabilizar el preview. El uploader
también queda fuera del scroll anchoring automático.

Las correcciones previas fueron insuficientes porque comprobaban montaje y estado, no coordenadas.
