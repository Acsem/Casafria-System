// Configuración personalizable del PDF - Formato Ecuafrim Original
const pdfConfig = {
    // Información de la empresa
    company: {
        name: "Centro de Servicio Técnico EcuaFrim",
        slogan: "REPARACIÓN, INSTALACIÓN Y MANTENIMIENTO LÍNEA BLANCA Y CALEFACCIÓN",
        logo: "images/ecuafrim-logo.png",
        owner: "JUAN CARLOS CHAUCA CALLE",
        address: "Ricaurte Luis García Pañora S/N y calle Centro de Salud",
        phone: "0985043098 - 0986271916",
        email: "ecuafrim_cuenca@hotmail.com"
    },

    // Configuración del documento
    document: {
        title: "ORDEN DE SERVICIO",
        fileName: "orden_servicio",
        format: "a4",
        orientation: "portrait",
    },

    // Secciones del formulario
    sections: {
        clientInfo: "INFORMACIÓN DEL CLIENTE",
        serviceRequest: "SOLICITUD DEL SERVICIO",
        serviceCompletion: "TERMINACIÓN DEL SERVICIO",
        articleData: "DATOS DE ARTICULOS",
        reportedDamage: "DAÑO REPORTADO",
        actualDamage: "DAÑO REAL",
        solution: "SOLUCIÓN",
        partsData: "DATOS DE REPUESTOS",
        warehouseData: "DATOS DE ALMACEN",
        observations: "OBSERVACIONES"
    },

    // Campos del formulario
    fields: {
        clientId: "C. IDENTIDAD",
        user: "USUARIO",
        address: "DIRECCIÓN",
        city: "CIUDAD",
        phone: "TELF:",
        domicile: "DOMICILIO",
        warehouse: "ALMACEN",
        pickup: "RETIRO",
        day: "DIA",
        month: "MES",
        year: "AÑO",
        model: "MODELO",
        series: "SERIE",
        voltage: "VOLTAJE",
        warranty: "GARANTIA",
        yes: "SI",
        no: "NO",
        partCode: "CODIGO PT",
        spareCode: "CODIGO REPUESTO",
        quantity: "CANT.",
        spare: "REPUESTO",
        purchaseDate: "FECHA DE COMPRA",
        mileage: "KILOMETRAJE",
        labor: "MANO DE OBRA",
        iva: "IVA",
        total: "TOTAL"
    },

    // Textos para el informe técnico
    technicalReport: {
        title: "DIAGNÓSTICO TÉCNICO",
        diagnosis: "DEFECTOS ENCONTRADOS:",
        solution: "SOLUCIÓN APLICADA:",
        observations: "OBSERVACIONES ADICIONALES:",
        clientSignature: "FIRMA DEL CLIENTE",
        technicianSignature: "FIRMA DEL TÉCNICO",
        warranty: "GARANTÍA",
        laborCost: "COSTO MANO DE OBRA",
        totalCost: "TOTAL A PAGAR"
    },

    // Configuración de colores
    colors: {
        primary: "#1e3a8a",
        secondary: "#3b82f6",
        text: "#333333",
        border: "#000000",
        header: "#000000",
        white: "#ffffff",
        lightBlue: "#e6f3ff",
        darkBlue: "#1e3a8a"
    },

    // Configuración de la fuente
    font: {
        family: "Arial, sans-serif",
        size: {
            title: "18px",
            subtitle: "14px",
            normal: "12px",
            small: "10px",
            header: "16px"
        }
    },

    // Textos personalizables
    texts: {
        footer: "Gracias por confiar en Ecuafrim",
        terms: "Declaro que entregue mi producto en las condiciones que estan escritas en este documento ECUAFRIM no se responsabiliza, Si despues de los 90 dias no ha retirado su equipo, no nos hacemos responsables después de ese tiempo por ningún trabajo realizado, ni equipos no retirados, sin ninguna exepción. No se regresará anticipo.",
        disclaimer: "Declaro que entregue mi producto en las condiciones que estan escritas en este documento ECUAFRIM no se responsabiliza, Si despues de los 90 dias no ha retirado su equipo, no nos hacemos responsables después de ese tiempo por ningún trabajo realizado, ni equipos no retirados, sin ninguna exepción. No se regresará anticipo."
    },

}; 