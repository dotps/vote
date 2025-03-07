export class DBError {
  constructor(public code: string, public message: string) {}
}

export const DBErrors = {
  RESULT_EXIST: new DBError("23505", "Такая запись уже присутствует в БД."),
};
