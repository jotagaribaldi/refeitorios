import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto, UpdateRestaurantDto } from './restaurant.dto';
export declare class RestaurantsController {
    private service;
    constructor(service: RestaurantsService);
    findAll(req: any): Promise<import("./restaurant.entity").Restaurant[]>;
    findOne(id: string, req: any): Promise<import("./restaurant.entity").Restaurant>;
    create(dto: CreateRestaurantDto, req: any): Promise<import("./restaurant.entity").Restaurant>;
    update(id: string, dto: UpdateRestaurantDto, req: any): Promise<import("./restaurant.entity").Restaurant>;
    remove(id: string, req: any): Promise<import("./restaurant.entity").Restaurant>;
}
