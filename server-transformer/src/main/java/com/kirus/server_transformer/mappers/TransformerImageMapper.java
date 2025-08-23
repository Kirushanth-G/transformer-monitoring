package com.kirus.server_transformer.mappers;

import com.kirus.server_transformer.dto.TransformerImageDTO;
import com.kirus.server_transformer.entities.TransformImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TransformerImageMapper {

    @Mapping(source = "transformer.id", target = "transformerId")
    TransformerImageDTO toDTO(TransformImage transformImage);
}
