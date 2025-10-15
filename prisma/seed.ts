import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Creando datos de prueba...')

  // Crear usuarios
  const adminUser = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@juridico.com',
      role: 'ADMIN',
    },
  })

  const abogado1 = await prisma.user.create({
    data: {
      name: 'Dr. Juan Carlos Rodríguez',
      email: 'jrodriguez@juridico.com',
      role: 'ABOGADO',
    },
  })

  const abogado2 = await prisma.user.create({
    data: {
      name: 'Dra. María Elena González',
      email: 'mgonzalez@juridico.com',
      role: 'ABOGADO',
    },
  })

  const secretario = await prisma.user.create({
    data: {
      name: 'Ana Secretaria',
      email: 'asecretaria@juridico.com',
      role: 'SECRETARIO',
    },
  })

  console.log('Usuarios creados')

  // Crear clientes
  const cliente1 = await prisma.cliente.create({
    data: {
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan.perez@email.com',
      telefono: '+54 11 1234-5678',
      documento: '12345678',
      tipoDocumento: 'DNI',
      tipoPersona: 'FISICA',
      estado: 'ACTIVO',
      direccion: 'Av. Corrientes 1234, CABA',
      cuitCuil: '20-12345678-9',
      domicilio: 'Av. Corrientes 1234, CABA',
      fechaNacimiento: new Date('1980-05-15'),
    },
  })

  const cliente2 = await prisma.cliente.create({
    data: {
      nombre: 'María',
      apellido: 'López',
      email: 'maria.lopez@email.com',
      telefono: '+54 11 8765-4321',
      documento: '87654321',
      tipoDocumento: 'DNI',
      tipoPersona: 'FISICA',
      estado: 'ACTIVO',
      direccion: 'Calle Falsa 123, CABA',
      cuitCuil: '27-87654321-2',
      domicilio: 'Calle Falsa 123, CABA',
      fechaNacimiento: new Date('1975-08-22'),
    },
  })

  const clienteEmpresa = await prisma.cliente.create({
    data: {
      nombre: 'Carlos',
      apellido: 'Martínez',
      email: 'carlos@empresa.com',
      telefono: '+54 11 5555-5555',
      documento: '30123456789',
      tipoDocumento: 'CUIT',
      tipoPersona: 'JURIDICA',
      estado: 'ACTIVO',
      direccion: 'Av. Santa Fe 5678, CABA',
      cuitCuil: '30-12345678-9',
      domicilio: 'Av. Santa Fe 5678, CABA',
      razonSocial: 'Empresa Demo SRL',
      cuit: '30-12345678-9',
      condicionIva: 'RESPONSABLE_INSCRIPTO',
    },
  })

  console.log('Clientes creados')

  // Crear expedientes
  const expediente1 = await prisma.expediente.create({
    data: {
      numero: 'EXP-2024-001',
      caratula: 'Pérez c/ García s/ Daños y Perjuicios',
      fuero: 'CIVIL',
      materia: 'CIVIL_EXTRACONTRACTUAL',
      juzgado: 'Juzgado Civil N° 15',
      secretaria: 'Secretaría N° 30',
      estado: 'ACTIVO',
      fechaInicio: new Date('2024-01-01'),
      fechaProximaAudiencia: new Date('2024-02-15'),
      descripcion: 'Demanda por daños y perjuicios derivados de accidente de tránsito',
      clienteId: cliente1.id,
      responsableId: abogado1.id,
      creadorId: adminUser.id,
    },
  })

  const expediente2 = await prisma.expediente.create({
    data: {
      numero: 'EXP-2024-002',
      caratula: 'López c/ Empresa XYZ s/ Laboral',
      fuero: 'LABORAL',
      materia: 'LABORAL',
      juzgado: 'Juzgado Laboral N° 8',
      secretaria: 'Secretaría N° 16',
      estado: 'ACTIVO',
      fechaInicio: new Date('2024-01-05'),
      fechaProximaAudiencia: new Date('2024-02-18'),
      descripcion: 'Demanda laboral por despido sin justa causa',
      clienteId: cliente2.id,
      responsableId: abogado2.id,
      creadorId: adminUser.id,
    },
  })

  const expediente3 = await prisma.expediente.create({
    data: {
      numero: 'EXP-2024-003',
      caratula: 'Martínez s/ Sucesión',
      fuero: 'CIVIL',
      materia: 'SUCESIONES',
      juzgado: 'Juzgado Civil N° 3',
      secretaria: 'Secretaría N° 5',
      estado: 'SUSPENDIDO',
      fechaInicio: new Date('2024-01-10'),
      descripcion: 'Proceso sucesorio',
      clienteId: clienteEmpresa.id,
      responsableId: abogado1.id,
      creadorId: adminUser.id,
    },
  })

  console.log('Expedientes creados')

  // Crear audiencias
  await prisma.audiencia.create({
    data: {
      fecha: new Date('2024-02-15T10:00:00'),
      hora: '10:00',
      tipo: 'CONCILIACION',
      lugar: 'Sala 3, Juzgado Civil N° 15',
      modalidad: 'PRESENCIAL',
      descripcion: 'Audiencia de conciliación obligatoria',
      estado: 'PROGRAMADA',
      expedienteId: expediente1.id,
      responsableId: abogado1.id,
    },
  })

  await prisma.audiencia.create({
    data: {
      fecha: new Date('2024-02-18T14:30:00'),
      hora: '14:30',
      tipo: 'VISTA_CAUSA',
      lugar: 'Sala 1, Juzgado Laboral N° 8',
      modalidad: 'PRESENCIAL',
      descripcion: 'Vista de causa',
      estado: 'PROGRAMADA',
      expedienteId: expediente2.id,
      responsableId: abogado2.id,
    },
  })

  console.log('Audiencias creadas')

  // Crear tareas
  await prisma.tarea.create({
    data: {
      titulo: 'Presentar contestación de demanda',
      descripcion: 'Preparar y presentar la contestación de demanda dentro del plazo legal',
      prioridad: 'ALTA',
      estado: 'PENDIENTE',
      fechaVencimiento: new Date('2024-01-25'),
      expedienteId: expediente1.id,
      asignadoId: abogado1.id,
    },
  })

  await prisma.tarea.create({
    data: {
      titulo: 'Preparar documentación para audiencia',
      descripcion: 'Reunir y organizar toda la documentación necesaria para la audiencia',
      prioridad: 'MEDIA',
      estado: 'PENDIENTE',
      fechaVencimiento: new Date('2024-02-10'),
      expedienteId: expediente2.id,
      asignadoId: abogado2.id,
    },
  })

  console.log('Tareas creadas')

  // Crear honorarios
  await prisma.honorario.create({
    data: {
      concepto: 'Honorarios por inicio de demanda',
      monto: 150000,
      moneda: 'ARS',
      fechaServicio: new Date('2024-01-01'),
      estado: 'PENDIENTE',
      expedienteId: expediente1.id,
    },
  })

  await prisma.honorario.create({
    data: {
      concepto: 'Honorarios por demanda laboral',
      monto: 200000,
      moneda: 'ARS',
      fechaServicio: new Date('2024-01-05'),
      estado: 'PENDIENTE',
      expedienteId: expediente2.id,
    },
  })

  console.log('Honorarios creados')

  console.log('¡Datos de prueba creados exitosamente!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
