import { Transform, TransformationType } from "class-transformer"
import { IsOptional } from "class-validator"

/*
export function RemoveFromGroups(groups: string[]) {

  return Transform(({ value, obj, type }) => {
    if (type === TransformationType.PLAIN_TO_CLASS) {
      if (groups.length > 0 && !groups.some(group => obj?.groups?.includes(group))) return undefined
    }
    return value
  })
}
 */

/*
export function RemoveFromGroups(groups: string[]) {
  return (target: any, propertyKey: string) => {
    IsOptional()(target, propertyKey) // принудительно ставим, чтобы не ругались другие валидаторы
    Transform(({ value, obj, type }) => {
      if (type === TransformationType.PLAIN_TO_CLASS) {
        if (groups.length > 0 && !groups.some(group => obj?.groups?.includes(group))) {
          return undefined
        }
      }
      return value
    })(target, propertyKey)
  }
}
*/

export function RemoveFromGroups(groups: string[]) {
  return (target: any, propertyKey: string) => {
    Transform(({ value, obj, type }) => {
      if (type === TransformationType.PLAIN_TO_CLASS) {
        if (groups.length > 0) {
          if (groups.some(group => obj?.groups?.includes(group))) {
            // Если объект принадлежит хотя бы одной из групп, применяем IsOptional
            // IsOptional()(target, propertyKey);
          }
          else {
            // IsOptional()(target, propertyKey);
            return undefined;
          }
        }
      }
      return value;
    })(target, propertyKey);
  };
}