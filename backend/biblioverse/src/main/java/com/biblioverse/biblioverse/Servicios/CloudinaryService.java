package com.biblioverse.biblioverse.Servicios;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    public String subirArchivo(MultipartFile archivo) throws IOException {

        if (archivo == null) {
            throw new IllegalArgumentException("Archivo recibido es null");
        }

        if (archivo.isEmpty()) {
            throw new IllegalArgumentException("Archivo está vacío");
        }

        Map resultado = cloudinary.uploader().upload(
                archivo.getBytes(),
                ObjectUtils.asMap(
                        "resource_type", "auto"  // permite PDF, imágenes, etc.
                )
        );

        return resultado.get("secure_url").toString();
    }
}

