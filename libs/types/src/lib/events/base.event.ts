import { IEvent } from './event.interface';

export abstract class BaseEvent<T> implements IEvent<T> {
  public static queue: string;
  public abstract name: string;

  constructor(public readonly data: T) {}
}
