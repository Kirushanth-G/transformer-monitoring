package com.kirus.server_transformer.controllers;

import com.kirus.server_transformer.dtos.TransformerDto;
import com.kirus.server_transformer.entities.Transformer;
import com.kirus.server_transformer.mappers.TransformerMapper;
import com.kirus.server_transformer.repositories.TransformerRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@AllArgsConstructor
@RestController
@RequestMapping("/transformers")
public class TransformerController {

    private final TransformerRepository transformerRepository;
    private final TransformerMapper transformerMapper;

    @GetMapping
    public List<TransformerDto> getAllTransformers() {
        List<Transformer> transformers = transformerRepository.findAll();
        return transformers.stream()
                .map(transformerMapper::toDto)
                .toList();
    }

    @GetMapping("/{id}")
    public Transformer getTransformerById(@PathVariable Long id) {
        return transformerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transformer not found with id: " + id));
    }

    @PostMapping
    public Transformer createTransformer(@RequestBody TransformerDto request) {
        Transformer transformer = transformerMapper.toEntity(request);
        transformerRepository.save(transformer);
        return transformer;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transformer> updateTransformer(@PathVariable Long id, @RequestBody TransformerDto request) {
        Transformer existingTransformer = transformerRepository.findById(id).orElse(null);
        if (existingTransformer == null) {
            return ResponseEntity.notFound().build();
        }

        Transformer updatedTransformer = transformerMapper.toEntity(request);
        updatedTransformer.setId(existingTransformer.getId());
        transformerRepository.save(updatedTransformer);
        return ResponseEntity.ok(updatedTransformer);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransformer(@PathVariable Long id) {
        Transformer existingTransformer = transformerRepository.findById(id).orElse(null);
        if (existingTransformer == null) {
            return ResponseEntity.notFound().build();
        }

        transformerRepository.delete(existingTransformer);
        return ResponseEntity.noContent().build();
    }
}
