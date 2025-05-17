//Dependencies 
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

//Interfaces
import { IGeneric } from "src/shared/domain/ientities/i-generic.interface";

export class GenericApi implements IGeneric {
    @ApiProperty({ })
    pk: string;
  
    @ApiPropertyOptional({ })
    sk?: string;

}