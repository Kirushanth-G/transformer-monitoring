package com.kirus.server_transformer.mappers;

import com.kirus.server_transformer.dtos.MaintenanceRecordRequest;
import com.kirus.server_transformer.dtos.MaintenanceRecordResponse;
import com.kirus.server_transformer.dtos.MaintenanceRecordSummaryDto;
import com.kirus.server_transformer.entities.MaintenanceRecord;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
    componentModel = "spring",
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
    uses = {ElectricalReadingMapper.class}
)
public interface MaintenanceRecordMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "inspection", ignore = true)
    @Mapping(target = "isFinalized", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "electricalReadings", ignore = true)
    MaintenanceRecord toEntity(MaintenanceRecordRequest request);

    @Mapping(source = "inspection.id", target = "inspectionId")
    @Mapping(source = "inspection.inspectionNo", target = "inspectionNo")
    MaintenanceRecordResponse toResponse(MaintenanceRecord entity);

    @Mapping(source = "inspection.id", target = "inspectionId")
    @Mapping(source = "inspection.inspectionNo", target = "inspectionNo")
    MaintenanceRecordSummaryDto toSummaryDto(MaintenanceRecord entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "inspection", ignore = true)
    @Mapping(target = "isFinalized", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "electricalReadings", ignore = true)
    void updateEntityFromRequest(MaintenanceRecordRequest request, @MappingTarget MaintenanceRecord entity);
}

