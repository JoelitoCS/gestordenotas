<p align="center">
  <img src="public/favicon.svg" width="64" height="64" alt="Clavey logo" />
</p>

<h1 align="center">Clavey</h1>

<p align="center">
  <strong>Tu espacio personal para notas y contraseñas.</strong><br/>
  Escribe, organiza y protege lo que más importa. Sin complicaciones.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PWA-installable-5A0FC8?style=flat-square&logo=pwa" alt="PWA" />
  <img src="https://img.shields.io/badge/AES--256--GCM-cifrado-22c55e?style=flat-square&logo=letsencrypt" alt="AES-256" />
</p>

---

## ¿Qué es Clavey?

**Clavey** es una aplicación web progresiva (PWA) diseñada para la gestión personal de notas y contraseñas. Pensada para ser rápida, limpia y segura, permite a cualquier usuario organizar su información más sensible en un único espacio privado, accesible desde cualquier dispositivo.

El nombre **Clavey** es una fusión de *clave* (español) y *key* (inglés), dos palabras que resumen perfectamente la esencia del proyecto: un lugar donde guardar tus claves y lo que más importa.

---

## ✨ Funcionalidades

### 📝 Módulo de Notas
- Editor de texto rico con soporte de **negrita**, *cursiva*, títulos, listas, colores y resaltado
- Inserción de **imágenes** con previsualización en tiempo real
- **15 colores de fondo** para personalizar cada nota (saturados y pastel)
- **Etiquetas** para organizar y filtrar
- **Búsqueda en tiempo real** sobre título, contenido y etiquetas
- **Exportación a PDF** preservando todo el formato: listas, imágenes, colores y estilos

### 🔐 Módulo de Contraseñas
- Almacenamiento cifrado con **AES-256-GCM** en servidor
- Las contraseñas solo se revelan cuando el usuario lo solicita, durante **60 segundos**
- Contador visual de tiempo de exposición
- **Copia al portapapeles** con confirmación visual animada
- Icono personalizable por servicio

### 👤 Perfil de usuario
- Cambio de nombre y foto de perfil
- Actualización de contraseña de acceso
- Soporte de **Google OAuth** y email/contraseña

### 🌙 Experiencia
- **Modo oscuro y claro** con toggle persistente
- Diseño **totalmente responsive**: móvil, tablet y escritorio
- Instalable como **PWA** en iOS, Android, Windows y Mac
- Animaciones de scroll y transiciones suaves

---

## 🛡️ Seguridad y privacidad

La privacidad del usuario es el eje central de Clavey. A continuación se detalla cómo se tratan los datos:

### Contraseñas cifradas
Las contraseñas almacenadas en el gestor se cifran en el servidor mediante **AES-256-GCM** antes de ser guardadas en la base de datos. La clave de cifrado se deriva de forma única para cada usuario utilizando `scrypt`. Esto significa que, incluso en el hipotético caso de que alguien accediera a la base de datos, los datos serían completamente ilegibles sin la clave maestra.

> **Nadie tiene acceso a tus contraseñas en texto plano.** Ni siquiera el administrador de la aplicación puede leer su contenido.

### Autenticación
La autenticación está gestionada por **Supabase Auth**, una plataforma de nivel empresarial con infraestructura propia de seguridad, cifrado de sesiones con JWT y soporte de OAuth.

### Row Level Security (RLS)
La base de datos tiene activado el sistema de **Row Level Security** de Supabase. Esto garantiza a nivel de base de datos que cada usuario únicamente puede leer, modificar o eliminar sus propios datos. No existe ninguna consulta que permita a un usuario acceder a los datos de otro.

### Notas
Las notas se almacenan en texto sin cifrado adicional, pero están protegidas por las políticas de RLS. Solo el usuario propietario puede acceder a ellas.

### Uso de los datos
Clavey no vende, cede ni comparte ningún dato personal con terceros. Los datos se almacenan exclusivamente para ofrecer el servicio al usuario que los ha introducido.

---

## 🚀 Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Estilos | CSS-in-JS con variables CSS (dark/light mode) |
| Editor | TipTap v3 |
| Auth & DB | Supabase (PostgreSQL + Auth + Storage) |
| Cifrado | AES-256-GCM (Node.js `crypto`) |
| PDF | jsPDF + html2canvas |
| Despliegue | Vercel |
| PWA | Service Worker manual + Web App Manifest |

---

## 📦 Instalación local

```bash
# 1. Clonar el repositorio
git clone https://github.com/joelcansan/gestordenotas.git
cd gestordenotas

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local con tus credenciales de Supabase

# 4. Ejecutar en desarrollo
npm run dev

# 5. Build de producción
npm run build && npm run start
```

### Variables de entorno requeridas

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ENCRYPTION_SECRET=
NEXT_PUBLIC_APP_URL=
```

---

## 🗄️ Base de datos

El esquema SQL completo se encuentra en `supabase/schema.sql`. Incluye:

- Tabla `profiles` — datos del usuario (nombre, avatar)
- Tabla `notes` — notas con contenido HTML, color, etiquetas
- Tabla `password_entries` — contraseñas cifradas
- Políticas RLS para cada tabla
- Buckets de Storage para avatares e imágenes de notas

---

## 📱 PWA — Instalar como app

Clavey es instalable como aplicación nativa en cualquier plataforma:

| Plataforma | Cómo instalar |
|---|---|
| **Android** (Chrome) | Menú `⋮` → *Instalar app* |
| **PC / Mac** (Chrome, Edge) | Icono de instalación en la barra de direcciones |
| **iPhone / iPad** (Safari) | Botón compartir → *Añadir a pantalla de inicio* |

---

## 🤝 Contribuciones

Este proyecto es de uso personal y familiar. Si encuentras algún fallo o tienes alguna sugerencia, puedes abrir un issue en el repositorio.

---

<p align="center">
  Hecho con ☕ por <a href="https://github.com/joelcansan">Joel Cano</a>
</p>
