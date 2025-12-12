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
        Map resultado = cloudinary.uploader().upload(archivo.getBytes(), ObjectUtils.emptyMap());
        return resultado.get("secure_url").toString();
    }
}
