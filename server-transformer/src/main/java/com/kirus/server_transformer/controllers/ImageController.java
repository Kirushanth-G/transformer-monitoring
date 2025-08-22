package com.kirus.server_transformer.controllers;

import com.kirus.server_transformer.dto.InspectionImageDTO;
import com.kirus.server_transformer.dto.TransformerImageDTO;
import com.kirus.server_transformer.entities.Inspection;
import com.kirus.server_transformer.entities.InspectionImage;
import com.kirus.server_transformer.entities.TransformImage;
import com.kirus.server_transformer.entities.Transformer;
import com.kirus.server_transformer.mappers.InspectionImageMapper;
import com.kirus.server_transformer.mappers.TransformerImageMapper;
import com.kirus.server_transformer.repositories.InspectionRepository;
import com.kirus.server_transformer.repositories.InspectionImageRepository;
import com.kirus.server_transformer.repositories.TransformerRepository;
import com.kirus.server_transformer.repositories.TransformerImageRepository;
import com.kirus.server_transformer.service.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/images")
@CrossOrigin(origins = "*")
public class ImageController {
    @Autowired
    private S3Service s3Service;

    @Autowired
    private TransformerRepository transformerRepository;

    @Autowired
    private InspectionRepository inspectionRepository;

    @Autowired
    private TransformerImageRepository transformerImageRepository;

    @Autowired
    private InspectionImageRepository inspectionImageRepository;

    @Autowired
    private TransformerImageMapper transformerImageMapper;

    @Autowired
    private InspectionImageMapper inspectionImageMapper;

    // Upload or update baseline image for a transformer
    @PostMapping("/transformers/{transformerId}")
    public ResponseEntity<?> uploadTransformerImage(
            @PathVariable Long transformerId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "uploaderName", required = false) String uploaderName) {

        try {
            Optional<Transformer> transformerOpt = transformerRepository.findById(transformerId);
            if (transformerOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Transformer not found");
            }

            List<TransformImage> existingImages = transformerImageRepository.findByTransformerId(transformerId);

            if (!existingImages.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    "Transformer already has a baseline image. Only one baseline image is allowed per transformer. " +
                    "Please delete the existing image first if you want to upload a new one."
                );
            }

            String imageUrl = s3Service.uploadFile(file);
            TransformImage image = new TransformImage();
            image.setTransformer(transformerOpt.get());
            image.setImageUrl(imageUrl);
            image.setUploaderName(uploaderName != null ? uploaderName : "Unknown");
            image.setUploadTime(LocalDateTime.now());

            TransformImage savedImage = transformerImageRepository.save(image);
            TransformerImageDTO dto = transformerImageMapper.toDTO(savedImage);

            return ResponseEntity.ok().body(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to upload image: " + e.getMessage());
        }
    }

    // Upload or update inspection image for an inspection
    @PostMapping("/inspections/{inspectionId}")
    public ResponseEntity<?> uploadInspectionImage(
            @PathVariable Long inspectionId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "environmentalCondition", required = false) String environmentalCondition,
            @RequestParam(value = "uploaderName", required = false) String uploaderName) {

        try {
            Optional<Inspection> inspectionOpt = inspectionRepository.findById(inspectionId);
            if (inspectionOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Inspection not found");
            }

            List<InspectionImage> existingImages = inspectionImageRepository.findByInspectionId(inspectionId);

            if (!existingImages.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    "Inspection already has an image. Only one image is allowed per inspection. " +
                    "Please delete the existing image first if you want to upload a new one."
                );
            }

            String imageUrl = s3Service.uploadFile(file);
            InspectionImage image = new InspectionImage();
            image.setInspection(inspectionOpt.get());
            image.setImageUrl(imageUrl);
            image.setEnvironmentalCondition(environmentalCondition);
            image.setUploaderName(uploaderName != null ? uploaderName : "Unknown");
            image.setUploadTime(LocalDateTime.now());

            InspectionImage savedImage = inspectionImageRepository.save(image);
            InspectionImageDTO dto = inspectionImageMapper.toDTO(savedImage);

            return ResponseEntity.ok().body(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to upload image: " + e.getMessage());
        }
    }

    // Get baseline image for a transformer
    @GetMapping("/transformers/{transformerId}")
    public ResponseEntity<?> getTransformerImage(@PathVariable Long transformerId) {
        Optional<Transformer> transformerOpt = transformerRepository.findById(transformerId);
        if (transformerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Transformer not found");
        }

        List<TransformImage> images = transformerImageRepository.findByTransformerId(transformerId);
        if (images.isEmpty()) {
            return ResponseEntity.ok().body("No baseline image found for this transformer");
        }

        TransformerImageDTO dto = transformerImageMapper.toDTO(images.get(0));
        return ResponseEntity.ok(dto);
    }

    // Get image for an inspection
    @GetMapping("/inspections/{inspectionId}")
    public ResponseEntity<?> getInspectionImage(@PathVariable Long inspectionId) {
        Optional<Inspection> inspectionOpt = inspectionRepository.findById(inspectionId);
        if (inspectionOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Inspection not found");
        }

        List<InspectionImage> images = inspectionImageRepository.findByInspectionId(inspectionId);
        if (images.isEmpty()) {
            return ResponseEntity.ok().body("No image found for this inspection");
        }

        InspectionImageDTO dto = inspectionImageMapper.toDTO(images.get(0));
        return ResponseEntity.ok(dto);
    }

    // Delete transformer baseline image
    @DeleteMapping("/transformers/{transformerId}")
    public ResponseEntity<?> deleteTransformerImage(@PathVariable Long transformerId) {
        Optional<Transformer> transformerOpt = transformerRepository.findById(transformerId);
        if (transformerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Transformer not found");
        }

        List<TransformImage> images = transformerImageRepository.findByTransformerId(transformerId);
        if (images.isEmpty()) {
            return ResponseEntity.badRequest().body("No image found to delete");
        }

        transformerImageRepository.deleteById(images.get(0).getId());
        return ResponseEntity.ok("Transformer baseline image deleted successfully");
    }

    // Delete inspection image
    @DeleteMapping("/inspections/{inspectionId}")
    public ResponseEntity<?> deleteInspectionImage(@PathVariable Long inspectionId) {
        Optional<Inspection> inspectionOpt = inspectionRepository.findById(inspectionId);
        if (inspectionOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Inspection not found");
        }

        List<InspectionImage> images = inspectionImageRepository.findByInspectionId(inspectionId);
        if (images.isEmpty()) {
            return ResponseEntity.badRequest().body("No image found to delete");
        }

        inspectionImageRepository.deleteById(images.get(0).getId());
        return ResponseEntity.ok("Inspection image deleted successfully");
    }
}
