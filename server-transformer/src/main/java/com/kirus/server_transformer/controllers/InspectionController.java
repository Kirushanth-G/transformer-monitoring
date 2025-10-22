package com.kirus.server_transformer.controllers;

import com.kirus.server_transformer.dtos.InspectionCreateRequest;
import com.kirus.server_transformer.dtos.InspectionDto;
import com.kirus.server_transformer.dtos.InspectionUpdateRequest;
import com.kirus.server_transformer.dtos.PagedResponse;
import com.kirus.server_transformer.dtos.AnnotationSaveRequest;
import com.kirus.server_transformer.dtos.UserAnnotationDto;
import com.kirus.server_transformer.entities.Inspection;
import com.kirus.server_transformer.entities.Transformer;
import com.kirus.server_transformer.mappers.InspectionMapper;
import com.kirus.server_transformer.repositories.InspectionRepository;
import com.kirus.server_transformer.repositories.TransformerRepository;
import com.kirus.server_transformer.services.UserAnnotationService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(
  origins = {"http://localhost:5173" , "http://react-powergrid.s3-website-ap-southeast-1.amazonaws.com"},
  allowedHeaders = {"*"},
  methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS },
  maxAge = 3600
)
@AllArgsConstructor
@RestController
@RequestMapping("/inspections")
public class InspectionController {

  private final InspectionRepository inspectionRepository;
  private final InspectionMapper inspectionMapper;
  private final TransformerRepository transformerRepository;
  private final UserAnnotationService userAnnotationService;

  @GetMapping
  public ResponseEntity<PagedResponse<InspectionDto>> getAllInspections(
          @RequestParam(defaultValue = "0") int page,
          @RequestParam(defaultValue = "10") int size) {

    Pageable pageable = PageRequest.of(page, size);
    Page<Inspection> inspectionPage = inspectionRepository.findAll(pageable);

    Page<InspectionDto> inspectionDtoPage = inspectionPage.map(inspectionMapper::toDto);
    PagedResponse<InspectionDto> response = PagedResponse.of(inspectionDtoPage);

    return ResponseEntity.ok(response);
  }

  @GetMapping("/transformer/{transformerId}")
  public ResponseEntity<PagedResponse<InspectionDto>> getInspectionsByTransformer(
          @PathVariable String transformerId,
          @RequestParam(defaultValue = "0") int page,
          @RequestParam(defaultValue = "10") int size) {

    Transformer transformer = transformerRepository.findByTransformerId(transformerId).orElse(null);
    if (transformer == null) {
      return ResponseEntity.notFound().build();
    }

    Pageable pageable = PageRequest.of(page, size);
    Page<Inspection> inspectionPage = inspectionRepository.findByTransformerId(transformer.getId(), pageable);

    Page<InspectionDto> inspectionDtoPage = inspectionPage.map(inspectionMapper::toDto);
    PagedResponse<InspectionDto> response = PagedResponse.of(inspectionDtoPage);

    return ResponseEntity.ok(response);
  }

  @GetMapping("/{id}")
    public ResponseEntity<InspectionDto> getInspectionById(@PathVariable Long id) {
        Inspection inspection = inspectionRepository.findById(id).orElse(null);
        if (inspection == null) {
          return ResponseEntity.notFound().build();
        }
        InspectionDto inspectionDto = inspectionMapper.toDto(inspection);
        return ResponseEntity.ok(inspectionDto);
    }

  @PostMapping
  public ResponseEntity<Inspection> createInspection(@RequestBody InspectionCreateRequest request) {
    Inspection inspection = inspectionMapper.toEntity(request);

    Transformer transformer = transformerRepository.findByTransformerId(request.getTransformerId()).orElse(null);
    if (transformer == null) {
      return ResponseEntity.notFound().build();
    }
    inspection.setTransformer(transformer);

    int maxRetries = 5;
    for (int i = 0; i < maxRetries; i++) {
      Integer maxNo = inspectionRepository.findMaxInspectionNoByTransformerId(transformer.getId());
      int nextNo = (maxNo == null ? 1 : maxNo + 1);
      String inspectionNo = String.format("INSP-%03d", nextNo);
      inspection.setInspectionNo(inspectionNo);
      inspection.setStatus("Pending");

      try {
        inspectionRepository.save(inspection);
        return ResponseEntity.ok().build();
      } catch (org.springframework.dao.DataIntegrityViolationException e) {
        // Duplicate key, try again
      }
    }
    return ResponseEntity.status(409).build(); // Conflict
  }

  @PutMapping("/{id}")
  public ResponseEntity<InspectionDto> updateInspection(@PathVariable Long id, @RequestBody InspectionUpdateRequest request) {
    Inspection existingInspection = inspectionRepository.findById(id).orElse(null);
    if (existingInspection == null) {
      return ResponseEntity.notFound().build();
    }

    Transformer transformer = transformerRepository.findByTransformerId(request.getTransformerId()).orElse(null);
    if (transformer == null) {
      return ResponseEntity.notFound().build();
    }

    existingInspection.setInspectionNo(request.getInspectionNo());
    existingInspection.setTransformer(transformer);
    existingInspection.setBranch(request.getBranch());
    existingInspection.setInspectedAt(request.getInspectedAt());
    existingInspection.setMaintenanceAt(request.getMaintenanceAt());
    existingInspection.setStatus(request.getStatus());

    Inspection savedInspection = inspectionRepository.save(existingInspection);
    InspectionDto inspectionDto = inspectionMapper.toDto(savedInspection);
    return ResponseEntity.ok(inspectionDto);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteInspection(@PathVariable Long id) {
    Inspection inspection = inspectionRepository.findById(id).orElse(null);
    if (inspection == null) {
      return ResponseEntity.notFound().build();
    }
    inspectionRepository.delete(inspection);
    return ResponseEntity.noContent().build();
  }

  // Save/override annotations for an inspection image
  @PostMapping("/{id}/annotations")
  public ResponseEntity<Map<String, Object>> saveAnnotations(
      @PathVariable Long id,
      @RequestBody AnnotationSaveRequest request
  ) {
    try {
      // Validate inspection exists
      if (!inspectionRepository.existsById(id)) {
        return ResponseEntity.notFound().build();
      }

      // Save annotations using the service
      Map<String, Object> response = userAnnotationService.saveAnnotations(id, request);
      return ResponseEntity.ok(response);
      
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    } catch (Exception e) {
      return ResponseEntity.status(500).body(Map.of("error", "Failed to save annotations: " + e.getMessage()));
    }
  }

  // Reset/delete annotations for a given inspection image
  @DeleteMapping("/{id}/annotations/{imageId}")
  public ResponseEntity<Map<String, Object>> resetAnnotations(
      @PathVariable Long id,
      @PathVariable Long imageId
  ) {
    try {
      if (!inspectionRepository.existsById(id)) {
        return ResponseEntity.notFound().build();
      }
      
      userAnnotationService.deleteAnnotationsByImageId(imageId);
      return ResponseEntity.ok(Map.of("reset", true, "imageId", imageId));
      
    } catch (Exception e) {
      return ResponseEntity.status(500).body(Map.of("error", "Failed to reset annotations: " + e.getMessage()));
    }
  }

  // Get annotations for an image
  @GetMapping("/{id}/annotations/{imageId}")
  public ResponseEntity<List<UserAnnotationDto>> getAnnotations(
      @PathVariable Long id,
      @PathVariable Long imageId
  ) {
    try {
      if (!inspectionRepository.existsById(id)) {
        return ResponseEntity.notFound().build();
      }
      
      List<UserAnnotationDto> annotations = userAnnotationService.getAnnotationsByImageId(imageId);
      return ResponseEntity.ok(annotations);
      
    } catch (Exception e) {
      return ResponseEntity.status(500).build();
    }
  }
}
