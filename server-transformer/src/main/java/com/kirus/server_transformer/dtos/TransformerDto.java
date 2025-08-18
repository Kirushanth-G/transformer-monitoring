package com.kirus.server_transformer.dtos;

import lombok.Data;

@Data
public class TransformerDto {
    private Long id;
    private String transformerId;
    private String location;
    private String type;
    private String poleNo;
}
