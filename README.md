# Contabilidad Familiar

Esta es una aplicación web tipo Single Page Application (SPA) diseñada para llevar el control de las finanzas de un hogar. La herramienta se enfoca en la privacidad absoluta del usuario. Toda la información financiera se almacena directamente en el navegador mediante `localStorage`. No existe conexión con servidores externos ni bases de datos en la nube, lo que significa que los datos nunca abandonan el dispositivo donde se ejecuta la aplicación.

### Características Principales

| Función | Descripción |
| :--- | :--- |
| **Almacenamiento Local** | Los datos persisten en el navegador sin requerir internet. |
| **Gestión Multi-usuario** | Calcula balances individuales separando los gastos e ingresos de cada miembro. |
| **Análisis Visual** | Renderiza gráficas de barras para comparativas anuales y gráficos circulares para la distribución de gastos. |
| **Respaldo Portátil** | Genera archivos JSON para descargar la información y cargarla en otros dispositivos. |
| **Portabilidad Docker** | Se ejecuta desde un contenedor Nginx ligero, sin depender de instalaciones locales de Node.js. |

### Tecnologías Utilizadas

| Herramienta | Propósito en el proyecto |
| :--- | :--- |
| **React** | Lógica de la interfaz de usuario y manejo de estado. |
| **Tailwind CSS** | Sistema de diseño y utilidades de estilo. |
| **Recharts** | Generación de gráficos financieros interactivos. |
| **Lucide React** | Biblioteca de iconos vectoriales. |
| **Docker** | Contenerización mediante un multi-stage build con Nginx y Alpine Linux. |

### Ejecución con Docker

Para correr la aplicación utilizando contenedores, es necesario tener instalado el motor de Docker en el sistema. El proceso de construcción toma el código fuente y genera una imagen estática lista para producción. 

Primero se debe construir la imagen ejecutando este comando en la raíz del proyecto. Esto descargará las dependencias y compilará la aplicación:

```bash
docker build -t contabilidad-familiar .
