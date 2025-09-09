package com.kirus.server_transformer.controllers;

import com.kirus.server_transformer.dtos.PagedResponse;
import com.kirus.server_transformer.dtos.TransformerDto;
import com.kirus.server_transformer.dtos.TransformerWithInspectionsDto;
import com.kirus.server_transformer.entities.Transformer;
import com.kirus.server_transformer.mappers.TransformerMapper;
import com.kirus.server_transformer.repositories.TransformerRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = {"http://localhost:5173" , "http://react-powergrid.s3-website-ap-southeast-1.amazonaws.com"})
@AllArgsConstructor
@RestController
@RequestMapping("/transformers")
public class TransformerController {

    private final TransformerRepository transformerRepository;
    private final TransformerMapper transformerMapper;

    @GetMapping
    public PagedModel<TransformerDto> getAllTransformers(Pageable pageable) {

        Sort.Order order = pageable.getSort().getOrderFor("transformerId");
        boolean isDesc = order != null && order.getDirection() == Sort.Direction.DESC;

        Page<Transformer> transformerPage = isDesc ?
                transformerRepository.findAllOrderByTransformerIdDesc(pageable) :
                transformerRepository.findAllOrderByTransformerIdAsNumber(pageable);
        Page<TransformerDto> dtoPage = transformerPage.map(transformerMapper::toDto);
        return new PagedModel<>(dtoPage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransformerWithInspectionsDto> getTransformerById(@PathVariable Long id) {
        Transformer transformer = transformerRepository.findById(id).orElse(null);
        if (transformer == null) {
            return ResponseEntity.notFound().build();
        }
        TransformerWithInspectionsDto transformerDto = transformerMapper.toDtoWithInspections(transformer);
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
