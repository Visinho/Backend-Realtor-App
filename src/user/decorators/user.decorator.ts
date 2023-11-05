import { ExecutionContext } from "@nestjs/common";
import { createParamDecorator } from "@nestjs/common/decorators";

export const User = createParamDecorator((data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user;
})