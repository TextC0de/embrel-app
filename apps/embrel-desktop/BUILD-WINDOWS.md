# Generar Ejecutable de EMBREL Desktop para Windows

## Requisitos Previos
- Node.js instalado
- Windows 10 o superior (para compilar en Windows)
- O macOS/Linux con Wine instalado (para compilación cruzada)

## Pasos para Generar el .exe

### 1. Instalar Dependencias
```bash
cd apps/embrel-desktop
npm install
```

### 2. Compilar la Aplicación
```bash
npm run build
```

### 3. Generar el Ejecutable Windows
```bash
# Para generar solo el portable (.exe único)
npm run dist:win

# O para generar todos los distribuidores (portable + instalador)
npm run dist
```

### 4. Ubicación del Ejecutable
Los ejecutables se generarán en la carpeta `release/`:
- **Portable**: `release/EMBREL-Desktop-Portable-1.0.0.exe`
- **Instalador**: `release/EMBREL-Desktop-Setup-1.0.0.exe`

## Importante: Permisos de Administrador

⚠️ **La aplicación REQUIERE permisos de administrador para funcionar correctamente**

### ¿Por qué necesita permisos de administrador?
La aplicación utiliza `robotjs` para simular escritura de teclado automática. Esta funcionalidad requiere permisos elevados en Windows para:
- Enviar pulsaciones de teclas a otras aplicaciones
- Simular la tecla Enter
- Interactuar con el sistema operativo

### Cómo ejecutar la aplicación:

#### Opción 1: Ejecutable Portable
1. Haz clic derecho en `EMBREL-Desktop-Portable-1.0.0.exe`
2. Selecciona **"Ejecutar como administrador"**
3. Acepta el diálogo de Control de Cuentas de Usuario (UAC)

#### Opción 2: Instalador
1. Ejecuta `EMBREL-Desktop-Setup-1.0.0.exe`
2. El instalador solicitará permisos de administrador automáticamente
3. Una vez instalado, la aplicación siempre se ejecutará con permisos elevados

## Solución de Problemas

### Error: "robotjs.node was compiled against a different Node.js version"
Si encuentras este error al ejecutar el .exe:
1. Asegúrate de compilar en la misma arquitectura que usarás (x64 o ia32)
2. Reconstruye los módulos nativos:
   ```bash
   npm rebuild robotjs
   npx electron-rebuild
   ```

### El auto-typing no funciona
- Verifica que la aplicación se esté ejecutando como administrador
- Comprueba que el antivirus no esté bloqueando la funcionalidad
- Asegúrate de que el cursor esté en un campo de texto cuando se envíe el código

### Windows Defender marca el archivo como sospechoso
Esto es normal para aplicaciones no firmadas que requieren permisos de administrador:
1. Puedes agregar una excepción en Windows Defender
2. O considera firmar digitalmente la aplicación con un certificado de código

## Distribución

Para distribuir la aplicación a usuarios finales:

1. **Recomienda el instalador** para usuarios menos técnicos
   - Se encarga de los permisos automáticamente
   - Crea accesos directos
   - Permite desinstalación fácil

2. **El portable** es ideal para:
   - Pruebas rápidas
   - Usuarios que prefieren no instalar software
   - Uso en múltiples computadoras

## Notas de Seguridad

- La aplicación solo simula escritura cuando recibe datos escaneados válidos
- No captura ni registra pulsaciones de teclas del usuario
- Solo escribe el número de secuencia del pasajero escaneado
- El código fuente está disponible para auditoría