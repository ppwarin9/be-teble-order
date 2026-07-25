export abstract class BaseResponseDto<T> {
  constructor(partial: Partial<T>) {
    Object.assign(this, partial);
  }
}
