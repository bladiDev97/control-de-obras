//Dependencies 
import { EntityAttributes, QUERY_ORDER } from "@typedorm/common";
import { FilterOptions } from "@typedorm/core/cjs/src/classes/expression/filter-options-type";
import { KeyConditionOptions } from "@typedorm/core/cjs/src/classes/expression/key-condition-options-type";


//Interfaces
import { IGeneric } from "./i-generic.interface";

export interface IQuery<T> {
    orderBy?: QUERY_ORDER,
    keyCondition?: KeyConditionOptions,
    where?: FilterOptions<T, string | Partial<EntityAttributes<T>>>
    limit?: number,
    cursor?: IGeneric
}