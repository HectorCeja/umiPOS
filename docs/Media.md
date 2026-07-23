# Media

Los binarios viven en el bucket privado de MinIO, nunca en PostgreSQL. El API crea un registro `PENDING` y una URL PUT de 15 minutos bajo `tenants/{tenant}/products/{product}/...`; al completar verifica el objeto con `statObject` y activa metadata, tamaño, alt text, orden y principal. La API no acepta URLs públicas arbitrarias. Video queda como extensión futura.
