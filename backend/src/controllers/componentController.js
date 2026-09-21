import * as componentService from "../services/componentService.js";
import Componentes from "../models/Componentes.js";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import xlsx from "xlsx";

const buildImageRef = (file) => {
  if (!file) {
    return null;
  }

  return `/uploads/${file.filename}`;
};

export const getAllComponents = async (req, res) => {
  try {
    const components = await componentService.getAllComponents(); 
    res.status(200).json(components);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los componentes" });
  }
};

export const createComponent = async (req, res) => {
  try {
    const component = await componentService.createComponent(req.body);
    res.status(201).json(component);
  } catch (error) {
    console.error(error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "El SKU ya existe" });
    }
    res.status(400).json({ error: error.message });
  }
};  

export const uploadComponentImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Debes enviar una imagen" });
    }

    res.status(201).json({
      message: "Imagen subida correctamente",
      image_ref: buildImageRef(req.file),
      filename: req.file.filename,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || "Error al subir la imagen" });
  }
};

export const getComponentImageById = async (req, res) => {
  try {
    const component = await componentService.getComponentById(req.params.id);

    if (!component) {
      return res.status(404).json({ error: "El componente no existe" });
    }

    if (!component.imagen_ref) {
      return res.status(404).json({ error: "El componente no tiene imagen asociada" });
    }

    const filename = path.basename(component.imagen_ref);
    const filePath = path.resolve(process.cwd(), "uploads", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "La imagen no existe en el servidor" });
    }

    return res.sendFile(filePath);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || "Error al obtener la imagen" });
  }
};

export const updateComponent = async (req, res) => {
  try {
    const componentData = { ...req.body };
    
    if (req.file) {
        componentData.imagen_ref = `/uploads/${req.file.filename}`;
    }

    const component = await componentService.updateComponent(req.params.id, componentData);

    if (!component) {
        return res.status(404).json({ error: "Componente no encontrado" });
    }

    res.status(200).json(component);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "El SKU ya está en uso por otro equipo" });
    }
    res.status(400).json({ error: error.message });
  }
};

export const deleteComponent = async (req, res) => {
  try {
    const result = await componentService.deleteComponent(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    if (error.message === "Componente no encontrado") {
      return res.status(404).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
};

export const searchComponents = async (req, res) => {
  try {
    const { q } = req.query; 
    
    const componentes = await componentService.searchComponents(q); 
    
    res.status(200).json(componentes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Error al realizar la búsqueda" });
  }
  
};export const importZip = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se ha subido ningún archivo ZIP." });
    }

    const rutaDestino = path.resolve(process.cwd(), "uploads", "productos");
    if (!fs.existsSync(rutaDestino)) {
      fs.mkdirSync(rutaDestino, { recursive: true });
    }

    const zip = new AdmZip(req.file.buffer);
    const entradasZip = zip.getEntries();
    
    let imagenesExtraidas = 0;
    let datosExcel = null;

    entradasZip.forEach((entrada) => {
      // Extraer imágenes
      if (!entrada.isDirectory && /\.(jpg|jpeg|png|gif|webp)$/i.test(entrada.entryName)) {
        const nombreArchivo = path.basename(entrada.entryName);
        const rutaFinal = path.join(rutaDestino, nombreArchivo);
        fs.writeFileSync(rutaFinal, entrada.getData());
        imagenesExtraidas++;
      }

      // Procesar Excel
      if (!entrada.isDirectory && entrada.entryName.endsWith(".xlsx")) {
        const workbook = xlsx.read(entrada.getData(), { type: "buffer" });
        const nombreHoja = workbook.SheetNames[0];
        datosExcel = xlsx.utils.sheet_to_json(workbook.Sheets[nombreHoja]);
      }
    });

    if (!datosExcel) {
      return res.status(400).json({ error: "No se encontró ningún archivo Excel en el ZIP." });
    }

    // Procesado y sincronización
    for (const item of datosExcel) {
      try {
        const nombreImagen = item.Imagen ? path.basename(item.Imagen) : null;
        const referenciaImagen = nombreImagen ? `/uploads/productos/${nombreImagen}` : null;

        await Componentes.upsert({
          sku: item.SKU,
          lab_id: item.Laboratorio,
          familia: item.Nombre,
          modelo: item.Modelo,
          tipo: item.Tipo,
          cantidad: item.Cantidad,
          codigo_utalca: item.CodigoUtalca,
          numero_serial: item.CodigoSerie,
          imagen_ref: referenciaImagen,
          descripcion: item.Descripcion
        });
      } catch (err) {
        console.error(`Error al procesar SKU ${item.SKU}:`, err.message);
      }
    }

    return res.status(200).json({
      message: "Procesamiento y guardado exitoso",
      detalles: {
        imagenes: imagenesExtraidas,
        productos: datosExcel.length
      }
    });

  } catch (error) {
    console.error("Error crítico en importZip:", error);
    return res.status(500).json({ error: "Error interno al procesar el archivo ZIP." });
  }
};