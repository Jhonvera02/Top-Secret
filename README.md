# 🎁 Amigo Secreto — Top Secret 🦸

Aplicación web moderna y confidencial para el juego de **Amigo Secreto** con dinámicas de **Endulzada** y **Regalo Final**. 

El sistema garantiza que **la identidad real de la persona asignada se mantenga en absoluto secreto** utilizando personajes de la cultura pop y avatares sorpresa.

---

## 🌟 Características Principales

1. **Registro de Participantes**:
   - 👤 Nombre completo
   - ⚧️ Género (Femenino, Masculino, No binario, Otro, Prefiero no decir)
   - 🎁 Qué regalo le gustaría recibir (texto libre)
   - 🍬 Qué le gustaría recibir en la endulzada (texto libre)

2. **Asignación Aleatoria de Personaje**:
   - Al registrarse, el sistema asigna automáticamente a cada participante un personaje ficticio/superhéroe (Batman, Spider-Man, Merlina, Sailor Moon, Barbie, Maestro Yoda, Goku, Hermione, etc.) con su avatar, emoji y frase célebre.

3. **Sorteo Seguro (Algoritmo de Sattolo)**:
   - 🎲 Genera un ciclo cerrado uniforme ($A \to B \to C \to \dots \to A$).
   - 🚫 **Nadie se asigna a sí mismo**.
   - 🎁 La **endulzada** y el **regalo final** corresponden a la **misma persona**.
   - 🔒 **Bloqueo irreversible**: Una vez ejecutado el sorteo, las asignaciones quedan congeladas y se cierran las inscripciones.

4. **Enlaces Privados y Confidencialidad Estricta**:
   - Cada participante recibe un token y enlace privado único (ej: `http://localhost:3001/#token=...`).
   - Al entrar a su enlace, el participante solo ve:
     - Su personaje propio.
     - El **personaje** de su amigo secreto.
     - El **género** de su amigo secreto.
     - Qué quiere de **endulzada** 🍬.
     - Qué quiere de **regalo** 🎁.
   - 🚫 **Nunca verá directamente el nombre de la persona asignada**: El nombre real jamás se envía en la API ni se muestra en la pantalla del participante.

5. **Panel del Organizador / Administrador**:
   - Protegido por PIN maestro (por defecto: `1234`).
   - Monitoreo en tiempo real de participantes registrados.
   - Botón de 1 clic para **Copiar Enlace** privado.
   - Botón de 1 clic para **Compartir por WhatsApp** con mensaje preformateado.
   - Botón para ejecutar el sorteo (mínimo 3 participantes).
   - Opciones de reinicio o edición antes del sorteo.

---

## 🚀 Cómo Iniciar la Aplicación

### Modo Producción (Servidor completo en puerto 3001)

```bash
npm run build
npm start
```
Abre tu navegador en: **`http://localhost:3001`**

### Modo Desarrollo (Hot-Reload)

```bash
npm run dev
```
Abre tu navegador en: **`http://localhost:5173`**

---

## 🧪 Pruebas Automatizadas

El proyecto cuenta con suites de pruebas completas:

```bash
# Probar el algoritmo de sorteo (100 simulaciones de ciclos y auto-asignaciones)
npx tsx tests/raffle.test.ts

# Probar la API completa de extremo a extremo y la privacidad de datos
npx tsx tests/api.test.ts
```

---

## 📁 Estructura del Proyecto

```
Top Secret/
├── server/
│   ├── index.ts        # Servidor Express API y servidor de estáticos
│   ├── routes.ts       # Endpoints REST (registro, revelación, admin)
│   ├── raffle.ts       # Algoritmo de sorteo basado en ciclo de Sattolo
│   ├── characters.ts   # Catálogo de personajes y avatares
│   ├── db.ts           # Almacenamiento persistente en JSON
│   └── types.ts        # Tipos TypeScript compartidos
├── src/
│   ├── App.tsx         # Enrutador principal y layout
│   ├── types.ts        # Tipos para la interfaz
│   ├── components/     # Navbar, CharacterBadge, Modales
│   └── pages/          # RegisterPage, RevealPage, AdminPage
├── data/
│   └── secret_santa.json # Base de datos transaccional en disco
├── tests/              # Pruebas unitarias e integración
└── package.json
```
