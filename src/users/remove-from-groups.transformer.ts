import { Transform, TransformationType } from "class-transformer"

export function RemoveFromGroups(groups: string[]) {
  return Transform(({ value, obj, type }) => {
    if (type === TransformationType.PLAIN_TO_CLASS) {
      if (groups.length > 0 && !groups.some(group => obj?.groups?.includes(group))) {
        return undefined
      }
    }
    return value
  })
}
