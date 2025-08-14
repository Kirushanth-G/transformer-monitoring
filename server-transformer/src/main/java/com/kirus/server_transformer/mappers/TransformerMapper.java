package com.kirus.server_transformer.mappers;

import com.kirus.server_transformer.dtos.TransformerDto;
import com.kirus.server_transformer.entities.Transformer;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TransformerMapper {
    Transformer toEntity(TransformerDto dto);
    TransformerDto toDto(Transformer entity);
}
