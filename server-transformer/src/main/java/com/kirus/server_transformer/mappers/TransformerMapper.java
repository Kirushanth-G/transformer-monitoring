package com.kirus.server_transformer.mappers;

import com.kirus.server_transformer.dtos.TransformerDto;
import com.kirus.server_transformer.entities.Transformer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TransformerMapper {
    @Mapping(target = "id", ignore = true)
    Transformer toEntity(TransformerDto dto);
    TransformerDto toDto(Transformer entity);
}
