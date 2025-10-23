import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Limpiar datos existentes
  await prisma.tarea.deleteMany()
  await prisma.expediente.deleteMany()
  await prisma.cliente.deleteMany()
  await prisma.user.deleteMany()
  await prisma.estudio.deleteMany()

  // Crear estudio jurídico con IA Legal activado
  const estudio = await prisma.estudio.create({
    data: {
      nombre: 'Estudio Jurídico González & Asociados',
      razonSocial: 'González y Asociados S.R.L.',
      direccion: 'Av. Corrientes 1234, CABA',
      telefono: '+54 11 4567-8900',
      email: 'contacto@gonzalez.com.ar',
      cuit: '30-12345678-9',
      paquete: 'PRO',
      maxUsuarios: 20,
      almacenamientoGB: 25,
      iaLegalActivo: true,
      iaLegalTipo: 'FIJO',
      iaLegalFechaActivacion: new Date(),
      iaLegalMaxConsultas: 1000,
      iaLegalConsultasUsadas: 0,
    },
  })
  console.log('✅ Estudio creado con IA Legal activado')

  // Crear usuarios
  const dueno = await prisma.user.create({
    data: {
      name: 'Dr. Alberto González',
      email: 'gonzalez@juridico.com',
      role: 'DUENO',
      color: '#8B5CF6', // Violeta
      estudioId: estudio.id,
      activo: true,
    },
  })

  const admin = await prisma.user.create({
    data: {
      name: 'Administrador del Sistema',
      email: 'admin@juridico.com',
      role: 'ADMIN',
      color: '#EF4444', // Rojo
      estudioId: estudio.id,
      activo: true,
    },
  })

  const abogado1 = await prisma.user.create({
    data: {
      name: 'Dr. Juan Pérez',
      email: 'jperez@gonzalez.com.ar',
      role: 'ABOGADO',
      color: '#3B82F6', // Azul
      estudioId: estudio.id,
      activo: true,
    },
  })

  const abogado2 = await prisma.user.create({
    data: {
      name: 'Dra. María González',
      email: 'mgonzalez@gonzalez.com.ar',
      color: '#10B981', // Verde
      role: 'ABOGADO',
      estudioId: estudio.id,
      activo: true,
    },
  })

  const secretario = await prisma.user.create({
    data: {
      name: 'Laura Martínez',
      email: 'lmartinez@gonzalez.com.ar',
      role: 'SECRETARIO',
      color: '#F59E0B', // Naranja
      estudioId: estudio.id,
      activo: true,
    },
  })
  console.log('✅ Usuarios creados (Dueño, Admin, 2 Abogados, 1 Secretario)')

  // Crear clientes
  const cliente1 = await prisma.cliente.create({
    data: {
      razonSocial: 'Carlos Martínez',
      email: 'carlos@email.com',
      telefono: '+54 11 1234-5678',
      documento: '12345678',
      tipoDocumento: 'DNI',
      tipoPersona: 'FISICA',
      estado: 'ACTIVO',
      estudioId: estudio.id,
    },
  })
  console.log('✅ Cliente creado')

  // Crear expediente
  const expediente1 = await prisma.expediente.create({
    data: {
      numero: 'EXP-2025-001',
      numeroCarpeta: 'CARP-001',
      caratula: 'Martínez c/ López s/ Daños y Perjuicios',
      fuero: 'CIVIL',
      materia: 'CIVIL_EXTRACONTRACTUAL',
      estado: 'ACTIVO',
      estudioId: estudio.id,
      clienteId: cliente1.id,
      responsableId: abogado1.id,
      creadorId: abogado1.id,
      fechaInicio: new Date(),
    },
  })
  console.log('✅ Expediente creado')

  // Crear tareas de ejemplo
  const tarea1 = await prisma.tarea.create({
    data: {
      titulo: 'Revisar documentación del cliente',
      descripcion: 'Verificar que todos los documentos estén en orden antes de la audiencia',
      tipo: 'PROCESAL',
      estado: 'PENDIENTE',
      prioridad: 'ALTA',
      fechaVencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      expedienteId: expediente1.id,
      asignadoId: abogado1.id,
    },
  })

  const tarea2 = await prisma.tarea.create({
    data: {
      titulo: 'Preparar escrito de demanda',
      descripcion: 'Redactar demanda con todos los fundamentos legales',
      tipo: 'PROCESAL',
      estado: 'IMPORTANTE',
      prioridad: 'URGENTE',
      fechaVencimiento: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 días
      expedienteId: expediente1.id,
      asignadoId: abogado2.id,
    },
  })

  const tarea3 = await prisma.tarea.create({
    data: {
      titulo: 'Reunión con cliente',
      descripcion: 'Coordinar reunión para revisar estrategia del caso',
      tipo: 'EXTRA_PROCESAL',
      estado: 'HECHO',
      prioridad: 'MEDIA',
      fechaVencimiento: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // hace 2 días
      fechaCompletado: new Date(),
      expedienteId: expediente1.id,
      asignadoId: abogado1.id,
    },
  })

  console.log('✅ Tareas creadas')
  console.log('\n🎉 Seed completado exitosamente!')
  console.log('\n📊 Resumen:')
  console.log(`  - 1 Estudio: ${estudio.nombre}`)
  console.log(`  - 5 Usuarios (1 Dueño + 1 Admin + 2 Abogados + 1 Secretario)`)
  console.log(`  - 1 Cliente`)
  console.log(`  - 1 Expediente`)
  console.log(`  - 3 Tareas`)
  console.log('\n✨ MÓDULO IA LEGAL ACTIVADO ✅')
  console.log(`  - Tipo: FIJO`)
  console.log(`  - Límite: 1000 consultas/mes`)
  console.log(`  - Estado: Activo`)
  console.log('\n🔑 Credenciales de acceso:')
  console.log(`  👑 DUEÑO:      gonzalez@juridico.com      (contraseña: admin123)`)
  console.log(`  � ADMIN:      admin@juridico.com         (contraseña: admin123)`)
  console.log(`  👨‍⚖️  ABOGADO:    jperez@gonzalez.com.ar     (contraseña: admin123)`)
  console.log(`  👩‍⚖️  ABOGADO:    mgonzalez@gonzalez.com.ar  (contraseña: admin123)`)
  console.log(`  📋 SECRETARIO: lmartinez@gonzalez.com.ar  (contraseña: admin123)`)
  console.log('\n💡 Todos los usuarios tienen acceso al módulo IA Legal')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
