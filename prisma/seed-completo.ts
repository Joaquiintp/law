import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed completo...')

  // Limpiar datos existentes
  console.log('🧹 Limpiando datos anteriores...')
  await prisma.notaExpediente.deleteMany()
  await prisma.consultaIA.deleteMany()
  await prisma.logIA.deleteMany()
  await prisma.honorario.deleteMany()
  await prisma.tarea.deleteMany()
  await prisma.audiencia.deleteMany()
  await prisma.documento.deleteMany()
  await prisma.evento.deleteMany()
  await prisma.expediente.deleteMany()
  await prisma.cliente.deleteMany()
  await prisma.user.deleteMany()
  await prisma.estudio.deleteMany()

  // ===== ESTUDIO JURÍDICO =====
  console.log('🏢 Creando estudio jurídico...')
  const estudio = await prisma.estudio.create({
    data: {
      nombre: 'García & Asociados',
      razonSocial: 'García & Asociados Sociedad Civil',
      cuit: '30-71234567-8',
      email: 'contacto@garciayasociados.com.ar',
      telefono: '+54 11 4567-8900',
      direccion: 'Av. Corrientes 1234, Piso 5°',
      ciudad: 'Ciudad Autónoma de Buenos Aires',
      provincia: 'Buenos Aires',
      codigoPostal: 'C1043',
      activo: true,
      paquete: 'PRO',
      iaLegalActivo: true,
      iaLegalTipo: 'FIJO',
      iaLegalMaxConsultas: 500,
      iaLegalConsultasUsadas: 45,
      maxUsuarios: 20,
      usuariosActivos: 5,
      almacenamientoGB: 25,
      almacenamientoUsadoMB: 3500,
      // Funcionalidades PRO
      whatsappAPI: true,
      emailAPI: true,
      plantillasInteligentes: true,
      portalClienteAvanzado: true,
      agendaIntegrada: true,
      facturacionElectronica: true,
      firmaDigital: true,
      dashboardFinanzas: true,
    },
  })

  // ===== USUARIOS =====
  console.log('👥 Creando usuarios...')
  
  const admin = await prisma.user.create({
    data: {
      name: 'Dr. Alberto García',
      email: 'admin@garciayasociados.com.ar',
      role: 'ADMIN',
      color: '#3B82F6', // Azul
      estudioId: estudio.id,
      activo: true,
    },
  })

  const abogado1 = await prisma.user.create({
    data: {
      name: 'Dr. Juan Carlos Rodríguez',
      email: 'jrodriguez@garciayasociados.com.ar',
      role: 'ABOGADO',
      color: '#10B981', // Verde
      estudioId: estudio.id,
      activo: true,
    },
  })

  const abogado2 = await prisma.user.create({
    data: {
      name: 'Dra. María Elena González',
      email: 'mgonzalez@garciayasociados.com.ar',
      role: 'ABOGADO',
      color: '#8B5CF6', // Púrpura
      estudioId: estudio.id,
      activo: true,
    },
  })

  const abogado3 = await prisma.user.create({
    data: {
      name: 'Dr. Roberto Fernández',
      email: 'rfernandez@garciayasociados.com.ar',
      role: 'ABOGADO',
      color: '#F59E0B', // Ámbar
      estudioId: estudio.id,
      activo: true,
    },
  })

  const secretario = await prisma.user.create({
    data: {
      name: 'Lic. Ana María Torres',
      email: 'atorres@garciayasociados.com.ar',
      role: 'SECRETARIO',
      color: '#EC4899', // Rosa
      estudioId: estudio.id,
      activo: true,
    },
  })

  // ===== CLIENTES =====
  console.log('👔 Creando clientes...')
  
  const cliente1 = await prisma.cliente.create({
    data: {
      razonSocial: 'Juan Pablo Pérez',
      email: 'juanperez@email.com',
      telefono: '+54 11 4321-5678',
      documento: '32456789',
      tipoDocumento: 'DNI',
      cuitCuil: '20-32456789-5',
      tipoPersona: 'FISICA',
      estado: 'ACTIVO',
      domicilio: 'Av. Rivadavia 4567, CABA',
      direccion: 'Av. Rivadavia 4567, CABA',
      fechaNacimiento: new Date('1985-03-15'),
      estudioId: estudio.id,
    },
  })

  const cliente2 = await prisma.cliente.create({
    data: {
      razonSocial: 'María Susana López',
      email: 'marialopez@email.com',
      telefono: '+54 11 5678-1234',
      documento: '28765432',
      tipoDocumento: 'DNI',
      cuitCuil: '27-28765432-3',
      tipoPersona: 'FISICA',
      estado: 'ACTIVO',
      domicilio: 'Calle Santa Fe 2345, CABA',
      direccion: 'Calle Santa Fe 2345, CABA',
      fechaNacimiento: new Date('1978-08-22'),
      estudioId: estudio.id,
    },
  })

  const cliente3 = await prisma.cliente.create({
    data: {
      razonSocial: 'TechSolutions SA',
      email: 'legal@techsolutions.com.ar',
      telefono: '+54 11 6789-2345',
      documento: '30712345678',
      tipoDocumento: 'CUIT',
      cuitCuil: '30-71234567-8',
      cuit: '30-71234567-8',
      tipoPersona: 'JURIDICA',
      estado: 'ACTIVO',
      domicilio: 'Av. Libertador 8900, CABA',
      direccion: 'Av. Libertador 8900, CABA',
      condicionIva: 'RESPONSABLE_INSCRIPTO',
      estudioId: estudio.id,
    },
  })

  const cliente4 = await prisma.cliente.create({
    data: {
      razonSocial: 'Carlos Alberto Martínez',
      email: 'cmartinez@email.com',
      telefono: '+54 11 7890-3456',
      documento: '35123456',
      tipoDocumento: 'DNI',
      cuitCuil: '20-35123456-7',
      tipoPersona: 'FISICA',
      estado: 'ACTIVO',
      domicilio: 'Av. Córdoba 5678, CABA',
      direccion: 'Av. Córdoba 5678, CABA',
      fechaNacimiento: new Date('1990-05-10'),
      estudioId: estudio.id,
    },
  })

  const cliente5 = await prisma.cliente.create({
    data: {
      razonSocial: 'Laura Victoria Sánchez',
      email: 'lsanchez@email.com',
      telefono: '+54 11 8901-4567',
      documento: '29876543',
      tipoDocumento: 'DNI',
      cuitCuil: '27-29876543-2',
      tipoPersona: 'FISICA',
      estado: 'ACTIVO',
      domicilio: 'Av. Callao 1234, CABA',
      direccion: 'Av. Callao 1234, CABA',
      fechaNacimiento: new Date('1982-11-28'),
      estudioId: estudio.id,
    },
  })

  // ===== EXPEDIENTES =====
  console.log('📁 Creando expedientes...')
  
  const expediente1 = await prisma.expediente.create({
    data: {
      numero: 'EXP-2024-001',
      numeroCarpeta: 'C-2024-001',
      caratula: 'Pérez Juan Pablo c/ García Constructora SA s/ Daños y Perjuicios',
      fuero: 'CIVIL',
      materia: 'CIVIL_EXTRACONTRACTUAL',
      juzgado: 'Juzgado Nacional en lo Civil N° 15',
      secretaria: 'Secretaría N° 30',
      estado: 'ACTIVO',
      fechaInicio: new Date('2024-01-15'),
      fechaProximaAudiencia: new Date('2025-11-15'),
      descripcion: 'Demanda por daños y perjuicios derivados de defectos en construcción de vivienda. Aparecieron fisuras estructurales a los 6 meses de la entrega. Se reclama reparación integral y lucro cesante por alquiler temporal.',
      observaciones: 'Pericia técnica programada. Contactar perito ingeniero.',
      clienteId: cliente1.id,
      responsableId: abogado1.id,
      creadorId: admin.id,
      estudioId: estudio.id,
    },
  })

  const expediente2 = await prisma.expediente.create({
    data: {
      numero: 'EXP-2024-002',
      numeroCarpeta: 'C-2024-002',
      caratula: 'López María Susana c/ Empresa Industrial SA s/ Despido',
      fuero: 'LABORAL',
      materia: 'LABORAL',
      juzgado: 'Juzgado Nacional del Trabajo N° 8',
      secretaria: 'Secretaría N° 16',
      estado: 'ACTIVO',
      fechaInicio: new Date('2024-02-01'),
      fechaProximaAudiencia: new Date('2025-11-20'),
      descripcion: 'Demanda laboral por despido sin justa causa. La actora trabajó durante 8 años en relación de dependencia. Se reclaman indemnizaciones por antigüedad, preaviso, integración mes de despido, SAC proporcional y vacaciones no gozadas.',
      observaciones: 'Audiencia SECLO fijada. Preparar liquidación actualizada.',
      clienteId: cliente2.id,
      responsableId: abogado2.id,
      creadorId: admin.id,
      estudioId: estudio.id,
    },
  })

  const expediente3 = await prisma.expediente.create({
    data: {
      numero: 'EXP-2024-003',
      numeroCarpeta: 'C-2024-003',
      caratula: 'TechSolutions SA s/ Asesoramiento Comercial',
      fuero: 'COMERCIAL',
      materia: 'COMERCIAL',
      juzgado: 'N/A - Asesoramiento',
      estado: 'ACTIVO',
      fechaInicio: new Date('2024-03-01'),
      descripcion: 'Asesoramiento legal permanente para empresa de tecnología. Incluye revisión de contratos, políticas laborales, cumplimiento normativo RGPD, propiedad intelectual y resolución extrajudicial de conflictos.',
      observaciones: 'Reunión mensual de seguimiento. Próxima: 15/11.',
      clienteId: cliente3.id,
      responsableId: abogado3.id,
      creadorId: admin.id,
      estudioId: estudio.id,
    },
  })

  const expediente4 = await prisma.expediente.create({
    data: {
      numero: 'EXP-2024-004',
      numeroCarpeta: 'SUC-2024-001',
      caratula: 'Martínez Carlos Alberto - Sucesión',
      fuero: 'CIVIL',
      materia: 'SUCESIONES',
      juzgado: 'Juzgado Nacional en lo Civil N° 3',
      secretaria: 'Secretaría N° 5',
      estado: 'ACTIVO',
      fechaInicio: new Date('2024-02-15'),
      descripcion: 'Proceso sucesorio del Sr. Ricardo Martínez (padre del cliente). Incluye inmuebles en CABA y GBA, cuentas bancarias y vehículos. Herederos: 3 hijos y cónyuge supérstite.',
      observaciones: 'Pendiente valuación fiscal de inmuebles.',
      clienteId: cliente4.id,
      responsableId: abogado1.id,
      creadorId: admin.id,
      estudioId: estudio.id,
    },
  })

  const expediente5 = await prisma.expediente.create({
    data: {
      numero: 'FAM-2024-001',
      numeroCarpeta: 'FAM-2024-001',
      caratula: 'Sánchez Laura Victoria c/ González Ramiro s/ Divorcio y Tenencia',
      fuero: 'CIVIL',
      materia: 'FAMILIA_DIVORCIO',
      juzgado: 'Juzgado Nacional en lo Civil con Competencia en Familia N° 2',
      secretaria: 'Secretaría N° 4',
      estado: 'ACTIVO',
      fechaInicio: new Date('2024-04-01'),
      fechaProximaAudiencia: new Date('2025-11-25'),
      descripcion: 'Divorcio vincular con cuestiones conexas: tenencia compartida de dos menores (8 y 5 años), régimen de comunicación, cuota alimentaria y liquidación de sociedad conyugal. Incluye vivienda familiar en común.',
      observaciones: 'Mediación familiar programada. Evaluar acuerdo extrajudicial.',
      clienteId: cliente5.id,
      responsableId: abogado2.id,
      creadorId: admin.id,
      estudioId: estudio.id,
    },
  })

  // ===== DOCUMENTOS =====
  console.log('📄 Creando documentos...')
  
  await prisma.documento.create({
    data: {
      nombre: 'Demanda_Inicial_Danios_Perjuicios.pdf',
      tipoDocumento: 'DEMANDA',
      rutaArchivo: '/uploads/documentos/exp001_demanda_inicial.pdf',
      tamaño: 245000,
      extension: 'pdf',
      descripcion: 'Escrito de demanda inicial con fundamentos de hecho y derecho',
      expedienteId: expediente1.id,
      creadorId: abogado1.id,
    },
  })

  await prisma.documento.create({
    data: {
      nombre: 'Contrato_Obra_Construccion.pdf',
      tipoDocumento: 'CONTRATO',
      rutaArchivo: '/uploads/documentos/exp001_contrato.pdf',
      tamaño: 189000,
      extension: 'pdf',
      descripcion: 'Contrato de obra entre el cliente y la constructora demandada',
      tags: 'contrato, prueba, construcción',
      expedienteId: expediente1.id,
      creadorId: secretario.id,
    },
  })

  await prisma.documento.create({
    data: {
      nombre: 'Informe_Pericial_Tecnico.pdf',
      tipoDocumento: 'PERICIA',
      rutaArchivo: '/uploads/documentos/exp001_pericial.pdf',
      tamaño: 512000,
      extension: 'pdf',
      descripcion: 'Informe pericial del ingeniero estructural sobre fisuras detectadas',
      tags: 'pericia, técnico, fisuras',
      expedienteId: expediente1.id,
      creadorId: abogado1.id,
    },
  })

  await prisma.documento.create({
    data: {
      nombre: 'Demanda_Laboral_Despido.pdf',
      tipoDocumento: 'DEMANDA',
      rutaArchivo: '/uploads/documentos/exp002_demanda_laboral.pdf',
      tamaño: 198000,
      extension: 'pdf',
      descripcion: 'Escrito inicial de demanda laboral por despido incausado',
      expedienteId: expediente2.id,
      creadorId: abogado2.id,
    },
  })

  await prisma.documento.create({
    data: {
      nombre: 'Recibos_Sueldo_Completos.pdf',
      tipoDocumento: 'OTRO',
      rutaArchivo: '/uploads/documentos/exp002_recibos.pdf',
      tamaño: 876000,
      extension: 'pdf',
      descripcion: 'Comprobante de todos los recibos de sueldo del período trabajado',
      tags: 'recibos, sueldo, prueba documental',
      expedienteId: expediente2.id,
      creadorId: secretario.id,
    },
  })

  await prisma.documento.create({
    data: {
      nombre: 'Contrato_Asesoramiento_Legal.pdf',
      tipoDocumento: 'CONTRATO',
      rutaArchivo: '/uploads/documentos/exp003_contrato.pdf',
      tamaño: 156000,
      extension: 'pdf',
      descripcion: 'Contrato de asesoramiento legal permanente con TechSolutions',
      expedienteId: expediente3.id,
      creadorId: abogado3.id,
    },
  })

  // ===== TAREAS =====
  console.log('✅ Creando tareas...')
  
  const tarea1 = await prisma.tarea.create({
    data: {
      titulo: 'Preparar contestación de demanda',
      descripcion: 'La parte demandada tiene plazo hasta el 20/11 para contestar demanda. Coordinar con cliente para reunir documentación de descargo.',
      tipo: 'PROCESAL',
      prioridad: 'ALTA',
      estado: 'PENDIENTE',
      fechaVencimiento: new Date('2025-11-20'),
      expedienteId: expediente1.id,
      asignadoId: abogado1.id,
    },
  })

  const tarea2 = await prisma.tarea.create({
    data: {
      titulo: 'Contactar perito ingeniero',
      descripcion: 'Coordinar fecha para inspección técnica de la vivienda con fisuras',
      tipo: 'EXTRA_PROCESAL',
      prioridad: 'MEDIA',
      estado: 'PENDIENTE',
      fechaVencimiento: new Date('2025-11-10'),
      expedienteId: expediente1.id,
      asignadoId: secretario.id,
    },
  })

  const tarea3 = await prisma.tarea.create({
    data: {
      titulo: 'Actualizar liquidación indemnizatoria',
      descripcion: 'Recalcular indemnización con tasas actualizadas y presentar en audiencia',
      tipo: 'PROCESAL',
      prioridad: 'ALTA',
      estado: 'PENDIENTE',
      fechaVencimiento: new Date('2025-11-18'),
      expedienteId: expediente2.id,
      asignadoId: abogado2.id,
    },
  })

  const tarea4 = await prisma.tarea.create({
    data: {
      titulo: 'Reunión mensual TechSolutions',
      descripcion: 'Revisión de contratos nuevos y actualización de políticas de compliance',
      tipo: 'EXTRA_PROCESAL',
      prioridad: 'MEDIA',
      estado: 'PENDIENTE',
      fechaVencimiento: new Date('2025-11-15'),
      expedienteId: expediente3.id,
      asignadoId: abogado3.id,
    },
  })

  const tarea5 = await prisma.tarea.create({
    data: {
      titulo: 'Solicitar valuación fiscal',
      descripcion: 'Tramitar valuación fiscal de inmuebles ante AGIP para proceso sucesorio',
      tipo: 'PROCESAL',
      prioridad: 'ALTA',
      estado: 'PENDIENTE',
      fechaVencimiento: new Date('2025-11-12'),
      expedienteId: expediente4.id,
      asignadoId: abogado1.id,
    },
  })

  // ===== AUDIENCIAS =====
  console.log('📅 Creando audiencias...')
  
  await prisma.audiencia.create({
    data: {
      fecha: new Date('2025-11-15T10:00:00'),
      hora: '10:00',
      tipo: 'CONCILIACION',
      lugar: 'Sala 3 - Juzgado Civil N° 15',
      modalidad: 'PRESENCIAL',
      descripcion: 'Audiencia de conciliación obligatoria. Asistencia con cliente y letrado patrocinante.',
      estado: 'PROGRAMADA',
      expedienteId: expediente1.id,
      responsableId: abogado1.id,
    },
  })

  await prisma.audiencia.create({
    data: {
      fecha: new Date('2025-11-20T14:30:00'),
      hora: '14:30',
      tipo: 'VISTA_CAUSA',
      lugar: 'SECLO - Servicio de Conciliación Laboral Obligatoria',
      modalidad: 'PRESENCIAL',
      descripcion: 'Audiencia SECLO para intentar conciliación en demanda laboral',
      estado: 'PROGRAMADA',
      expedienteId: expediente2.id,
      responsableId: abogado2.id,
    },
  })

  await prisma.audiencia.create({
    data: {
      fecha: new Date('2025-11-25T11:00:00'),
      hora: '11:00',
      tipo: 'MEDIACION',
      lugar: 'Centro de Mediación Familiar - Av. Callao 456',
      modalidad: 'PRESENCIAL',
      descripcion: 'Mediación familiar obligatoria previa. Intentar acuerdo sobre tenencia y cuota alimentaria.',
      estado: 'PROGRAMADA',
      expedienteId: expediente5.id,
      responsableId: abogado2.id,
    },
  })

  // ===== NOTAS EN EXPEDIENTES =====
  console.log('📝 Creando notas colaborativas...')
  
  // Notas en Expediente 1
  await prisma.notaExpediente.create({
    data: {
      texto: 'Revisé los documentos iniciales y la demanda está perfectamente estructurada. Los fundamentos son sólidos y tenemos buena prueba documental. Confiado en resultado favorable.',
      expedienteId: expediente1.id,
      autorId: admin.id,
    },
  })

  await prisma.notaExpediente.create({
    data: {
      texto: 'He subido el informe pericial técnico que confirma las fisuras estructurales. El perito es categórico: defectos de construcción. Esto fortalece mucho nuestra posición.',
      expedienteId: expediente1.id,
      autorId: abogado1.id,
      archivoReferenciadoId: (await prisma.documento.findFirst({
        where: { nombre: 'Informe_Pericial_Tecnico.pdf' }
      }))!.id,
    },
  })

  await prisma.notaExpediente.create({
    data: {
      texto: 'Recordatorio: tenemos que preparar la contestación antes del 20/11. Ya coordiné reunión con el cliente para el jueves.',
      expedienteId: expediente1.id,
      autorId: secretario.id,
      tareaReferenciadaId: tarea1.id,
    },
  })

  // Notas en Expediente 2
  await prisma.notaExpediente.create({
    data: {
      texto: 'La audiencia SECLO está confirmada para el 20/11 a las 14:30hs. La contraparte viene con ánimo conciliatorio según su letrado. Buenas chances de acuerdo.',
      expedienteId: expediente2.id,
      autorId: abogado2.id,
    },
  })

  await prisma.notaExpediente.create({
    data: {
      texto: 'Actualicé la liquidación con los índices del último trimestre. El monto total asciende a $3.850.000. Enviado a cliente para su revisión.',
      expedienteId: expediente2.id,
      autorId: abogado2.id,
      tareaReferenciadaId: tarea3.id,
    },
  })

  await prisma.notaExpediente.create({
    data: {
      texto: 'La clienta está conforme con los montos. Autorizó negociar entre $3.500.000 y $3.850.000 en audiencia.',
      expedienteId: expediente2.id,
      autorId: secretario.id,
    },
  })

  // Notas en Expediente 3
  await prisma.notaExpediente.create({
    data: {
      texto: 'Reunión muy productiva con el directorio de TechSolutions. Aprobaron nuevas políticas de RGPD y compliance. Documentación actualizada.',
      expedienteId: expediente3.id,
      autorId: abogado3.id,
    },
  })

  await prisma.notaExpediente.create({
    data: {
      texto: 'Próxima reunión programada para el 15/11. Agenda: revisión de contratos con nuevos proveedores internacionales.',
      expedienteId: expediente3.id,
      autorId: abogado3.id,
      tareaReferenciadaId: tarea4.id,
    },
  })

  // Notas en Expediente 4
  await prisma.notaExpediente.create({
    data: {
      texto: 'Proceso sucesorio avanzando según lo previsto. Todos los herederos están de acuerdo con la partición propuesta.',
      expedienteId: expediente4.id,
      autorId: abogado1.id,
    },
  })

  await prisma.notaExpediente.create({
    data: {
      texto: 'Falta completar la valuación fiscal de los inmuebles. Ya se inició el trámite ante AGIP. Estimado: 15 días hábiles.',
      expedienteId: expediente4.id,
      autorId: secretario.id,
      tareaReferenciadaId: tarea5.id,
    },
  })

  // Notas en Expediente 5
  await prisma.notaExpediente.create({
    data: {
      texto: 'La mediación familiar es clave. Ambas partes están dispuestas a llegar a un acuerdo sobre la tenencia compartida.',
      expedienteId: expediente5.id,
      autorId: abogado2.id,
    },
  })

  await prisma.notaExpediente.create({
    data: {
      texto: 'El padre propone tenencia compartida 50/50 y se compromete a aumentar la cuota alimentaria voluntariamente. Buena predisposición.',
      expedienteId: expediente5.id,
      autorId: admin.id,
    },
  })

  // ===== HONORARIOS =====
  console.log('💰 Creando honorarios...')
  
  await prisma.honorario.create({
    data: {
      concepto: 'Honorarios por inicio de demanda + preparación documental',
      monto: 250000,
      moneda: 'ARS',
      fechaServicio: new Date('2024-01-15'),
      estado: 'COBRADO',
      expedienteId: expediente1.id,
    },
  })

  await prisma.honorario.create({
    data: {
      concepto: 'Honorarios por representación en audiencia de conciliación',
      monto: 150000,
      moneda: 'ARS',
      fechaServicio: new Date('2025-11-15'),
      estado: 'PENDIENTE',
      expedienteId: expediente1.id,
    },
  })

  await prisma.honorario.create({
    data: {
      concepto: 'Honorarios demanda laboral + audiencia SECLO',
      monto: 320000,
      moneda: 'ARS',
      fechaServicio: new Date('2024-02-01'),
      estado: 'PENDIENTE',
      expedienteId: expediente2.id,
    },
  })

  await prisma.honorario.create({
    data: {
      concepto: 'Asesoramiento legal mensual - Octubre 2025',
      monto: 180000,
      moneda: 'ARS',
      fechaServicio: new Date('2025-10-01'),
      estado: 'COBRADO',
      expedienteId: expediente3.id,
    },
  })

  await prisma.honorario.create({
    data: {
      concepto: 'Asesoramiento legal mensual - Noviembre 2025',
      monto: 180000,
      moneda: 'ARS',
      fechaServicio: new Date('2025-11-01'),
      estado: 'PENDIENTE',
      expedienteId: expediente3.id,
    },
  })

  await prisma.honorario.create({
    data: {
      concepto: 'Honorarios proceso sucesorio - Tramitación inicial',
      monto: 280000,
      moneda: 'ARS',
      fechaServicio: new Date('2024-02-15'),
      estado: 'COBRADO',
      expedienteId: expediente4.id,
    },
  })

  await prisma.honorario.create({
    data: {
      concepto: 'Honorarios divorcio y cuestiones conexas',
      monto: 350000,
      moneda: 'ARS',
      fechaServicio: new Date('2024-04-01'),
      estado: 'PENDIENTE',
      expedienteId: expediente5.id,
    },
  })

  // ===== EVENTOS =====
  console.log('🗓️ Creando eventos...')
  
  await prisma.evento.create({
    data: {
      titulo: 'Vencimiento presentación escrito',
      descripcion: 'Vence plazo para presentar contestación de demanda',
      fecha: new Date('2025-11-20'),
      hora: '18:00',
      tipo: 'VENCIMIENTO',
      estado: 'PENDIENTE',
      expedienteId: expediente1.id,
    },
  })

  await prisma.evento.create({
    data: {
      titulo: 'Cobro honorarios audiencia',
      descripcion: 'Cobrar honorarios por representación en audiencia SECLO',
      fecha: new Date('2025-11-21'),
      tipo: 'COBRO',
      monto: 320000,
      moneda: 'ARS',
      estado: 'PENDIENTE',
      expedienteId: expediente2.id,
      clienteId: cliente2.id,
    },
  })

  await prisma.evento.create({
    data: {
      titulo: 'Reunión seguimiento TechSolutions',
      descripcion: 'Revisión de contratos y políticas de compliance',
      fecha: new Date('2025-11-15'),
      hora: '15:00',
      tipo: 'REUNION',
      estado: 'PENDIENTE',
      expedienteId: expediente3.id,
      clienteId: cliente3.id,
    },
  })

  console.log('✅ ¡Seed completado exitosamente!')
  console.log('\n📊 Resumen de datos creados:')
  console.log('   🏢 Estudio: 1')
  console.log('   👥 Usuarios: 5 (1 Admin, 3 Abogados, 1 Secretario)')
  console.log('   👔 Clientes: 5')
  console.log('   📁 Expedientes: 5')
  console.log('   📄 Documentos: 6')
  console.log('   ✅ Tareas: 5')
  console.log('   📅 Audiencias: 3')
  console.log('   📝 Notas: 11')
  console.log('   💰 Honorarios: 7')
  console.log('   🗓️ Eventos: 3')
  console.log('\n🔑 Usuario de prueba:')
  console.log('   Email: admin@garciayasociados.com.ar')
  console.log('   Rol: ADMIN')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
