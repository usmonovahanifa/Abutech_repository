import { IsString } from "class-validator";

export class UpdateUserDto {
    @IsString()
    full_name: string;

    @IsString()
    email:string;

    @IsString()
    username: string;

    @IsString()
    password: string;
}