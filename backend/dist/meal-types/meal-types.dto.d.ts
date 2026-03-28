export declare class UpdateTimeWindowDto {
    restaurantId: string;
    mealTypeId: string;
    startTime: string;
    endTime: string;
    allowDuplicate?: boolean;
    isActive?: boolean;
}
export declare class CreateMealTypeDto {
    name: string;
    sortOrder?: number;
}
