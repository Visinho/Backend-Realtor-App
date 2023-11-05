import { createParamDecorator } from "@nestjs/common/decorators";

export const User = createParamDecorator(() => {
    return {
        id: 4,
        name: "Visinho"
    }
})