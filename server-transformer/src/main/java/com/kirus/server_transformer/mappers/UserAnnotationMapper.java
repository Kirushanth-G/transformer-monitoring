package com.kirus.server_transformer.mappers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kirus.server_transformer.dtos.UserAnnotationDto;
import com.kirus.server_transformer.entities.UserAnnotation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring")
public abstract class UserAnnotationMapper {

    @Autowired
    protected ObjectMapper objectMapper;

    @Mapping(source = "image.id", target = "imageId")
    public abstract UserAnnotationDto toDto(UserAnnotation userAnnotation);

    @Mapping(target = "image", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    public abstract UserAnnotation toEntity(UserAnnotationDto userAnnotationDto);
}
