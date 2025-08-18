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
    public ResponseEntity<TransformerDto> getTransformerById(@PathVariable Long id) {
        Transformer transformer = transformerRepository.findById(id).orElse(null);
        if (transformer == null) {
            return ResponseEntity.notFound().build();
        }
        TransformerDto transformerDto = transformerMapper.toDto(transformer);
        return ResponseEntity.ok(transformerDto);
    }

    @PostMapping
    public TransformerDto createTransformer(@RequestBody TransformerDto request) {
        Transformer transformer = transformerMapper.toEntity(request);
        Transformer saved = transformerRepository.save(transformer);
        return transformerMapper.toDto(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransformerDto> updateTransformer(@PathVariable Long id, @RequestBody TransformerDto request) {
        Transformer existingTransformer = transformerRepository.findById(id).orElse(null);
        if (existingTransformer == null) {
            return ResponseEntity.notFound().build();
        }

        Transformer updatedTransformer = transformerMapper.toEntity(request);
        updatedTransformer.setId(existingTransformer.getId());
        Transformer saved = transformerRepository.save(updatedTransformer);
        return ResponseEntity.ok(transformerMapper.toDto(saved));
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
