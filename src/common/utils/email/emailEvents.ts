import { EventEmitter } from "node:events";
import { UserEvents } from "../../enum/user.enum";

export const eventEmitter = new EventEmitter();

eventEmitter.on(UserEvents.confirmEmail, async (fn) => {
  await fn();
});

eventEmitter.on(UserEvents.forgetPassword, async (fn) => {
  await fn();
});
